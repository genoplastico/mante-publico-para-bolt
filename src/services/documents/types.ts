import type { Document, DocumentType } from '../../types';

export interface CreateDocumentParams {
  workerId: string;
  type: DocumentType;
  file: File;
  expiryDate?: string;
  disableScaling?: boolean;
}

export interface DocumentStats {
  totalDocuments: number;
  expiringDocuments: number;
  expiredDocuments: number;
  validDocuments: number;
  documentsByType: Record<DocumentType, number>;
  upcomingExpirations: Array<{
    document: Document;
    daysUntilExpiry: number;
    workerName?: string;
  }>;
}