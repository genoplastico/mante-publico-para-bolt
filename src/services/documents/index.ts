import { collection, doc, query, where, getDocs, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { StorageService } from '../storage';
import { AuthService } from '../auth';
import { DocumentStatusService } from './status';
import { DOCUMENT_TYPES } from './constants';
import type { Document, DocumentType } from '../../types';

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

  static async getWorkerDocuments(workerId: string): Promise<Document[]> {
    try {
      const q = query(
        collection(db, 'documents'),
        where('workerId', '==', workerId)
      );
      const querySnapshot = await getDocs(q);
      
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Document));

      return documents.map(doc => DocumentStatusService.updateDocumentStatus(doc));
    } catch (error) {
      console.error('Error getting worker documents:', error);
      throw new Error('Error al obtener los documentos del trabajador');
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
}