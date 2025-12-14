import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import ProcessTable from './components/ProcessTable';
import ProcessStats from './components/ProcessStats';
import SearchBar from './components/SearchBar';
import ProcessDetailModal from './components/ProcessDetailModal';

function App() {
  const [processes, setProcesses] = useState([]);
  const [filteredProcesses, setFilteredProcesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('pid');
  const [sortOrder, setSortOrder] = useState('asc');
  const [stats, setStats] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(5);
  const [paused, setPaused] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [selectedPids, setSelectedPids] = useState([]);
  const [systemHistory, setSystemHistory] = useState([]);
  const [cpuHistoryMap, setCpuHistoryMap] = useState({});
  const [memHistoryMap, setMemHistoryMap] = useState({});
  const [mockRunning, setMockRunning] = useState(false);

  const API_URL = 'http://localhost:5000/api';

  // Fetch processes
  const fetchProcesses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/processes`);
      const procs = response.data;
      setProcesses(procs);
      // update per-process CPU and MEM history maps
      setCpuHistoryMap(prev => {
        const copy = { ...prev };
        const MAX_HISTORY = 20;
        procs.forEach(p => {
          const arr = (copy[p.pid] && Array.isArray(copy[p.pid]) ? copy[p.pid] : []);
          arr.push(p.cpu);
          if (arr.length > MAX_HISTORY) arr.splice(0, arr.length - MAX_HISTORY);
          copy[p.pid] = arr;
        });
        // prune keys not in current processes
        const current = new Set(procs.map(p => p.pid));
        Object.keys(copy).forEach(k => { if (!current.has(parseInt(k))) delete copy[k]; });
        return copy;
      });
      setMemHistoryMap(prev => {
        const copy = { ...prev };
        const MAX_HISTORY = 20;
        procs.forEach(p => {
          const arr = (copy[p.pid] && Array.isArray(copy[p.pid]) ? copy[p.pid] : []);
          arr.push(p.mem);
          if (arr.length > MAX_HISTORY) arr.splice(0, arr.length - MAX_HISTORY);
          copy[p.pid] = arr;
        });
        const current = new Set(procs.map(p => p.pid));
        Object.keys(copy).forEach(k => { if (!current.has(parseInt(k))) delete copy[k]; });
        return copy;
      });
    } catch (error) {
      console.error('Error fetching processes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch system stats
  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/stats`);
      setStats(response.data);
      // update system history (keep last 20)
      setSystemHistory(prev => {
        const next = prev.concat({ cpu: response.data.total_cpu || 0, mem: response.data.total_mem || 0 });
        return next.slice(-20);
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchProcesses();
    fetchStats();

    let interval = null;
    if (!paused) {
      interval = setInterval(() => {
        fetchProcesses();
        fetchStats();
      }, refreshInterval * 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [refreshInterval, paused]);

  useEffect(() => {
    // Fetch mock status at mount
    (async () => {
      try {
        const res = await axios.get(`${API_URL}/mock/status`);
        setMockRunning(!!res.data.running);
      } catch (err) {
        // ignore
      }
    })();
  }, []);

  // Filter and sort processes
  useEffect(() => {
    let filtered = processes.filter(
      proc =>
        proc.command.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proc.pid.toString().includes(searchTerm) ||
        proc.user.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredProcesses(filtered);
  }, [processes, searchTerm, sortBy, sortOrder]);

  // Kill process
  const killProcess = async (pid) => {
    if (window.confirm(`Are you sure you want to kill process ${pid}?`)) {
      try {
        await axios.post(`${API_URL}/processes/${pid}/kill`);
        fetchProcesses();
        alert(`Process ${pid} terminated successfully`);
      } catch (error) {
        alert(`Error: ${error.response?.data?.error || 'Failed to kill process'}`);
      }
    }
  };

  const killSelected = async () => {
    if (selectedPids.length === 0) return alert('No processes selected');
    if (!window.confirm(`Kill ${selectedPids.length} selected processes?`)) return;
    for (const pid of selectedPids) {
      try {
        await axios.post(`${API_URL}/processes/${pid}/kill`);
      } catch (err) {
        console.error('Failed to kill', pid, err);
      }
    }
    setSelectedPids([]);
    fetchProcesses();
  };

  const onToggleSelect = (pid) => {
    setSelectedPids(prev => {
      if (prev.includes(pid)) return prev.filter(p => p !== pid);
      return prev.concat(pid);
    });
  };

  const exportCSV = () => {
    if (!filteredProcesses || filteredProcesses.length === 0) return alert('No data to export');
    const header = ['user','pid','cpu','mem','vsz','rss','stat','time','command'];
    const rows = filteredProcesses.map(p => ([p.user,p.pid,p.cpu,p.mem,p.vsz,p.rss,p.stat,p.time,'"'+p.command.replace(/"/g,'""')+'"'].join(',')));
    const csv = [header.join(',')].concat(rows).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `processes-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleSelectProcess = (proc) => {
    setSelectedProcess(proc);
  };

  const handleCloseModal = () => {
    setSelectedProcess(null);
  };

  // Simulation control helpers
  const startMock = async (ms = 2000) => {
    try {
      await axios.post(`${API_URL}/mock/start?ms=${ms}`);
      setMockRunning(true);
    } catch (err) {
      console.error('failed to start mock', err);
    }
  };

  const stopMock = async () => {
    try {
      await axios.post(`${API_URL}/mock/stop`);
      setMockRunning(false);
    } catch (err) {
      console.error('failed to stop mock', err);
    }
  };

  const resetMock = async (count = 150) => {
    try {
      await axios.post(`${API_URL}/mock/reset?count=${count}`);
      fetchProcesses();
    } catch (err) {
      console.error('failed to reset mock', err);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🐧 Linux Process Viewer</h1>
        <p>Real-time process monitoring and management</p>
      </header>

      <main className="main-content">
        <div className="controls">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <div className="refresh-control">
            <label htmlFor="refresh">Auto-refresh (seconds):</label>
            <input
              id="refresh"
              type="number"
              min="1"
              max="60"
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
            />
            <button onClick={fetchProcesses} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            <label className="pause-toggle">
              <input type="checkbox" checked={paused} onChange={() => setPaused(!paused)} /> Pause
            </label>
            <div className="mock-controls">
              <button onClick={() => startMock(1000)} className="muted">Start Sim</button>
              <button onClick={() => stopMock()} className="muted">Stop Sim</button>
              <button onClick={() => resetMock(150)} className="muted">Reset Mocks</button>
              <span className={`mock-status ${mockRunning ? 'on' : 'off'}`}>{mockRunning ? 'Running' : 'Stopped'}</span>
            </div>
            <button onClick={killSelected} className="muted danger">Kill Selected</button>
            <span className="selected-count">Selected: {selectedPids.length}</span>
            <button onClick={exportCSV} className="muted">Export CSV</button>
          </div>
        </div>

        {stats && <ProcessStats stats={stats} processCount={filteredProcesses.length} systemHistory={systemHistory} />}

        <ProcessTable
          processes={filteredProcesses}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onKill={killProcess}
          onSelect={handleSelectProcess}
          cpuHistoryMap={cpuHistoryMap}
          selectedPids={selectedPids}
          onToggleSelect={onToggleSelect}
          loading={loading}
        />

        {selectedProcess && (
          <ProcessDetailModal
            process={selectedProcess}
            onClose={handleCloseModal}
            onKill={killProcess}
            cpuHistory={cpuHistoryMap[selectedProcess.pid]}
            memHistory={memHistoryMap[selectedProcess.pid]}
          />
        )}
      </main>

      <footer className="footer">
        <p>Linux Process Viewer © 2025 - Course Project</p>
      </footer>
    </div>
  );
}

export default App;
