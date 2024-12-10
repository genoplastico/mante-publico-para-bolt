import { 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { User, FirebaseUser } from '../types';

interface LoginCredentials {
  email: string;
  password: string;
}

export class AuthService {
  private static currentUser: User | null = null;

  static async login({ email, password }: LoginCredentials): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user.email) {
        throw new Error('El correo electrónico es requerido');
      }

      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

      if (!userDoc.exists()) {
        // Si el usuario existe en Auth pero no en Firestore, lo creamos
        const newUser: FirebaseUser = {
          name: email.split('@')[0],
          role: 'secondary',
          projectIds: []
        };
        
        await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
        
        return {
          id: userCredential.user.uid,
          email: userCredential.user.email,
          name: newUser.name,
          role: newUser.role,
          projectIds: newUser.projectIds
        };
      }

      const userData = userDoc.data() as FirebaseUser;
      const user: User = {
        id: userCredential.user.uid,
        email: userCredential.user.email!,
        name: userData.name,
        role: userData.role,
        projectIds: userData.projectIds
      };

      this.currentUser = user;
      return user;
    } catch (error) {
      throw error; // Propagar el error original de Firebase para mejor manejo
    }
  }

  static async logout(): Promise<void> {
    try {
      await firebaseSignOut(auth);
      this.currentUser = null;
    } catch (error) {
      throw new Error('Error al cerrar sesión');
    }
  }

  static getCurrentUser(): User | null {
    return this.currentUser;
  }

  static initAuthListener(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as FirebaseUser;
          const user: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            name: userData.name,
            role: userData.role,
            projectIds: userData.projectIds
          };
          this.currentUser = user;
          callback(user);
        }
      } else {
        this.currentUser = null;
        callback(null);
      }
    });
  }

  static isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  static hasPermission(permission: 'create_project' | 'edit_project' | 'upload_document'): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.role === 'super';
  }
}