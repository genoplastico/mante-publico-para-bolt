import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { DocumentService } from '../../services/documents';
import { StorageService } from '../../services/storage';
import type { DocumentType } from '../../types';

interface DocumentUploadFormProps {
  workerId: string;
  onSuccess: () => void;
}

const DOCUMENT_TYPES: Array<{ value: DocumentType; label: string }> = [
  { value: 'carnet_salud', label: 'Carnet de Salud' },
  { value: 'cert_seguridad', label: 'Certificado de Seguridad' },
  { value: 'entrega_epp', label: 'Entrega de EPP' },
  { value: 'recibo_sueldo', label: 'Recibo de Sueldo' },
  { value: 'cert_dgi', label: 'Certificado DGI' },
  { value: 'cert_bps', label: 'Certificado BPS' },
  { value: 'cert_seguro', label: 'Certificado de Seguro' }
];

export function DocumentUploadForm({ workerId, onSuccess }: DocumentUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [disableScaling, setDisableScaling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Por favor seleccione un archivo');
      return;
    }

    const validationError = StorageService.validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const type = formData.get('type') as DocumentType;
    const expiryDate = formData.get('expiryDate') as string;

    setIsUploading(true);
    setError(null);

    try {
      await DocumentService.uploadDocument({
        workerId,
        type,
        file: selectedFile,
        expiryDate: expiryDate || undefined,
        disableScaling
      });
      onSuccess();
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Error al subir el documento';
      setError(error);
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('El archivo no debe superar los 5MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Tipo de Documento
        </label>
        <select
          id="type"
          name="type"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
          disabled={isUploading}
        >
          <option value="">Seleccione un tipo</option>
          {DOCUMENT_TYPES.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Archivo
        </label>
        <div className="mt-1">
          {selectedFile ? (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Upload className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">{selectedFile.name}</span>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="text-gray-400 hover:text-gray-500"
                disabled={isUploading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Seleccionar archivo</span>
                    <input
                      id="file-upload"
                      name="file"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="sr-only"
                      onChange={handleFileChange}
                      disabled={isUploading}
                      required
                    />
                  </label>
                  <p className="pl-1">o arrastrar y soltar</p>
                </div>
                <p className="text-xs text-gray-500">
                  PDF, JPG o PNG hasta 5MB
                </p>
              </div>
            </div>
          )}
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
          Fecha de Vencimiento
        </label>
        <input
          type="date"
          id="expiryDate"
          name="expiryDate"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          disabled={isUploading}
        />
      </div>
      
      {selectedFile?.type.startsWith('image/') && (
        <div className="flex items-center">
          <input
            type="checkbox"
            id="disableScaling"
            checked={disableScaling}
            onChange={(e) => setDisableScaling(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="disableScaling" className="ml-2 block text-sm text-gray-700">
            Mantener resolución original
          </label>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="submit"
          className={`inline-flex justify-center items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isUploading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Subiendo...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Subir Documento
            </>
          )}
        </button>
      </div>
    </form>
  );
}