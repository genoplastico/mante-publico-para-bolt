import type { Document } from '../../../types';

export interface DocumentStatusInfo {
  status: Document['status'];
  daysUntilExpiry?: number;
  isExpired: boolean;
  isCritical: boolean;
  isValid: boolean;
}

export interface DocumentStatusUpdate {
  id: string;
  status: Document['status'];
  metadata: {
    lastStatusUpdate: string;
    daysUntilExpiry?: number;
  };
}