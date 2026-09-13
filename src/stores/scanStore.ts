import { create } from 'zustand';
import { logger } from '@/services/logger';
import {
  ScanPage,
  ImageAdjustments,
  ImageFilter,
  DetectionResult,
  QuadrilateralPoint,
} from '@/types';

interface ScanState {
  // Pages
  pages: ScanPage[];
  addPage: (page: ScanPage) => void;
  removePage: (pageIndex: number) => void;
  updatePage: (pageIndex: number, updates: Partial<ScanPage>) => void;
  clearPages: () => void;

  // Current page
  currentPageIndex: number;
  setCurrentPageIndex: (index: number) => void;
  getCurrentPage: () => ScanPage | null;

  // Detection
  detectionResult: DetectionResult | null;
  setDetectionResult: (result: DetectionResult | null) => void;

  // Adjustments
  adjustments: ImageAdjustments;
  setAdjustments: (adjustments: ImageAdjustments) => void;
  resetAdjustments: () => void;

  // Filter
  filter: ImageFilter;
  setFilter: (filter: ImageFilter) => void;

  // UI State
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;

  // Quad
  quad: QuadrilateralPoint[] | null;
  setQuad: (quad: QuadrilateralPoint[] | null) => void;

  // Reset
  reset: () => void;
}

const DEFAULT_ADJUSTMENTS: ImageAdjustments = {
  brightness: 0,
  contrast: 1,
  sharpness: 1,
};

const DEFAULT_FILTER: ImageFilter = 'none';

export const useScanStore = create<ScanState>((set, get) => ({
  // Pages
  pages: [],
  addPage: (page) => {
    set((state) => {
      const updated = [...state.pages, page];
      logger.info('Page added to scan', { totalPages: updated.length });
      return { pages: updated };
    });
  },
  removePage: (pageIndex) => {
    set((state) => {
      const updated = state.pages.filter((_, i) => i !== pageIndex);
      logger.info('Page removed from scan', { totalPages: updated.length });
      return { pages: updated };
    });
  },
  updatePage: (pageIndex, updates) => {
    set((state) => {
      const updated = [...state.pages];
      updated[pageIndex] = { ...updated[pageIndex], ...updates };
      logger.debug('Page updated', { pageIndex });
      return { pages: updated };
    });
  },
  clearPages: () => {
    set({ pages: [], currentPageIndex: 0 });
    logger.info('Scan pages cleared');
  },

  // Current page
  currentPageIndex: 0,
  setCurrentPageIndex: (index) => {
    set({ currentPageIndex: index });
    logger.debug('Current page changed', { pageIndex: index });
  },
  getCurrentPage: () => {
    const state = get();
    return state.pages[state.currentPageIndex] || null;
  },

  // Detection
  detectionResult: null,
  setDetectionResult: (result) => {
    set({ detectionResult: result });
    if (result) {
      logger.debug('Detection result updated', {
        confidence: result.confidence,
      });
    }
  },

  // Adjustments
  adjustments: DEFAULT_ADJUSTMENTS,
  setAdjustments: (adjustments) => {
    set({ adjustments });
    logger.debug('Image adjustments updated', adjustments);
  },
  resetAdjustments: () => {
    set({ adjustments: DEFAULT_ADJUSTMENTS });
    logger.info('Image adjustments reset');
  },

  // Filter
  filter: DEFAULT_FILTER,
  setFilter: (filter) => {
    set({ filter });
    logger.debug('Image filter changed', { filter });
  },

  // UI State
  isProcessing: false,
  setIsProcessing: (processing) => {
    set({ isProcessing: processing });
  },

  // Quad
  quad: null,
  setQuad: (quad) => {
    set({ quad });
    if (quad) {
      logger.debug('Document quad updated');
    }
  },

  // Reset
  reset: () => {
    set({
      pages: [],
      currentPageIndex: 0,
      detectionResult: null,
      adjustments: DEFAULT_ADJUSTMENTS,
      filter: DEFAULT_FILTER,
      isProcessing: false,
      quad: null,
    });
    logger.info('Scan store reset');
  },
}));