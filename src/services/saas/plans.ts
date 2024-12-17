import { collection, doc, getDoc, getDocs, query, where, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import type { SaasPlan, Organization } from '../../types';

export class SaasPlansService {
  static async checkPlanLimits(organizationId: string): Promise<{
    isExceeded: boolean;
    currentWorkers: number;
    maxWorkers: number;
    needsUpgrade: boolean;
  }> {
    try {
      const orgDoc = await getDoc(doc(db, 'organizations', organizationId));
      if (!orgDoc.exists()) throw new Error('Organización no encontrada');
      
      const organization = orgDoc.data() as Organization;
      const planDoc = await getDoc(doc(db, 'plans', organization.planId));
      if (!planDoc.exists()) throw new Error('Plan no encontrado');
      
      const plan = planDoc.data() as SaasPlan;
      
      // Contar trabajadores actuales
      const workersQuery = query(
        collection(db, 'workers'),
        where('organizationId', '==', organizationId)
      );
      const workersSnapshot = await getDocs(workersQuery);
      const currentWorkers = workersSnapshot.size;
      
      return {
        isExceeded: currentWorkers > plan.maxWorkers,
        currentWorkers,
        maxWorkers: plan.maxWorkers,
        needsUpgrade: currentWorkers >= plan.maxWorkers * 0.9 // Alerta cuando está al 90% del límite
      };
    } catch (error) {
      console.error('Error checking plan limits:', error);
      throw error;
    }
  }

  static async upgradePlan(organizationId: string, newPlanId: string): Promise<void> {
    try {
      const orgRef = doc(db, 'organizations', organizationId);
      
      // Registrar el cambio de plan
      await addDoc(collection(db, 'plan_changes'), {
        organizationId,
        oldPlanId: (await getDoc(orgRef)).data()?.planId,
        newPlanId,
        timestamp: new Date().toISOString(),
        status: 'pending'
      });
      
      // Actualizar el plan de la organización
      await updateDoc(orgRef, {
        planId: newPlanId,
        'billing.lastPlanChange': new Date().toISOString()
      });
    } catch (error) {
      console.error('Error upgrading plan:', error);
      throw error;
    }
  }

  static async getAvailablePlans(): Promise<SaasPlan[]> {
    try {
      const plansSnapshot = await getDocs(collection(db, 'plans'));
      return plansSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as SaasPlan));
    } catch (error) {
      console.error('Error getting available plans:', error);
      throw error;
    }
  }

  static async createPlan(data: Omit<SaasPlan, 'id'>): Promise<SaasPlan> {
    try {
      const docRef = await addDoc(collection(db, 'plans'), {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      return {
        id: docRef.id,
        ...data
      };
    } catch (error) {
      console.error('Error creating plan:', error);
      throw error;
    }
  }

  static async updatePlan(id: string, data: Partial<Omit<SaasPlan, 'id'>>): Promise<void> {
    try {
      await updateDoc(doc(db, 'plans', id), {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating plan:', error);
      throw error;
    }
  }
}