import { db } from '../features/products/product.db.js';

self.onmessage = async (e) => {
  if (e.data.type === 'SYNC') {
    try {
      // In a real application, this would fetch a JSON file from an API:
      // const response = await fetch('https://api.example.com/products.json');
      // const data = await response.json();
      
      // For this project, we generate a highly optimized mock array to simulate a large retail dataset
      // ensuring high performance without overwhelming the repo with a large json file.
      const dataLength = 10000;
      const mockData = new Array(dataLength);
      
      for (let i = 0; i < dataLength; i++) {
        // Generating sequential barcodes for testability: '1000000000', '1000000001', etc.
        const barcodeId = (1000000000 + i).toString();
        // Just picking some random names and prices
        const productNames = ["Milk", "Bread", "Eggs", "Coffee", "Tea", "Chicken", "Rice", "Apples", "Water", "Cereal"];
        const name = `${productNames[i % productNames.length]} - Brand ${Math.floor(i / 100)}`;
        const price = (Math.random() * 50 + 1).toFixed(2);
        
        mockData[i] = {
          id: barcodeId,
          value: [name, price]
        };
      }
      
      // Add a distinct barcode for manual testing easy typing
      mockData.push({ id: "123456789", value: ["Premium Offline Cola", "1.99"] });

      // 1. Clear existing DB logic
      await db.clear();
      
      // 2. Insert new batch in single IDB transaction bounds
      await db.saveBatch(mockData);
      
      self.postMessage({ type: 'SYNC_SUCCESS', count: mockData.length });
    } catch (error) {
      self.postMessage({ type: 'SYNC_ERROR', error: error.message });
    }
  }
};
