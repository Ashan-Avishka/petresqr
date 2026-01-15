// src/components/QRScanner.tsx
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, AlertCircle } from 'lucide-react';
import jsQR from 'jsqr';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (tagId: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ isOpen, onClose, onScan }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setError('');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      if (!videoRef.current) return;

      videoRef.current.srcObject = stream;

      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play();
        setIsScanning(true);
        animationFrameRef.current = requestAnimationFrame(scanQRCode);
      };
    } catch (err) {
      console.error(err);
      setError('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    setIsScanning(false);

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };


  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context || video.videoWidth === 0) {
      animationFrameRef.current = requestAnimationFrame(scanQRCode);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code?.data) {
      const tagId = extractTagId(code.data);
      if (tagId) {
        stopCamera();
        onScan(tagId);
        onClose();
        return;
      } else {
        setError('Invalid QR code. Please scan a PetResQR tag.');
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanQRCode);
  };


  const extractTagId = (url: string): string | null => {
    try {
      // Match patterns like: www.petresqr.com/user/6P421DZ5 or petresqr.com/user/6P421DZ5
      const match = url.match(/petresqr\.com\/user\/([A-Z0-9]+)/i);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-s z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-tl from-black to-primary p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Camera className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">Scan QR Code</h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Scanner Area */}
            <div className="relative bg-black aspect-square">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Scanning Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-64 h-64">
                  {/* Corner borders */}
                  <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-lg" />

                  {/* Scanning line animation */}
                  <motion.div
                    animate={{ y: [0, 256, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="absolute left-0 right-0 h-1 bg-primary shadow-[0_0_20px_rgba(251,191,36,0.8)]"
                  />
                </div>
              </div>
            </div>

            {/* Instructions/Error */}
            <div className="p-6 space-y-4">
              {error ? (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <p className="text-gray-100 font-medium">
                    Position the QR code within the frame
                  </p>
                  <p className="text-sm text-gray-300">
                    The scanner will automatically detect and read the code
                  </p>
                </div>
              )}

              <button
                onClick={handleClose}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QRScanner;