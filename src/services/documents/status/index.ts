import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { determineDocumentStatus, calculateDaysUntilExpiry } from './utils';
import type { Document } from '../../../types';
import type { DocumentStatusUpdate } from './types';

export class DocumentStatusService {
  static updateDocumentStatus(document: Document): Document {
    const statusInfo = determineDocumentStatus(document.expiryDate);
    return {
      ...document,
      status: statusInfo.status
    };
  }

  static async updateStatusInDatabase(documentId: string, expiryDate?: string): Promise<DocumentStatusUpdate> {
    const statusInfo = determineDocumentStatus(expiryDate);
    const now = new Date().toISOString();
    
    const updateData: DocumentStatusUpdate = {
      id: documentId,
      status: statusInfo.status,
      metadata: {
        lastStatusUpdate: now,
        daysUntilExpiry: expiryDate ? calculateDaysUntilExpiry(expiryDate) : undefined
      }
    };

    await updateDoc(doc(db, 'documents', documentId), {
      status: updateData.status,
      'metadata.lastStatusUpdate': updateData.metadata.lastStatusUpdate,
      'metadata.daysUntilExpiry': updateData.metadata.daysUntilExpiry
    });

    return updateData;
  }

  static shouldUpdateStatus(document: Document): boolean {
    if (!document.expiryDate) return false;
    
    const currentStatus = determineDocumentStatus(document.expiryDate);
    return currentStatus.status !== document.status;
  }
}

export { determineDocumentStatus, calculateDaysUntilExpiry } from './utils';
export type { DocumentStatusInfo, DocumentStatusUpdate } from './types';
export { DOCUMENT_STATUS_CONFIG } from './constants';