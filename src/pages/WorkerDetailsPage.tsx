import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { DocumentStatus } from '../components/documents/DocumentStatus';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { FileText, Upload, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { DocumentUploadForm } from '../components/documents/DocumentUploadForm';
import { DocumentService } from '../services/documents';
import type { Worker, Document, DocumentType } from '../types';

const DOCUMENT_TYPES: Record<DocumentType, string> = {
  carnet_salud: 'Carnet de Salud',
  cert_seguridad: 'Certificado de Seguridad',
  entrega_epp: 'Entrega de EPP',
  recibo_sueldo: 'Recibo de Sueldo',
  cert_dgi: 'Certificado DGI',
  cert_bps: 'Certificado BPS',
  cert_seguro: 'Certificado de Seguro'
};

interface WorkerDetailsPageProps {
  worker: Worker;
  onBack: () => void;
}

export function WorkerDetailsPage({ worker, onBack }: WorkerDetailsPageProps) {
  const { hasPermission } = useAuth();
  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false);
  const [documents, setDocuments] = React.useState<Document[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadDocuments = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const workerDocuments = await DocumentService.getWorkerDocuments(worker.id);
        setDocuments(workerDocuments.map(doc => DocumentService.updateDocumentStatus(doc)));
      } catch (error) {
        console.error('Error loading documents:', error);
        setError('Error al cargar los documentos');
      } finally {
        setIsLoading(false);
      }
    };
    loadDocuments();
  }, [worker.id]);

  const handleDocumentUpload = async () => {
    try {
      const updatedDocuments = await DocumentService.getWorkerDocuments(worker.id);
      setDocuments(updatedDocuments.map(doc => DocumentService.updateDocumentStatus(doc)));
    } catch (error) {
      console.error('Error updating documents:', error);
    }
    setIsUploadModalOpen(false);
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <button
            onClick={onBack}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver
          </button>
          
          <div className="mt-2 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{worker.name}</h1>
              <p className="text-gray-500">CI: {worker.documentNumber}</p>
            </div>
            {hasPermission('uploadDocument') && (
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Subir Documento
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border">
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold text-gray-900">Documentos</h2>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-600">{error}</div>
          ) : documents.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="Sin documentos"
                description="Este operario no tiene documentos cargados."
                action={
                  hasPermission('uploadDocument') && (
                    <button
                      onClick={() => setIsUploadModalOpen(true)}
                      className="mt-4 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Subir Primer Documento
                    </button>
                  )
                }
              />
            </div>
          ) : (
            <div className="divide-y">
              {documents.map((doc) => (
                <div key={doc.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900">
                        {DOCUMENT_TYPES[doc.type]}
                      </span>
                    </div>
                    
                    <div className="mt-1 text-sm text-gray-500">
                      Subido el {new Date(doc.uploadedAt).toLocaleDateString('es-ES')}
                      {doc.expiryDate && (
                        <> · Vence el {new Date(doc.expiryDate).toLocaleDateString('es-ES')}</>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <DocumentStatus document={doc} />
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Ver documento
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Subir Documento"
      >
        <DocumentUploadForm
          workerId={worker.id}
          onSuccess={handleDocumentUpload}
        />
      </Modal>
    </DashboardLayout>
  );
}