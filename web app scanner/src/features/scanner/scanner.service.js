import { Html5Qrcode } from 'html5-qrcode';

export const isNative = () => false;

export const requestCameraPermissions = async () => {
  try {
    const devices = await Html5Qrcode.getCameras();
    return devices && devices.length > 0;
  } catch (err) {
    console.error("Camera permission error", err);
    return false;
  }
};

let html5QrCode = null;

export const startScan = async (listener) => {
  try {
    html5QrCode = new Html5Qrcode("reader");
    
    // Configure scanner for high performance
    const config = {
      fps: 10,
      disableFlip: false
    };

    await html5QrCode.start(
      { facingMode: "environment" },
      config,
      (decodedText, decodedResult) => {
        listener(decodedText);
      },
      (errorMessage) => {
        // parsing errors are normal, do not log by default
      }
    );
    
    return async () => {
      if (html5QrCode) {
        if (html5QrCode.isScanning) {
          await html5QrCode.stop();
        }
        html5QrCode.clear();
        html5QrCode = null;
      }
    };
  } catch (err) {
    console.error("Failed to start scanner", err);
    return async () => {};
  }
};
