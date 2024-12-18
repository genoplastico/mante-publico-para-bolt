import { 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc, writeBatch } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { AuthUser, SaasRole, UserPermissions, SaasAdmin } from '../types/auth';
import { INITIAL_SAAS_CONFIG } from './saas/constants';

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
    manageUsers: true,
    viewMetrics: true,
    manageSubscriptions: true,
    manageAdmins: true
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
    manageUsers: false,
    viewMetrics: true
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
    manageUsers: true,
    viewMetrics: false
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
    manageUsers: false,
    viewMetrics: false
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
    manageUsers: false,
    viewMetrics: false
  },
};

interface LoginCredentials {
  email: string;
  password: string;
}

export class AuthService {
  private static currentUser: AuthUser | null = null;

  static async login({ email, password }: LoginCredentials): Promise<AuthUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Primero verificar si es admin del SaaS
      const adminDoc = await getDoc(doc(db, 'saas_admins', userCredential.user.uid));
      if (adminDoc.exists()) {
        const adminData = adminDoc.data() as SaasAdmin;
        this.currentUser = {
          id: userCredential.user.uid,
          email: userCredential.user.email!,
          name: adminData.name,
          role: adminData.role || 'owner'
        };
        return this.currentUser;
      }

      // Si no es admin, buscar en usuarios normales
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (!userDoc.exists()) {
        // Verificar si hay algún owner configurado
        const configDoc = await getDoc(doc(db, 'saas_config', 'setup'));
        const isFirstUser = !configDoc.exists() || !configDoc.data()?.ownerConfigured;
        const now = new Date().toISOString();

        const newUser: AuthUser = {
          name: email.split('@')[0],
          role: isFirstUser ? 'owner' : 'viewer',
          id: userCredential.user.uid,
          email: userCredential.user.email!
        };
        
        if (isFirstUser) {
          // Si es el primer usuario, crearlo como admin
          const batch = writeBatch(db);
          
          const adminData: SaasAdmin = {
            id: userCredential.user.uid,
            email: userCredential.user.email!,
            name: newUser.name,
            role: 'owner'
          };
          
          // Configurar el SaaS
          batch.set(doc(db, 'saas_config', 'setup'), {
            ownerConfigured: true,
            setupDate: new Date().toISOString(),
            features: INITIAL_SAAS_CONFIG.features
          });
          
          // Crear admin
          batch.set(doc(db, 'saas_admins', userCredential.user.uid), adminData);
          
          await batch.commit();
        }
        
        if (!isFirstUser) {
          // Si no es el primer usuario, crearlo como usuario normal
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            id: userCredential.user.uid,
            email: userCredential.user.email!,
            name: newUser.name,
            role: newUser.role
          });
        }

        return newUser;
      }

      const userData = userDoc.data() as AuthUser;
      const user: AuthUser = {
        id: userCredential.user.uid,
        email: userCredential.user.email!,
        name: userData.name,
        role: userData.role,
        organizationId: userData.organizationId || undefined,
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

  static getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  static initAuthListener(callback: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Primero verificar si es admin
        const adminDoc = await getDoc(doc(db, 'saas_admins', firebaseUser.uid));
        if (adminDoc.exists()) {
          const adminData = adminDoc.data() as SaasAdmin;
          const user: AuthUser = {
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            name: adminData.name, 
            role: adminData.role,
            organizationId: 'default_org'
          };
          this.currentUser = user;
          callback(user);
        } else {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as AuthUser;
            const user: AuthUser = {
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              name: userData.name,
              role: userData.role,
              projectIds: userData.projectIds,
              organizationId: userData.organizationId
            };
            this.currentUser = user;
            callback(user);
          }
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

  private static readonly ROLE_MAP = {
    super: 'owner',
    secondary: 'viewer'
  } as const;

  private static mapRole(role: string): SaasRole {
    return this.ROLE_MAP[role as keyof typeof this.ROLE_MAP] || 'viewer';
  }

  static hasPermission(permission: keyof UserPermissions): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    const mappedRole = this.mapRole(user.role);
    return ROLE_PERMISSIONS[mappedRole]?.[permission] ?? false;
  }

  static getUserPermissions(): UserPermissions | null {
    const user = this.getCurrentUser();
    if (!user) return null;
    
    const mappedRole = this.mapRole(user.role);
    return ROLE_PERMISSIONS[mappedRole] ?? null;
  }
}