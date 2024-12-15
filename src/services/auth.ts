import { 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { AuthUser, SaasRole, UserPermissions } from '../types/auth';

const ROLE_PERMISSIONS: Record<SaasRole, UserPermissions> = {
  owner: {
    createProject: true,
    editProject: true,
    deleteProject: true,
    uploadDocument: true,
    deleteDocument: true,
    createWorker: true,
    editWorker: true,
    viewAllProjects: true,
    assignWorkers: true,
    manageUsers: true
  },
  support: {
    createProject: false,
    editProject: false,
    deleteProject: false,
    uploadDocument: false,
    deleteDocument: false,
    createWorker: false,
    editWorker: false,
    viewAllProjects: true,
    assignWorkers: false,
    manageUsers: false
  },
  subscriber: {
    createProject: true,
    editProject: true,
    deleteProject: true,
    uploadDocument: true,
    deleteDocument: true,
    createWorker: true,
    editWorker: true,
    viewAllProjects: true,
    assignWorkers: true,
    manageUsers: true
  },
  viewer: {
    createProject: false,
    editProject: false,
    deleteProject: false,
    uploadDocument: false,
    deleteDocument: false,
    createWorker: false,
    editWorker: false,
    viewAllProjects: false,
    assignWorkers: false,
    manageUsers: false
  },
  collaborator: {
    createProject: false,
    editProject: true,
    deleteProject: false,
    uploadDocument: true,
    deleteDocument: false,
    createWorker: true,
    editWorker: true,
    viewAllProjects: false,
    assignWorkers: false,
    manageUsers: false
  },
};

interface LoginCredentials {
  email: string;
  password: string;
}

export class AuthService {
  private static currentUser: AuthUser | null = null;

  static async login({ email, password }: LoginCredentials): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      if (!userCredential.user.email) {
        throw new Error('El correo electrónico es requerido');
      }

      // Verificar si es admin del SaaS
      const adminDoc = await getDoc(doc(db, 'saas_admins', userCredential.user.uid));
      if (adminDoc.exists()) {
        const adminData = adminDoc.data();
        this.currentUser = {
          id: userCredential.user.uid,
          email: userCredential.user.email!,
          name: adminData.name,
          role: adminData.role as SaasRole
        };
        return this.currentUser;
      }

      // Si no es admin, buscar en usuarios normales
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (!userDoc.exists()) {
        // Si el usuario existe en Auth pero no en Firestore, lo creamos
        const newUser: FirebaseUser = {
          name: email.split('@')[0],
          role: 'secondary',
          projectIds: [] // Usuario nuevo sin proyectos asignados
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
        organizationId: userData.organizationId,
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

  static hasPermission(permission: keyof UserPermissions): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    return ROLE_PERMISSIONS[user.role][permission];
  }

  static getUserPermissions(): UserPermissions | null {
    const user = this.getCurrentUser();
    if (!user) return null;
    return ROLE_PERMISSIONS[user.role];
  }
}