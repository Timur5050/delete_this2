import React from 'react';
import './ProcessStats.css';

function ProcessStats({ stats, processCount }) {
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
    </div>
  );
}

export default ProcessStats;
