import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { 
  TrendingUp, 
  Users, 
  Building2, 
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { SaasAdminService } from '../../services/saas/admin';
import { StatCard } from '../../components/ui/StatCard';
import type { SaasMetrics } from '../../types/saas';

export function MetricsPage() {
  const [metrics, setMetrics] = useState<SaasMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await SaasAdminService.getMetrics();
      setMetrics(data);
    } catch (err) {
      setError('Error al cargar las métricas');
      console.error('Error loading metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Métricas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Visualice las métricas clave del sistema
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

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : metrics ? (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={<Building2 className="h-6 w-6" />}
                label="Suscriptores Totales"
                value={metrics.totalSubscribers.toString()}
                description="Organizaciones activas"
              />
              
              <StatCard
                icon={<Users className="h-6 w-6" />}
                label="Operarios Totales"
                value={metrics.totalWorkers.toString()}
                description="En todas las organizaciones"
              />
              
              <StatCard
                icon={<CreditCard className="h-6 w-6" />}
                label="Ingresos Mensuales"
                value={`$${metrics.monthlyRevenue.toLocaleString()}`}
                description="Mes actual"
              />
              
              <StatCard
                icon={<TrendingUp className="h-6 w-6" />}
                label="Suscripciones Activas"
                value={metrics.activeSubscriptions.toString()}
                description="Con pagos al día"
              />
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <section className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Distribución de Planes
                </h2>
                <div className="space-y-4">
                  {metrics.planDistribution?.map((plan) => (
                    <div key={plan.name} className="flex items-center">
                      <span className="flex-1 text-sm text-gray-600">
                        {plan.name}
                      </span>
                      <span className="ml-4 text-sm font-medium text-gray-900">
                        {plan.count} suscriptores
                      </span>
                      <div className="ml-4 flex-1">
                        <div className="h-2 bg-gray-100 rounded-full">
                          <div
                            className="h-2 bg-blue-600 rounded-full"
                            style={{
                              width: `${(plan.count / metrics.totalSubscribers) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Crecimiento Mensual
                </h2>
                <div className="space-y-4">
                  {metrics.monthlyGrowth?.map((month) => (
                    <div key={month.date} className="flex items-center">
                      <span className="flex-1 text-sm text-gray-600">
                        {new Date(month.date).toLocaleDateString('es-ES', {
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="ml-4 text-sm font-medium text-gray-900">
                        {month.newSubscribers} nuevos
                      </span>
                      <div className="ml-4 flex-1">
                        <div className="h-2 bg-gray-100 rounded-full">
                          <div
                            className="h-2 bg-green-600 rounded-full"
                            style={{
                              width: `${(month.newSubscribers / month.totalSubscribers) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}