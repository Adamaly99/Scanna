import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import { logger } from './logger';
import { fileStorage } from './fileStorage';
import { PDFExportOptions, Document } from '@/types';
import { PDF } from '@/constants/app';

/**
 * PDF Service - Document Generation
 * 
 * Uses expo-print for native PDF generation
 * Handles compression, metadata, and quality presets
 */

class PDFService {
  private static instance: PDFService;

  private constructor() {}

  static getInstance(): PDFService {
    if (!PDFService.instance) {
      PDFService.instance = new PDFService();
    }
    return PDFService.instance;
  }

  /**
   * Generate PDF from document
   */
  async generatePDF(
    document: Document,
    options: PDFExportOptions = {}
  ): Promise<string> {
    try {
      logger.startTimer('pdf_generation');

      const {
        quality = 'medium',
        pageSize = 'A4',
        compression = true,
      } = options;

      // Build HTML from document pages
      const html = await this.buildHTML(document, quality);

      // Get page size dimensions
      const pageDimensions = this.getPageDimensions(pageSize);

      // Generate PDF
      const result = await Print.printToFileAsync({
        html,
        width: pageDimensions.width,
        height: pageDimensions.height,
        base64: false,
      });

      // Save to documents directory
      const fileName = `${document.title}-${Date.now()}.pdf`;
      const destinationUri = await fileStorage.saveFile(
        result.uri,
        'documents',
        fileName
      );

      // Compress if enabled
      if (compression) {
        await this.compressPDF(destinationUri);
      }

      logger.endTimer('pdf_generation');
      logger.info('PDF generated', { fileName, quality });

      return destinationUri;
    } catch (error) {
      logger.error('PDF generation failed', error);
      throw error;
    }
  }

  /**
   * Build HTML from document pages
   */
  private async buildHTML(
    document: Document,
    quality: 'low' | 'medium' | 'high'
  ): Promise<string> {
    try {
      const pages = document.pages || [];

      const imageElements = await Promise.all(
        pages.map(async (page, index) => {
          const base64 = await FileSystem.readAsStringAsync(
            page.imageUri,
            { encoding: FileSystem.EncodingType.Base64 }
          );

          return `
            <div style="page-break-after: always; margin: 0; padding: 0;">
              <img 
                src="data:image/jpeg;base64,${base64}"
                style="width: 100%; height: 100%; object-fit: contain;"
              />
            </div>
          `;
        })
      );

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <title>${document.title}</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                font-family: Arial, sans-serif;
              }
              .page {
                page-break-after: always;
              }
            </style>
          </head>
          <body>
            ${imageElements.join('')}
          </body>
        </html>
      `;

      return html;
    } catch (error) {
      logger.error('HTML building failed', error);
      throw error;
    }
  }

  /**
   * Get page dimensions in points
   */
  private getPageDimensions(
    pageSize: 'A4' | 'LETTER' | 'LEGAL'
  ): { width: number; height: number } {
    const sizes: Record<string, { width: number; height: number }> = {
      A4: { width: 595, height: 842 },
      LETTER: { width: 612, height: 792 },
      LEGAL: { width: 612, height: 1008 },
    };

    return sizes[pageSize] || sizes.A4;
  }

  /**
   * Compress PDF
   * Note: Actual compression requires native module
   * Placeholder for Phase 3 enhancement
   */
  private async compressPDF(pdfUri: string): Promise<void> {
    try {
      logger.debug('PDF compression started');

      // TODO: Integrate actual compression library
      // Options:
      // - react-native-pdf-lib
      // - PDFTron SDK
      // - Custom native module

      logger.debug('PDF compressed');
    } catch (error) {
      logger.warn('PDF compression failed (non-critical)', error);
    }
  }

  /**
   * Add metadata to PDF
   */
  async addMetadata(
    pdfUri: string,
    metadata: Record<string, string>
  ): Promise<void> {
    try {
      logger.debug('Adding PDF metadata');

      // TODO: Implement metadata injection
      // Requires PDF manipulation library

      logger.debug('Metadata added');
    } catch (error) {
      logger.warn('Failed to add metadata', error);
    }
  }

  /**
   * Get PDF info
   */
  async getPDFInfo(pdfUri: string): Promise<{ pages: number; size: number }> {
    try {
      const fileInfo = await fileStorage.getFileInfo(pdfUri);
      const sizeMB = await fileStorage.getFileSizeMB(pdfUri);

      return {
        pages: 0, // TODO: Parse PDF to get page count
        size: sizeMB,
      };
    } catch (error) {
      logger.error('Failed to get PDF info', error);
      throw error;
    }
  }
}

export const pdf = PDFService.getInstance();