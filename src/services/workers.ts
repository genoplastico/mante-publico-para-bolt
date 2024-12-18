import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  updateDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { AuthService } from './auth';
import type { Worker } from '../types';

export class WorkerService {
  static async getWorkers(projectId?: string): Promise<Worker[]> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) throw new Error('Usuario no autenticado');

      let workersQuery = collection(db, 'workers');
      
      // Si es usuario secundario, filtrar por sus proyectos asignados
      if (user.role === 'secondary' && user.projectIds?.length > 0) {
        workersQuery = query(
          workersQuery,
          where('projectIds', 'array-contains-any', user.projectIds)
        );
      } else if (projectId) {
        workersQuery = query(
          workersQuery,
          where('projectIds', 'array-contains', projectId)
        );
      }
      
      const querySnapshot = await getDocs(workersQuery);
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
      if (!AuthService.hasPermission('createWorker')) {
        throw new Error('No tiene permisos para crear operarios');
      }

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
      if (!AuthService.hasPermission('editWorker')) {
        throw new Error('No tiene permisos para editar operarios');
      }

      await updateDoc(doc(db, 'workers', id), {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating worker:', error);
      throw error instanceof Error ? error : new Error('No se pudo actualizar el operario');
    }
  }

  static async addWorkerToProject(workerId: string, projectId: string): Promise<void> {
    try {
      const workerRef = doc(db, 'workers', workerId);
      const workerDoc = await getDoc(workerRef);
      
      if (!workerDoc.exists()) {
        throw new Error('Operario no encontrado');
      }

      const worker = workerDoc.data() as Worker;
      const projectIds = worker.projectIds || [];

      if (!projectIds.includes(projectId)) {
        await updateDoc(workerRef, {
          projectIds: [...projectIds, projectId],
          updatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error adding worker to project:', error);
      throw error instanceof Error ? error : new Error('No se pudo agregar el operario al proyecto');
    }
  }
}