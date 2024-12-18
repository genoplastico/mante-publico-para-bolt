import mercadopago from 'mercadopago';
import { MERCADOPAGO_CONFIG } from './config';

// Initialize Mercado Pago configuration
mercadopago.configure({
  access_token: MERCADOPAGO_CONFIG.API_KEY
});

export class MercadoPagoService {
  static async createSubscription(planData: {
    name: string;
    price: number;
    organizationId: string;
  }) {
    try {
      const subscription = await mercadopago.preapproval.create({
        payer_email: '', // Will be set when subscribing
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: planData.price,
          currency_id: MERCADOPAGO_CONFIG.CURRENCY
        },
        back_url: window.location.origin,
        reason: `Suscripción a ${planData.name}`,
        external_reference: `${planData.organizationId}-${Date.now()}`
      });

      return subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  static async getSubscriptionStatus(subscriptionId: string) {
    try {
      const subscription = await mercadopago.preapproval.findById(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Error getting subscription status:', error);
      throw error;
    }
  }

  static async cancelSubscription(subscriptionId: string) {
    try {
      const result = await mercadopago.preapproval.cancel(subscriptionId);
      return result;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }
}