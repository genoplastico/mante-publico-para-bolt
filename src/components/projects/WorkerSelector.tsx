import React, { useState, useEffect } from 'react';
import { Search, Plus, Users } from 'lucide-react';
import { WorkerService } from '../../services/workers';
import type { Worker } from '../../types';

interface WorkerSelectorProps {
  projectId: string;
  onWorkerSelect: (worker: Worker) => void;
  onClose: () => void;
}

export function WorkerSelector({ projectId, onWorkerSelect, onClose }: WorkerSelectorProps) {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [filteredWorkers, setFilteredWorkers] = useState<Worker[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWorkers();
  }, []);

  useEffect(() => {
    filterWorkers();
  }, [searchQuery, workers]);

  const loadWorkers = async () => {
    try {
      setIsLoading(true);
      const allWorkers = await WorkerService.getWorkers();
      // Solo mostrar trabajadores que no estén en el proyecto actual
      setWorkers(allWorkers.filter(worker => 
        !worker.projectIds?.includes(projectId)
      ));
    } catch (error) {
      console.error('Error loading workers:', error);
      setWorkers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterWorkers = () => {
    if (!searchQuery.trim()) {
      setFilteredWorkers(workers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = workers.filter(
      worker =>
        worker.name.toLowerCase().includes(query) ||
        worker.documentNumber.includes(query)
    );
    setFilteredWorkers(filtered);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar por nombre o cédula..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>

      {filteredWorkers.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          No se encontraron operarios disponibles
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredWorkers.map((worker) => (
            <div
              key={worker.id}
              className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-blue-500 cursor-pointer transition-colors"
              onClick={() => onWorkerSelect(worker)}
            >
              <div>
                <p className="font-medium text-gray-900">{worker.name}</p>
                <p className="text-sm text-gray-500">CI: {worker.documentNumber}</p>
                {worker.projectIds?.length > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    Asignado a {worker.projectIds.length} {worker.projectIds.length === 1 ? 'obra' : 'obras'}
                  </p>
                )}
              </div>
              <Plus className="h-5 w-5 text-blue-600" />
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end pt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}