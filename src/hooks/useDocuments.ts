import { useCallback, useEffect } from 'react';
import { useDocumentStore } from '@/stores/documentStore';
import { database } from '@/services/database';
import { logger } from '@/services/logger';
import { Document } from '@/types';

export function useDocuments() {
  const documentStore = useDocumentStore();

  // Load documents on mount
  useEffect(() => {
    documentStore.loadDocuments();
  }, []);

  // CRUD Operations
  const createDocument = useCallback(
    async (documentData: Omit<Document, 'id' | 'createdAt' | 'modifiedAt'>) => {
      try {
        logger.startTimer('create_document');

        const newDocument: Document = {
          id: Date.now().toString(),
          ...documentData,
          createdAt: new Date(),
          modifiedAt: new Date(),
        };

        // TODO: Implement actual document insertion
        logger.endTimer('create_document');
        logger.info('Document created', { id: newDocument.id });

        return newDocument;
      } catch (error) {
        logger.error('Failed to create document', error);
        throw error;
      }
    },
    []
  );

  const updateDocument = useCallback(
    async (id: string, updates: Partial<Document>) => {
      try {
        logger.startTimer('update_document');

        const document = documentStore.getDocument(id);
        if (!document) {
          throw new Error('Document not found');
        }

        const updated = {
          ...document,
          ...updates,
          modifiedAt: new Date(),
        };

        // TODO: Implement actual document update
        logger.endTimer('update_document');
        logger.info('Document updated', { id });

        return updated;
      } catch (error) {
        logger.error('Failed to update document', error);
        throw error;
      }
    },
    [documentStore]
  );

  const deleteDocument = useCallback(
    async (id: string) => {
      try {
        logger.startTimer('delete_document');
        await documentStore.deleteDocument(id);
        logger.endTimer('delete_document');
        logger.info('Document deleted', { id });
      } catch (error) {
        logger.error('Failed to delete document', error);
        throw error;
      }
    },
    [documentStore]
  );

  // Batch operations
  const deleteSelectedDocuments = useCallback(async () => {
    try {
      logger.info('Deleting selected documents', {
        count: documentStore.selectedDocuments.length,
      });

      for (const id of documentStore.selectedDocuments) {
        await deleteDocument(id);
      }

      documentStore.clearSelection();
      logger.info('Selected documents deleted');
    } catch (error) {
      logger.error('Failed to delete selected documents', error);
    }
  }, [documentStore, deleteDocument]);

  // Export document
  const exportDocument = useCallback(
    async (id: string, format: 'pdf' | 'images' | 'zip' = 'pdf') => {
      try {
        logger.startTimer('export_document');

        const document = documentStore.getDocument(id);
        if (!document) {
          throw new Error('Document not found');
        }

        // TODO: Implement actual export
        logger.endTimer('export_document');
        logger.info('Document exported', { id, format });

        return true;
      } catch (error) {
        logger.error('Failed to export document', error);
        throw error;
      }
    },
    [documentStore]
  );

  return {
    // State
    documents: documentStore.documents,
    isLoading: documentStore.isLoading,
    selectedDocuments: documentStore.selectedDocuments,
    sortBy: documentStore.sortBy,

    // CRUD
    createDocument,
    getDocument: documentStore.getDocument,
    updateDocument,
    deleteDocument,

    // Batch
    deleteSelectedDocuments,
    toggleDocumentSelection: documentStore.toggleDocumentSelection,
    selectAll: documentStore.selectAll,
    clearSelection: documentStore.clearSelection,

    // Search
    search: documentStore.search,
    searchResults: documentStore.searchResults,
    clearSearch: documentStore.clearSearch,

    // UI
    setSortBy: documentStore.setSortBy,
    refresh: documentStore.refresh,

    // Export
    exportDocument,
  };
}