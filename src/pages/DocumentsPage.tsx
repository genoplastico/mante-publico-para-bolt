import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { DocumentSearch } from '../components/documents/DocumentSearch';
import { DocumentList } from '../components/documents/DocumentList';
import { DocumentService } from '../services/documents';
import type { Document } from '../types';

export function DocumentsPage() {
  const [documents, setDocuments] = React.useState<Document[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSearching, setIsSearching] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadInitialDocuments = async () => {
      try {
        const docs = await DocumentService.searchDocuments({});
        setDocuments(docs);
      } catch (error) {
        console.error('Error loading initial documents:', error);
        setError('Error al cargar los documentos');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialDocuments();
  }, []);

  const handleSearchComplete = (docs: Document[]) => {
    setIsSearching(false);
    setDocuments(docs);
    setError(null);
  };

  const handleSearchError = (error: Error) => {
    setIsSearching(false);
    setError(error.message);
    setDocuments([]);
  };

  const handleDelete = async (documentId: string) => {
    try {
      setError(null);
      await DocumentService.deleteDocument(documentId);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Error al eliminar el documento');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Busque y gestione todos los documentos del sistema
          </p>
        </div>

        <DocumentSearch 
          onSearchStart={() => setIsSearching(true)}
          onSearchComplete={handleSearchComplete}
          onError={handleSearchError}
        />

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {isSearching ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <DocumentList
            documents={documents}
            onDelete={handleDelete}
          />
        )}
      </div>
    </DashboardLayout>
  );
}