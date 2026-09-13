import { logger } from '@/services/logger';

/**
 * Formatting Utilities
 */

export function formatFileSize(bytes: number): string {
  try {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  } catch (error) {
    logger.error('File size formatting failed', error);
    return '0 B';
  }
}

export function formatDate(date: Date): string {
  try {
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    logger.error('Date formatting failed', error);
    return '';
  }
}

export function formatDateTime(date: Date): string {
  try {
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    logger.error('DateTime formatting failed', error);
    return '';
  }
}

export function formatDuration(milliseconds: number): string {
  try {
    if (milliseconds < 1000) {
      return `${Math.round(milliseconds)}ms`;
    }

    const seconds = milliseconds / 1000;
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    }

    const minutes = seconds / 60;
    return `${minutes.toFixed(1)}m`;
  } catch (error) {
    logger.error('Duration formatting failed', error);
    return '0ms';
  }
}

export function formatPageCount(count: number): string {
  return `${count} page${count > 1 ? 's' : ''}`;
}

export function truncateString(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength - 3) + '...';
}

export function capitalizeFirstLetter(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}