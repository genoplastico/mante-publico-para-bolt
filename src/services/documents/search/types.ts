import type { DocumentType, DocumentStatus } from '../../../types';

export interface SearchFilters {
  type?: DocumentType[];
  status?: DocumentStatus[];
  dateRange?: {
    start?: string;
    end?: string;
  };
}

export interface SearchOptions {
  text?: string;
  filters?: SearchFilters;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

export interface SearchResult {
  total: number;
  items: Document[];
  metadata: {
    filters: SearchFilters;
    appliedText: string | null;
  };
}