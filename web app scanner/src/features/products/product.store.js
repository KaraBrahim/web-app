import { create } from 'zustand';

// A lightweight store to manage syncing UI state and configuration
export const useProductStore = create((set) => ({
  syncStatus: 'idle', // 'idle' | 'syncing' | 'error' | 'success'
  lastSync: localStorage.getItem('lastSync') || null,
  version: localStorage.getItem('db_version') || null,
  
  setSyncStatus: (status) => set({ syncStatus: status }),
  
  setSyncData: (timestamp, version) => {
    localStorage.setItem('lastSync', timestamp);
    localStorage.setItem('db_version', version);
    set({ lastSync: timestamp.toString(), version });
  }
}));
