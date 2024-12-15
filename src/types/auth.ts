export type SaasRole = 'owner' | 'support' | 'subscriber' | 'viewer' | 'collaborator';

export interface UserPermissions {
  createProject: boolean;
  editProject: boolean;
  deleteProject: boolean;
  uploadDocument: boolean;
  deleteDocument: boolean;
  createWorker: boolean;
  editWorker: boolean;
  viewAllProjects: boolean;
  assignWorkers: boolean;
  manageUsers: boolean;
  viewMetrics: boolean;
  manageSubscriptions: boolean;
  manageAdmins: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: SaasRole;
  organizationId?: string;
  projectIds?: string[];
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoading: boolean;
}

export interface SaasAdmin {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'support';
}