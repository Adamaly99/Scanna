import { useCallback, useState } from 'react';
import { ocr } from '@/services/ocr';
import { logger } from '@/services/logger';
import { OCRResult } from '@/types';

export function useOCR() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const extractText = useCallback(
    async (imageUri: string, languages?: string[]) => {
      try {
        setIsProcessing(true);
        setError(null);

        logger.startTimer('ocr_hook_extract');

        const result = await ocr.extractText(imageUri, { languages });

        if (result) {
          setOcrResult(result);
          logger.endTimer('ocr_hook_extract');
          return result;
        } else {
          throw new Error('OCR extraction returned null');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        logger.error('OCR extraction failed', err);
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  const extractTextBatch = useCallback(
    async (imageUris: string[], languages?: string[]) => {
      try {
        setIsProcessing(true);
        setError(null);

        const results = await ocr.extractTextBatch(imageUris, { languages });

        logger.info('Batch OCR completed', { count: results.length });
        return results;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        logger.error('Batch OCR failed', err);
        return [];
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  const clearResult = useCallback(() => {
    setOcrResult(null);
    setError(null);
  }, []);

  return {
    extractText,
    extractTextBatch,
    ocrResult,
    isProcessing,
    error,
    clearResult,
  };
}