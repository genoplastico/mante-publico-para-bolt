import React from 'react';
import type { Worker } from '../../types';

interface WorkerFormProps {
  onSubmit: (data: Omit<Worker, 'id' | 'documents'>) => void;
  initialData?: Worker;
}

export function WorkerForm({ onSubmit, initialData }: WorkerFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    onSubmit({
      name: formData.get('name') as string,
      documentNumber: formData.get('documentNumber') as string,
      projectIds: initialData?.projectIds || [],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {initialData ? 'Actualizar' : 'Agregar'} Operario
        </button>
      </div>
    </form>
  );
}