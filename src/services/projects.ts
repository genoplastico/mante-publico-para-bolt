import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Project } from '../types';

export class ProjectService {
  static async getProjects(): Promise<Project[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'projects'));
      const projects = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Project));
      return projects.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw new Error('No se pudieron obtener los proyectos');
    }
  }

  static async createProject(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    try {
      const now = new Date().toISOString();
      const docRef = await addDoc(collection(db, 'projects'), {
        ...data,
        createdAt: now,
        updatedAt: now
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
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating project:', error);
      throw new Error('No se pudo actualizar el proyecto');
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