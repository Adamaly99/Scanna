import { logger } from '@/services/logger';
import { SCANNER, STORAGE } from '@/constants/app';

/**
 * Validation Utilities
 */

export function validateImageSize(fileSizeInBytes: number): boolean {
  const maxSizeBytes = STORAGE.MAX_IMAGE_SIZE_MB * 1024 * 1024;
  const isValid = fileSizeInBytes <= maxSizeBytes;

  if (!isValid) {
    logger.warn('Image size exceeds limit', {
      size: fileSizeInBytes,
      maxSize: maxSizeBytes,
    });
  }

  return isValid;
}

export function validateDocumentTitle(title: string): boolean {
  if (!title || title.trim().length === 0) {
    logger.warn('Invalid document title: empty');
    return false;
  }

  if (title.length > 255) {
    logger.warn('Invalid document title: too long', { length: title.length });
    return false;
  }

  return true;
}

export function validatePageCount(count: number): boolean {
  const isValid =
    Number.isInteger(count) &&
    count > 0 &&
    count <= SCANNER.MAX_PAGES_PER_DOCUMENT;

  if (!isValid) {
    logger.warn('Invalid page count', { count });
  }

  return isValid;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validateLanguageCode(code: string): boolean {
  const validCodes = ['fr', 'en', 'es', 'de', 'it', 'pt', 'ar', 'zh', 'ja'];
  return validCodes.includes(code);
}