import type { PaymentHistory } from '../types';

export class MercadoPagoService {
  private static readonly API_URL = 'https://api.mercadopago.com';

  static async createSubscriptionPayment(organizationId: string, planId: string, amount: number): Promise<PaymentHistory> {
    // Implementar integración con Mercado Pago
    throw new Error('Not implemented');
  }

  static async getPaymentStatus(paymentId: string): Promise<PaymentHistory['status']> {
    // Implementar verificación de estado
    throw new Error('Not implemented');
  }
}