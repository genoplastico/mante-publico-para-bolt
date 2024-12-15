import type { DocumentStatus } from '../../types';
import { EXPIRY_THRESHOLDS } from './constants';

export function calculateDocumentStatus(expiryDate: string | undefined): DocumentStatus {
  if (!expiryDate) return 'valid';

  const now = new Date();
  const expiry = new Date(expiryDate);
  const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry <= 0) return 'expired';
  if (daysUntilExpiry <= EXPIRY_THRESHOLDS.WARNING_DAYS) return 'expiring_soon';
  return 'valid';
}

export function getDaysUntilExpiry(expiryDate: string): number {
  const now = new Date();
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}