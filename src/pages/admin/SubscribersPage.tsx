import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Building2, Users, CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SaasPlansService } from '../../services/saas/plans';
import { SaasLimitsService } from '../../services/saas/limits';
import { SaasBillingService } from '../../services/saas/billing';
import type { Organization, SaasPlan } from '../../types/saas';

export function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Array<Organization & { 
    limits?: Awaited<ReturnType<typeof SaasLimitsService.checkOrganizationLimits>>;
    plan?: SaasPlan;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      // Obtener organizaciones (implementar en el servicio)
      const orgs = await fetch('/api/organizations').then(res => res.json());

      // Cargar límites y detalles para cada organización
      const subscribersWithDetails = await Promise.all(
        orgs.map(async (org: Organization) => {
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

  const handleGenerateInvoice = async (organizationId: string) => {
    try {
      await SaasBillingService.generateMonthlyInvoice(organizationId);
      // Recargar datos
      await loadSubscribers();
    } catch (error) {
      console.error('Error generating invoice:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Suscriptores</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gestione las organizaciones suscritas al sistema
            </p>
          </div>
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
          <div className="grid gap-6">
            {subscribers.map((subscriber) => (
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
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      subscriber.billing?.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {subscriber.billing?.status === 'active' ? (
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
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {subscriber.limits?.workers.current || 0} operarios
                      {subscriber.limits?.workers.limit && (
                        <span className="text-gray-400">
                          {' '}/ {subscriber.limits.workers.limit}
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {subscriber.limits?.projects.current || 0} proyectos
                      {subscriber.limits?.projects.limit && (
                        <span className="text-gray-400">
                          {' '}/ {subscriber.limits.projects.limit}
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      Plan: {subscriber.plan?.name || 'No definido'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    onClick={() => handleGenerateInvoice(subscriber.id)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <CreditCard className="h-4 w-4 mr-1.5" />
                    Generar Factura
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}