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
import { db } from '../config/firebase';
import { StorageService } from './storage';
import { AuthService } from './auth';
import { WorkerService } from './workers'; 
import type { Document, DocumentType, DocumentSearchQuery, DocumentStatus } from '../types';

const DOCUMENT_METADATA = {
  carnet_salud: {
    category: 'documentos_personales',
    keywords: ['salud', 'carnet', 'médico', 'sanitario'],
    description: 'Carnet de salud del trabajador'
  },
  cert_seguridad: {
    category: 'seguridad_laboral',
    keywords: ['seguridad', 'certificado', 'capacitación', 'prevención'],
    description: 'Certificado de seguridad laboral'
  },
  entrega_epp: {
    category: 'seguridad_laboral',
    keywords: ['epp', 'equipo', 'protección', 'seguridad'],
    description: 'Constancia de entrega de equipo de protección personal'
  },
  recibo_sueldo: {
    category: 'documentos_laborales',
    keywords: ['sueldo', 'salario', 'pago', 'recibo'],
    description: 'Recibo de sueldo mensual'
  },
  cert_dgi: {
    category: 'documentos_fiscales',
    keywords: ['dgi', 'impuestos', 'certificado', 'fiscal'],
    description: 'Certificado DGI'
  },
  cert_bps: {
    category: 'documentos_fiscales',
    keywords: ['bps', 'seguridad social', 'certificado'],
    description: 'Certificado BPS'
  },
  cert_seguro: {
    category: 'seguros',
    keywords: ['seguro', 'póliza', 'cobertura'],
    description: 'Certificado de seguro'
  }
};

interface CreateDocumentParams {
  workerId: string;
  type: DocumentType;
  file: File;
  expiryDate?: string;
  disableScaling?: boolean;
}

export class DocumentService {
  static async uploadDocument({ workerId, type, file, expiryDate, disableScaling }: CreateDocumentParams): Promise<Document> {
    try {
      if (!AuthService.hasPermission('uploadDocument')) {
        throw new Error('No tiene permisos para subir documentos');
      }

      const user = AuthService.getCurrentUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Validaciones iniciales
      const validationError = StorageService.validateFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      // Subir archivo
      const filePath = StorageService.generateFilePath(workerId, file.name);
      const url = await StorageService.uploadFile(file, filePath, { disableScaling });

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
      return this.updateDocumentStatus(newDocument);
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error instanceof Error ? error : new Error('Error al subir el documento');
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

  static updateDocumentStatus(document: Document): Document {
    if (!document.expiryDate) return document;

    const now = new Date();
    const expiry = new Date(document.expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    let newStatus: DocumentStatus = 'valid';
    if (daysUntilExpiry <= 0) {
      newStatus = 'expired';
    } else if (daysUntilExpiry <= 15) {
      newStatus = 'expiring_soon';
    }

    return { ...document, status: newStatus };
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

  static async searchDocuments(query: string): Promise<Document[]> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) throw new Error('Usuario no autenticado');

      let documentsQuery = collection(db, 'documents');
      
      if (user.role === 'secondary' && user.projectIds?.length) {
        documentsQuery = query(
          documentsQuery,
          where('projectId', 'in', user.projectIds)
        );
      }
      
      const querySnapshot = await getDocs(documentsQuery);
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Document));
      
      if (!query) return documents;
      
      const normalizedQuery = query.toLowerCase();
      return documents.filter(doc => {
        const searchableText = [
          doc.name,
          doc.metadata.description,
          ...doc.metadata.keywords,
          ...doc.metadata.tags,
          doc.metadata.category
        ].join(' ').toLowerCase();
        
        return searchableText.includes(normalizedQuery);
      });
    } catch (error) {
      throw new Error('Error al buscar documentos');
    }
  }

  static async getDashboardStats(): Promise<{
    totalDocuments: number;
    expiringDocuments: number;
    expiredDocuments: number;
    validDocuments: number;
    documentsByType: Record<DocumentType, number>;
    upcomingExpirations: Array<{
      document: Document;
      daysUntilExpiry: number;
      workerName?: string;
    }>;
  }> {
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
      
      const stats = {
        totalDocuments: documents.length,
        expiringDocuments: 0,
        expiredDocuments: 0,
        validDocuments: 0,
        documentsByType: {} as Record<DocumentType, number>,
        upcomingExpirations: [] as Array<{
          document: Document;
          daysUntilExpiry: number;
          workerName?: string;
        }>
      };
      
      documents.forEach(doc => {
        const updatedDoc = this.updateDocumentStatus(doc);
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

  static async searchDocumentsWithFilters(query: DocumentSearchQuery): Promise<Document[]> {
    try {
      let q = query(collection(db, 'documents'));
      
      if (query.filters?.type?.length) {
        q = query(q, where('type', 'in', query.filters.type));
      }
      
      if (query.filters?.status?.length) {
        q = query(q, where('status', 'in', query.filters.status));
      }
      
      const querySnapshot = await getDocs(q);
      let documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Document));
      
      if (query.text) {
        const normalizedQuery = query.text.toLowerCase();
        documents = documents.filter(doc => {
          const searchableText = [
            doc.name,
            doc.metadata.description,
            ...doc.metadata.keywords,
            ...doc.metadata.tags,
            doc.metadata.category
          ].join(' ').toLowerCase();
          
          return searchableText.includes(normalizedQuery);
        });
      }
      
      if (query.filters?.dateRange) {
        const start = new Date(query.filters.dateRange.start);
        const end = new Date(query.filters.dateRange.end);
        documents = documents.filter(doc => {
          const docDate = new Date(doc.uploadedAt);
          return docDate >= start && docDate <= end;
        });
      }
      
      return documents;
    } catch (error) {
      throw new Error('Error al buscar documentos con filtros');
    }
  }
}