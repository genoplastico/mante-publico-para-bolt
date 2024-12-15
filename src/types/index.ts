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

export interface Organization {
  id: string;
  name: string;
  logo?: string;
  domain?: string;
  planId: string;
  settings: {
    theme: {
      primaryColor: string;
      logo?: string;
    };
    features: {
      documentsEnabled: boolean;
      workersEnabled: boolean;
      reportsEnabled: boolean;
    };
  };
  billing: {
    email: string;
    address: string;
    taxId?: string;
  };
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
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Worker {
  id: string;
  name: string;
  documentNumber: string;
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

export interface DocumentSearchQuery {
  text?: string;
  filters?: {
    type?: DocumentType[];
    status?: DocumentStatus[];
    dateRange?: {
      start: string;
      end: string;
    };
    metadata?: {
      keywords?: string[];
      category?: string;
      tags?: string[];
    };
  };
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}