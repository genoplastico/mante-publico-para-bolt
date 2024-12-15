import { doc, setDoc, getDoc, getDocs, collection, writeBatch } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import type { SaasAdmin } from '../../types/saas';
import { INITIAL_SAAS_CONFIG, COLLECTIONS } from './constants';

export class SaasSetupService {
  static async createOwnerAccount(email: string, password: string, name: string): Promise<SaasAdmin> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const batch = writeBatch(db);
      
      // Crear colecciones básicas si no existen
      const collections = [
        COLLECTIONS.SAAS_ADMINS,
        COLLECTIONS.SAAS_CONFIG,
        COLLECTIONS.ORGANIZATIONS,
        COLLECTIONS.WORKERS,
        COLLECTIONS.PAYMENTS
      ];

      for (const collectionName of collections) {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        if (snapshot.empty) {
          // Si la colección está vacía, crear un documento dummy que luego se eliminará
          const dummyDoc = doc(collectionRef, '_placeholder');
          batch.set(dummyDoc, { _placeholder: true });
        }
      }

      // Crear colecciones y documentos iniciales
      const now = new Date().toISOString();
      
      // 1. Configuración del SaaS
      batch.set(doc(db, COLLECTIONS.SAAS_CONFIG, 'setup'), {
        ownerConfigured: true,
        setupDate: now,
        features: INITIAL_SAAS_CONFIG.features
      });

      // 2. Crear documento del admin
      const adminData: SaasAdmin = {
        id: userCredential.user.uid,
        email,
        name,
        role: 'owner'
      };

      batch.set(doc(db, 'saas_admins', userCredential.user.uid), adminData);

      // Ejecutar todas las operaciones en una transacción
      await batch.commit();

      return adminData;
    } catch (error) {
      console.error('Error creating owner account:', error);
      throw error;
    }
  }

  static async isOwnerConfigured(): Promise<boolean> { 
    try {
      // Verificar si existe algún documento en saas_admins
      const configDoc = await getDoc(doc(db, 'saas_config', 'setup'));
      return configDoc.exists() && configDoc.data()?.ownerConfigured === true;
    } catch (error) {
      console.error('Error checking owner configuration:', error);
      return false;
    }
  }
}