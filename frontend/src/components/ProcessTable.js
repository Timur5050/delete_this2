import React from 'react';
import './ProcessTable.css';

function ProcessTable({ processes, sortBy, sortOrder, onSort, onKill, onSelect, loading }) {
  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <span className="sort-icon">⇅</span>;
    return sortOrder === 'asc' ? <span className="sort-icon">▲</span> : <span className="sort-icon">▼</span>;
  };

  return (
    <div className="process-table-container">
      <table className="process-table">
        <thead>
          <tr>
            <th onClick={() => onSort('user')}>
              User <SortIcon field="user" />
            </th>
            <th onClick={() => onSort('pid')}>
              PID <SortIcon field="pid" />
            </th>
            <th onClick={() => onSort('cpu')}>
              CPU % <SortIcon field="cpu" />
            </th>
            <th onClick={() => onSort('mem')}>
              MEM % <SortIcon field="mem" />
            </th>
            <th onClick={() => onSort('rss')}>
              RSS (MB) <SortIcon field="rss" />
            </th>
            <th onClick={() => onSort('time')}>
              Time <SortIcon field="time" />
            </th>
            <th>Command</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="8" className="loading">
                Loading processes...
              </td>
            </tr>
          ) : processes.length === 0 ? (
            <tr>
              <td colSpan="8" className="no-data">
                No processes found
              </td>
            </tr>
          ) : (
            processes.map((proc) => (
              <tr
                key={proc.pid}
                className={`process-row ${proc.cpu > 50 ? 'high-cpu' : ''} ${proc.mem > 50 ? 'high-mem' : ''}`}
                onClick={() => onSelect && onSelect(proc)}
                style={{ cursor: onSelect ? 'pointer' : 'default' }}
              >
                <td className="user">{proc.user}</td>
                <td className="pid">{proc.pid}</td>
                <td className="cpu">
                  <span className={`cpu-badge ${proc.cpu > 50 ? 'critical' : proc.cpu > 20 ? 'warning' : 'normal'}`}>
                    {proc.cpu.toFixed(1)}%
                  </span>
                </td>
                <td className="mem">
                  <span className={`mem-badge ${proc.mem > 50 ? 'critical' : proc.mem > 20 ? 'warning' : 'normal'}`}>
                    {proc.mem.toFixed(1)}%
                  </span>
                </td>
                <td className="rss">{(proc.rss / 1024).toFixed(2)}</td>
                <td className="time">{proc.time}</td>
                <td className="command" title={proc.command}>
                  {proc.command.length > 50 ? proc.command.substring(0, 50) + '...' : proc.command}
                </td>
                <td className="action">
                  <button
                    className="kill-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onKill(proc.pid);
                    }}
                    title={`Kill process ${proc.pid}`}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ProcessTable;
