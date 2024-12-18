import React from 'react';
import { Filter, X } from 'lucide-react';
import type { DocumentType, DocumentStatus } from '../../types';
import type { SearchFilters } from '../../services/documents/search/types';

interface DocumentSearchFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
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

export function DocumentSearchFilters({ onFiltersChange, initialFilters }: DocumentSearchFiltersProps) {
  const [showFilters, setShowFilters] = React.useState(false);
  const [selectedTypes, setSelectedTypes] = React.useState<DocumentType[]>(
    initialFilters?.type || []
  );
  const [selectedStatuses, setSelectedStatuses] = React.useState<DocumentStatus[]>(
    initialFilters?.status || []
  );
  const [dateRange, setDateRange] = React.useState(initialFilters?.dateRange);

  const updateFilters = React.useCallback(() => {
    const filters: SearchFilters = {};
    
    if (selectedTypes.length) filters.type = selectedTypes;
    if (selectedStatuses.length) filters.status = selectedStatuses;
    if (dateRange?.start || dateRange?.end) filters.dateRange = dateRange;
    
    onFiltersChange(filters);
  }, [selectedTypes, selectedStatuses, dateRange, onFiltersChange]);

  React.useEffect(() => {
    updateFilters();
  }, [updateFilters]);

  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedStatuses([]);
    setDateRange(undefined);
  };

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

        {(selectedTypes.length > 0 || selectedStatuses.length > 0 || dateRange) && (
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fecha desde
              </label>
              <input
                type="date"
                value={dateRange?.start || ''}
                onChange={(e) => setDateRange({
                  ...dateRange,
                  start: e.target.value
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fecha hasta
              </label>
              <input
                type="date"
                value={dateRange?.end || ''}
                onChange={(e) => setDateRange({
                  ...dateRange,
                  end: e.target.value
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}