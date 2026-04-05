import { openDB } from 'idb';

const DB_NAME = 'products_db';
const STORE_NAME = 'products';

export const db = {
  async getDb() {
    return openDB(DB_NAME, 1, {
      upgrade(database) {
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  },
  
  async getAll() {
    const database = await this.getDb();
    const tx = database.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    return store.getAll();
  },
  
  async saveBatch(items) {
    const database = await this.getDb();
    const tx = database.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    // Process insertions in a single transaction for efficiency
    for (const item of items) {
       store.put(item);
    }
    await tx.done;
  },
  
  async clear() {
      const database = await this.getDb();
      const tx = database.transaction(STORE_NAME, 'readwrite');
      await tx.objectStore(STORE_NAME).clear();
      await tx.done;
  }
};
