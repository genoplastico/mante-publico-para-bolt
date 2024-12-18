import { DOCUMENT_STATUS_CONFIG } from './constants';
import type { DocumentStatusInfo } from './types';

export function calculateDaysUntilExpiry(expiryDate: string): number {
  const now = new Date();
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function determineDocumentStatus(expiryDate?: string): DocumentStatusInfo {
  if (!expiryDate) {
    return {
      status: DOCUMENT_STATUS_CONFIG.STATUS.VALID,
      isExpired: false,
      isCritical: false,
      isValid: true
    };
  }

  const daysUntilExpiry = calculateDaysUntilExpiry(expiryDate);
  
  if (daysUntilExpiry <= 0) {
    return {
      status: DOCUMENT_STATUS_CONFIG.STATUS.EXPIRED,
      daysUntilExpiry: 0,
      isExpired: true,
      isCritical: false,
      isValid: false
    };
  }
  
  if (daysUntilExpiry <= DOCUMENT_STATUS_CONFIG.CRITICAL_THRESHOLD) {
    return {
      status: DOCUMENT_STATUS_CONFIG.STATUS.EXPIRING_SOON,
      daysUntilExpiry,
      isExpired: false,
      isCritical: true,
      isValid: false
    };
  }
  
  if (daysUntilExpiry <= DOCUMENT_STATUS_CONFIG.WARNING_THRESHOLD) {
    return {
      status: DOCUMENT_STATUS_CONFIG.STATUS.EXPIRING_SOON,
      daysUntilExpiry,
      isExpired: false,
      isCritical: false,
      isValid: false
    };
  }
  
  return {
    status: DOCUMENT_STATUS_CONFIG.STATUS.VALID,
    daysUntilExpiry,
    isExpired: false,
    isCritical: false,
    isValid: true
  };
}