import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import type { DocumentSearchQuery, DocumentType, DocumentStatus } from '../../types';

interface DocumentSearchProps {
  onSearch: (query: DocumentSearchQuery) => void;
}

const DOCUMENT_TYPES: Array<{ value: DocumentType; label: string }> = [
  { value: 'carnet_salud', label: 'Carnet de Salud' },
  { value: 'cert_seguridad', label: 'Certificado de Seguridad' },
  { value: 'entrega_epp', label: 'Entrega de EPP' },
  { value: 'recibo_sueldo', label: 'Recibo de Sueldo' },
  { value: 'cert_dgi', label: 'Certificado DGI' },
  { value: 'cert_bps', label: 'Certificado BPS' },
  { value: 'cert_seguro', label: 'Certificado de Seguro' }
];

const DOCUMENT_STATUSES: Array<{ value: DocumentStatus; label: string }> = [
  { value: 'valid', label: 'Vigente' },
  { value: 'expired', label: 'Vencido' },
  { value: 'expiring_soon', label: 'Por vencer' }
];

export function DocumentSearch({ onSearch }: DocumentSearchProps) {
  const [showFilters, setShowFilters] = React.useState(false);
  const [searchText, setSearchText] = React.useState('');
  const [selectedTypes, setSelectedTypes] = React.useState<DocumentType[]>([]);
  const [selectedStatuses, setSelectedStatuses] = React.useState<DocumentStatus[]>([]);

  const handleSearch = () => {
    const query: DocumentSearchQuery = {
      text: searchText,
      filters: {
        type: selectedTypes.length > 0 ? selectedTypes : undefined,
        status: selectedStatuses.length > 0 ? selectedStatuses : undefined
      }
    };
    onSearch(query);
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedStatuses([]);
    handleSearch();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Buscar documentos..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 rounded-lg border ${
            showFilters 
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="h-5 w-5" />
        </button>
        
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Buscar
        </button>
      </div>

      {showFilters && (
        <div className="p-4 bg-white rounded-lg border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Filtros</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
            >
              <X className="h-4 w-4 mr-1" />
              Limpiar filtros
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de documento
              </label>
              <div className="flex flex-wrap gap-2">
                {DOCUMENT_TYPES.map(({ value, label }) => (
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
        </div>
      )}
    </div>
  );
}