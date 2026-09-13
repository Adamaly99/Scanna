import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { database } from '@/services/database';
import { logger } from '@/services/logger';

export type AppTheme = 'light' | 'dark' | 'auto';
export type AppLocale = 'fr' | 'en' | 'es';

interface AppLockSettings {
  enabled: boolean;
  biometricEnabled: boolean;
  pinCode?: string;
}

interface AppState {
  // Theme
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;

  // Locale
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;

  // Onboarding
  onboardingComplete: boolean;
  setOnboardingComplete: (complete: boolean) => void;

  // App Lock
  appLock: AppLockSettings;
  setAppLock: (lock: AppLockSettings) => void;

  // App State
  isAppLocked: boolean;
  lockApp: () => void;
  unlockApp: () => void;

  // Initialization
  isInitialized: boolean;
  initialize: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Theme
      theme: 'auto',
      setTheme: (theme) => {
        set({ theme });
        database.setAppState('theme', theme);
        logger.info('Theme changed', { theme });
      },

      // Locale
      locale: 'fr',
      setLocale: (locale) => {
        set({ locale });
        database.setAppState('locale', locale);
        logger.info('Locale changed', { locale });
      },

      // Onboarding
      onboardingComplete: false,
      setOnboardingComplete: (complete) => {
        set({ onboardingComplete: complete });
        database.setAppState('onboarding_complete', complete.toString());
        logger.info('Onboarding status changed', { complete });
      },

      // App Lock
      appLock: {
        enabled: false,
        biometricEnabled: false,
        pinCode: undefined,
      },
      setAppLock: (lock) => {
        set({ appLock: lock });
        database.setAppState('app_lock', JSON.stringify(lock));
        logger.info('App lock settings updated');
      },

      // App State
      isAppLocked: false,
      lockApp: () => {
        set({ isAppLocked: true });
        logger.info('App locked');
      },
      unlockApp: () => {
        set({ isAppLocked: false });
        logger.info('App unlocked');
      },

      // Initialization
      isInitialized: false,
      initialize: async () => {
        try {
          logger.startTimer('app_initialization');

          // Load theme
          const savedTheme = await database.getAppState('theme');
          if (savedTheme) {
            set({ theme: (savedTheme as AppTheme) || 'auto' });
          }

          // Load locale
          const savedLocale = await database.getAppState('locale');
          if (savedLocale) {
            set({ locale: (savedLocale as AppLocale) || 'fr' });
          }

          // Load onboarding status
          const savedOnboarding = await database.getAppState('onboarding_complete');
          if (savedOnboarding) {
            set({ onboardingComplete: savedOnboarding === 'true' });
          }

          // Load app lock settings
          const savedAppLock = await database.getAppState('app_lock');
          if (savedAppLock) {
            set({ appLock: JSON.parse(savedAppLock) });
          }

          set({ isInitialized: true });
          logger.endTimer('app_initialization');
          logger.info('App store initialized');
        } catch (error) {
          logger.error('App store initialization failed', error);
          set({ isInitialized: false });
        }
      },
    }),
    {
      name: 'app-store',
      storage: createJSONStorage(() => ({
        getItem: async (key) => {
          try {
            const value = await database.getAppState(key);
            return value ? JSON.parse(value) : null;
          } catch {
            return null;
          }
        },
        setItem: async (key, value) => {
          await database.setAppState(key, JSON.stringify(value));
        },
        removeItem: async (key) => {
          await database.setAppState(key, '');
        },
      })),
    }
  )
);