/**
 * Design System Scana 2.0
 * Source unique de vérité pour l'apparence
 */

// =============== COULEURS ===============
export const colors = {
  // Brand
  primary: '#2563EB', // Bleu principal
  primarySoft: '#DBEAFE', // Bleu léger pour backgrounds
  primaryDark: '#1E40AF', // Bleu foncé pour états actifs

  // Neutrals
  background: '#FFFFFF',
  backgroundSecondary: '#F9FAFB',
  surface: '#FFFFFF',
  surfaceSecondary: '#F3F4F6',

  // Text
  text: '#111827', // Noir principal
  textSecondary: '#6B7280', // Gris moyen
  textTertiary: '#9CA3AF', // Gris clair
  textInverse: '#FFFFFF',

  // Borders & Dividers
  border: '#E5E7EB',
  divider: '#F3F4F6',

  // Feedback
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Scanner & Camera
  scannerBg: '#000000',
  scannerOverlay: 'rgba(0, 0, 0, 0.4)',
  detectionSuccess: '#10B981',
  detectionPending: '#F59E0B',

  // UI Elements
  skeleton: '#E5E7EB',
  disabled: '#D1D5DB',
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Gradients
  gradientPrimary: ['#2563EB', '#1E40AF'],
  gradientWarning: ['#F59E0B', '#D97706'],
};

// =============== SPACING ===============
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

// =============== TYPOGRAPHIE ===============
export const typography = {
  // Display (très grand, headlines)
  display: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },

  // Headings
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
  h3: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600' as const,
    letterSpacing: -0.1,
  },

  // Body
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  bodyMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500' as const,
    letterSpacing: 0,
  },
  bodyStrong: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600' as const,
    letterSpacing: 0,
  },

  // Small body
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
    letterSpacing: 0.1,
  },
  bodySmallMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
  },

  // Captions
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.2,
  },
  captionStrong: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
  },

  // Buttons
  button: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600' as const,
    letterSpacing: 0,
  },
  buttonSmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600' as const,
    letterSpacing: 0,
  },
};

// =============== BORDER RADIUS ===============
export const radius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

// =============== SHADOWS ===============
export const shadows = {
  xs: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
};

// =============== ANIMATIONS ===============
export const animations = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 800,
};

// =============== Z-INDEX ===============
export const zIndex = {
  hidden: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modal: 1300,
  toast: 1400,
  tooltip: 1500,
};