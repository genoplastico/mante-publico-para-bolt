import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { 
  CreditCard, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Download,
  Search
} from 'lucide-react';
import { SaasBillingService } from '../../services/saas/billing';
import { SaasOrganizationsService } from '../../services/saas/organizations';
import type { PaymentHistory, Organization } from '../../types';

type PaymentWithOrg = PaymentHistory & { organization?: Organization };

export function BillingPage() {
  const [payments, setPayments] = useState<PaymentWithOrg[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentHistory['status'] | 'all'>('all');

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Obtener organizaciones para enriquecer los datos de pagos
      const organizations = await SaasOrganizationsService.getOrganizations();
      const orgsMap = new Map(organizations.map(org => [org.id, org]));

      // Obtener historial de pagos
      const paymentsHistory = await SaasBillingService.getPaymentsHistory();
      
      // Combinar datos
      const paymentsWithOrgs = paymentsHistory.map(payment => ({
        ...payment,
        organization: orgsMap.get(payment.organizationId)
      }));

      setPayments(paymentsWithOrgs);
    } catch (err) {
      setError('Error al cargar el historial de pagos');
      console.error('Error loading payments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckPayment = async (paymentId: string) => {
    try {
      await SaasBillingService.checkPaymentStatus(paymentId);
      await loadPayments(); // Recargar para obtener el estado actualizado
    } catch (error) {
      console.error('Error checking payment:', error);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.organization?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status: PaymentHistory['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facturación</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestione los pagos y facturas de los suscriptores
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
              placeholder="Buscar por organización o ID de pago..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PaymentHistory['status'] | 'all')}
            className="rounded-lg border border-gray-300 px-4 py-2"
          >
            <option value="all">Todos los estados</option>
            <option value="success">Exitosos</option>
            <option value="pending">Pendientes</option>
            <option value="failed">Fallidos</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <li key={payment.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center">
                        <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-900">
                          {payment.organization?.name || 'Organización no encontrada'}
                        </span>
                      </div>
                      
                      <div className="mt-1 text-sm text-gray-500">
                        ID: {payment.id}
                      </div>
                      
                      <div className="mt-2 text-sm">
                        <span className="text-gray-500">Período:</span>
                        <span className="ml-1">
                          {new Date(payment.metadata.period.start).toLocaleDateString()} - 
                          {new Date(payment.metadata.period.end).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getStatusBadgeClass(payment.status)
                      }`}>
                        {payment.status === 'success' && (
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                        )}
                        {payment.status === 'pending' && (
                          <Clock className="w-4 h-4 mr-1" />
                        )}
                        {payment.status === 'failed' && (
                          <AlertCircle className="w-4 h-4 mr-1" />
                        )}
                        {payment.status === 'success' && 'Exitoso'}
                        {payment.status === 'pending' && 'Pendiente'}
                        {payment.status === 'failed' && 'Fallido'}
                      </span>

                      <span className="text-lg font-semibold text-gray-900">
                        ${payment.amount}
                      </span>

                      <div className="flex space-x-2">
                        {payment.status === 'pending' && (
                          <button
                            onClick={() => handleCheckPayment(payment.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <Clock className="h-4 w-4 mr-1.5" />
                            Verificar Estado
                          </button>
                        )}

                        <button
                          onClick={() => {/* Implementar descarga de factura */}}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Download className="h-4 w-4 mr-1.5" />
                          Descargar Factura
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}