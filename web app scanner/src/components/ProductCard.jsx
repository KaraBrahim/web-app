import React, { useEffect, useState } from 'react';

export default function ProductCard({ product, onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (product) {
      // Allow layout, then trigger class for animation
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [product]);

  if (!product) return null;

  return (
    <div className={`product-card-wrapper ${isVisible ? 'slide-up-active' : ''}`}>
      <div className="glass-card product-card">
        <button className="close-btn glow-on-hover" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>

        {product.found ? (
          <div className="product-match-content">
            <div className="success-icon bounce-in">
              <svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <div className="product-details">
              <h3 className="product-name">{product.name}</h3>
              <div className="product-price">${String(product.price).replace(/"/g, '')}</div>
              <p className="barcode-id">UID: {product.barcode}</p>
            </div>
          </div>
        ) : (
          <div className="product-match-content">
            <div className="error-icon shake">
              <svg viewBox="0 0 24 24" fill="none"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <div className="product-details">
              <h3 className="product-name error-text">Unrecognized Product</h3>
              <p className="barcode-id code-block">{product.barcode}</p>
              <p className="error-desc text-muted">This barcode isn't in our offline database yet.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
