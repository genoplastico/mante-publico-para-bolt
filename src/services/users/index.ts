import { collection, doc, getDocs, getDoc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { deleteUser } from './delete';
import type { User, UserRole } from '../../types';

export class UserService {
  static readonly deleteUser = deleteUser;

  static async getUsers(): Promise<User[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));
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
}