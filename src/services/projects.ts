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
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Project } from '../types';

export class ProjectService {
  static async getProjects(): Promise<Project[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'projects'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Project));
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw new Error('No se pudieron obtener los proyectos');
    }
  }

  static async createProject(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    try {
      const docRef = await addDoc(collection(db, 'projects'), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const newDoc = await getDoc(docRef);
      return {
        id: docRef.id,
        ...newDoc.data()
      } as Project;
    } catch (error) {
      console.error('Error creating project:', error);
      throw new Error('No se pudo crear el proyecto');
    }
  }

  static async updateProject(id: string, data: Partial<Omit<Project, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const projectRef = doc(db, 'projects', id);
      await updateDoc(projectRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating project:', error);
      throw new Error('No se pudo actualizar el proyecto');
    }
  }

  static async deleteProject(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'projects', id));
    } catch (error) {
      console.error('Error deleting project:', error);
      throw new Error('No se pudo eliminar el proyecto');
    }
  }

  static async getProjectWorkers(projectId: string): Promise<string[]> {
    try {
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      if (!projectDoc.exists()) {
        throw new Error('Proyecto no encontrado');
      }
      return projectDoc.data().workerIds || [];
    } catch (error) {
      console.error('Error fetching project workers:', error);
      throw new Error('No se pudieron obtener los operarios del proyecto');
    }
  }
}