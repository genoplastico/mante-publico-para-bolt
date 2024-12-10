import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  query,
  where
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Worker } from '../types';

export class WorkerService {
  static async getWorkers(projectId?: string): Promise<Worker[]> {
    try {
      let q = collection(db, 'workers');
      if (projectId) {
        q = query(q, where('projectIds', 'array-contains', projectId));
      }
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Worker));
    } catch (error) {
      console.error('Error fetching workers:', error);
      throw new Error('No se pudieron obtener los operarios');
    }
  }

  static async createWorker(data: Omit<Worker, 'id' | 'documents'>): Promise<Worker> {
    try {
      const now = new Date().toISOString();
      const docRef = await addDoc(collection(db, 'workers'), {
        ...data,
        documents: [],
        createdAt: now,
        updatedAt: now
      });

      const newDoc = await getDoc(docRef);
      return {
        id: docRef.id,
        ...newDoc.data()
      } as Worker;
    } catch (error) {
      console.error('Error creating worker:', error);
      throw new Error('No se pudo crear el operario');
    }
  }

  static async updateWorker(id: string, data: Partial<Omit<Worker, 'id'>>): Promise<void> {
    try {
      await updateDoc(doc(db, 'workers', id), {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating worker:', error);
      throw new Error('No se pudo actualizar el operario');
    }
  }
}