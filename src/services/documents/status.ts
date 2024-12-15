import type { Document, DocumentStatus } from '../../types';
import { createStatusChangeNotification } from './notifications';
import { AuthService } from '../auth';
import { calculateDocumentStatus, shouldNotifyStatusChange } from './utils';

export class DocumentStatusService {
  static updateDocumentStatus(document: Document): Document {
    if (!document.expiryDate) return document;

    const newStatus = calculateDocumentStatus(document.expiryDate);

    if (shouldNotifyStatusChange(document.status, newStatus)) {
      const user = AuthService.getCurrentUser();
      if (user) {
        void createStatusChangeNotification(document, newStatus, user);
      }
    }

    return { ...document, status: newStatus };
  }
}