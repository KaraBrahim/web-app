import React, { useState } from 'react';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setQuery(''); // Reset after submit
    }
  };

  return (
    <div className="search-bar-container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="input-icon-wrapper">
            <svg className="search-icon" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
            type="text" 
            className="search-input glass-input" 
            placeholder="Type barcode ID..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            />
        </div>
        <button type="submit" className="search-submit-btn glow-on-hover">
            Search
        </button>
      </form>
    </div>
  );
}
