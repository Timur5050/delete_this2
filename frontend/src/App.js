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

  const API_URL = 'http://localhost:5000/api';

  // Fetch processes
  const fetchProcesses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/processes`);
      setProcesses(response.data);
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
          </div>
        </div>

        {stats && <ProcessStats stats={stats} processCount={filteredProcesses.length} />}

        <ProcessTable
          processes={filteredProcesses}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onKill={killProcess}
          onSelect={handleSelectProcess}
          loading={loading}
        />

        {selectedProcess && (
          <ProcessDetailModal
            process={selectedProcess}
            onClose={handleCloseModal}
            onKill={killProcess}
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
