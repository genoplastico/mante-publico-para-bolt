import type { SaasConfig } from '../../types/saas';

export const INITIAL_SAAS_CONFIG: SaasConfig = {
  ownerConfigured: false,
  setupDate: null,
  features: {
    maxInvitesPerProject: 4,
    inviteExpirationDays: 7,
    maxFileSize: 5 * 1024 * 1024, // 5MB
  }
};

export const COLLECTIONS = {
  SAAS_ADMINS: 'saas_admins',
  SAAS_CONFIG: 'saas_config',
  ORGANIZATIONS: 'organizations',
  WORKERS: 'workers',
  PAYMENTS: 'payments'
} as const;