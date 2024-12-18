import { useState, useCallback } from 'react';
import { SearchEngine } from '../services/documents/search/engine';
import type { Document, SearchFilters } from '../types';

interface UseDocumentSearchProps {
  onSearchComplete: (documents: Document[]) => void;
  onError: (error: Error) => void;
}

export function useDocumentSearch({ onSearchComplete, onError }: UseDocumentSearchProps) {
  return null;
}