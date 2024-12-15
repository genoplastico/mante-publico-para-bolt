import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Settings, CreditCard, Building, Palette } from 'lucide-react';
import { OrganizationService } from '../services/organization';
import { SubscriptionService } from '../services/subscription';
import type { Organization, Plan } from '../types';
import { useAuth } from '../hooks/useAuth';

export function SettingsPage() {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.organizationId) {
      loadOrganizationData(user.organizationId);
    }
  }, [user]);

  const loadOrganizationData = async (orgId: string) => {
    try {
      setIsLoading(true);
      const [org, plan] = await Promise.all([
        OrganizationService.getOrganization(orgId),
        SubscriptionService.getCurrentPlan(orgId)
      ]);
      setOrganization(org);
      setCurrentPlan(plan);
    } catch (error) {
      console.error('Error loading organization data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="bg-white rounded-lg border p-6">
            <div className="flex items-center mb-4">
              <Building className="h-6 w-6 text-gray-400 mr-2" />
              <h2 className="text-lg font-semibold">Organización</h2>
            </div>
            {organization && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre de la Organización
                  </label>
                  <input
                    type="text"
                    value={organization.name}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Dominio
                  </label>
                  <input
                    type="text"
                    value={organization.domain || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </section>

          <section className="bg-white rounded-lg border p-6">
            <div className="flex items-center mb-4">
              <CreditCard className="h-6 w-6 text-gray-400 mr-2" />
              <h2 className="text-lg font-semibold">Plan y Facturación</h2>
            </div>
            {currentPlan && (
              <div>
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900">Plan Actual</h3>
                  <p className="text-sm text-gray-500">{currentPlan.name}</p>
                  <p className="text-sm text-gray-500">
                    {currentPlan.price} {currentPlan.currency} / {currentPlan.interval}
                  </p>
                </div>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                  Cambiar Plan
                </button>
              </div>
            )}
          </section>

          <section className="bg-white rounded-lg border p-6">
            <div className="flex items-center mb-4">
              <Palette className="h-6 w-6 text-gray-400 mr-2" />
              <h2 className="text-lg font-semibold">Personalización</h2>
            </div>
            {organization && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Color Principal
                  </label>
                  <input
                    type="color"
                    value={organization.settings.theme.primaryColor}
                    className="mt-1 block"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Logo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>
            )}
          </section>

          <section className="bg-white rounded-lg border p-6">
            <div className="flex items-center mb-4">
              <Settings className="h-6 w-6 text-gray-400 mr-2" />
              <h2 className="text-lg font-semibold">Características</h2>
            </div>
            {organization && (
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={organization.settings.features.documentsEnabled}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Gestión de Documentos
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={organization.settings.features.workersEnabled}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Gestión de Operarios
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={organization.settings.features.reportsEnabled}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Reportes Avanzados
                  </span>
                </label>
              </div>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}