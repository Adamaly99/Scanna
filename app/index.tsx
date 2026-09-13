import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera } from 'expo-camera';
import { Text, Button } from '@/components/atoms';
import { useCamera } from '@/hooks/useCamera';
import { useScanner } from '@/hooks/useScanner';
import { colors, spacing } from '@/constants/theme';
import { logger } from '@/services/logger';

const { width } = Dimensions.get('window');

export default function ScanScreen() {
  const router = useRouter();
  const cameraRef = useRef<Camera>(null);
  const { hasPermission, requestPermission, cameraType, toggleCameraType, flashMode, toggleFlash } =
    useCamera({ autoRequest: true });
  const { captureFrame, cancelScan, pageCount, isAutoCaptureEnabled, setIsAutoCaptureEnabled } =
    useScanner();
  const [isCameraReady, setIsCameraReady] = useState(false);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, []);

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text variant="h2" style={styles.title}>
          Autorisation caméra requise
        </Text>
        <Button
          label="Accorder l'accès"
          onPress={requestPermission}
          style={styles.button}
        />
      </View>
    );
  }

  const handleCapture = async () => {
    try {
      if (!cameraRef.current || !isCameraReady) return;

      logger.startTimer('capture_photo');
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: false,
      });

      // Placeholder for detection - will be implemented in Phase 3
      await captureFrame(photo.uri, null);

      logger.endTimer('capture_photo');
      logger.info('Photo captured', { uri: photo.uri });
    } catch (error) {
      logger.error('Failed to capture photo', error);
    }
  };

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={cameraType}
        flashMode={flashMode}
        onCameraReady={() => setIsCameraReady(true)}
      >
        {/* Top Controls */}
        <View style={styles.topControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => router.back()}
          >
            <Text style={styles.controlText}>✕</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleFlash}
          >
            <Text style={styles.controlText}>
              {flashMode === 'on' ? '🔦' : '💡'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleCameraType}
          >
            <Text style={styles.controlText}>🔄</Text>
          </TouchableOpacity>
        </View>

        {/* Page Counter */}
        {pageCount > 0 && (
          <View style={styles.pageCounter}>
            <Text style={styles.pageCounterText}>
              {pageCount} page{pageCount > 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </Camera>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <TouchableOpacity
          style={[
            styles.autoButton,
            isAutoCaptureEnabled && styles.autoButtonActive,
          ]}
          onPress={() => setIsAutoCaptureEnabled(!isAutoCaptureEnabled)}
        >
          <Text
            style={[
              styles.autoButtonText,
              isAutoCaptureEnabled && styles.autoButtonTextActive,
            ]}
          >
            Auto
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.captureButton}
          onPress={handleCapture}
        >
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.reviewButton}
          onPress={() => {
            if (pageCount > 0) {
              router.push('/scan/review');
            }
          }}
          disabled={pageCount === 0}
        >
          <Text style={styles.reviewButtonText}>
            Voir ({pageCount})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  camera: {
    flex: 1,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlText: {
    color: colors.white,
    fontSize: 20,
  },
  pageCounter: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginTop: spacing.lg,
  },
  pageCounterText: {
    color: colors.white,
    fontWeight: '600',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  autoButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.white,
  },
  autoButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  autoButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  autoButtonTextActive: {
    color: colors.white,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
  },
  reviewButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.white,
  },
  reviewButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  black: {
    color: colors.neutrals[900],
  },
});