import React from 'react';
import { Filter, X } from 'lucide-react';
import type { DocumentType, DocumentStatus } from '../../types';
import type { SearchFilters } from '../../services/documents/search/types';
import { DOCUMENT_TYPES } from '../../services/documents/constants';

interface DocumentSearchFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void;
}

const DOCUMENT_TYPE_OPTIONS = Object.entries(DOCUMENT_TYPES).map(([value, label]) => ({
  value: value as DocumentType,
  label
}));

const DOCUMENT_STATUSES: Array<{ value: DocumentStatus; label: string }> = [
  { value: 'valid', label: 'Vigente' },
  { value: 'expired', label: 'Vencido' },
  { value: 'expiring_soon', label: 'Por vencer' }
];

export function DocumentSearchFilters({ onFiltersChange }: DocumentSearchFiltersProps) {
  const [showFilters, setShowFilters] = React.useState(false);
  const [selectedTypes, setSelectedTypes] = React.useState<DocumentType[]>([]);
  const [selectedStatuses, setSelectedStatuses] = React.useState<DocumentStatus[]>([]);

  const updateFilters = React.useCallback(() => {
    const filters: SearchFilters = {};
    
    if (selectedTypes.length > 0) filters.type = selectedTypes;
    if (selectedStatuses.length > 0) filters.status = selectedStatuses;
    
    onFiltersChange(filters);
  }, [selectedTypes, selectedStatuses, onFiltersChange]);

  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedStatuses([]);
    updateFilters();
  };

  React.useEffect(() => {
    if (selectedTypes.length > 0 || selectedStatuses.length > 0) {
      updateFilters();
    }
  }, [selectedTypes, selectedStatuses, updateFilters]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center px-3 py-2 text-sm rounded-lg border ${
            showFilters 
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </button>

        {(selectedTypes.length > 0 || selectedStatuses.length > 0) && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
          >
            <X className="w-4 h-4 mr-1" />
            Limpiar filtros
          </button>
        )}
      </div>

      {showFilters && (
        <div className="p-4 bg-white rounded-lg border space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de documento
            </label>
            <div className="flex flex-wrap gap-2">
              {DOCUMENT_TYPE_OPTIONS.map(({ value, label }) => (
                <label
                  key={value}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                    selectedTypes.includes(value)
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={selectedTypes.includes(value)}
                    onChange={(e) => {
                      setSelectedTypes(
                        e.target.checked
                          ? [...selectedTypes, value]
                          : selectedTypes.filter(t => t !== value)
                      );
                    }}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <div className="flex flex-wrap gap-2">
              {DOCUMENT_STATUSES.map(({ value, label }) => (
                <label
                  key={value}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                    selectedStatuses.includes(value)
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={selectedStatuses.includes(value)}
                    onChange={(e) => {
                      setSelectedStatuses(
                        e.target.checked
                          ? [...selectedStatuses, value]
                          : selectedStatuses.filter(s => s !== value)
                      );
                    }}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}