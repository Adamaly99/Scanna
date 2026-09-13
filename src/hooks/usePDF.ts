import { useCallback, useState } from 'react';
import { pdf } from '@/services/pdf';
import { logger } from '@/services/logger';
import { Document, PDFExportOptions } from '@/types';

export function usePDF() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generatePDF = useCallback(
    async (document: Document, options?: PDFExportOptions) => {
      try {
        setIsGenerating(true);
        setError(null);

        logger.startTimer('pdf_generation_hook');

        const uri = await pdf.generatePDF(document, options);

        setPdfUri(uri);
        logger.endTimer('pdf_generation_hook');

        return uri;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        logger.error('PDF generation failed', err);
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  const clearPDF = useCallback(() => {
    setPdfUri(null);
    setError(null);
  }, []);

  return {
    generatePDF,
    pdfUri,
    isGenerating,
    error,
    clearPDF,
  };
}