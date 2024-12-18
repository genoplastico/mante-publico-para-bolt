import { collection, doc, query, where, getDocs, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { StorageService } from '../storage';
import { AuthService } from '../auth';
import { DocumentStatusService } from './status';
import { DOCUMENT_TYPES } from './constants';
import type { Document, DocumentType } from '../../types';
import type { DocumentStats } from './types/document.types';

export class DocumentService {
  static async getDocuments(): Promise<Document[]> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) {
        throw new Error('ERR_NOT_AUTHENTICATED');
      }

      // Construir query base
      let documentsQuery = collection(db, 'documents');

      // Aplicar filtros según el rol
      if (user.role === 'secondary' && user.projectIds?.length) {
        documentsQuery = query(
          documentsQuery,
          where('projectId', 'in', user.projectIds)
        );
      } else {
        documentsQuery = query(
          documentsQuery,
          where('createdBy', '==', user.id)
        );
      }

      const snapshot = await getDocs(documentsQuery);
      
      if (snapshot.empty) {
        return [];
      }

      // Mapear documentos y asegurar valores por defecto
      const documents = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          documentType: DOCUMENT_TYPES[data.type as DocumentType] || 'Documento sin tipo',
          workerName: data.workerName || 'Trabajador no encontrado',
          status: data.status || 'valid'
        } as Document;
      });

      // Actualizar estados
      return documents.map(doc => DocumentStatusService.updateDocumentStatus(doc));
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw new Error('ERR_FETCH_DOCUMENTS');
    }
  }

  static async deleteDocument(documentId: string): Promise<void> {
    try {
      if (!AuthService.hasPermission('deleteDocument')) {
        throw new Error('ERR_PERMISSION_DENIED');
      }

      const docRef = doc(db, 'documents', documentId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('ERR_DOCUMENT_NOT_FOUND');
      }

      const document = docSnap.data() as Document;

      // Eliminar archivo de Storage si existe URL
      if (document.url) {
        const pathMatch = document.url.match(/documents%2F.+\?/);
        if (pathMatch) {
          const path = decodeURIComponent(pathMatch[0].replace('?', ''));
          await StorageService.deleteFile(path);
        }
      }

      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting document:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('ERR_DELETE_DOCUMENT');
    }
  }

  static async getDocumentStats(): Promise<DocumentStats> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) {
        throw new Error('ERR_NOT_AUTHENTICATED');
      }

      const documents = await this.getDocuments();
      
      const stats: DocumentStats = {
        totalDocuments: documents.length,
        expiringDocuments: 0,
        expiredDocuments: 0,
        validDocuments: 0,
        documentsByType: {} as Record<DocumentType, number>,
        upcomingExpirations: []
      };

      documents.forEach(doc => {
        // Contar por tipo
        stats.documentsByType[doc.type] = (stats.documentsByType[doc.type] || 0) + 1;

        // Contar por estado
        switch (doc.status) {
          case 'expired':
            stats.expiredDocuments++;
            break;
          case 'expiring_soon':
            stats.expiringDocuments++;
            break;
          case 'valid':
            stats.validDocuments++;
            break;
        }

        // Agregar a próximos vencimientos si aplica
        if (doc.status === 'expiring_soon') {
          const daysUntilExpiry = doc.expiryDate 
            ? Math.ceil((new Date(doc.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            : 0;

          stats.upcomingExpirations.push({
            document: doc,
            daysUntilExpiry,
            workerName: doc.workerName
          });
        }
      });

      // Ordenar próximos vencimientos
      stats.upcomingExpirations.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

      return stats;
    } catch (error) {
      console.error('Error getting document stats:', error);
      throw new Error('ERR_GET_STATS');
    }
  }
}