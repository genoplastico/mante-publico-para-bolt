import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import type { SaasAdmin } from '../../types/saas';

export class AdminPromotionService {
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