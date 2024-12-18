import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  getDoc 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { StorageService } from '../storage';
import { AuthService } from '../auth';
import { WorkerService } from '../workers';
import { DocumentStatusService } from './status';
import { DocumentSearchService } from './search';
import { DOCUMENT_METADATA } from './metadata';
import type { Document } from '../../types';
import type { CreateDocumentParams, DocumentStats } from './types';

import { collection, query, where, getDocs, QueryConstraint } from 'firebase/firestore';
import { db } from '../config/firebase';
import { AuthService } from '../auth';
import type { Document, DocumentType } from '../types';
import type { SearchFilters } from './search/types';

interface SearchQuery {
  text?: string;
  filters?: SearchFilters;
}

export class DocumentService {
  static async searchDocuments(searchQuery: SearchQuery = {}): Promise<Document[]> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Construir constraints base
      const constraints: QueryConstraint[] = [];

      // Aplicar filtros de tipo
      if (searchQuery.filters?.type?.length) {
        constraints.push(where('type', 'in', searchQuery.filters.type));
      }

      // Aplicar filtros de estado
      if (searchQuery.filters?.status?.length) {
        constraints.push(where('status', 'in', searchQuery.filters.status));
      }

      // Construir y ejecutar query
      const q = query(collection(db, 'documents'), ...constraints);
      const snapshot = await getDocs(q);
      
      let documents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Document));

      // Aplicar filtro de texto si existe
      if (searchQuery.text) {
        const searchText = searchQuery.text.toLowerCase();
        documents = documents.filter(doc => {
          const searchableText = [
            DOCUMENT_TYPES[doc.type],
            doc.metadata?.description,
            ...(doc.metadata?.keywords || []),
            doc.name
          ].join(' ').toLowerCase();
          
          return searchableText.includes(searchText);
        });
      }

      return documents;
    } catch (error) {
      console.error('Error searching documents:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Error al buscar documentos');
    }
  }

  static async uploadDocument({ workerId, type, file, expiryDate, disableScaling }: CreateDocumentParams): Promise<Document> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Verificar conexión
      if (!navigator.onLine) {
        throw new Error('No hay conexión a internet. Por favor, intente más tarde.');
      }

      // Verificar que el worker existe y pertenece al usuario
      const workerDoc = await getDoc(doc(db, 'workers', workerId));
      if (!workerDoc.exists()) {
        throw new Error('Operario no encontrado');
      }
      
      const worker = workerDoc.data();
      if (worker.createdBy !== user.id) {
        throw new Error('No tiene permisos para subir documentos a este operario');
      }

      // Validaciones iniciales
      const validationError = StorageService.validateFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      // Subir archivo
      const filePath = StorageService.generateFilePath(workerId, file.name);
      let url;
      try {
        url = await StorageService.uploadFile(file, filePath, { disableScaling });
      } catch (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw new Error('Error al subir el archivo. Por favor, verifique su conexión e intente nuevamente.');
      }

      // Preparar metadata
      const metadata = DOCUMENT_METADATA[type];
      const now = new Date().toISOString();
    
      const documentData: Omit<Document, 'id'> = {
        type,
        name: file.name,
        url,
        status: 'valid',
        uploadedAt: now,
        expiryDate,
        workerId,
        metadata: {
          description: metadata.description,
          keywords: metadata.keywords,
          category: metadata.category,
          lastModified: now,
          modifiedBy: user.id,
          version: 1,
          tags: [metadata.category],
        },
        auditLog: {
          createdAt: now,
          createdBy: user.id,
          actions: [{
            type: 'create',
            timestamp: now,
            userId: user.id,
            details: `Documento ${type} creado para el trabajador ${workerId}`
          }]
        }
      };

      // Crear documento en Firestore
      const docRef = await addDoc(collection(db, 'documents'), documentData);
      const newDocument = { id: docRef.id, ...documentData };

      // Actualizar estado inicial
      return DocumentStatusService.updateDocumentStatus(newDocument);
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Error al subir el documento. Por favor, intente nuevamente.');
    }
  }

  static async getWorkerDocuments(workerId: string): Promise<Document[]> {
    try {
      const q = query(
        collection(db, 'documents'),
        where('workerId', '==', workerId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Document));
    } catch (error) {
      throw new Error('Error al obtener los documentos');
    }
  }

  static async deleteDocument(documentId: string): Promise<void> {
    try {
      if (!AuthService.hasPermission('deleteDocument')) {
        throw new Error('No tiene permisos para eliminar documentos');
      }

      const docRef = doc(db, 'documents', documentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const document = docSnap.data() as Document;
        
        const pathMatch = document.url.match(/documents%2F.+\?/);
        if (pathMatch) {
          const path = decodeURIComponent(pathMatch[0].replace('?', ''));
          await StorageService.deleteFile(path);
        }
        
        await deleteDoc(docRef);
      }
    } catch (error) {
      throw new Error('Error al eliminar el documento');
    }
  }

  static async getDashboardStats(): Promise<DocumentStats> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const workers = await WorkerService.getWorkers();
      const workerIds = workers.map(w => w.id);
      
      const documentsQuery = query(
        collection(db, 'documents'),
        where('workerId', 'in', workerIds)
      );
      
      const querySnapshot = await getDocs(documentsQuery);
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Document));

      const workerMap = new Map(workers.map(w => [w.id, w]));
      const now = new Date();
      
      const stats: DocumentStats = {
        totalDocuments: documents.length,
        expiringDocuments: 0,
        expiredDocuments: 0,
        validDocuments: 0,
        documentsByType: {} as Record<DocumentType, number>,
        upcomingExpirations: []
      };
      
      documents.forEach(doc => {
        const updatedDoc = DocumentStatusService.updateDocumentStatus(doc);
        doc.status = updatedDoc.status;

        if (doc.expiryDate) {
          const expiryDate = new Date(doc.expiryDate);
          const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilExpiry > 0 && daysUntilExpiry <= 15) {
            stats.upcomingExpirations.push({
              document: doc,
              daysUntilExpiry,
              workerName: doc.workerId ? workerMap.get(doc.workerId)?.name : undefined
            });
          }
        }

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
        
        stats.documentsByType[doc.type] = (stats.documentsByType[doc.type] || 0) + 1;
      });
      
      stats.upcomingExpirations.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
      
      return stats;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error desconocido');
      console.error('Error getting dashboard stats:', err);
      throw err;
    }
  }

  // Re-export functionality from other modules
  static readonly search = DocumentSearchService.searchDocuments;
  static readonly searchWithFilters = DocumentSearchService.searchWithFilters;
  static readonly updateDocumentStatus = DocumentStatusService.updateDocumentStatus;
}