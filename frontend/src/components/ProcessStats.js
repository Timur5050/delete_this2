import React from 'react';
import './ProcessStats.css';
import Sparkline from './Sparkline';

function ProcessStats({ stats, processCount, systemHistory = [] }) {
  return (
    <div className="stats-container">
      <div className="stat-card">
        <div className="stat-icon">📊</div>
        <div className="stat-content">
          <h3>Active Processes</h3>
          <p className="stat-value">{processCount}</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">⚙️</div>
        <div className="stat-content">
          <h3>System Status</h3>
          <p className="stat-value">Running</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">💾</div>
        <div className="stat-content">
          <h3>Last Updated</h3>
          <p className="stat-value">{new Date().toLocaleTimeString()}</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">📈</div>
        <div className="stat-content">
          <h3>CPU Trend</h3>
          <p className="stat-value small">
            <Sparkline points={systemHistory.map(s => s.cpu)} width={180} height={36} />
          </p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">🧠</div>
        <div className="stat-content">
          <h3>MEM Trend</h3>
          <p className="stat-value small">
            <Sparkline points={systemHistory.map(s => s.mem)} width={180} height={36} color="#ffa726" />
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProcessStats;
