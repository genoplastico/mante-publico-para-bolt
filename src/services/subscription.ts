import { collection, doc, getDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Plan, Subscription, Organization } from '../types';

export class SubscriptionService {
  static async getCurrentPlan(organizationId: string): Promise<Plan | null> {
    try {
      const orgDoc = await getDoc(doc(db, 'organizations', organizationId));
      if (!orgDoc.exists()) return null;
      
      const org = orgDoc.data() as Organization;
      const planDoc = await getDoc(doc(db, 'plans', org.planId));
      
      if (!planDoc.exists()) return null;
      return { id: planDoc.id, ...planDoc.data() } as Plan;
    } catch (error) {
      console.error('Error getting current plan:', error);
      return null;
    }
  }

  static async getSubscription(subscriptionId: string): Promise<Subscription | null> {
    try {
      const subDoc = await getDoc(doc(db, 'subscriptions', subscriptionId));
      if (!subDoc.exists()) return null;
      return { id: subDoc.id, ...subDoc.data() } as Subscription;
    } catch (error) {
      console.error('Error getting subscription:', error);
      return null;
    }
  }

  static async checkSubscriptionLimits(organizationId: string): Promise<{
    projectsLimit: boolean;
    usersLimit: boolean;
    storageLimit: boolean;
    documentsLimit: boolean;
  }> {
    try {
      const plan = await this.getCurrentPlan(organizationId);
      if (!plan) throw new Error('No plan found');

      // Obtener proyectos actuales
      const projectsQuery = query(
        collection(db, 'projects'),
        where('organizationId', '==', organizationId)
      );
      const projectsSnapshot = await getDocs(projectsQuery);
      const currentProjects = projectsSnapshot.size;

      // Obtener usuarios actuales
      const usersQuery = query(
        collection(db, 'users'),
        where('organizationId', '==', organizationId)
      );
      const usersSnapshot = await getDocs(usersQuery);
      const currentUsers = usersSnapshot.size;

      // Obtener uso de almacenamiento actual
      const storageUsed = await this.calculateStorageUsed(organizationId);

      // Obtener documentos subidos este mes
      const documentsThisMonth = await this.getDocumentsUploadedThisMonth(organizationId);

      return {
        projectsLimit: currentProjects >= plan.features.maxProjects,
        usersLimit: currentUsers >= plan.features.maxUsersPerProject,
        storageLimit: storageUsed >= plan.features.maxStorage,
        documentsLimit: documentsThisMonth >= plan.features.documentsPerMonth
      };
    } catch (error) {
      console.error('Error checking subscription limits:', error);
      throw error;
    }
  }

  private static async calculateStorageUsed(organizationId: string): Promise<number> {
    // Implementar cálculo de almacenamiento usado
    return 0;
  }

  private static async getDocumentsUploadedThisMonth(organizationId: string): Promise<number> {
    // Implementar conteo de documentos subidos este mes
    return 0;
  }
}