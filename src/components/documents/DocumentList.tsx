import React from 'react';
import { FileText, Download, Trash2, User } from 'lucide-react';
import { DocumentStatus } from '../../components/ui/DocumentStatus';
import type { Document, Worker } from '../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../../hooks/useAuth';
import { WorkerService } from '../../services/workers';

const DOCUMENT_TYPES: Record<Document['type'], string> = {
  carnet_salud: 'Carnet de Salud',
  cert_seguridad: 'Certificado de Seguridad',
  entrega_epp: 'Entrega de EPP',
  recibo_sueldo: 'Recibo de Sueldo',
  cert_dgi: 'Certificado DGI',
  cert_bps: 'Certificado BPS',
  cert_seguro: 'Certificado de Seguro'
};

interface DocumentListProps {
  documents: Document[];
  onDelete?: (documentId: string) => void;
}

export function DocumentList({ documents, onDelete }: DocumentListProps) {
  const { hasPermission } = useAuth();
  const [workers, setWorkers] = React.useState<Record<string, Worker>>({});
  const canDelete = hasPermission('deleteDocument');
  
  React.useEffect(() => {
    const loadWorkers = async () => {
      if (!documents?.length) return;
      
      const workerIds = [...new Set(documents.map(doc => doc.workerId).filter(Boolean))];
      if (workerIds.length === 0) return;
      
      try {
        const fetchedWorkers = await WorkerService.getWorkers();
        const workersMap = fetchedWorkers.reduce((acc, worker) => {
          acc[worker.id] = worker;
          return acc;
        }, {} as Record<string, Worker>);
        setWorkers(workersMap);
      } catch (error) {
        console.error('Error loading workers:', error);
      }
    };
    
    loadWorkers();
  }, [documents]);

  if (!documents?.length) {
    return (
      <div className="text-center py-8">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay documentos</h3>
        <p className="mt-1 text-sm text-gray-500">
          {documents === undefined 
            ? 'Utilice los filtros para buscar documentos'
            : 'No se encontraron documentos que coincidan con los criterios de búsqueda.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      <ul className="divide-y divide-gray-200">
        {documents.map((document) => (
          <li key={document.id} className="p-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <div className="ml-4 flex-1">
                    <p className="font-medium text-gray-900">
                      {DOCUMENT_TYPES[document.type]}
                    </p>
                    {document.workerId && workers[document.workerId] && (
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        <User className="h-4 w-4 mr-1.5 text-gray-400" />
                        {workers[document.workerId].name}
                      </div>
                    )}
                    <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        Subido el {format(new Date(document.uploadedAt), "d 'de' MMMM 'de' yyyy", { locale: es })}
                      </span>
                      {document.expiryDate && (
                        <span>
                          · Vence el {format(new Date(document.expiryDate), "d 'de' MMMM 'de' yyyy", { locale: es })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="ml-4 flex items-center gap-4">
                <DocumentStatus document={document} />
                
                <a
                  href={document.url}
                  download={document.name}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                  title="Descargar"
                >
                  <Download className="h-5 w-5" />
                </a>

                {canDelete && onDelete && (
                  <button
                    onClick={() => onDelete(document.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}