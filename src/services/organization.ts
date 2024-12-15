import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Organization } from '../types';

export class OrganizationService {
  static async getOrganization(id: string): Promise<Organization | null> {
    try {
      const orgDoc = await getDoc(doc(db, 'organizations', id));
      if (!orgDoc.exists()) return null;
      return { id: orgDoc.id, ...orgDoc.data() } as Organization;
    } catch (error) {
      console.error('Error getting organization:', error);
      return null;
    }
  }

  static async updateOrganization(id: string, data: Partial<Organization>): Promise<void> {
    try {
      await updateDoc(doc(db, 'organizations', id), data);
    } catch (error) {
      console.error('Error updating organization:', error);
      throw error;
    }
  }

  static async updateTheme(id: string, theme: Organization['settings']['theme']): Promise<void> {
    try {
      await updateDoc(doc(db, 'organizations', id), {
        'settings.theme': theme
      });
    } catch (error) {
      console.error('Error updating theme:', error);
      throw error;
    }
  }

  static async updateBilling(id: string, billing: Organization['billing']): Promise<void> {
    try {
      await updateDoc(doc(db, 'organizations', id), {
        billing
      });
    } catch (error) {
      console.error('Error updating billing:', error);
      throw error;
    }
  }
}