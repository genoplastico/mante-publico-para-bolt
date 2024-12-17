import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { NotificationService } from '../notifications';
import type { Organization } from '../../types';

export class SaasLimitsService {
  static async checkOrganizationLimits(organizationId: string): Promise<{
    workers: { current: number; limit: number };
    storage: { current: number; limit: number };
    projects: { current: number; limit: number };
  }> {
    try {
      // Contar trabajadores
      const workersQuery = query(
        collection(db, 'workers'),
        where('organizationId', '==', organizationId)
      );
      const workersCount = (await getDocs(workersQuery)).size;
      
      // Contar proyectos
      const projectsQuery = query(
        collection(db, 'projects'),
        where('organizationId', '==', organizationId)
      );
      const projectsCount = (await getDocs(projectsQuery)).size;
      
      // Calcular almacenamiento usado (implementar lógica específica)
      const storageUsed = 0; // TODO: Implementar cálculo real
      
      return {
        workers: { current: workersCount, limit: 0 }, // Obtener límite del plan
        storage: { current: storageUsed, limit: 0 }, // Obtener límite del plan
        projects: { current: projectsCount, limit: 0 } // Obtener límite del plan
      };
    } catch (error) {
      console.error('Error checking organization limits:', error);
      throw error;
    }
  }

  static async notifyLimitExceeded(organizationId: string, limitType: string): Promise<void> {
    try {
      const orgDoc = await getDocs(query(
        collection(db, 'organizations'),
        where('id', '==', organizationId)
      ));
      
      if (!orgDoc.empty) {
        const org = orgDoc.docs[0].data() as Organization;
        
        // Notificar al administrador de la organización
        await NotificationService.createNotification({
          type: 'limit_exceeded',
          title: 'Límite excedido',
          message: `Su organización ha excedido el límite de ${limitType}`,
          userId: org.adminId
        });
      }
    } catch (error) {
      console.error('Error notifying limit exceeded:', error);
      throw error;
    }
  }
}