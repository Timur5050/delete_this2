const express = require('express');
const cors = require('cors');
const db = require('./db');
const mock = require('./mockProcesses');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Linux Process Viewer Backend is running' });
});

// Get all processes
app.get('/api/processes', async (req, res) => {
  try {
    const processes = mock.getProcesses();
    res.json(processes);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get process by PID
app.get('/api/processes/:pid', async (req, res) => {
  try {
    const { pid } = req.params;
    const process = mock.getProcess(pid);
    if (!process) return res.status(404).json({ error: 'Process not found' });
    res.json(process);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Kill process
app.post('/api/processes/:pid/kill', async (req, res) => {
  try {
    const { pid } = req.params;
    if (isNaN(pid) || pid < 1) {
      return res.status(400).json({ error: 'Invalid PID' });
    }

    // Simulate kill using mockProcesses (no real system changes)
    const result = mock.killProcess(pid, null);
    if (!result.ok) {
      return res.status(result.code || 500).json({ error: result.error || 'Failed to kill process' });
    }
    res.json({ message: `Process ${pid} terminated successfully (mock)` });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get system stats
app.get('/api/stats', (req, res) => {
  try {
    // Provide simple aggregated mock stats
    const processes = mock.getProcesses();
    const totalCpu = processes.reduce((s, p) => s + (p.cpu || 0), 0).toFixed(1);
    const totalMem = processes.reduce((s, p) => s + (p.mem || 0), 0).toFixed(1);
    res.json({ process_count: processes.length, total_cpu: parseFloat(totalCpu), total_mem: parseFloat(totalMem) });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mock control endpoints
app.post('/api/mock/reset', async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 150;
    const procs = mock.resetMock(count);
    res.json({ message: 'mock reset', count: procs.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset mock' });
  }
});

app.post('/api/mock/stop', (req, res) => {
  try {
    mock.stopSimulation();
    res.json({ message: 'simulation stopped' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to stop simulation' });
  }
});

app.post('/api/mock/start', (req, res) => {
  try {
    const ms = parseInt(req.query.ms) || 2000;
    mock.startSimulation(ms);
    res.json({ message: 'simulation started', interval_ms: ms });
  } catch (err) {
    res.status(500).json({ error: 'Failed to start simulation' });
  }
});

// Save process snapshot to database
app.post('/api/snapshots', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Capture mock processes as snapshot (JSON)
    try {
      const processes = mock.getProcesses();
      const data = JSON.stringify(processes, null, 2);
      const result = await db.query(
        'INSERT INTO snapshots(name, description, data, created_at) VALUES($1, $2, $3, NOW()) RETURNING *',
        [name, description, data]
      );
      res.json(result.rows[0]);
    } catch (dbError) {
      res.status(500).json({ error: 'Database error' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all snapshots
app.get('/api/snapshots', async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, description, created_at FROM snapshots ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Get snapshot by ID
app.get('/api/snapshots/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM snapshots WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Snapshot not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  // Start mock simulation by default (background mutation of mock processes)
  try {
    mock.startSimulation(2000);
    console.log('Mock process simulation started (2s interval)');
  } catch (err) {
    console.warn('Failed to start mock simulation:', err && err.message);
  }
});
