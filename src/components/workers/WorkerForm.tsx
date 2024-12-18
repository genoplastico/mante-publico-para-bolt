import React from 'react';
import type { Worker } from '../../types';

interface WorkerFormProps {
  onSubmit: (data: Omit<Worker, 'id' | 'documents'>) => void;
  initialData?: Worker;
}

export function WorkerForm({ onSubmit, initialData }: WorkerFormProps) {
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      const name = formData.get('name') as string;
      const documentNumber = formData.get('documentNumber') as string;

      if (!name || !documentNumber) {
        setError('Todos los campos son requeridos');
        setIsLoading(false);
        return;
      }

      if (!/^\d{8}$/.test(documentNumber)) {
        setError('El número de cédula debe tener 8 dígitos');
        setIsLoading(false);
        return;
      }

      onSubmit({
        name,
        documentNumber,
        projectIds: initialData?.projectIds || [],
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al crear el operario');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nombre Completo
        </label>
        <input
          type="text"
          name="name"
          id="name"
          defaultValue={initialData?.name}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="documentNumber" className="block text-sm font-medium text-gray-700">
          Número de Cédula
        </label>
        <input
          type="text"
          name="documentNumber"
          id="documentNumber"
          defaultValue={initialData?.documentNumber}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
          pattern="[0-9]{8}"
          title="Ingrese un número de cédula válido (8 dígitos)"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Procesando...
            </>
          ) : (
            <>{initialData ? 'Actualizar' : 'Agregar'} Operario</>
          )}
        </button>
      </div>
    </form>
  );
}