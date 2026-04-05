import React, { useEffect } from 'react';
import { useProductStore } from '../products/product.store';
import { syncProducts } from './sync.service';
import { loadProducts, isDataReady } from '../products/product.service';

export default function ConfigScreen({ onBack }) {
  const { syncStatus, lastSync, version } = useProductStore();

  // Try to load data into memory automatically if not there
  useEffect(() => {
    if (!isDataReady()) {
      loadProducts();
    }
  }, []);

  return (
    <div className="screen slide-in config-screen">
      <header className="app-header glass-header">
        <button className="icon-btn" onClick={onBack} aria-label="Go Back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h2>Configuration</h2>
        <div style={{ width: 24 }}></div>
      </header>

      <div className="content-pad scroll-y">
        <div className="card glass-card">
          <div className="card-header">
            <h3>Database Hub</h3>
            <span className={`status-dot ${syncStatus}`}></span>
          </div>

          <div className="stat-grid">
            <div className="stat-item">
              <span className="stat-label">Status</span>
              <span className={`stat-value capitalize ${syncStatus}`}>{syncStatus}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Last Sync</span>
              <span className="stat-value">{lastSync ? new Date(lastSync).toLocaleString() : 'Never'}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Version ETag</span>
              <span className="stat-value">{version || 'Unknown'}</span>
            </div>
          </div>

          <button
            className={`btn primary-btn sync-btn ${syncStatus === 'syncing' ? 'pulsing' : ''}`}
            disabled={syncStatus === 'syncing'}
            onClick={syncProducts}
          >
            {syncStatus === 'syncing' ? 'Syncing Background...' : 'Sync Now'}
          </button>

          <p className="caption">
            * 10,000 product mock rows will be synced securely to IndexedDB via background Web Worker to ensure UI thread performs optimally at 60fps.
          </p>
        </div>
      </div>
    </div>
  );
}
