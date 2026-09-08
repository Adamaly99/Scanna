import React, { useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Alert } from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { colors, spacing, typography } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { ScannerOverlay } from '@/components/scanner/ScannerOverlay';
import { detectOnPhoto, AutoCaptureController } from '@/scanner/scannerService';
import { useScanStore } from '@/stores/scanStore';
import * as fileStorage from '@/storage/fileStorage';
import { hasFreeSpace } from '@/storage/fileStorage';
import { useToast } from '@/components/ui/Toast';
import { logger } from '@/utils/logger';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');

export default function ScanScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [, requestMic] = useMicrophonePermissions();
  const [flash, setFlash] = useState(false);
  const [detected, setDetected] = useState<{ quad: any; locked: boolean }>({ quad: null, locked: false });
  const [capturing, setCapturing] = useState(false);
  const autoCapture = useRef(new AutoCaptureController());
  const router = useRouter();
  const toast = useToast();
  const { addPage, pages } = useScanStore();
  const params = useLocalSearchParams<{ importUri?: string }>();

  React.useEffect(() => {
    void requestMic(); // requis par expo-camera sur iOS même sans audio
    if (params.importUri) void handleImport(params.importUri);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImport = async (uri: string) => {
    const ok = await processCapturedImage(uri);
    if (ok) router.push('/scan/review');
  };

  const processCapturedImage = useCallback(async (uri: string): Promise<boolean> => {
    if (!(await hasFreeSpace(5 * 1024 * 1024))) {
      Alert.alert('Stockage insuffisant', 'Libérez de l’espace pour numériser.');
      return false;
    }
    setCapturing(true);
    try {
      // Compression et normalisation orientation native
      const ctx = ImageManipulator.manipulate(uri);
      const img = await ctx.resize({ width: 1600 }).renderAsync();
      const b64 = await img.base64();
      if (!b64) throw new Error('base64 indisponible');
      const tempPath = `${fileStorage.documentDir('temp').uri}${Date.now()}.jpg`;
      const written = await fileStorage.writeBase64(tempPath, b64);
      if (!written.ok) throw written.error;

      // Détection réelle sur la photo capturée
      const det = await detectOnPhoto({ uri: tempPath, width: 1600, height: 0 });
      addPage({
        tempUri: written.value.uri,
        width: 1600,
        height: 0,
        quad: det.quad,
        filter: 'document',
        adjustments: { brightness: 0, contrast: 0, rotation: 0 },
        fileSize: written.value.size,
      });
      return true;
    } catch (e) {
      logger.error('Scan', 'Capture échouée', e);
      toast('Capture impossible. Réessayez.', 'error');
      return false;
    } finally {
      setCapturing(false);
    }
  }, [addPage, toast]);

  const capture = useCallback(async () => {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.9, skipProcessing: false });
    if (!photo) { toast('Caméra non prête', 'error'); return; }
    const ok = await processCapturedImage(photo.uri);
    autoCapture.current.reset();
    if (ok) router.push('/scan/review');
  }, [processCapturedImage, router, toast]);

  const onAnalyze = useCallback(async () => {
    // Analyse périodique : photo basse résolution pour le feedback temps réel
    if (capturing) return;
    try {
      const preview = await cameraRef.current?.takePictureAsync({ quality: 0.1 });
      if (!preview) return;
      const det = await detectOnPhoto(preview);
      setDetected({ quad: det.quad, locked: det.locked });
      if (useScanStore.getState().autoCapture && autoCapture.current.update(det.score)) {
        await capture();
      }
    } catch { /* frame ratée : on continue silencieusement */ }
  }, [capture, capturing]);

  React.useEffect(() => {
    const t = setInterval(() => void onAnalyze(), 500);
    return () => clearInterval(t);
  }, [onAnalyze]);

  if (!permission) return <View style={styles.bg} />;
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.perm}>
        <Text style={[typography.h2, { color: colors.text }]}>Caméra requise</Text>
        <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>
          Scana a besoin de la caméra pour numériser vos documents.
        </Text>
        <Pressable onPress={() => void requestPermission()} style={styles.permBtn}
          accessibilityRole="button" accessibilityLabel="Autoriser la caméra">
          <Text style={{ color: '#FFF', ...typography.button }}>Autoriser</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.bg}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back"
        flash={flash ? 'on' : 'off'} mode="picture" />
      <ScannerOverlay quad={detected.quad} locked={detected.locked} width={width} height={height} />

      <SafeAreaView style={styles.topBar} edges={['top']}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Fermer le scanner">
          <Icon name="close" size={26} color="#FFF" />
        </Pressable>
        <Text style={[typography.body, { color: '#FFF' }]}>{pages.length} page{pages.length > 1 ? 's' : ''}</Text>
        <Pressable onPress={() => setFlash((f) => !f)} hitSlop={12}
          accessibilityLabel={flash ? 'Désactiver le flash' : 'Activer le flash'}>
          <Icon name={flash ? 'flash' : 'flashOff'} size={24} color="#FFF" />
        </Pressable>
      </SafeAreaView>

      <View style={styles.bottomBar}>
        <Pressable style={styles.captureBtn} onPress={() => void capture()}
          accessibilityRole="button" accessibilityLabel="Capturer" disabled={capturing}>
          <Animated.View style={[styles.captureInner, captureAnim(capturing)]} />
        </Pressable>
      </View>
    </View>
  );
}

function captureAnim(active: boolean) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: withTiming(active ? 0.8 : 1, { duration: 120 }) }],
  }));
  return style;
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.scannerBg },
  perm: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  permBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: 12 },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.sm,
  },
  bottomBar: {
    position: 'absolute', bottom: 60, left: 0, right: 0,
    alignItems: 'center',
  },
  captureBtn: {
    width: 76, height: 76, borderRadius: 38,
    borderWidth: 4, borderColor: '#FFF',
    alignItems: 'center', justifyContent: 'center',
  },
  captureInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFF' },
});
