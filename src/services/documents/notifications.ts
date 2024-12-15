import type { Document, DocumentStatus, User } from '../../types';
import { createNotification } from '../notifications';
import { getDaysUntilExpiry } from './utils';

export async function createStatusChangeNotification(
  document: Document,
  newStatus: DocumentStatus,
  user: User
): Promise<void> {
  try {
    if (!document.id || !user.id) {
      console.warn('Missing required data for notification');
      return;
    }

    const daysUntilExpiry = document.expiryDate ? getDaysUntilExpiry(document.expiryDate) : 0;

    const notificationData = {
      type: newStatus === 'expired' ? 'document_expired' : 'document_expiring',
      title: newStatus === 'expired' ? 'Documento Vencido' : 'Documento por Vencer',
      message: newStatus === 'expired'
        ? `El documento ${document.name} ha vencido`
        : `El documento ${document.name} vencerá en ${daysUntilExpiry} días`,
      metadata: {
        documentId: document.id,
        workerId: document.workerId || null,
        projectId: document.projectId || null
      },
      userId: user.id
    };

    await createNotification(notificationData);
  } catch (error) {
    console.error('Error creating status change notification:', error);
  }
}