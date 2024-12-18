import { collection, doc, getDocs, getDoc, setDoc, updateDoc, query, where, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { User, UserRole } from '../types';

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
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('Usuario no encontrado');
      }
      
      await deleteDoc(userRef);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error instanceof Error ? error : new Error('No se pudo eliminar el usuario');
    }
  }
}