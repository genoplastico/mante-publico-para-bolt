import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { DocumentSearch } from '../components/documents/DocumentSearch';
import { DocumentList } from '../components/documents/DocumentList';
import { DocumentService } from '../services/documents';
import type { Document, DocumentSearchQuery } from '../types';

export function DocumentsPage() {
  const [documents, setDocuments] = React.useState<Document[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  const handleSearch = async (query: DocumentSearchQuery) => {
    setIsSearching(true);
    try {
      const results = await DocumentService.searchDocuments(query.text || '');
      setDocuments(results);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDelete = (documentId: string) => {
    DocumentService.deleteDocument(documentId);
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
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

        <DocumentSearch onSearch={handleSearch} />

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