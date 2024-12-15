import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import type { SaasAdmin, SaasMetrics } from '../../types/saas';
import { COLLECTIONS } from './constants';

export class SaasAdminService {
  static async getMetrics(): Promise<SaasMetrics> {
    try {
      // Obtener total de suscriptores (organizaciones)
      let totalSubscribers = 0;
      try {
        const orgsSnapshot = await getDocs(collection(db, COLLECTIONS.ORGANIZATIONS));
        totalSubscribers = orgsSnapshot.size;
      } catch (e) {
        console.warn('Organizations collection not found');
      }

      // Obtener total de trabajadores
      let totalWorkers = 0;
      try {
        const workersSnapshot = await getDocs(collection(db, COLLECTIONS.WORKERS));
        totalWorkers = workersSnapshot.size;
      } catch (e) {
        console.warn('Workers collection not found');
      }

      // Obtener pagos del mes actual
      let monthlyRevenue = 0;
      try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const paymentsQuery = query(
          collection(db, COLLECTIONS.PAYMENTS),
          where('status', '==', 'success'),
          where('createdAt', '>=', startOfMonth.toISOString())
        );
        
        const paymentsSnapshot = await getDocs(paymentsQuery);
        monthlyRevenue = paymentsSnapshot.docs.reduce(
          (total, doc) => total + doc.data().amount,
          0
        );
      } catch (e) {
        console.warn('Payments collection not found');
      }

      // Obtener suscripciones activas
      let activeSubscriptions = 0;
      try {
        const activeOrgsQuery = query(
          collection(db, COLLECTIONS.ORGANIZATIONS),
          where('status', '==', 'active')
        );
        const activeOrgsSnapshot = await getDocs(activeOrgsQuery);
        activeSubscriptions = activeOrgsSnapshot.size;
      } catch (e) {
        console.warn('Organizations collection not found');
      }

      return {
        totalSubscribers,
        totalWorkers,
        monthlyRevenue,
        activeSubscriptions
      };
    } catch (error) {
      console.error('Error getting SaaS metrics:', error);
      return {
        totalSubscribers: 0,
        totalWorkers: 0,
        monthlyRevenue: 0,
        activeSubscriptions: 0
      };
    }
  }

  static async promoteToOwner(userId: string, email: string, name: string): Promise<void> {
    try {
      // Verificar si el usuario ya es admin
      const adminDoc = await getDoc(doc(db, 'saas_admins', userId));
      if (adminDoc.exists()) {
        throw new Error('El usuario ya es administrador');
      }

      // Crear documento de admin
      const adminData: SaasAdmin = {
        id: userId,
        email,
        name,
        role: 'owner'
      };

      await setDoc(doc(db, 'saas_admins', userId), adminData);
    } catch (error) {
      console.error('Error promoting to owner:', error);
      throw error;
    }
  }
}