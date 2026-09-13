import { create } from 'zustand';
import { database } from '@/services/database';
import { logger } from '@/services/logger';
import { Document, Folder, SearchQuery, SearchResult } from '@/types';

interface DocumentStoreState {
  // Documents
  documents: Document[];
  selectedDocuments: string[];
  loadDocuments: (limit?: number, offset?: number) => Promise<void>;
  getDocument: (id: string) => Document | null;
  deleteDocument: (id: string) => Promise<void>;

  // Folders
  folders: Folder[];
  currentFolderId: string | null;
  loadFolders: () => Promise<void>;
  setCurrentFolder: (folderId: string | null) => void;

  // Search
  searchQuery: SearchQuery;
  searchResults: SearchResult[];
  setSearchQuery: (query: SearchQuery) => void;
  search: (query: SearchQuery) => Promise<void>;
  clearSearch: () => void;

  // Selection
  toggleDocumentSelection: (id: string) => void;
  clearSelection: () => void;
  selectAll: () => void;

  // UI
  isLoading: boolean;
  sortBy: 'date' | 'name' | 'size';
  setSortBy: (sortBy: 'date' | 'name' | 'size') => void;

  // Refresh
  refresh: () => Promise<void>;
}

export const useDocumentStore = create<DocumentStoreState>((set, get) => ({
  // Documents
  documents: [],
  selectedDocuments: [],
  loadDocuments: async (limit = 50, offset = 0) => {
    try {
      set({ isLoading: true });
      logger.startTimer('load_documents');

      const docs = await database.getAllDocuments(limit, offset);
      set({ documents: docs });

      logger.endTimer('load_documents');
      logger.info('Documents loaded', { count: docs.length });
    } catch (error) {
      logger.error('Failed to load documents', error);
      set({ documents: [] });
    } finally {
      set({ isLoading: false });
    }
  },
  getDocument: (id) => {
    return get().documents.find((doc) => doc.id === id) || null;
  },
  deleteDocument: async (id) => {
    try {
      await database.deleteDocument(id);
      set((state) => ({
        documents: state.documents.filter((doc) => doc.id !== id),
      }));
      logger.info('Document deleted', { id });
    } catch (error) {
      logger.error('Failed to delete document', error);
    }
  },

  // Folders
  folders: [],
  currentFolderId: null,
  loadFolders: async () => {
    try {
      logger.debug('Loading folders');
      // TODO: Implement folder loading when service is ready
      set({ folders: [] });
    } catch (error) {
      logger.error('Failed to load folders', error);
    }
  },
  setCurrentFolder: (folderId) => {
    set({ currentFolderId: folderId });
    logger.debug('Current folder changed', { folderId });
  },

  // Search
  searchQuery: { text: '', filters: {} },
  searchResults: [],
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },
  search: async (query) => {
    try {
      set({ isLoading: true });
      logger.startTimer('document_search');

      // TODO: Implement actual search when service is ready
      const results: SearchResult[] = [];

      set({ searchResults: results });
      logger.endTimer('document_search');
      logger.info('Search completed', { resultCount: results.length });
    } catch (error) {
      logger.error('Search failed', error);
      set({ searchResults: [] });
    } finally {
      set({ isLoading: false });
    }
  },
  clearSearch: () => {
    set({ searchQuery: { text: '', filters: {} }, searchResults: [] });
    logger.debug('Search cleared');
  },

  // Selection
  toggleDocumentSelection: (id) => {
    set((state) => {
      const selected = state.selectedDocuments.includes(id)
        ? state.selectedDocuments.filter((docId) => docId !== id)
        : [...state.selectedDocuments, id];
      return { selectedDocuments: selected };
    });
  },
  clearSelection: () => {
    set({ selectedDocuments: [] });
  },
  selectAll: () => {
    set((state) => ({
      selectedDocuments: state.documents.map((doc) => doc.id),
    }));
  },

  // UI
  isLoading: false,
  sortBy: 'date',
  setSortBy: (sortBy) => {
    set({ sortBy });
    logger.debug('Sort order changed', { sortBy });
  },

  // Refresh
  refresh: async () => {
    const { loadDocuments, loadFolders } = get();
    await loadDocuments();
    await loadFolders();
  },
}));