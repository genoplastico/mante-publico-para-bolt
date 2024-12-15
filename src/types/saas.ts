// Tipos para el panel de administración del SaaS
export interface SaasAdmin {
  id: string;
  email: string;
  role: 'owner' | 'support';
  name: string;
}

export interface SaasConfig {
  ownerConfigured: boolean;
  setupDate: string | null;
  features: {
    maxInvitesPerProject: number;
    inviteExpirationDays: number;
    maxFileSize: number;
  };
}

export interface SaasMetrics {
  totalSubscribers: number;
  totalWorkers: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
}

export interface SaasPlan {
  id: string;
  name: string;
  maxWorkers: number;
  price: number;
  features: {
    maxProjectsPerOrg: number;
    maxViewersPerProject: number;
    maxCollaboratorsPerOrg: number;
    storageLimit: number; // en GB
  };
}

export interface Invitation {
  id: string;
  email: string;
  role: 'viewer' | 'collaborator';
  projectId?: string;
  organizationId: string;
  status: 'pending' | 'accepted' | 'expired';
  createdAt: string;
  expiresAt: string;
}

export interface PaymentHistory {
  id: string;
  organizationId: string;
  amount: number;
  status: 'success' | 'failed' | 'pending';
  provider: 'mercadopago';
  createdAt: string;
  metadata: {
    transactionId: string;
    planId: string;
    period: {
      start: string;
      end: string;
    };
  };
}