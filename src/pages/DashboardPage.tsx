import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Users, FileText, AlertCircle, Clock, CheckCircle2, Calendar, Building2 } from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { AuthService } from '../services/auth';
import { ProjectService } from '../services/projects';
import { WorkerService } from '../services/workers';
import { DocumentService } from '../services/documents';
import type { Document, DocumentType } from '../types';
import { useNotificationsContext } from '../contexts/NotificationsContext';

export function DashboardPage() {
  const { notifications, markAsRead } = useNotificationsContext();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    activeProjects: 0,
    totalWorkers: 0,
    expiredDocuments: 0,
    expiringDocuments: 0,
    validDocuments: 0,
    totalDocuments: 0,
    upcomingExpirations: [] as Array<{
      document: Document;
      daysUntilExpiry: number;
      workerName?: string;
    }>,
    documentsByType: {} as Record<DocumentType, number>
  });

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Cargar proyectos
        const projects = await ProjectService.getProjects();
        const activeProjects = projects.filter(p => p.isActive).length || 0;
        
        // Cargar trabajadores
        const workers = await WorkerService.getWorkers();
        
        // Cargar documentos
        const documentStats = await DocumentService.getDashboardStats();

        setStats({
          activeProjects: activeProjects,
          totalWorkers: workers.length || 0,
          expiredDocuments: documentStats.expiredDocuments,
          expiringDocuments: documentStats.expiringDocuments,
          validDocuments: documentStats.validDocuments,
          totalDocuments: documentStats.totalDocuments,
          upcomingExpirations: documentStats.upcomingExpirations,
          documentsByType: documentStats.documentsByType
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error al cargar los datos del panel';
        console.error('Error loading dashboard data:', error);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout
        notifications={notifications}
        onMarkNotificationAsRead={markAsRead}
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <span className="ml-3 text-gray-600">Cargando datos...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        notifications={notifications}
        onMarkNotificationAsRead={markAsRead}
      >
        <div className="flex flex-col items-center justify-center h-64">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-gray-900 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      notifications={notifications}
      onMarkNotificationAsRead={markAsRead}
    >
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Panel Principal</h1>
        <p className="text-gray-500">Resumen general del sistema</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<Building2 className="h-6 w-6" />}
            label="Obras Activas"
            value={stats.activeProjects.toString()}
            description={`${stats.totalWorkers} operarios registrados`}
          />
          <StatCard
            icon={<AlertCircle className="h-6 w-6 text-red-500" />}
            label="Documentos Vencidos"
            value={stats.expiredDocuments?.toString() || '0'}
            description="Requieren atención inmediata"
          />
          <StatCard
            icon={<Clock className="h-6 w-6 text-amber-500" />}
            label="Documentos por Vencer"
            value={stats.expiringDocuments?.toString() || '0'}
            description="Próximos 7 días"
          />
          <StatCard
            icon={<CheckCircle2 className="h-6 w-6 text-green-500" />}
            label="Documentos Vigentes"
            value={stats.validDocuments?.toString() || '0'}
            description={`De un total de ${stats.totalDocuments}`}
          />
        </div>
        
        {stats.upcomingExpirations.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Próximos Vencimientos
            </h2>
            <div className="bg-white rounded-lg border overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documento
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Operario
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vence en
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.upcomingExpirations.map(({ document, daysUntilExpiry, workerName }) => (
                    <tr key={document.id} className={
                      daysUntilExpiry <= 7
                        ? 'bg-red-50'
                        : daysUntilExpiry <= 15
                        ? 'bg-amber-50'
                        : ''
                    }>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-2" />
                          <span>
                            {document.type === 'carnet_salud' && 'Carnet de Salud'}
                            {document.type === 'cert_seguridad' && 'Certificado de Seguridad'}
                            {document.type === 'entrega_epp' && 'Entrega de EPP'}
                            {document.type === 'recibo_sueldo' && 'Recibo de Sueldo'}
                            {document.type === 'cert_dgi' && 'Certificado DGI'}
                            {document.type === 'cert_bps' && 'Certificado BPS'}
                            {document.type === 'cert_seguro' && 'Certificado de Seguro'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {workerName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          daysUntilExpiry <= 7
                            ? 'bg-red-100 text-red-800'
                            : daysUntilExpiry <= 15
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {daysUntilExpiry} días
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(document.expiryDate!).toLocaleDateString('es-ES')}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Documentos por Tipo</h2>
          <div className="bg-white rounded-lg border p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(stats.documentsByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">
                    {type === 'carnet_salud' && 'Carnet de Salud'}
                    {type === 'cert_seguridad' && 'Certificado de Seguridad'}
                    {type === 'entrega_epp' && 'Entrega de EPP'}
                    {type === 'recibo_sueldo' && 'Recibo de Sueldo'}
                    {type === 'cert_dgi' && 'Certificado DGI'}
                    {type === 'cert_bps' && 'Certificado BPS'}
                    {type === 'cert_seguro' && 'Certificado de Seguro'}
                  </span>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}