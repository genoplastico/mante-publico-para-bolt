export interface Subscription {
  id: string;
  planId: string;
  userId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: {
    maxProjects: number;
    maxUsersPerProject: number;
    maxStorage: number; // en GB
    documentsPerMonth: number;
    customBranding: boolean;
    advancedReports: boolean;
    apiAccess: boolean;
    priority: boolean;
  };
}

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  projectIds?: string[];
  organizationId: string;
  subscriptionId?: string;
}

export type UserRole = 'super' | 'secondary';

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
}

export interface FirebaseUser {
  name: string;
  role: UserRole;
  projectIds?: string[];
}

export interface Project {
  id: string;
  name: string;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Worker {
  id: string;
  name: string;
  documentNumber: string;
  createdBy: string;
  projectIds: string[];
  documents: Document[];
}

export interface Document {
  id: string;
  type: DocumentType;
  name: string;
  url: string;
  expiryDate?: string;
  status: DocumentStatus;
  uploadedAt: string;
  workerId?: string;
  workerName: string; // Ahora es requerido y siempre tendrá un valor
  documentType?: string;
  projectId?: string;
  metadata: {
    description?: string;
    keywords: string[];
    category: string;
    lastModified: string;
    modifiedBy: string;
    version: number;
    previousVersions?: string[];
    relatedDocuments?: string[];
    tags: string[];
  };
  auditLog: {
    createdAt: string;
    createdBy: string;
    actions: Array<{
      type: 'create' | 'update' | 'view' | 'download' | 'delete';
      timestamp: string;
      userId: string;
      details: string;
    }>;
  };
}

export type DocumentType = 
  | 'carnet_salud'
  | 'cert_seguridad'
  | 'entrega_epp'
  | 'recibo_sueldo'
  | 'cert_dgi'
  | 'cert_bps'
  | 'cert_seguro';

export type DocumentStatus = 'valid' | 'expired' | 'expiring_soon';
