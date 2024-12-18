import React from 'react';
import { AlertCircle, CheckCircle2, FileText, Building2 } from 'lucide-react';
import type { Worker } from '../../types';
import { useAuth } from '../../hooks/useAuth';

interface WorkersListProps {
  workers: Worker[];
  onViewDetails: (worker: Worker) => void;
}

export function WorkersList({ workers, onViewDetails }: WorkersListProps) {
  if (workers.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">No hay operarios asignados a esta obra.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {workers.map((worker) => (
        <WorkerCard
          key={worker.id}
          worker={worker}
          onViewDetails={() => onViewDetails(worker)}
        />
      ))}
    </div>
  );
}

interface WorkerCardProps {
  worker: Worker;
  onViewDetails: () => void;
}

function WorkerCard({ worker, onViewDetails }: WorkerCardProps) {
  const { hasPermission } = useAuth();
  const expiredDocuments = worker.documents.filter(
    doc => doc.status === 'expired'
  ).length;

  return (
    <div className="bg-white rounded-lg border p-4 hover:border-blue-200 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-gray-900">{worker.name}</h3>
          <p className="text-sm text-gray-500">CI: {worker.documentNumber}</p>
          
          <div className="mt-2 flex items-center space-x-4">
            {expiredDocuments > 0 && (
              <span className="flex items-center text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {expiredDocuments} documentos vencidos
              </span>
            )}
            {expiredDocuments === 0 && (
              <span className="flex items-center text-green-600 text-sm">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Documentación al día
              </span>
            )}
            {worker.projectIds?.length > 0 && (
              <span className="flex items-center text-gray-600 text-sm">
                <Building2 className="w-4 h-4 mr-1" />
                {worker.projectIds.length} {worker.projectIds.length === 1 ? 'obra' : 'obras'}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onViewDetails}
            className="flex items-center px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            <FileText className="w-4 h-4 mr-1.5" />
            Ver documentos
          </button>
        </div>
      </div>
    </div>
  );
}