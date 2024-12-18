import type { Document, DocumentType } from '../../../types';

export interface DocumentMetadata {
  description?: string;
  keywords: string[];
  category: string;
  lastModified: string;
  modifiedBy: string;
  version: number;
  previousVersions?: string[];
  relatedDocuments?: string[];
  tags: string[];
}

export interface DocumentAuditAction {
  type: 'create' | 'update' | 'view' | 'download' | 'delete';
  timestamp: string;
  userId: string;
  details: string;
}

export interface DocumentAuditLog {
  createdAt: string;
  createdBy: string;
  actions: DocumentAuditAction[];
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
    workerName: string;
  }>;
}

export interface CreateDocumentParams {
  workerId: string;
  type: DocumentType;
  file: File;
  expiryDate?: string;
  disableScaling?: boolean;
}