import { doc, getDoc, writeBatch, query, where, collection, getDocs } from 'firebase/firestore';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { db } from '../../config/firebase';
import type { BatchOperation } from './types';
import type { User } from '../../types';

export async function deleteUser(userId: string): Promise<void> {
  const batch = writeBatch(db);
  const operations: BatchOperation[] = [];

  try {
    // 1. Verificar y obtener datos del usuario
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('Usuario no encontrado');
    }

    const userData = userDoc.data() as User;

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

    // 4. Eliminar usuario de Auth usando Cloud Function
    try {
      const functions = getFunctions();
      const deleteUserAuth = httpsCallable<{ userId: string }, { success: boolean; message: string }>(
        functions, 
        'deleteUserAuth'
      );
      
      const result = await deleteUserAuth({ userId });
      
      if (!result.data.success && result.data.message !== 'Usuario no encontrado en autenticación') {
        throw new Error(result.data.message || 'Error al eliminar el usuario de autenticación');
      }
    } catch (authError) {
      console.error('Error deleting auth user:', authError);
      // Continuar con la eliminación en Firestore incluso si falla Auth
      console.warn('Continuando con eliminación en Firestore...');
    }

    // 5. Si la eliminación de Auth fue exitosa, proceder con Firestore
    operations.forEach(op => {
      if (op.type === 'update') {
        batch.update(op.ref, op.data);
      } else if (op.type === 'delete') {
        batch.delete(op.ref);
      }
    });

    await batch.commit();
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error instanceof Error 
      ? error 
      : new Error('No se pudo completar la eliminación del usuario');
  }
}