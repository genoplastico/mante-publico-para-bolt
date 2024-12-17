import { collection, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { MercadoPagoService } from '../mercadopago';
import type { Organization, PaymentHistory } from '../../types';

export class SaasBillingService {
  static async generateMonthlyInvoice(organizationId: string): Promise<PaymentHistory> {
    try {
      const orgDoc = await getDoc(doc(db, 'organizations', organizationId));
      if (!orgDoc.exists()) throw new Error('Organización no encontrada');
      
      const organization = orgDoc.data() as Organization;
      const planDoc = await getDoc(doc(db, 'plans', organization.planId));
      if (!planDoc.exists()) throw new Error('Plan no encontrado');
      
      const plan = planDoc.data();
      
      // Crear pago en Mercado Pago
      const payment = await MercadoPagoService.createSubscriptionPayment(
        organizationId,
        organization.planId,
        plan.price
      );
      
      // Registrar el pago en Firestore
      const paymentDoc = await addDoc(collection(db, 'payments'), payment);
      
      // Actualizar estado de facturación de la organización
      await updateDoc(doc(db, 'organizations', organizationId), {
        'billing.lastPayment': new Date().toISOString(),
        'billing.status': payment.status
      });
      
      return { id: paymentDoc.id, ...payment };
    } catch (error) {
      console.error('Error generating invoice:', error);
      throw error;
    }
  }

  static async checkPaymentStatus(paymentId: string): Promise<void> {
    try {
      const status = await MercadoPagoService.getPaymentStatus(paymentId);
      
      const paymentDoc = doc(db, 'payments', paymentId);
      await updateDoc(paymentDoc, {
        status,
        lastChecked: new Date().toISOString()
      });
      
      // Si el pago falló, actualizar estado de la organización
      if (status === 'failed') {
        const payment = (await getDoc(paymentDoc)).data() as PaymentHistory;
        await updateDoc(doc(db, 'organizations', payment.organizationId), {
          'billing.status': 'overdue'
        });
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  }

  static async getPaymentsHistory(): Promise<PaymentHistory[]> {
    try {
      const snapshot = await getDocs(collection(db, 'payments'));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PaymentHistory));
    } catch (error) {
      console.error('Error getting payments history:', error);
      throw error;
    }
  }
}