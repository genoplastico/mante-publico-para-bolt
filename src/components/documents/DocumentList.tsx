import React from 'react';
import { FileText, Download, Trash2 } from 'lucide-react';
import { DocumentStatus } from './DocumentStatus';
import type { Document } from '../../types';
import { useAuth } from '../../hooks/useAuth';

interface DocumentListProps {
  documents: Document[];
  onDelete?: (documentId: string) => void;
}

export function DocumentList({ documents, onDelete }: DocumentListProps) {
  const { hasPermission } = useAuth();
  const canDelete = hasPermission('deleteDocument');

  if (documents.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay documentos</h3>
        <p className="mt-1 text-sm text-gray-500">
          No se encontraron documentos que coincidan con los criterios de búsqueda.
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
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div className="ml-4">
                    <p className="font-medium text-gray-900">{document.name}</p>
                    <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        Subido el {new Date(document.uploadedAt).toLocaleDateString('es-ES')}
                      </span>
                      {document.expiryDate && (
                        <span>
                          · Vence el {new Date(document.expiryDate).toLocaleDateString('es-ES')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="ml-4 flex items-center space-x-4">
                <DocumentStatus document={document} />
                
                <a
                  href={document.url}
                  download={document.name}
                  className="text-gray-400 hover:text-gray-500"
                  title="Descargar"
                >
                  <Download className="h-5 w-5" />
                </a>

                {canDelete && onDelete && (
                  <button
                    onClick={() => onDelete(document.id)}
                    className="text-gray-400 hover:text-red-500"
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