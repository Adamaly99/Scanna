/**
 * Constantes applicatives Scana 2.0
 */

// =============== VERSION & BUILD ===============
export const APP = {
  NAME: 'Scana',
  VERSION: '2.0.0',
  BUILD_NUMBER: 1,
  PACKAGE_NAME: 'com.adamaly.scana',
  WEBSITE: 'https://scana.app',
  GITHUB: 'https://github.com/Adamaly99/Scanna',
} as const;

// =============== STORAGE LIMITS ===============
export const STORAGE = {
  // Limites fichiers
  MAX_IMAGE_SIZE_MB: 25,
  MAX_DOCUMENT_SIZE_MB: 500,
  MIN_FREE_SPACE_MB: 50,

  // Limites métadonnées
  MAX_DOCUMENTS_FREE: 100,
  MAX_DOCUMENTS_PRO: 5000,
  MAX_PAGES_PER_DOCUMENT: 500,
  MAX_TITLE_LENGTH: 255,
  MAX_TAG_LENGTH: 50,
  MAX_TAGS_PER_DOCUMENT: 10,

  // Cache
  IMAGE_CACHE_MAX_SIZE_MB: 200,
  TEMP_FILES_CLEANUP_DAYS: 7,
} as const;

// =============== SCANNER ===============
export const SCANNER = {
  // Résolution
  PREVIEW_WIDTH: 480,
  PREVIEW_HEIGHT: 640,
  CAPTURE_WIDTH: 1600,
  CAPTURE_HEIGHT: 2000,
  THUMBNAIL_WIDTH: 200,
  THUMBNAIL_HEIGHT: 250,

  // Auto-capture
  DETECTION_THRESHOLD: 0.75, // 0-1
  FOCUS_STABILITY_FRAMES: 3, // nombre de frames stables avant capture
  AUTO_CAPTURE_DELAY_MS: 500, // délai avant capture auto

  // Analyse périodique
  ANALYSIS_INTERVAL_MS: 500,

  // Image quality
  CAPTURE_QUALITY: 0.9, // 0-1
  PREVIEW_QUALITY: 0.3, // qualité basse résolution pour feedback temps réel

  // Limites détection
  MIN_ASPECT_RATIO: 0.4, // largeur/hauteur min
  MAX_ASPECT_RATIO: 2.5, // largeur/hauteur max
  MIN_DOCUMENT_AREA_PERCENT: 5, // % de l'image
} as const;

// =============== IMAGE PROCESSING ===============
export const IMAGE_PROCESSING = {
  // Limites ajustements
  BRIGHTNESS_MIN: -100,
  BRIGHTNESS_MAX: 100,
  BRIGHTNESS_DEFAULT: 0,

  CONTRAST_MIN: -100,
  CONTRAST_MAX: 100,
  CONTRAST_DEFAULT: 0,

  SATURATION_MIN: -100,
  SATURATION_MAX: 100,
  SATURATION_DEFAULT: 0,

  // Filtres
  FILTERS: ['original', 'document', 'bw', 'grayscale', 'enhanced', 'highContrast'] as const,

  // Temps de traitement max
  PROCESSING_TIMEOUT_MS: 10000,
} as const;

// =============== OCR ===============
export const OCR = {
  // Langues supportées
  SUPPORTED_LANGUAGES: ['fr', 'en', 'es', 'de', 'it', 'pt', 'ar', 'zh', 'ja'] as const,
  DEFAULT_LANGUAGE: 'fr' as const,

  // Limites traitement
  PROCESSING_TIMEOUT_MS: 30000,
  MAX_TEXT_LENGTH: 1000000, // caractères

  // Offline processing
  OFFLINE_MODE_ENABLED: true,
} as const;

// =============== PDF GENERATION ===============
export const PDF = {
  // Formats de page
  PAGE_SIZES: {
    A4: { width: 210, height: 297 }, // mm
    LETTER: { width: 8.5, height: 11 }, // inches
    AUTO: 'auto',
  },

  // Qualité
  QUALITY_PRESETS: {
    LOW: { quality: 0.6, maxWidth: 800 },
    MEDIUM: { quality: 0.8, maxWidth: 1200 },
    HIGH: { quality: 0.95, maxWidth: 2000 },
  },

  // Compression
  COMPRESSION_ENABLED: true,
  COMPRESSION_LEVEL: 0.8, // 0-1

  // Timeout
  GENERATION_TIMEOUT_MS: 60000,
} as const;

// =============== DATABASE ===============
export const DATABASE = {
  NAME: 'scana.db',
  VERSION: 1,

  // Limites requêtes
  QUERY_TIMEOUT_MS: 5000,
  BATCH_SIZE: 100,

  // Cleanup
  VACUUM_INTERVAL_DAYS: 7,
  STATS_UPDATE_INTERVAL_HOURS: 24,
} as const;

// =============== SEARCH ===============
export const SEARCH = {
  MIN_QUERY_LENGTH: 1,
  MAX_RESULTS: 100,
  DEBOUNCE_MS: 300,
  INDEX_UPDATE_DELAY_MS: 1000,
} as const;

// =============== ANIMATIONS ===============
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 800,
} as const;

// =============== PERMISSIONS ===============
export const PERMISSIONS_REQUIRED = ['camera', 'media_library'] as const;

export const PERMISSION_MESSAGES = {
  camera:
    'Scana a besoin d\'accéder à votre caméra pour numériser les documents.',
  media_library:
    'Scana a besoin d\'accéder à votre galerie pour importer et enregistrer les scans.',
  location:
    'Scana a besoin de votre localisation (optionnel pour des fonctionnalités futures).',
  microphone:
    'iOS nécessite l\'accès au microphone pour la caméra (Scana ne l\'enregistre pas).',
} as const;

// =============== ERREURS ===============
export const ERROR_CODES = {
  // Camera & Scanner
  CAMERA_NOT_AVAILABLE: 'CAMERA_NOT_AVAILABLE',
  CAMERA_PERMISSION_DENIED: 'CAMERA_PERMISSION_DENIED',
  DOCUMENT_NOT_DETECTED: 'DOCUMENT_NOT_DETECTED',
  CAPTURE_FAILED: 'CAPTURE_FAILED',

  // Storage
  INSUFFICIENT_SPACE: 'INSUFFICIENT_SPACE',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  FILE_WRITE_FAILED: 'FILE_WRITE_FAILED',
  FILE_READ_FAILED: 'FILE_READ_FAILED',

  // Database
  DB_CONNECTION_FAILED: 'DB_CONNECTION_FAILED',
  DB_QUERY_FAILED: 'DB_QUERY_FAILED',
  DB_MIGRATION_FAILED: 'DB_MIGRATION_FAILED',

  // Processing
  IMAGE_PROCESSING_FAILED: 'IMAGE_PROCESSING_FAILED',
  OCR_PROCESSING_FAILED: 'OCR_PROCESSING_FAILED',
  PDF_GENERATION_FAILED: 'PDF_GENERATION_FAILED',

  // Network
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',

  // Generic
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED',
} as const;

// =============== LOG LEVELS ===============
export const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
} as const;

export const LOG_LEVEL_PRIORITY = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
} as const;

// =============== DEFAULTS ===============
export const DEFAULTS = {
  THEME: 'auto' as const,
  LOCALE: 'fr' as const,
  IMAGE_FILTER: 'document' as const,
  SORT_BY: 'modifiedAt' as const,
  SORT_ORDER: 'desc' as const,
  ITEMS_PER_PAGE: 20,
  TOAST_DURATION_MS: 3000,
} as const;

// =============== FEATURE FLAGS ===============
export const FEATURES = {
  CLOUD_SYNC: false,
  ANNOTATIONS: true,
  SIGNATURES: true,
  SHARING: true,
  BATCH_OPERATIONS: true,
  ADVANCED_OCR: true,
  CUSTOM_FILTERS: true,
} as const;

// =============== API ENDPOINTS ===============
export const API = {
  BASE_URL: 'https://api.scana.app',
  TIMEOUT_MS: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
} as const;

// =============== SUBSCRIPTION LIMITS ===============
export const SUBSCRIPTION_LIMITS = {
  free: {
    maxDocuments: 100,
    maxPages: 500,
    ocrLanguages: 1,
    cloudStorage: 0,
    advancedFilters: false,
    bulkOperations: false,
    customFolders: false,
    annotations: false,
    signatures: false,
    cloudSync: false,
  },
  pro: {
    maxDocuments: 1000,
    maxPages: 10000,
    ocrLanguages: 5,
    cloudStorage: 100,
    advancedFilters: true,
    bulkOperations: true,
    customFolders: true,
    annotations: true,
    signatures: true,
    cloudSync: false,
  },
  premium: {
    maxDocuments: 99999,
    maxPages: 999999,
    ocrLanguages: 9,
    cloudStorage: 1000,
    advancedFilters: true,
    bulkOperations: true,
    customFolders: true,
    annotations: true,
    signatures: true,
    cloudSync: true,
  },
} as const;