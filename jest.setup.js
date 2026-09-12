/**
 * Jest Setup
 * Configuration pour les tests unitaires
 */

// Mock console en mode test
global.console = {
  ...console,
  debug: jest.fn(),
  info: jest.fn(),
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock des APIs Expo
jest.mock('expo-file-system', () => ({
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  deleteAsync: jest.fn(),
  getInfoAsync: jest.fn(),
  getFreeDiskStorageAsync: jest.fn(() => Promise.resolve(1000000000)),
  getContentUriAsync: jest.fn(),
  DocumentDirectoryPath: '/documents',
  CacheDirectoryPath: '/cache',
  readDirectoryAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  copyAsync: jest.fn(),
  moveAsync: jest.fn(),
}));

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(() =>
    Promise.resolve({
      execAsync: jest.fn(),
      runAsync: jest.fn(),
      getAllAsync: jest.fn(),
      getFirstAsync: jest.fn(),
      closeAsync: jest.fn(),
    })
  ),
}));

jest.mock('expo-camera', () => ({
  useCameraPermissions: jest.fn(() => [
    { granted: true },
    jest.fn(),
  ]),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
}));

// Mock __DEV__
global.__DEV__ = false;