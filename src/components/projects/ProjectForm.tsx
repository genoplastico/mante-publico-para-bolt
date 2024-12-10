import React from 'react';
import type { Project } from '../../types';

interface ProjectFormProps {
  onSubmit: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Project;
}

export function ProjectForm({ onSubmit, initialData }: ProjectFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    onSubmit({
      name: formData.get('name') as string,
      isActive: formData.get('isActive') === 'true',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nombre de la Obra
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
        <label className="block text-sm font-medium text-gray-700">Estado</label>
        <div className="mt-1 space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="isActive"
              value="true"
              defaultChecked={initialData?.isActive !== false}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2">Activa</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="isActive"
              value="false"
              defaultChecked={initialData?.isActive === false}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2">Inactiva</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {initialData ? 'Actualizar' : 'Crear'} Obra
        </button>
      </div>
    </form>
  );
}