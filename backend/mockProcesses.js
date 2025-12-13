const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const FILE = path.join(DATA_DIR, 'mock_processes.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function load() {
  try {
    ensureDataDir();
    if (!fs.existsSync(FILE)) {
      const arr = generateMockProcesses(150);
      fs.writeFileSync(FILE, JSON.stringify(arr, null, 2));
      return arr;
    }
    const raw = fs.readFileSync(FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('Failed to load mock processes:', err);
    return [];
  }
}

function save(arr) {
  try {
    ensureDataDir();
    fs.writeFileSync(FILE, JSON.stringify(arr, null, 2));
  } catch (err) {
    console.error('Failed to save mock processes:', err);
  }
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const SAMPLE_COMMANDS = [
  '/usr/bin/node server.js',
  '/usr/bin/python3 app.py',
  '/usr/sbin/sshd -D',
  '/usr/bin/java -jar app.jar',
  '/usr/bin/nginx -g daemon off;',
  '/usr/bin/mysqld',
  '/usr/bin/docker daemon',
  '/usr/bin/bash',
  '/usr/bin/top -b',
  '/usr/bin/redis-server',
  '/sbin/init splash',
];

function generateMockProcesses(count = 100) {
  const users = ['timur', 'alice', 'bob', 'root', 'www-data'];
  const procs = [];
  let pid = 1000;
  for (let i = 0; i < count; i++) {
    const cmd = SAMPLE_COMMANDS[randomInt(0, SAMPLE_COMMANDS.length - 1)];
    procs.push({
      user: users[randomInt(0, users.length - 1)],
      pid: pid++,
      cpu: parseFloat((Math.random() * 30).toFixed(1)),
      mem: parseFloat((Math.random() * 40).toFixed(1)),
      vsz: randomInt(10000, 500000),
      rss: randomInt(1000, 200000),
      tty: '?',
      stat: 'S',
      start: '10:00',
      time: '00:00:10',
      command: cmd + (Math.random() > 0.6 ? ` --port=${randomInt(1000,9000)}` : ''),
    });
  }
  return procs;
}

// In-memory cache loaded from file
let processes = load();

// Simulation state
let simInterval = null;
let nextPid = processes.length > 0 ? Math.max(...processes.map(p => p.pid)) + 1 : 1000;

function clamp(v, min=0, max=100) { return Math.max(min, Math.min(max, v)); }

function simulateStep() {
  // change cpu/mem slightly
  processes.forEach(p => {
    // small random walk
    const cpuDelta = (Math.random() - 0.5) * 4; // -2 .. +2
    const memDelta = (Math.random() - 0.5) * 3;
    p.cpu = parseFloat(clamp(p.cpu + cpuDelta, 0, 100).toFixed(1));
    p.mem = parseFloat(clamp(p.mem + memDelta, 0, 100).toFixed(1));

    // occasional spikes
    if (Math.random() < 0.005) p.cpu = parseFloat((Math.random()*80 + 20).toFixed(1));
    if (Math.random() < 0.003) p.mem = parseFloat((Math.random()*70 + 10).toFixed(1));
  });

  // sometimes add a new process
  if (Math.random() < 0.04) {
    const users = ['timur','alice','bob','www-data','daemon'];
    const cmd = SAMPLE_COMMANDS[randomInt(0, SAMPLE_COMMANDS.length - 1)];
    const proc = {
      user: users[randomInt(0, users.length -1)],
      pid: nextPid++,
      cpu: parseFloat((Math.random()*30).toFixed(1)),
      mem: parseFloat((Math.random()*30).toFixed(1)),
      vsz: randomInt(10000, 500000),
      rss: randomInt(1000, 200000),
      tty: '?', stat: 'S', start: 'now', time: '00:00:00',
      command: cmd + (Math.random()>0.5 ? ` --port=${randomInt(1000,9000)}` : '')
    };
    processes.unshift(proc);
  }

  // sometimes remove a non-root process
  if (processes.length > 20 && Math.random() < 0.03) {
    const idx = processes.findIndex(p => p.user !== 'root');
    if (idx !== -1) processes.splice(idx, 1);
  }

  // occasionally persist
  if (Math.random() < 0.2) save(processes);
}

function startSimulation(intervalMs = 2000) {
  if (simInterval) return;
  simInterval = setInterval(simulateStep, intervalMs);
}

function stopSimulation() {
  if (!simInterval) return;
  clearInterval(simInterval);
  simInterval = null;
}

function isSimulationRunning() { return !!simInterval; }

function getProcesses() {
  // return a shallow copy so callers don't mutate
  return processes.slice().sort((a, b) => a.pid - b.pid);
}

function getProcess(pid) {
  pid = parseInt(pid);
  return processes.find((p) => p.pid === pid) || null;
}

function killProcess(pid, requesterUser = null) {
  pid = parseInt(pid);
  const idx = processes.findIndex((p) => p.pid === pid);
  if (idx === -1) return { ok: false, code: 404, error: 'Process not found' };

  const proc = processes[idx];
  // Permission: allow kill if same user or if requesterUser === 'root' or null (server-side)
  if (requesterUser && proc.user !== requesterUser && requesterUser !== 'root') {
    return { ok: false, code: 403, error: `Operation not permitted: process owned by '${proc.user}'` };
  }

  // remove from list
  processes.splice(idx, 1);
  save(processes);
  return { ok: true };
}

function resetMock(count = 150) {
  processes = generateMockProcesses(count);
  save(processes);
  return processes;
}

module.exports = {
  getProcesses,
  getProcess,
  killProcess,
  resetMock,
};

// Export simulation controls
module.exports.startSimulation = startSimulation;
module.exports.stopSimulation = stopSimulation;
module.exports.isSimulationRunning = isSimulationRunning;
