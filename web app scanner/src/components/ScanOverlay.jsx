import React from 'react';

export default function ScanOverlay() {
  return (
    <div className="scan-overlay">
      <div className="scanner-target">
        <div className="corner top-left"></div>
        <div className="corner top-right"></div>
        <div className="corner bottom-left"></div>
        <div className="corner bottom-right"></div>
        <div className="laser-beam"></div>
      </div>
      <div className="overlay-text">
        <p>Center barcode inside the frame</p>
      </div>
    </div>
  );
}
