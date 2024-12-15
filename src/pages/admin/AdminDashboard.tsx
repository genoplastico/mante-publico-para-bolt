import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Users, Building2, CreditCard, TrendingUp } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { SaasAdminService } from '../../services/saas/admin';
import type { SaasMetrics } from '../../types/saas';

export function AdminDashboard() {
  const [metrics, setMetrics] = useState<SaasMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setIsLoading(true);
      const data = await SaasAdminService.getMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Error loading metrics:', error);
      setError('Error al cargar las métricas');
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

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={loadMetrics}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Panel de Administración SaaS</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<Building2 className="h-6 w-6" />}
            label="Suscriptores Totales"
            value={metrics?.totalSubscribers.toString() || '0'}
            description="Organizaciones activas"
          />
          <StatCard
            icon={<Users className="h-6 w-6" />}
            label="Operarios Totales"
            value={metrics?.totalWorkers.toString() || '0'}
            description="En todas las organizaciones"
          />
          <StatCard
            icon={<CreditCard className="h-6 w-6" />}
            label="Ingresos Mensuales"
            value={`$${metrics?.monthlyRevenue.toLocaleString() || '0'}`}
            description="Mes actual"
          />
          <StatCard
            icon={<TrendingUp className="h-6 w-6" />}
            label="Suscripciones Activas"
            value={metrics?.activeSubscriptions.toString() || '0'}
            description="Con pagos al día"
          />
        </div>

        {/* Lista de suscriptores recientes */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Suscriptores Recientes</h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {/* Implementar lista de suscriptores */}
          </div>
        </section>

        {/* Gráficos y métricas adicionales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <section className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Crecimiento Mensual
            </h3>
            {/* Implementar gráfico de crecimiento */}
          </section>

          <section className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Distribución de Planes
            </h3>
            {/* Implementar gráfico de distribución */}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}