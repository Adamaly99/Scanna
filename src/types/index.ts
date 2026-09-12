/**
 * Types partagés Scana 2.0
 * Source unique de vérité pour les contrats de données
 */

// =============== DOCUMENT ===============
export interface Document {
  id: string;
  title: string;
  createdAt: Date;
  modifiedAt: Date;
  pages: DocumentPage[];
  pageCount: number;
  totalSize: number;
  folderId?: string;
  tags: string[];
  isFavorite: boolean;
  ocrStatus: OCRStatus;
  localPath: string;
}

export interface DocumentPage {
  id: string;
  documentId: string;
  pageNumber: number;
  imageUri: string; // FileSystem URI
  width: number;
  height: number;
  fileSize: number;
  quad?: QuadrilateralPoint[]; // Document corner points
  adjustments: ImageAdjustments;
  filter: ImageFilter;
  ocrText?: string;
  createdAt: Date;
  modifiedAt: Date;
}

export type ImageFilter =
  | 'original'
  | 'document'
  | 'bw'
  | 'grayscale'
  | 'enhanced'
  | 'highContrast';

export interface ImageAdjustments {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation?: number; // -100 to 100
  rotation: number; // 0, 90, 180, 270
  hue?: number; // 0 to 360
}

// =============== SCANNER & DETECTION ===============
export interface DetectionResult {
  quad: QuadrilateralPoint[] | null; // Les 4 coins du document
  score: number; // 0-1: confiance de détection
  locked: boolean; // Utilisateur a verrouillé la détection
}

export interface QuadrilateralPoint {
  x: number;
  y: number;
}

export interface ScanPage {
  tempUri: string;
  width: number;
  height: number;
  quad: QuadrilateralPoint[] | null;
  filter: ImageFilter;
  adjustments: ImageAdjustments;
  fileSize: number;
  capturedAt: Date;
}

// =============== OCR ===============
export type OCRStatus = 'pending' | 'processing' | 'completed' | 'error';

export interface OCRResult {
  text: string;
  pageNumber: number;
  documentId: string;
  confidence: number; // 0-1
  processedAt: Date;
  language?: string;
}

// =============== PDF ===============
export interface PDFExportOptions {
  pageSize: 'A4' | 'letter' | 'auto';
  quality: 'low' | 'medium' | 'high';
  compression: boolean;
  metadata?: PDFMetadata;
}

export interface PDFMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  creator?: string;
  creationDate: Date;
  modificationDate: Date;
}

// =============== STORAGE & FOLDERS ===============
export interface Folder {
  id: string;
  name: string;
  description?: string;
  documentCount: number;
  createdAt: Date;
  modifiedAt: Date;
  color?: string;
}

// =============== SEARCH ===============
export interface SearchQuery {
  text: string;
  folderId?: string;
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  isFavoriteOnly?: boolean;
}

export interface SearchResult {
  documentId: string;
  pageNumber?: number;
  title: string;
  snippet?: string; // Context around match
  matchedAt: 'title' | 'content' | 'tag';
}

// =============== ANNOTATIONS ===============
export interface Annotation {
  id: string;
  pageId: string;
  type: 'highlight' | 'underline' | 'strikethrough' | 'note' | 'drawing';
  content: string | DrawingPath[];
  color?: string;
  createdAt: Date;
  modifiedAt: Date;
}

export interface DrawingPath {
  points: { x: number; y: number }[];
  strokeColor: string;
  strokeWidth: number;
}

// =============== SIGNATURE ===============
export interface Signature {
  id: string;
  name: string;
  data: string; // Base64 encoded SVG or image
  createdAt: Date;
}

// =============== SHARING ===============
export interface ShareLink {
  id: string;
  documentId: string;
  token: string;
  expiresAt?: Date;
  password?: string;
  allowDownload: boolean;
  createdAt: Date;
}

// =============== SECURITY ===============
export interface SecuritySettings {
  biometricEnabled: boolean;
  biometricType?: 'faceId' | 'fingerprint' | 'iris';
  appLocked: boolean;
  encryptionEnabled: boolean;
}

export interface AppLock {
  type: 'pin' | 'biometric' | 'password';
  enabled: boolean;
  lastLockedAt: Date;
}

// =============== SUBSCRIPTION ===============
export type SubscriptionTier = 'free' | 'pro' | 'premium';

export interface SubscriptionStatus {
  tier: SubscriptionTier;
  isPremium: boolean;
  expiresAt?: Date;
  autoRenew: boolean;
  features: SubscriptionFeatures;
}

export interface SubscriptionFeatures {
  maxDocuments: number;
  maxPages: number;
  ocrLanguages: number;
  cloudStorage: number; // MB
  advancedFilters: boolean;
  bulkOperations: boolean;
  customFolders: boolean;
  annotations: boolean;
  signatures: boolean;
  cloudSync: boolean;
}

// =============== APP STATE ===============
export interface AppState {
  onboardingDone: boolean;
  locked: boolean;
  theme: 'light' | 'dark' | 'auto';
  locale: string;
  lastUpdatedAt: Date;
}

// =============== ERROR HANDLING ===============
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

// =============== BATCH OPERATIONS ===============
export interface BatchOperation {
  id: string;
  type: 'delete' | 'move' | 'tag' | 'favorite' | 'export';
  documentIds: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  createdAt: Date;
  completedAt?: Date;
}

// =============== EXPORT FORMATS ===============
export type ExportFormat = 'pdf' | 'jpeg' | 'png' | 'text' | 'zip';

export interface ExportJob {
  id: string;
  format: ExportFormat;
  documentIds: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  outputUri?: string;
  createdAt: Date;
}

// =============== SYNC STATE ===============
export interface SyncState {
  isSyncing: boolean;
  lastSyncAt?: Date;
  pendingChanges: number;
  syncErrors: AppError[];
}

// =============== CAMERA STATE ===============
export interface CameraPermissionStatus {
  status: 'undetermined' | 'denied' | 'granted';
  canAskAgain: boolean;
}

export interface CameraCapabilities {
  flashModes: Array<'on' | 'off' | 'auto'>;
  zoomRange: [number, number];
  videoStabilizationModes: string[];
  autoFocusModes: string[];
}

// =============== PERFORMANCE METRICS ===============
export interface PerformanceMetric {
  name: string;
  value: number; // milliseconds
  timestamp: Date;
}

export interface AppMetrics {
  cameraInitTime: number;
  documentDetectionTime: number;
  imageProcessingTime: number;
  ocrProcessingTime: number;
  pdfGenerationTime: number;
  dbQueryTime: number;
}

// =============== UI STATES ===============
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number; // milliseconds
  action?: {
    label: string;
    onPress: () => void;
  };
}

export interface LoadingState {
  isLoading: boolean;
  progress?: number; // 0-100
  message?: string;
}