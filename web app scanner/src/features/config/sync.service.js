import { useProductStore } from '../products/product.store';
import { loadProducts } from '../products/product.service';

// Simulating a remote ETag or version hash that would come from API Headers
const REMOTE_VERSION = 'v1.0.2';

export const syncProducts = async () => {
  const store = useProductStore.getState();
  
  if (store.syncStatus === 'syncing') return;
  
  store.setSyncStatus('syncing');

  try {
    // 1. Fetch headers / Compare Version
    if (store.version === REMOTE_VERSION && store.lastSync) {
      console.log('Database is already up to date.');
      // Ensure memory map is loaded just in case
      await loadProducts();
      store.setSyncStatus('success');
      return;
    }

    // 2. Offload processing to Web Worker
    const worker = new Worker(new URL('../../utils/worker.js', import.meta.url), { type: 'module' });
    
    worker.postMessage({ type: 'SYNC' });

    worker.onmessage = async (e) => {
      if (e.data.type === 'SYNC_SUCCESS') {
        // 3. Rebuild in-memory map on main thread instantly
        await loadProducts();
        
        // 4. Update UI state
        store.setSyncData(new Date().toISOString(), REMOTE_VERSION);
        store.setSyncStatus('success');
        worker.terminate();
      } else if (e.data.type === 'SYNC_ERROR') {
        store.setSyncStatus('error');
        console.error('Worker Sync Error:', e.data.error);
        worker.terminate();
      }
    };

    worker.onerror = (err) => {
      store.setSyncStatus('error');
      console.error('Worker failed:', err);
      worker.terminate();
    };

  } catch (err) {
    console.error('Sync process failed:', err);
    store.setSyncStatus('error');
  }
};
