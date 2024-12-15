import { collection, query, where, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Notification } from '../types';

interface CreateNotificationParams {
  type: Notification['type'];
  title: string;
  message: string;
  userId: string;
  metadata?: {
    documentId?: string;
    workerId?: string;
    projectId?: string;
  };
}

export async function createNotification(params: CreateNotificationParams): Promise<void> {
  try {
    if (!params.userId) {
      throw new Error('userId es requerido para crear una notificación');
    }

    // Asegurarnos de que metadata sea un objeto válido
    const metadata = {
      documentId: params.metadata?.documentId || null,
      workerId: params.metadata?.workerId || null,
      projectId: params.metadata?.projectId || null
    };

    const notificationData = {
      type: params.type,
      title: params.title,
      message: params.message,
      userId: params.userId,
      metadata,
      createdAt: new Date().toISOString(),
      read: false,
      updatedAt: new Date().toISOString()
    };

    await addDoc(collection(db, 'notifications'), notificationData);
  } catch (error) {
    console.error('Error creating notification:', error instanceof Error ? error.message : 'Error desconocido');
    throw error;
  }
}

export class NotificationService {
  static async getNotifications(userId: string): Promise<Notification[]> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Notification));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  static async markAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('No se pudo marcar la notificación como leída');
    }
  }

  static readonly createNotification = createNotification;

  static getNotificationMessage(type: Notification['type'], metadata: any): string {
    switch (type) {
      case 'document_expired':
        return metadata.documentName 
          ? `El documento ${metadata.documentName} ha vencido`
          : 'Un documento ha vencido';
      case 'document_expiring':
        return metadata.documentName && metadata.daysUntilExpiry
          ? `El documento ${metadata.documentName} vencerá en ${metadata.daysUntilExpiry} días`
          : 'Un documento está por vencer';
      case 'worker_added':
        return metadata.workerName
          ? `Se ha agregado un nuevo operario: ${metadata.workerName}`
          : 'Se ha agregado un nuevo operario';
      case 'document_added':
        return metadata.documentName
          ? `Se ha agregado un nuevo documento: ${metadata.documentName}`
          : 'Se ha agregado un nuevo documento';
      default:
        return 'Nueva notificación';
    }
  }
}