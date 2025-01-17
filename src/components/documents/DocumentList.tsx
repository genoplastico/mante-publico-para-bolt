import React, { useMemo } from 'react';
import { FileText, Download, Trash2 } from 'lucide-react';
import { DocumentStatus } from '../ui/DocumentStatus';
import type { Document } from '../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../../hooks/useAuth';
import { DOCUMENT_TYPES } from '../../services/documents/constants';

interface DocumentListProps {
  documents: Document[];
  onDelete?: (documentId: string) => void;
}

interface DocumentItemProps {
  document: Document;
  onDelete?: (documentId: string) => void;
  canDelete: boolean;
}

function DocumentItem({ document, onDelete, canDelete }: DocumentItemProps) {
  const documentType = DOCUMENT_TYPES[document.type] || 'Documento sin tipo';
  
  return (
    <li className="p-4 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-gray-400" />
            <div className="ml-4 flex-1">
              <p className="font-medium text-gray-900">{documentType}</p>
              <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                <span>
                  Subido el {format(new Date(document.uploadedAt), "d 'de' MMMM 'de' yyyy", { locale: es })}
                </span>
                {document.expiryDate && (
                  <span>
                    · Vence el {format(new Date(document.expiryDate), "d 'de' MMMM 'de' yyyy", { locale: es })}
                  </span>
                )}
                <span>· {document.workerName}</span>
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
  );
}

export function DocumentList({ documents, onDelete }: DocumentListProps) {
  const { hasPermission } = useAuth();
  const canDelete = hasPermission('deleteDocument');
  
  const sortedDocuments = useMemo(() => {
    return [...documents].sort((a, b) => {
      // Primero por estado (vencidos primero)
      if (a.status !== b.status) {
        if (a.status === 'expired') return -1;
        if (b.status === 'expired') return 1;
        if (a.status === 'expiring_soon') return -1;
        if (b.status === 'expiring_soon') return 1;
      }
      // Luego por fecha de subida (más recientes primero)
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    });
  }, [documents]);

  if (documents.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay documentos</h3>
        <p className="mt-1 text-sm text-gray-500">
          No se encontraron documentos en el sistema.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      <ul className="divide-y divide-gray-200">
        {sortedDocuments.map((document) => (
          <DocumentItem
            key={document.id}
            document={document}
            onDelete={onDelete}
            canDelete={canDelete}
          />
        ))}
      </ul>
    </div>
  );
}