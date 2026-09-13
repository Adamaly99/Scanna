import { useCallback, useState } from 'react';
import { logger } from '@/services/logger';
import { useScanStore } from '@/stores/scanStore';
import { ScanPage, DetectionResult } from '@/types';

interface UseScannerOptions {
  autoCaptureSensitivity?: 'low' | 'medium' | 'high';
}

export function useScanner(options: UseScannerOptions = {}) {
  const { autoCaptureSensitivity = 'medium' } = options;
  const scanStore = useScanStore();

  const [isAutoCaptureEnabled, setIsAutoCaptureEnabled] = useState(false);
  const [lastCaptureTime, setLastCaptureTime] = useState(0);
  const [detectionConfidence, setDetectionConfidence] = useState(0);

  // Auto-capture logic
  const checkAutoCapture = useCallback(
    async (detection: DetectionResult | null) => {
      if (!isAutoCaptureEnabled || !detection) return false;

      const now = Date.now();
      const minInterval =
        autoCaptureSensitivity === 'high'
          ? 500
          : autoCaptureSensitivity === 'medium'
            ? 800
            : 1200;

      if (now - lastCaptureTime < minInterval) {
        return false;
      }

      const confidenceThreshold =
        autoCaptureSensitivity === 'high'
          ? 0.75
          : autoCaptureSensitivity === 'medium'
            ? 0.80
            : 0.85;

      const shouldCapture =
        detection.confidence >= confidenceThreshold &&
        detection.quad &&
        detection.quad.length === 4;

      if (shouldCapture) {
        setLastCaptureTime(now);
        setDetectionConfidence(detection.confidence);
        logger.debug('Auto-capture triggered', {
          confidence: detection.confidence,
        });
        return true;
      }

      return false;
    },
    [isAutoCaptureEnabled, lastCaptureTime, autoCaptureSensitivity]
  );

  // Capture frame
  const captureFrame = useCallback(
    async (imageUri: string, detection: DetectionResult | null) => {
      try {
        logger.startTimer('frame_capture');

        const newPage: ScanPage = {
          id: Date.now().toString(),
          imageUri,
          adjustments: {
            brightness: 0,
            contrast: 1,
            sharpness: 1,
          },
          filter: 'none',
          quad: detection?.quad || null,
          ocr: null,
        };

        scanStore.addPage(newPage);
        scanStore.setCurrentPageIndex(scanStore.pages.length - 1);
        scanStore.setDetectionResult(detection);

        logger.endTimer('frame_capture');
        logger.info('Frame captured', {
          pageIndex: scanStore.pages.length - 1,
        });

        return newPage;
      } catch (error) {
        logger.error('Frame capture failed', error);
        throw error;
      }
    },
    [scanStore]
  );

  // Retake current page
  const retakeCurrentPage = useCallback(async () => {
    const currentIndex = scanStore.currentPageIndex;
    if (currentIndex >= 0) {
      scanStore.removePage(currentIndex);
      if (scanStore.pages.length > 0) {
        scanStore.setCurrentPageIndex(
          Math.min(currentIndex, scanStore.pages.length - 1)
        );
      }
      logger.info('Page retaken');
    }
  }, [scanStore]);

  // Remove page
  const removePage = useCallback(
    (pageIndex: number) => {
      scanStore.removePage(pageIndex);
      logger.debug('Page removed', { pageIndex });
    },
    [scanStore]
  );

  // Reorder pages
  const reorderPages = useCallback(
    (fromIndex: number, toIndex: number) => {
      const pages = [...scanStore.pages];
      const [removed] = pages.splice(fromIndex, 1);
      pages.splice(toIndex, 0, removed);
      scanStore.clearPages();
      pages.forEach((page) => scanStore.addPage(page));
      logger.debug('Pages reordered', { fromIndex, toIndex });
    },
    [scanStore]
  );

  // Complete scan
  const completeScan = useCallback(async () => {
    try {
      logger.info('Scan completed', { pageCount: scanStore.pages.length });
      return scanStore.pages;
    } catch (error) {
      logger.error('Scan completion failed', error);
      throw error;
    }
  }, [scanStore.pages]);

  // Cancel scan
  const cancelScan = useCallback(() => {
    scanStore.reset();
    logger.info('Scan cancelled');
  }, [scanStore]);

  return {
    // Pages
    pages: scanStore.pages,
    currentPageIndex: scanStore.currentPageIndex,
    currentPage: scanStore.getCurrentPage(),
    pageCount: scanStore.pages.length,

    // Detection
    detectionResult: scanStore.detectionResult,
    detectionConfidence,
    setDetectionResult: (result: DetectionResult | null) => {
      scanStore.setDetectionResult(result);
    },

    // Adjustments
    adjustments: scanStore.adjustments,
    setAdjustments: (adj) => scanStore.setAdjustments(adj),
    resetAdjustments: () => scanStore.resetAdjustments(),

    // Filter
    filter: scanStore.filter,
    setFilter: (filter) => scanStore.setFilter(filter),

    // Auto-capture
    isAutoCaptureEnabled,
    setIsAutoCaptureEnabled,
    checkAutoCapture,

    // Capture operations
    captureFrame,
    retakeCurrentPage,
    removePage,
    reorderPages,

    // Completion
    completeScan,
    cancelScan,

    // Processing state
    isProcessing: scanStore.isProcessing,
    setIsProcessing: (processing) => scanStore.setIsProcessing(processing),
  };
}