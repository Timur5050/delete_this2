import React from 'react';
import './SearchBar.css';

function SearchBar({ searchTerm, setSearchTerm }) {
  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Search by process name, PID, or user..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      {searchTerm && (
        <button
          className="clear-btn"
          onClick={() => setSearchTerm('')}
          title="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default SearchBar;
