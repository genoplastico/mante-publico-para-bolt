import React, { useCallback } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { DocumentList } from '../components/documents/DocumentList';
import { DocumentService } from '../services/documents';
import { StatCard } from '../components/ui/StatCard';
import { getErrorMessage } from '../utils/errorUtils';
import type { Document } from '../types';
import type { DocumentStats } from '../services/documents/types/document.types';

export function DocumentsPage() {
  const [documents, setDocuments] = React.useState<Document[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [stats, setStats] = React.useState<DocumentStats | null>(null);

  const loadDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [docs, documentStats] = await Promise.all([
        DocumentService.getDocuments(),
        DocumentService.getDocumentStats()
      ]);
      setDocuments(docs);
      setStats(documentStats);
    } catch (err) {
      console.error('Error loading documents:', err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleDelete = async (documentId: string) => {
    try {
      setError(null);
      await DocumentService.deleteDocument(documentId);
      await loadDocuments(); // Recargar documentos y estadísticas
    } catch (err) {
      console.error('Error deleting document:', err);
      setError(getErrorMessage(err));
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>
          {error ? (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          ) : (
            <p className="mt-1 text-sm text-gray-500">
              Gestione todos los documentos del sistema
            </p>
          )}
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              icon="document"
              label="Total Documentos"
              value={stats.totalDocuments.toString()}
              description="Documentos en el sistema"
            />
            <StatCard
              icon="check"
              label="Documentos Vigentes"
              value={stats.validDocuments.toString()}
              description="Al día"
              variant="success"
            />
            <StatCard
              icon="clock"
              label="Por Vencer"
              value={stats.expiringDocuments.toString()}
              description="Próximos 15 días"
              variant="warning"
            />
            <StatCard
              icon="alert"
              label="Vencidos"
              value={stats.expiredDocuments.toString()}
              description="Requieren atención"
              variant="danger"
            />
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <>
            <DocumentList
              documents={documents}
              onDelete={handleDelete}
            />
            {documents.length > 0 && (
              <p className="mt-4 text-sm text-gray-500 text-center">
                Mostrando {documents.length} documento{documents.length !== 1 ? 's' : ''}
              </p>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}