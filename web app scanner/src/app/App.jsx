import React, { useState, useEffect } from 'react';
import { useProductStore } from '../features/products/product.store';
import { loadProducts } from '../features/products/product.service';

import ScannerScreen from '../features/scanner/ScannerScreen';
import UploadScreen from '../features/config/UploadScreen';

export default function App() {
  const lastSync = useProductStore(state => state.lastSync);

  // LocalStorage sometimes saves the literal string 'null' or 'undefined'
  const isFirstTime = !lastSync || lastSync === 'null' || lastSync === 'undefined';

  const [currentScreen, setCurrentScreen] = useState(isFirstTime ? 'upload' : 'scanner');

  useEffect(() => {
    loadProducts().then(map => {
      if (Object.keys(map).length === 0) {
        setCurrentScreen('upload');
      }
    });
  }, []);

  return (
    <main className="app-container">
      {currentScreen === 'scanner' && (
        <ScannerScreen onReturnToSettings={() => setCurrentScreen('upload')} />
      )}
      {currentScreen === 'upload' && (
        <UploadScreen onCancel={() => setCurrentScreen('scanner')} />
      )}
    </main>
  );
}
