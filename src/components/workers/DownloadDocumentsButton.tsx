import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { DocumentDownloadService } from '../../services/documents/download';

interface DownloadDocumentsButtonProps {
  workerId: string;
  workerName: string;
  disabled?: boolean;
}

export function DownloadDocumentsButton({ workerId, workerName, disabled }: DownloadDocumentsButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!workerId || !workerName) {
        throw new Error('Datos del trabajador no válidos');
      }

      const blob = await DocumentDownloadService.downloadWorkerDocuments(workerId, workerName, {
        includeExpired: true,
        organizeByType: true
      });
      
      if (!blob || blob.size === 0) {
        throw new Error('No se generó el archivo ZIP correctamente');
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeWorkerName = workerName.replace(/[^a-zA-Z0-9]/g, '_');
      link.download = `documentos_${safeWorkerName}.zip`;
      
      try {
        document.body.appendChild(link);
        link.click();
      } finally {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
      
    } catch (err) {
      console.error('Error downloading documents:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Error al descargar los documentos'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={disabled || isLoading}
        className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md ${
          disabled || isLoading
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
        }`}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
            Descargando...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-1.5" />
            Descargar Documentos
          </>
        )}
      </button>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}