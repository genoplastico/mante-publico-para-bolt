import { doc, setDoc, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import type { SaasAdmin } from '../../types/saas';

export class SaasSetupService {
  static async createOwnerAccount(email: string, password: string, name: string): Promise<SaasAdmin> {
    try {
      // Verificar si ya existe un owner
      const ownerDoc = await getDoc(doc(db, 'saas_admins', 'owner'));
      if (ownerDoc.exists()) {
        throw new Error('Ya existe una cuenta de propietario');
      }

      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Crear documento del admin
      const adminData: SaasAdmin = {
        id: userCredential.user.uid,
        email,
        name,
        role: 'owner'
      };

      await setDoc(doc(db, 'saas_admins', userCredential.user.uid), adminData);

      // Marcar como configurado
      await setDoc(doc(db, 'saas_config', 'setup'), {
        ownerConfigured: true,
        setupDate: new Date().toISOString()
      });

      return adminData;
    } catch (error) {
      console.error('Error creating owner account:', error);
      throw error;
    }
  }

  static async isOwnerConfigured(): Promise<boolean> {
    try {
      const configDoc = await getDoc(doc(db, 'saas_config', 'setup'));
      return configDoc.exists() && configDoc.data()?.ownerConfigured === true;
    } catch (error) {
      console.error('Error checking owner configuration:', error);
      return false;
    }
  }
}