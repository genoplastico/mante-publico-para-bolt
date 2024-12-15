import type { Document, DocumentStatus } from '../../types';
import { calculateDocumentStatus } from './utils';

export class DocumentStatusService {
  static updateDocumentStatus(document: Document): Document {
    if (!document.expiryDate) return document;

    const newStatus = calculateDocumentStatus(document.expiryDate);
    return { ...document, status: newStatus };
  }
}