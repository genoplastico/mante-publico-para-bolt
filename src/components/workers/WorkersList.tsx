import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, FileText, Building2 } from 'lucide-react';
import type { Worker, Project } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { ProjectService } from '../../services/projects';

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
  const [projects, setProjects] = useState<Project[]>([]);
  const [showTooltip, setShowTooltip] = useState(false);
  const expiredDocuments = worker.documents.filter(
    doc => doc.status === 'expired'
  ).length;

  useEffect(() => {
    if (worker.projectIds?.length) {
      ProjectService.getProjectsByIds(worker.projectIds)
        .then(setProjects)
        .catch(console.error);
    }
  }, [worker.projectIds]);

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
              <span
                className="flex items-center text-gray-600 text-sm relative cursor-help"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <Building2 className="w-4 h-4 mr-1" />
                {worker.projectIds.length} {worker.projectIds.length === 1 ? 'obra' : 'obras'}
                {showTooltip && projects.length > 0 && (
                  <div className="absolute bottom-full left-0 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg z-50">
                    <div className="font-medium mb-1">Obras asignadas:</div>
                    <ul className="space-y-1">
                      {projects.map(project => (
                        <li key={project.id} className="flex items-center">
                          <Building2 className="w-3 h-3 mr-1 text-gray-400" />
                          {project.name}
                        </li>
                      ))}
                    </ul>
                    <div className="absolute -bottom-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                  </div>
                )}
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