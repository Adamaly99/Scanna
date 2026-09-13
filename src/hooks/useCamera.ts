import { useEffect, useState, useCallback } from 'react';
import { useCameraPermissions, Camera } from 'expo-camera';
import { logger } from '@/services/logger';
import { CameraPermissionStatus } from '@/types';

interface UseCameraOptions {
  autoRequest?: boolean;
}

export function useCamera(options: UseCameraOptions = {}) {
  const { autoRequest = true } = options;
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState<'front' | 'back'>('back');
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('off');
  const [zoom, setZoom] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // Permission status
  const permissionStatus: CameraPermissionStatus = permission?.granted
    ? 'granted'
    : permission?.canAskAgain
      ? 'undetermined'
      : 'denied';

  // Request permission on mount if autoRequest is true
  useEffect(() => {
    if (autoRequest && permission && !permission.granted) {
      requestPermission();
    }
  }, [autoRequest, permission, requestPermission]);

  // Handle permission request
  const handleRequestPermission = useCallback(async () => {
    try {
      logger.info('Requesting camera permission');
      const result = await requestPermission();
      if (!result.granted) {
        logger.warn('Camera permission denied');
      }
      return result.granted;
    } catch (error) {
      logger.error('Failed to request camera permission', error);
      return false;
    }
  }, [requestPermission]);

  // Toggle camera type
  const toggleCameraType = useCallback(() => {
    setCameraType((current) => (current === 'back' ? 'front' : 'back'));
    logger.debug('Camera type toggled', { type: cameraType });
  }, [cameraType]);

  // Toggle flash
  const toggleFlash = useCallback(() => {
    setFlashMode((current) => {
      const modes: ('off' | 'on' | 'auto')[] = ['off', 'on', 'auto'];
      const nextIndex = (modes.indexOf(current) + 1) % modes.length;
      return modes[nextIndex];
    });
  }, []);

  // Set flash mode
  const setFlashModeExplicit = useCallback(
    (mode: 'off' | 'on' | 'auto') => {
      setFlashMode(mode);
      logger.debug('Flash mode set', { mode });
    },
    []
  );

  // Handle zoom
  const handleZoom = useCallback((zoomValue: number) => {
    setZoom(zoomValue);
  }, []);

  // Handle camera ready
  const handleCameraReady = useCallback(() => {
    setIsReady(true);
    logger.info('Camera ready');
  }, []);

  return {
    // Permissions
    permissionStatus,
    hasPermission: permissionStatus === 'granted',
    requestPermission: handleRequestPermission,

    // Camera State
    cameraType,
    toggleCameraType,
    flashMode,
    toggleFlash,
    setFlashMode: setFlashModeExplicit,
    zoom,
    setZoom: handleZoom,
    isReady,

    // Handlers
    onCameraReady: handleCameraReady,
  };
}