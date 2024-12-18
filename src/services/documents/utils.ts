import type { DocumentStatus } from '../../types';
import { DOCUMENT_STATUS_CONFIG } from './status/constants';

export function calculateDocumentStatus(expiryDate: string | undefined): DocumentStatus {
  if (!expiryDate) return 'valid';

  const now = new Date();
  const expiry = new Date(expiryDate);
  const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry <= 0) return 'expired';
  if (daysUntilExpiry <= DOCUMENT_STATUS_CONFIG.WARNING_THRESHOLD) return 'expiring_soon';
  return 'valid';
}

export function getDaysUntilExpiry(expiryDate: string): number {
  const now = new Date();
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}