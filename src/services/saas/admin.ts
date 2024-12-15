import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import type { SaasMetrics, Organization, PaymentHistory } from '../../types';

export class SaasAdminService {
  static async getMetrics(): Promise<SaasMetrics> {
    try {
      // Obtener total de suscriptores (organizaciones)
      const orgsSnapshot = await getDocs(collection(db, 'organizations'));
      const totalSubscribers = orgsSnapshot.size;

      // Obtener total de trabajadores
      const workersSnapshot = await getDocs(collection(db, 'workers'));
      const totalWorkers = workersSnapshot.size;

      // Obtener pagos del mes actual
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const paymentsQuery = query(
        collection(db, 'payments'),
        where('status', '==', 'success'),
        where('createdAt', '>=', startOfMonth.toISOString())
      );
      
      const paymentsSnapshot = await getDocs(paymentsQuery);
      const monthlyRevenue = paymentsSnapshot.docs.reduce(
        (total, doc) => total + (doc.data() as PaymentHistory).amount,
        0
      );

      // Obtener suscripciones activas
      const activeOrgsQuery = query(
        collection(db, 'organizations'),
        where('status', '==', 'active')
      );
      const activeOrgsSnapshot = await getDocs(activeOrgsQuery);

      return {
        totalSubscribers,
        totalWorkers,
        monthlyRevenue,
        activeSubscriptions: activeOrgsSnapshot.size
      };
    } catch (error) {
      console.error('Error getting SaaS metrics:', error);
      throw error;
    }
  }

  static async getSubscribersList(): Promise<Organization[]> {
    try {
      const snapshot = await getDocs(collection(db, 'organizations'));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Organization));
    } catch (error) {
      console.error('Error getting subscribers list:', error);
      throw error;
    }
  }
}