import { useRef, useState } from 'react';
import { startScan, requestCameraPermissions } from './scanner.service';
import { getProduct } from '../products/product.service';

export function useScanner() {
  const [product, setProduct] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);
  
  // Ref tracking ensures no re-renders during intervals and handles the strict 1.5s duplication debounce rule
  const lastScanTime = useRef(0);
  const SCAN_COOLDOWN = 1500; 

  const handleScan = (barcodeRaw) => {
    const now = Date.now();
    // Deduping
    if (now - lastScanTime.current < SCAN_COOLDOWN) return; 
    lastScanTime.current = now;
    
    // High-performance O(1) Lookup
    const result = getProduct(barcodeRaw);
    
    if (result) {
      setProduct({ barcode: barcodeRaw, name: result[0], price: result[1], found: true });
    } else {
      setProduct({ barcode: barcodeRaw, found: false });
    }
  };

  const initScanner = async () => {
    const perm = await requestCameraPermissions();
    setHasPermission(perm);
    
    if (!perm) return null;
    
    setIsScanning(true);
    const stop = await startScan(handleScan);
    
    return () => {
      if (stop) stop();
      setIsScanning(false);
    };
  };

  const simulateScan = (barcodeId) => {
    handleScan(barcodeId);
  };

  return {
    product,
    isScanning,
    hasPermission,
    initScanner,
    simulateScan,
    clearProduct: () => setProduct(null)
  };
}
