import {
  collection,
  doc,
  documentId,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { AuthService } from './auth';
import type { Project } from '../types';

export class ProjectService {
  static async getProjects(): Promise<Project[]> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user || !user.organizationId) {
        console.warn('Usuario no autenticado o sin organización');
        return [];
      }

      // Construir query base con filtro de organización
      let projectsQuery = query(collection(db, 'projects'),
        where('organizationId', '==', user.organizationId)
      );
      
      // Si es usuario secundario, filtrar por sus proyectos asignados
      if (user.role === 'secondary' && user.projectIds?.length > 0) {
        projectsQuery = query(projectsQuery, where(documentId(), 'in', user.projectIds));
      }
      
      const querySnapshot = await getDocs(projectsQuery);
      return querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Project))
        .sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error desconocido');
      console.error('Error fetching projects:', err);
      return [];
    }
  }

  static async getProjectsByIds(projectIds: string[]): Promise<Project[]> {
    try {
      if (!projectIds.length) return [];

      const user = AuthService.getCurrentUser();
      if (!user || !user.organizationId) {
        return [];
      }
      
      // Filtrar por organizationId y projectIds
      const q = query(
        collection(db, 'projects'),
        where('organizationId', '==', user.organizationId),
        where(documentId(), 'in', projectIds)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Project));
    } catch (error) {
      console.error('Error fetching projects by ids:', error);
      return [];
    }
  }

  static async createProject(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) {
        throw new Error('Debe iniciar sesión para crear proyectos');
      }

      if (!AuthService.hasPermission('createProject')) {
        throw new Error('No tiene permisos para crear proyectos');
      }

      // Verificar organización
      if (!user.organizationId) {
        throw new Error('No tiene una organización asignada. Por favor contacte al administrador.');
      }
      // Validar datos del proyecto
      if (!data.name?.trim()) {
        throw new Error('El nombre del proyecto es requerido');
      }

      const now = new Date().toISOString();
      const projectData = {
        ...data,
        organizationId: user.organizationId,
        createdAt: now,
        updatedAt: now,
        isActive: data.isActive ?? true
      };

      const docRef = await addDoc(collection(db, 'projects'), projectData);
      if (!docRef.id) {
        throw new Error('Error al crear el proyecto en la base de datos');
      }

      const newDoc = await getDoc(docRef); 
      if (!newDoc.exists()) {
        throw new Error('Error al obtener los datos del proyecto creado');
      }

      return {
        id: docRef.id,
        ...newDoc.data()
      } as Project;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear el proyecto';
      console.error('Error creating project:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  static async updateProject(id: string, data: Partial<Omit<Project, 'id' | 'createdAt'>>): Promise<void> {
    try {
      if (!AuthService.hasPermission('editProject')) {
        throw new Error('No tiene permisos para editar proyectos');
      }

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