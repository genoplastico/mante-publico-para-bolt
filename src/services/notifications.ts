import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Notification } from '../types';

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

  static async createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<void> {
    try {
      await collection(db, 'notifications').add({
        ...notification,
        createdAt: new Date().toISOString(),
        read: false
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error('No se pudo crear la notificación');
    }
  }

  static getNotificationMessage(type: Notification['type'], metadata: any): string {
    switch (type) {
      case 'document_expired':
        return `El documento ${metadata.documentName} ha vencido`;
      case 'document_expiring':
        return `El documento ${metadata.documentName} vencerá en ${metadata.daysUntilExpiry} días`;
      case 'worker_added':
        return `Se ha agregado un nuevo operario: ${metadata.workerName}`;
      case 'document_added':
        return `Se ha agregado un nuevo documento: ${metadata.documentName}`;
      default:
        return 'Nueva notificación';
    }
  }
}