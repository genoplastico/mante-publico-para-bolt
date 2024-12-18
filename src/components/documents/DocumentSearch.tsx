import React from 'react';
import { Search } from 'lucide-react';
import { DocumentSearchFilters } from './DocumentSearchFilters';
import { useDebounce } from '../../hooks/useDebounce';
import { useDocumentSearch } from '../../hooks/useDocumentSearch';
import type { Document } from '../../types';

interface DocumentSearchProps {
  onSearchStart: () => void;
  onSearchComplete: (documents: Document[]) => void;
  onError: (error: Error) => void;
}

export function DocumentSearch({ onSearchStart, onSearchComplete, onError }: DocumentSearchProps) {
  const {
    searchText,
    setSearchText,
    filters,
    setFilters,
    isSearching,
    search
  } = useDocumentSearch({
    onSearchComplete,
    onError
  });

  const debouncedSearchText = useDebounce(searchText, 300);

  React.useEffect(() => {
    if (debouncedSearchText && debouncedSearchText.length > 2) {
      onSearchStart();
      search(debouncedSearchText);
    }
  }, [debouncedSearchText, search, onSearchStart]);

  const handleSearch = React.useCallback(() => {
    if (searchText.trim()) {
      onSearchStart();
      search(searchText.trim());
    }
  }, [searchText, search, onSearchStart]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Buscar documentos..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
              }
            }}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSearching}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        
        <button
          onClick={handleSearch}
          disabled={isSearching || !searchText.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {isSearching ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Buscando...
            </div>
          ) : (
            'Buscar'
          )}
        </button>
      </div>

      <DocumentSearchFilters 
        onFiltersChange={setFilters}
      />
    </div>
  );
}