import React, { useEffect, useState, useRef } from 'react';
import { useScanner } from './useScanner';
import { useProductStore } from '../products/product.store';

export default function ScannerScreen({ onReturnToSettings }) {
   const { product, isScanning, hasPermission, initScanner, clearProduct } = useScanner();
   const { lastSync } = useProductStore();

   const [cardState, setCardState] = useState('hidden'); // 'hidden', 'showing', 'shake', 'dismissing'
   const prevBarcodeRef = useRef(null);
   const dismissTimeoutRef = useRef(null);

   const handleDismiss = () => {
      setCardState('dismissing');
      setTimeout(() => {
         clearProduct();
      }, 250); // wait for CSS transition to sink down
   };

   useEffect(() => {
      let stopFn = null;
      let isMounted = true;
      
      initScanner().then(fn => { 
         if (!isMounted) {
            // Unmounted before initialization finished, stop immediately
            if (fn) fn();
         } else {
            stopFn = fn; 
         }
      });
      
      return () => { 
         isMounted = false;
         if (stopFn) stopFn(); 
      };
   }, []);

   useEffect(() => {
      if (product) {
         if (prevBarcodeRef.current === product.barcode) {
            // Repeated scan of same item -> micro shake
            setCardState('shake');
            setTimeout(() => setCardState('showing'), 250);
         } else {
            setCardState('showing');
         }
         prevBarcodeRef.current = product.barcode;

         // Auto-dismiss after 5 seconds
         if (dismissTimeoutRef.current) clearTimeout(dismissTimeoutRef.current);
         dismissTimeoutRef.current = setTimeout(() => {
            handleDismiss();
         }, 5000);
      } else {
         setCardState('hidden');
         if (dismissTimeoutRef.current) clearTimeout(dismissTimeoutRef.current);
      }

      return () => {
         if (dismissTimeoutRef.current) clearTimeout(dismissTimeoutRef.current);
      };
   }, [product]);



   const handleCopy = () => {
      if (product?.barcode) {
         navigator.clipboard.writeText(product.barcode);
      }
   };

   if (!hasPermission) {
      return (
         <div className="container center-content" style={{ gap: '16px' }}>
            <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
            <div className="permission-text">Camera access is required to scan barcodes.</div>
            <button className="permission-btn" onClick={initScanner}>Grant Permission</button>
         </div>
      );
   }

   return (
      <div className="container scanner-container">
         <div id="reader" className="reader-container"></div>
         <div className="viewfinder-container glass-overlay">
            <div className="viewfinder">
               <div className="corner corner-tl"></div>
               <div className="corner corner-tr"></div>
               <div className="corner corner-bl"></div>
               <div className="corner corner-br"></div>
            </div>
            <div className="scan-hint">Align barcode within the frame</div>
         </div>

         <div className="top-bar">
            <div className="top-bar-left">
               <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><line x1="8" y1="12" x2="16" y2="12"></line></svg>
               <span className="last-updated-text">{lastSync ? `Updated ${lastSync}` : 'No list loaded'}</span>
            </div>
         </div>

         <button className="gear-btn" onClick={onReturnToSettings}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
         </button>

         {product && product.found && (
            <div className={`result-card ${cardState}`}>
               <div className="card-content">
                  <div className="icon-badge" onClick={handleDismiss} style={{ cursor: 'pointer' }}>
                     <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </div>
                  <div className="card-text-group">
                     <div className="product-name">{product.name}</div>
                     <div className="barcode-label" onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <span>{product.barcode}</span>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                     </div>
                  </div>
                  <div className="product-price">{String(product.price).replace(/"/g, '')} DA</div>
               </div>

               <div className="divider" />

               <div className="action-row">
                  <div className="action-hint">Tap dismiss to scan next item</div>
                  <button className="dismiss-btn" onClick={handleDismiss}>
                     <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                     <span className="dismiss-btn-text">Dismiss</span>
                  </button>
               </div>
            </div>
         )}

         {product && !product.found && (
            <div className={`result-card ${cardState}`}>
               <div className="card-content">
                  <div className="icon-badge error-badge" onClick={handleDismiss} style={{ cursor: 'pointer' }}>
                     <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"></path></svg>
                  </div>
                  <div className="card-text-group">
                     <div className="product-name">Not Found</div>
                     <div className="barcode-label" onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <span>{product.barcode}</span>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                     </div>
                  </div>
                  <div className="product-price" style={{ color: '#888' }}>-- DA</div>
               </div>

               <div className="divider" />

               <div className="action-row">
                  <div className="action-hint">Unrecognized product barcode</div>
                  <button className="dismiss-btn" onClick={handleDismiss}>
                     <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                     <span className="dismiss-btn-text">Dismiss</span>
                  </button>
               </div>
            </div>
         )}
      </div>
   );
}
