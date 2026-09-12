/**
 * Database Service - SQLite avec migrations et type-safety
 * Gestion complète de la persistance
 */

import * as SQLite from 'expo-sqlite';
import { logger } from './logger';
import { DATABASE, ERROR_CODES } from '@/constants/app';
import { Document, DocumentPage, Folder, Annotation, Signature } from '@/types';
import { AppError } from '@/types';

interface DBConfig {
  dbName: string;
  version: number;
}

class DatabaseService {
  private static instance: DatabaseService;
  private db: SQLite.SQLiteDatabase | null = null;
  private config: DBConfig = {
    dbName: DATABASE.NAME,
    version: DATABASE.VERSION,
  };
  private initialized = false;

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Initialiser la base de données
   */
  async initialize(): Promise<void> {
    try {
      if (this.initialized) {
        return;
      }

      logger.startTimer('dbInitialize');

      this.db = await SQLite.openDatabaseAsync(this.config.dbName);
      await this.db.execAsync('PRAGMA journal_mode = WAL;');
      await this.db.execAsync('PRAGMA synchronous = NORMAL;');

      await this.runMigrations();

      this.initialized = true;
      logger.endTimer('dbInitialize');
      logger.info('Database initialized');
    } catch (error) {
      logger.error('Failed to initialize database', error);
      throw this.createError(
        ERROR_CODES.DB_CONNECTION_FAILED,
        'Could not initialize database'
      );
    }
  }

  /**
   * Exécuter les migrations
   */
  private async runMigrations(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      logger.debug('Running database migrations');

      // Migration v1: Tables principales
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS documents (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          createdAt INTEGER NOT NULL,
          modifiedAt INTEGER NOT NULL,
          pageCount INTEGER DEFAULT 0,
          totalSize INTEGER DEFAULT 0,
          folderId TEXT,
          isFavorite INTEGER DEFAULT 0,
          ocrStatus TEXT DEFAULT 'pending',
          localPath TEXT NOT NULL UNIQUE,
          tags TEXT,
          FOREIGN KEY (folderId) REFERENCES folders(id)
        );

        CREATE TABLE IF NOT EXISTS document_pages (
          id TEXT PRIMARY KEY,
          documentId TEXT NOT NULL,
          pageNumber INTEGER NOT NULL,
          imageUri TEXT NOT NULL,
          width INTEGER,
          height INTEGER,
          fileSize INTEGER,
          quad TEXT,
          adjustments TEXT,
          filter TEXT DEFAULT 'original',
          ocrText TEXT,
          createdAt INTEGER NOT NULL,
          modifiedAt INTEGER NOT NULL,
          FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE CASCADE,
          UNIQUE(documentId, pageNumber)
        );

        CREATE TABLE IF NOT EXISTS folders (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          documentCount INTEGER DEFAULT 0,
          createdAt INTEGER NOT NULL,
          modifiedAt INTEGER NOT NULL,
          color TEXT
        );

        CREATE TABLE IF NOT EXISTS annotations (
          id TEXT PRIMARY KEY,
          pageId TEXT NOT NULL,
          type TEXT NOT NULL,
          content TEXT NOT NULL,
          color TEXT,
          createdAt INTEGER NOT NULL,
          modifiedAt INTEGER NOT NULL,
          FOREIGN KEY (pageId) REFERENCES document_pages(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS signatures (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          data TEXT NOT NULL,
          createdAt INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS app_state (
          key TEXT PRIMARY KEY,
          value TEXT,
          updatedAt INTEGER NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_documents_folder ON documents(folderId);
        CREATE INDEX IF NOT EXISTS idx_documents_modified ON documents(modifiedAt);
        CREATE INDEX IF NOT EXISTS idx_document_pages_document ON document_pages(documentId);
        CREATE INDEX IF NOT EXISTS idx_annotations_page ON annotations(pageId);
      `);

      logger.debug('Migrations completed');
    } catch (error) {
      logger.error('Migration failed', error);
      throw this.createError(
        ERROR_CODES.DB_MIGRATION_FAILED,
        'Database migration failed'
      );
    }
  }

  /**
   * Insérer un document
   */
  async insertDocument(doc: Omit<Document, 'id' | 'createdAt' | 'modifiedAt'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = Date.now();

      await this.db.runAsync(
        `INSERT INTO documents (id, title, createdAt, modifiedAt, pageCount, totalSize, folderId, isFavorite, ocrStatus, localPath, tags)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          doc.title,
          now,
          now,
          doc.pageCount,
          doc.totalSize,
          doc.folderId || null,
          doc.isFavorite ? 1 : 0,
          doc.ocrStatus,
          doc.localPath,
          JSON.stringify(doc.tags),
        ]
      );

      logger.debug(`Document inserted: ${id}`);
      return id;
    } catch (error) {
      logger.error('Failed to insert document', error);
      throw this.createError(ERROR_CODES.DB_QUERY_FAILED, 'Failed to insert document');
    }
  }

  /**
   * Récupérer un document par ID
   */
  async getDocument(documentId: string): Promise<Document | null> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.getFirstAsync<any>(
        `SELECT * FROM documents WHERE id = ?`,
        [documentId]
      );

      if (!result) return null;

      const pages = await this.db.getAllAsync<any>(
        `SELECT * FROM document_pages WHERE documentId = ? ORDER BY pageNumber`,
        [documentId]
      );

      return {
        id: result.id,
        title: result.title,
        createdAt: new Date(result.createdAt),
        modifiedAt: new Date(result.modifiedAt),
        pageCount: result.pageCount,
        totalSize: result.totalSize,
        folderId: result.folderId,
        isFavorite: result.isFavorite === 1,
        ocrStatus: result.ocrStatus,
        localPath: result.localPath,
        tags: JSON.parse(result.tags || '[]'),
        pages: pages.map(p => ({
          id: p.id,
          documentId: p.documentId,
          pageNumber: p.pageNumber,
          imageUri: p.imageUri,
          width: p.width,
          height: p.height,
          fileSize: p.fileSize,
          quad: p.quad ? JSON.parse(p.quad) : undefined,
          adjustments: JSON.parse(p.adjustments || '{}'),
          filter: p.filter,
          ocrText: p.ocrText,
          createdAt: new Date(p.createdAt),
          modifiedAt: new Date(p.modifiedAt),
        })),
      };
    } catch (error) {
      logger.error(`Failed to get document: ${documentId}`, error);
      return null;
    }
  }

  /**
   * Récupérer tous les documents avec pagination
   */
  async getAllDocuments(limit: number = 50, offset: number = 0): Promise<Document[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const results = await this.db.getAllAsync<any>(
        `SELECT * FROM documents ORDER BY modifiedAt DESC LIMIT ? OFFSET ?`,
        [limit, offset]
      );

      return results.map(result => ({
        id: result.id,
        title: result.title,
        createdAt: new Date(result.createdAt),
        modifiedAt: new Date(result.modifiedAt),
        pageCount: result.pageCount,
        totalSize: result.totalSize,
        folderId: result.folderId,
        isFavorite: result.isFavorite === 1,
        ocrStatus: result.ocrStatus,
        localPath: result.localPath,
        tags: JSON.parse(result.tags || '[]'),
        pages: [],
      }));
    } catch (error) {
      logger.error('Failed to get all documents', error);
      return [];
    }
  }

  /**
   * Compter les documents
   */
  async countDocuments(): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM documents`
      );
      return result?.count || 0;
    } catch (error) {
      logger.error('Failed to count documents', error);
      return 0;
    }
  }

  /**
   * Mettre à jour un document
   */
  async updateDocument(
    documentId: string,
    updates: Partial<Omit<Document, 'id' | 'createdAt'>>
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const fields: string[] = [];
      const values: any[] = [];

      if (updates.title !== undefined) {
        fields.push('title = ?');
        values.push(updates.title);
      }
      if (updates.pageCount !== undefined) {
        fields.push('pageCount = ?');
        values.push(updates.pageCount);
      }
      if (updates.totalSize !== undefined) {
        fields.push('totalSize = ?');
        values.push(updates.totalSize);
      }
      if (updates.isFavorite !== undefined) {
        fields.push('isFavorite = ?');
        values.push(updates.isFavorite ? 1 : 0);
      }
      if (updates.ocrStatus !== undefined) {
        fields.push('ocrStatus = ?');
        values.push(updates.ocrStatus);
      }
      if (updates.tags !== undefined) {
        fields.push('tags = ?');
        values.push(JSON.stringify(updates.tags));
      }

      fields.push('modifiedAt = ?');
      values.push(Date.now());
      values.push(documentId);

      await this.db.runAsync(
        `UPDATE documents SET ${fields.join(', ')} WHERE id = ?`,
        values
      );

      logger.debug(`Document updated: ${documentId}`);
    } catch (error) {
      logger.error(`Failed to update document: ${documentId}`, error);
      throw this.createError(ERROR_CODES.DB_QUERY_FAILED, 'Failed to update document');
    }
  }

  /**
   * Supprimer un document
   */
  async deleteDocument(documentId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync(`DELETE FROM documents WHERE id = ?`, [documentId]);
      logger.debug(`Document deleted: ${documentId}`);
    } catch (error) {
      logger.error(`Failed to delete document: ${documentId}`, error);
      throw this.createError(ERROR_CODES.DB_QUERY_FAILED, 'Failed to delete document');
    }
  }

  /**
   * Insérer une page de document
   */
  async insertDocumentPage(
    page: Omit<DocumentPage, 'id' | 'createdAt' | 'modifiedAt'>
  ): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const id = `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = Date.now();

      await this.db.runAsync(
        `INSERT INTO document_pages (id, documentId, pageNumber, imageUri, width, height, fileSize, quad, adjustments, filter, createdAt, modifiedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          page.documentId,
          page.pageNumber,
          page.imageUri,
          page.width,
          page.height,
          page.fileSize,
          page.quad ? JSON.stringify(page.quad) : null,
          JSON.stringify(page.adjustments),
          page.filter,
          now,
          now,
        ]
      );

      logger.debug(`Document page inserted: ${id}`);
      return id;
    } catch (error) {
      logger.error('Failed to insert document page', error);
      throw this.createError(ERROR_CODES.DB_QUERY_FAILED, 'Failed to insert document page');
    }
  }

  /**
   * Récupérer l'état de l'app (key-value store)
   */
  async getAppState(key: string): Promise<string | null> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.getFirstAsync<{ value: string }>(
        `SELECT value FROM app_state WHERE key = ?`,
        [key]
      );
      return result?.value || null;
    } catch (error) {
      logger.error(`Failed to get app state: ${key}`, error);
      return null;
    }
  }

  /**
   * Définir l'état de l'app
   */
  async setAppState(key: string, value: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO app_state (key, value, updatedAt) VALUES (?, ?, ?)`,
        [key, value, Date.now()]
      );
    } catch (error) {
      logger.error(`Failed to set app state: ${key}`, error);
      throw this.createError(ERROR_CODES.DB_QUERY_FAILED, 'Failed to set app state');
    }
  }

  /**
   * Vacuum la base de données
   */
  async vacuum(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      logger.startTimer('dbVacuum');
      await this.db.execAsync('VACUUM;');
      logger.endTimer('dbVacuum');
      logger.debug('Database vacuumed');
    } catch (error) {
      logger.error('Failed to vacuum database', error);
    }
  }

  /**
   * Fermer la base de données
   */
  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      this.initialized = false;
      logger.info('Database closed');
    }
  }

  /**
   * Créer une erreur AppError
   */
  private createError(code: string, message: string): AppError {
    return {
      code,
      message,
      timestamp: new Date(),
      severity: 'error',
    };
  }
}

export const database = DatabaseService.getInstance();