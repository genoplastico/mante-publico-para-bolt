import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Invitation } from '../types';

export class InvitationService {
  static async createInvitation(data: Omit<Invitation, 'id' | 'status' | 'createdAt'>): Promise<Invitation> {
    try {
      // Verificar límite de invitaciones para el proyecto si es viewer
      if (data.role === 'viewer' && data.projectId) {
        const existingInvites = await this.getProjectInvitations(data.projectId);
        if (existingInvites.length >= 4) {
          throw new Error('Se alcanzó el límite de invitaciones para este proyecto');
        }
      }

      const now = new Date();
      const expiresAt = new Date();
      expiresAt.setDate(now.getDate() + 7); // 7 días de validez

      const invitationData = {
        ...data,
        status: 'pending',
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString()
      };

      const docRef = await addDoc(collection(db, 'invitations'), invitationData);
      return { id: docRef.id, ...invitationData } as Invitation;
    } catch (error) {
      console.error('Error creating invitation:', error);
      throw error;
    }
  }

  static async getProjectInvitations(projectId: string): Promise<Invitation[]> {
    const q = query(
      collection(db, 'invitations'),
      where('projectId', '==', projectId),
      where('status', '==', 'pending')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Invitation));
  }

  static async acceptInvitation(invitationId: string): Promise<void> {
    const invitationRef = doc(db, 'invitations', invitationId);
    await updateDoc(invitationRef, {
      status: 'accepted'
    });
  }
}