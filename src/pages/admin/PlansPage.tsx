import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Plus, Edit2, AlertCircle, Users, Building2, HardDrive, FileCheck } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { SaasPlansService } from '../../services/saas/plans';
import type { SaasPlan } from '../../types/saas';

interface PlanFormData {
  name: string;
  maxWorkers: number;
  price: number;
  features: {
    maxProjectsPerOrg: number;
    maxViewersPerProject: number;
    maxCollaboratorsPerOrg: number;
    storageLimit: number;
  };
}

export function PlansPage() {
  const [plans, setPlans] = useState<SaasPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SaasPlan | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const availablePlans = await SaasPlansService.getAvailablePlans();
      setPlans(availablePlans);
    } catch (err) {
      setError('Error al cargar los planes');
      console.error('Error loading plans:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: PlanFormData) => {
    try {
      if (selectedPlan) {
        await SaasPlansService.updatePlan(selectedPlan.id, data);
      } else {
        await SaasPlansService.createPlan(data);
      }
      setIsModalOpen(false);
      loadPlans();
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Planes</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gestione los planes disponibles para los suscriptores
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedPlan(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Plan
          </button>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-lg border shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {plan.name}
                      </h3>
                      <p className="mt-1 text-2xl font-bold text-gray-900">
                        ${plan.price}
                        <span className="text-sm font-normal text-gray-500">/mes</span>
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedPlan(plan);
                        setIsModalOpen(true);
                      }}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>

                  <ul className="mt-6 space-y-4">
                    <li className="flex items-center">
                      <Users className="h-4 w-4 text-blue-500 mr-3" />
                      <span className="text-sm text-gray-700">
                        Hasta {plan.maxWorkers} operarios
                      </span>
                    </li>
                    <li className="flex items-center">
                      <Building2 className="h-4 w-4 text-blue-500 mr-3" />
                      <span className="text-sm text-gray-700">
                        {plan.features.maxProjectsPerOrg} proyectos
                      </span>
                    </li>
                    <li className="flex items-center">
                      <FileCheck className="h-4 w-4 text-blue-500 mr-3" />
                      <span className="text-sm text-gray-700">
                        {plan.features.maxViewersPerProject} usuarios por proyecto
                      </span>
                    </li>
                    <li className="flex items-center">
                      <HardDrive className="h-4 w-4 text-blue-500 mr-3" />
                      <span className="text-sm text-gray-700">
                        {plan.features.storageLimit}GB almacenamiento
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPlan(null);
          }}
          title={selectedPlan ? 'Editar Plan' : 'Nuevo Plan'}
        >
          <PlanForm
            initialData={selectedPlan}
            onSubmit={handleSubmit}
            onCancel={() => setIsModalOpen(false)}
          />
        </Modal>
      </div>
    </DashboardLayout>
  );
}

interface PlanFormProps {
  initialData?: SaasPlan | null;
  onSubmit: (data: PlanFormData) => void;
  onCancel: () => void;
}

function PlanForm({ initialData, onSubmit, onCancel }: PlanFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data: PlanFormData = {
      name: formData.get('name') as string,
      maxWorkers: parseInt(formData.get('maxWorkers') as string),
      price: parseFloat(formData.get('price') as string),
      features: {
        maxProjectsPerOrg: parseInt(formData.get('maxProjectsPerOrg') as string),
        maxViewersPerProject: parseInt(formData.get('maxViewersPerProject') as string),
        maxCollaboratorsPerOrg: parseInt(formData.get('maxCollaboratorsPerOrg') as string),
        storageLimit: parseInt(formData.get('storageLimit') as string)
      }
    };

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nombre del Plan
        </label>
        <input
          type="text"
          name="name"
          id="name"
          defaultValue={initialData?.name}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="maxWorkers" className="block text-sm font-medium text-gray-700">
            Máximo de Operarios
          </label>
          <input
            type="number"
            name="maxWorkers"
            id="maxWorkers"
            defaultValue={initialData?.maxWorkers}
            required
            min="1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Precio Mensual ($)
          </label>
          <input
            type="number"
            name="price"
            id="price"
            defaultValue={initialData?.price}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="maxProjectsPerOrg" className="block text-sm font-medium text-gray-700">
            Proyectos por Organización
          </label>
          <input
            type="number"
            name="maxProjectsPerOrg"
            id="maxProjectsPerOrg"
            defaultValue={initialData?.features.maxProjectsPerOrg}
            required
            min="1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="maxViewersPerProject" className="block text-sm font-medium text-gray-700">
            Usuarios por Proyecto
          </label>
          <input
            type="number"
            name="maxViewersPerProject"
            id="maxViewersPerProject"
            defaultValue={initialData?.features.maxViewersPerProject}
            required
            min="1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="maxCollaboratorsPerOrg" className="block text-sm font-medium text-gray-700">
            Colaboradores por Organización
          </label>
          <input
            type="number"
            name="maxCollaboratorsPerOrg"
            id="maxCollaboratorsPerOrg"
            defaultValue={initialData?.features.maxCollaboratorsPerOrg}
            required
            min="1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="storageLimit" className="block text-sm font-medium text-gray-700">
            Almacenamiento (GB)
          </label>
          <input
            type="number"
            name="storageLimit"
            id="storageLimit"
            defaultValue={initialData?.features.storageLimit}
            required
            min="1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
        >
          {initialData ? 'Actualizar' : 'Crear'} Plan
        </button>
      </div>
    </form>
  );
}