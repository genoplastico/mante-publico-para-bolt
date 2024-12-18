import { useState, useCallback } from 'react';
import { SearchEngine } from '../services/documents/search/engine';
import type { Document, SearchFilters } from '../types';

interface UseDocumentSearchProps {
  onSearchComplete: (documents: Document[]) => void;
  onError: (error: Error) => void;
}

export function useDocumentSearch({ onSearchComplete, onError }: UseDocumentSearchProps) {
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState<SearchFilters>();
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (text: string) => {
    if (!text.trim()) return;
    
    try {
      setIsSearching(true);
      setError(null);
      
      const searchResult = await SearchEngine.search({
        text,
        filters: filters && Object.keys(filters).length > 0 ? filters : undefined
      });

      onSearchComplete(searchResult.items);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al buscar documentos';
      setError(errorMessage);
      onError(new Error(errorMessage));
    } finally {
      setIsSearching(false);
    }
  }, [filters, onSearchComplete, onError]);

  return {
    searchText,
    setSearchText,
    filters,
    setFilters,
    isSearching,
    error,
    search
  };
}