import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Custom hook for webcam management during Mock Interviews.
 * Adheres to SRP: handles media stream lifecycle and track disposal.
 */
export const useWebcam = () => {
  const [isActive, setIsActive] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsActive(true);
      setHasPermission(true);
    } catch (err) {
      setError(err.message || 'Unable to access webcam');
      setHasPermission(false);
      setIsActive(false);
    }
  }, []);

  const toggleCamera = useCallback(() => {
    if (isActive) {
      stopCamera();
    } else {
      startCamera();
    }
  }, [isActive, startCamera, stopCamera]);

  useEffect(() => {
    return () => {
      // Ensure camera stops when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    videoRef,
    isActive,
    hasPermission,
    error,
    startCamera,
    stopCamera,
    toggleCamera,
  };
};

export default useWebcam;
