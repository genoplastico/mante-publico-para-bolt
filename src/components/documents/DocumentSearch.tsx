import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { DocumentSearchFilters } from './DocumentSearchFilters';
import type { SearchFilters } from '../../services/documents/search/types';

interface DocumentSearchProps {
  onSearch: (query: { text: string; filters?: SearchFilters }) => void;
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
  const [searchText, setSearchText] = React.useState('');
  const [filters, setFilters] = React.useState<SearchFilters>();

  const handleSearch = () => {
    onSearch({ text: searchText, filters });
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
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Buscar
        </button>
      </div>

      <DocumentSearchFilters onFiltersChange={setFilters} />
    </div>
  );
}