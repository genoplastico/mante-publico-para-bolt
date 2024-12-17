import { collection, doc, getDoc, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import type { Organization } from '../../types/saas';

export class SaasOrganizationsService {
  static async getOrganizations(): Promise<Organization[]> {
    try {
      const snapshot = await getDocs(collection(db, 'organizations'));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Organization));
    } catch (error) {
      console.error('Error getting organizations:', error);
      throw error;
    }
  }

  static async getOrganization(id: string): Promise<Organization | null> {
    try {
      const docRef = doc(db, 'organizations', id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) return null;
      
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Organization;
    } catch (error) {
      console.error('Error getting organization:', error);
      throw error;
    }
  }

  static async updateOrganizationStatus(id: string, status: 'active' | 'inactive' | 'suspended'): Promise<void> {
    try {
      await updateDoc(doc(db, 'organizations', id), {
        status,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating organization status:', error);
      throw error;
    }
  }

  static async getActiveOrganizations(): Promise<Organization[]> {
    try {
      const q = query(
        collection(db, 'organizations'),
        where('status', '==', 'active')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Organization));
    } catch (error) {
      console.error('Error getting active organizations:', error);
      throw error;
    }
  }
}