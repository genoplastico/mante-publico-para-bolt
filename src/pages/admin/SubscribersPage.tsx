import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { 
  Building2, 
  Users, 
  HardDrive,
  AlertCircle,
  CheckCircle2,
  Search,
  CreditCard
} from 'lucide-react';
import { SaasOrganizationsService } from '../../services/saas/organizations';
import { SaasLimitsService } from '../../services/saas/limits';
import { SaasPlansService } from '../../services/saas/plans';
import { Modal } from '../../components/ui/Modal';
import type { Organization, SaasPlan } from '../../types/saas';

export function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Array<Organization & {
    limits?: {
      workers: { current: number; limit: number };
      storage: { current: number; limit: number };
      projects: { current: number; limit: number };
    };
    plan?: SaasPlan;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubscriber, setSelectedSubscriber] = useState<Organization | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Obtener planes disponibles
      const plans = await SaasPlansService.getAvailablePlans();
      const plansMap = new Map(plans.map(plan => [plan.id, plan]));

      // Obtener organizaciones
      const organizations = await SaasOrganizationsService.getOrganizations();

      // Cargar límites y detalles para cada organización
      const subscribersWithDetails = await Promise.all(
        organizations.map(async (org) => {
          try {
            const limits = await SaasLimitsService.checkOrganizationLimits(org.id);
            return {
              ...org,
              limits,
              plan: plansMap.get(org.planId)
            };
          } catch (error) {
            console.error(`Error loading details for org ${org.id}:`, error);
            return org;
          }
        })
      );

      setSubscribers(subscribersWithDetails);
    } catch (err) {
      setError('Error al cargar los suscriptores');
      console.error('Error loading subscribers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSubscribers = subscribers.filter(subscriber =>
    subscriber.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subscriber.domain?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStatusChange = async (organizationId: string, status: 'active' | 'inactive' | 'suspended') => {
    try {
      await SaasOrganizationsService.updateOrganizationStatus(organizationId, status);
      await loadSubscribers(); // Recargar para obtener datos actualizados
    } catch (error) {
      console.error('Error updating organization status:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suscriptores</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestione las organizaciones suscritas al sistema
          </p>
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

        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Buscar por nombre o dominio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredSubscribers.map((subscriber) => (
              <div
                key={subscriber.id}
                className="bg-white rounded-lg border shadow-sm p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center">
                      <Building2 className="h-5 w-5 text-gray-400 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {subscriber.name}
                      </h3>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {subscriber.domain || 'Sin dominio configurado'}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <select
                      value={subscriber.status}
                      onChange={(e) => handleStatusChange(subscriber.id, e.target.value as 'active' | 'inactive' | 'suspended')}
                      className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                      <option value="suspended">Suspendido</option>
                    </select>

                    <button
                      onClick={() => {
                        setSelectedSubscriber(subscriber);
                        setIsDetailsModalOpen(true);
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Ver detalles
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {subscriber.limits?.workers.current || 0} / {subscriber.limits?.workers.limit || 0}
                      </p>
                      <p className="text-xs text-gray-500">Operarios</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {subscriber.limits?.projects.current || 0} / {subscriber.limits?.projects.limit || 0}
                      </p>
                      <p className="text-xs text-gray-500">Proyectos</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <HardDrive className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {subscriber.limits?.storage.current || 0} / {subscriber.limits?.storage.limit || 0} GB
                      </p>
                      <p className="text-xs text-gray-500">Almacenamiento</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {subscriber.plan?.name || 'Sin plan'}
                      </p>
                      <p className="text-xs text-gray-500">
                        ${subscriber.plan?.price || 0}/mes
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedSubscriber(null);
          }}
          title="Detalles del Suscriptor"
        >
          {selectedSubscriber && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedSubscriber.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedSubscriber.domain || 'Sin dominio configurado'}
                </p>
              </div>

              <div className="border-t border-b border-gray-200 py-4">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Plan Actual</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {selectedSubscriber.plan?.name || 'Sin plan'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Estado</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedSubscriber.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedSubscriber.status === 'active' ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Activo
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 mr-1" />
                            Inactivo
                          </>
                        )}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Fecha de Registro</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(selectedSubscriber.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Última Facturación</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {selectedSubscriber.billing?.lastPayment
                        ? new Date(selectedSubscriber.billing.lastPayment).toLocaleDateString()
                        : 'Sin facturación'}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Uso del Sistema</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Operarios</span>
                      <span className="text-gray-900">
                        {selectedSubscriber.limits?.workers.current || 0} de {selectedSubscriber.limits?.workers.limit || 0}
                      </span>
                    </div>
                    <div className="mt-1 h-2 bg-gray-100 rounded-full">
                      <div
                        className="h-2 bg-blue-600 rounded-full"
                        style={{
                          width: `${((selectedSubscriber.limits?.workers.current || 0) / (selectedSubscriber.limits?.workers.limit || 1)) * 100}%`
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Almacenamiento</span>
                      <span className="text-gray-900">
                        {selectedSubscriber.limits?.storage.current || 0} GB de {selectedSubscriber.limits?.storage.limit || 0} GB
                      </span>
                    </div>
                    <div className="mt-1 h-2 bg-gray-100 rounded-full">
                      <div
                        className="h-2 bg-blue-600 rounded-full"
                        style={{
                          width: `${((selectedSubscriber.limits?.storage.current || 0) / (selectedSubscriber.limits?.storage.limit || 1)) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}