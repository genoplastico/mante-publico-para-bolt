import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  arrayUnion,
  arrayRemove,
  serverTimestamp
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
      const docRef = await addDoc(collection(db, 'workers'), {
        ...data,
        documents: [],
        createdAt: serverTimestamp()
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
      const workerRef = doc(db, 'workers', id);
      await updateDoc(workerRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating worker:', error);
      throw new Error('No se pudo actualizar el operario');
    }
  }

  static async deleteWorker(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'workers', id));
    } catch (error) {
      console.error('Error deleting worker:', error);
      throw new Error('No se pudo eliminar el operario');
    }
  }

  static async assignToProject(workerId: string, projectId: string): Promise<void> {
    try {
      const workerRef = doc(db, 'workers', workerId);
      await updateDoc(workerRef, {
        projectIds: arrayUnion(projectId)
      });
    } catch (error) {
      console.error('Error assigning worker to project:', error);
      throw new Error('No se pudo asignar el operario al proyecto');
    }
  }

  static async removeFromProject(workerId: string, projectId: string): Promise<void> {
    try {
      const workerRef = doc(db, 'workers', workerId);
      await updateDoc(workerRef, {
        projectIds: arrayRemove(projectId)
      });
    } catch (error) {
      console.error('Error removing worker from project:', error);
      throw new Error('No se pudo remover el operario del proyecto');
    }
  }
}