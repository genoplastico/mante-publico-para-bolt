import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export async function promoteToSuperUser(userId: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role: 'super'
    });
    console.log('Usuario promovido a superusuario exitosamente');
  } catch (error) {
    console.error('Error al promover usuario:', error);
    throw new Error('No se pudo promover al usuario');
  }
}