import { collection, doc, getDocs, getDoc, setDoc, updateDoc, query, where, deleteDoc, writeBatch, DocumentReference } from 'firebase/firestore';
import { db } from '../config/firebase';
import { httpsCallable, getFunctions } from 'firebase/functions';
import type { User, UserRole } from '../types';

interface BatchOperation {
  ref: DocumentReference;
  type: 'update' | 'delete';
  data?: any;
}
export class UserService {
  static async getUsers(): Promise<User[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const users = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const userData = doc.data();
          return {
            id: doc.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            projectIds: userData.projectIds,
            organizationId: userData.organizationId
          } as User;
        })
      );
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('No se pudieron obtener los usuarios');
    }
  }

  static async updateUserRole(userId: string, role: UserRole): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { role });
    } catch (error) {
      console.error('Error updating user role:', error);
      throw new Error('No se pudo actualizar el rol del usuario');
    }
  }

  static async assignProjectToUser(userId: string, projectId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('Usuario no encontrado');
      }

      const userData = userDoc.data();
      const projectIds = userData.projectIds || [];
      
      if (!projectIds.includes(projectId)) {
        await updateDoc(userRef, {
          projectIds: [...projectIds, projectId]
        });
      }
    } catch (error) {
      console.error('Error assigning project:', error);
      throw new Error('No se pudo asignar el proyecto al usuario');
    }
  }

  static async removeProjectFromUser(userId: string, projectId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('Usuario no encontrado');
      }

      const userData = userDoc.data();
      const projectIds = userData.projectIds || [];
      
      await updateDoc(userRef, {
        projectIds: projectIds.filter(id => id !== projectId)
      });
    } catch (error) {
      console.error('Error removing project:', error);
      throw new Error('No se pudo remover el proyecto del usuario');
    }
  }

  static async getUsersByProject(projectId: string): Promise<User[]> {
    try {
      const q = query(
        collection(db, 'users'),
        where('projectIds', 'array-contains', projectId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));
    } catch (error) {
      console.error('Error fetching project users:', error);
      throw new Error('No se pudieron obtener los usuarios del proyecto');
    }
  }

  static async deleteUser(userId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const batch = writeBatch(db);
      const operations: BatchOperation[] = [];

      // 1. Verificar y obtener datos del usuario
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) throw new Error('Usuario no encontrado');
      const userData = userDoc.data();

      // 2. Eliminar de proyectos asignados
      if (userData.projectIds?.length) {
        const projectsQuery = query(
          collection(db, 'projects'),
          where('userIds', 'array-contains', userId)
        );
        
        const projectDocs = await getDocs(projectsQuery);
        projectDocs.forEach(projectDoc => {
          operations.push({
            ref: projectDoc.ref,
            type: 'update',
            data: {
              userIds: projectDoc.data().userIds.filter((id: string) => id !== userId)
            }
          });
        });
      }

      // 3. Eliminar documento del usuario
      operations.push({
        ref: userRef,
        type: 'delete'
      });

      // 4. Aplicar operaciones en batch
      operations.forEach(op => {
        if (op.type === 'update') {
          batch.update(op.ref, op.data);
        } else if (op.type === 'delete') {
          batch.delete(op.ref);
        }
      });

      await batch.commit();
      
      // 5. Eliminar usuario de Firebase Auth usando Cloud Functions
      try {
        const functions = getFunctions();
        const deleteUserAuth = httpsCallable(functions, 'deleteUserAuth');
        await deleteUserAuth({ userId });
      } catch (authError) {
        console.error('Error deleting auth user:', authError);
        // Revertir cambios en Firestore si falla la eliminación en Auth
        throw new Error('No se pudo eliminar el usuario completamente. Por favor, contacte al administrador.');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Error inesperado al eliminar el usuario');
    }
  }
}