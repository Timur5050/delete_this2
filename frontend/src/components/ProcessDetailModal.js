import React from 'react';
import './ProcessDetailModal.css';
import Sparkline from './Sparkline';

function ProcessDetailModal({ process, onClose, onKill, cpuHistory = [], memHistory = [] }) {
  if (!process) return null;

  const handleKill = async () => {
    if (window.confirm(`Really kill process ${process.pid}?`)) {
      try {
        await onKill(process.pid);
        onClose();
      } catch (err) {
        alert('Failed to kill process');
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h3>Process {process.pid} details</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </header>

        <div className="modal-body">
          <div className="modal-row"><strong>User:</strong> {process.user}</div>
          <div className="modal-row"><strong>PID:</strong> {process.pid}</div>
          <div className="modal-row"><strong>CPU:</strong> {process.cpu.toFixed(1)}%</div>
          <div className="modal-row"><strong>CPU Trend:</strong>
            <Sparkline points={cpuHistory} width={420} height={48} color="#667eea" />
          </div>
          <div className="modal-row"><strong>MEM:</strong> {process.mem.toFixed(1)}%</div>
          <div className="modal-row"><strong>MEM Trend:</strong>
            <Sparkline points={memHistory} width={420} height={48} color="#ffa726" />
          </div>
          <div className="modal-row"><strong>RSS (KB):</strong> {process.rss}</div>
          <div className="modal-row"><strong>Time:</strong> {process.time}</div>
          <div className="modal-row"><strong>Command:</strong>
            <pre className="modal-command">{process.command}</pre>
          </div>
        </div>

        <footer className="modal-footer">
          <button className="modal-kill" onClick={handleKill}>Kill</button>
          <button className="modal-close-btn" onClick={onClose}>Close</button>
        </footer>
      </div>
    </div>
  );
}

export default ProcessDetailModal;
