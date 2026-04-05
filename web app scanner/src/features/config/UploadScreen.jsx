import React, { useState } from 'react';
import { useProductStore } from '../products/product.store';
import { db } from '../products/product.db';
import { loadProducts } from '../products/product.service';

export default function UploadScreen({ onCancel }) {
  const { lastSync, setSyncData } = useProductStore();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const parseCSV = (text) => {
    const lines = text.split('\n');
    const items = [];

    // Quick, lightweight manual parsing
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(',');
      if (parts.length >= 3) {
        const barcode = parts[0].trim().replace(/^"|"$/g, '');
        const price = parts[parts.length - 1].trim().replace(/^"|"$/g, '');
        // Handles standard formatting where middle parts compose the name
        const name = parts.slice(1, parts.length - 1).join(',').replace(/^"|"$/g, '').trim();

        if (barcode) {
          items.push({ id: barcode, value: [name, price] });
        }
      }
    }
    return items;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const text = await file.text();
      const items = parseCSV(text);

      if (items.length === 0) {
        setErrorMsg('Could not parse the CSV. Check that headers are: barcode, product_name, price');
        setLoading(false);
        return;
      }

      // Store efficiently 
      await db.clear();
      await db.saveBatch(items);
      await loadProducts();

      const timestamp = new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
      setSyncData(timestamp, 'csv_upload');

      setTimeout(() => onCancel(), 500);
    } catch (err) {
      setErrorMsg('Error picking document. Please try again.');
    } finally {
      // Small delay on loading to prevent flash
      setTimeout(() => setLoading(false), 200);
    }
  };

  return (
    <div className="container upload-container">
      <div className="icon-ring">
        <svg viewBox="0 0 24 24" width="52" height="52" fill="none" stroke="#3b82f6" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path><line x1="8" y1="12" x2="16" y2="12"></line></svg>
      </div>

      <h1 className="title">Price Scanner</h1>
      <p className="subtitle">Upload a CSV with your product prices to start scanning instantly.</p>

      {lastSync && (
        <div className="last-updated-badge">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span className="last-updated-text">Last updated: {lastSync}</span>
        </div>
      )}

      <div className="hint-box">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        <span className="hint-text">CSV format: <span className="hint-code">barcode, product_name, price</span></span>
      </div>

      <div className="upload-btn-wrapper">
        <input
          type="file"
          id="csv-upload"
          accept=".csv,text/csv"
          onChange={handleFileUpload}
          className="visually-hidden"
          disabled={loading}
        />
        <label htmlFor="csv-upload" className={`upload-btn ${loading ? 'upload-btn-loading' : ''}`}>
          {loading ? (
            <div className="spinner-small"></div>
          ) : (
            <>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              <span className="upload-btn-text">Upload Price List (CSV)</span>
            </>
          )}
        </label>
      </div>

      {errorMsg && (
        <div className="error-box">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <span className="error-text">{errorMsg}</span>
        </div>
      )}

      <button className="cancel-btn" onClick={onCancel}>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>
        <span className="cancel-btn-text">Return to Camera</span>
      </button>
    </div>
  );
}
