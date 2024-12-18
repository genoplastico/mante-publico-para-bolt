import type { DocumentType, DocumentStatus } from '../../../types';
import type { SEARCH_CONFIG } from './constants';

export interface SearchFilters {
  type?: DocumentType[];
  status?: DocumentStatus[];
  dateRange?: {
    start: string;
    end: string;
  };
  metadata?: {
    keywords?: string[];
    category?: string;
    tags?: string[];
  };
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export interface SearchOptions {
  filters?: SearchFilters;
  sort?: SortOption;
  pagination?: PaginationOptions;
}

export type SearchableField = typeof SEARCH_CONFIG.SEARCHABLE_FIELDS[number];