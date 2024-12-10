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
import type { Document, DocumentType, DocumentSearchQuery } from '../types';

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
      // Validar el archivo
      const validationError = StorageService.validateFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      // Generate a unique path for the file
      const filePath = StorageService.generateFilePath(workerId, file.name);
      
      // Upload file to Firebase Storage
      const url = await StorageService.uploadFile(file, filePath, { disableScaling });

      const metadata = DOCUMENT_METADATA[type];
    
      const documentData: Omit<Document, 'id'> = {
        type,
        name: file.name,
        url,
        status: 'valid',
        uploadedAt: new Date().toISOString(),
        expiryDate,
        workerId,
        metadata: {
          description: metadata.description,
          keywords: metadata.keywords,
          category: metadata.category,
          lastModified: new Date().toISOString(),
          modifiedBy: 'system',
          version: 1,
          tags: [metadata.category],
        },
        auditLog: {
          createdAt: new Date().toISOString(),
          createdBy: 'system',
          actions: [{
            type: 'create',
            timestamp: new Date().toISOString(),
            userId: 'system',
            details: `Documento ${type} creado para el trabajador ${workerId}`
          }]
        }
      };

      const docRef = await addDoc(collection(db, 'documents'), documentData);
      return { id: docRef.id, ...documentData };
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
    const expiryDate = new Date(document.expiryDate);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    let status: Document['status'] = 'valid';
    if (daysUntilExpiry <= 0) {
      status = 'expired';
    } else if (daysUntilExpiry <= 7) {
      status = 'expiring_soon';
    }

    return { ...document, status };
  }

  static async deleteDocument(documentId: string): Promise<void> {
    try {
      const docRef = doc(db, 'documents', documentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const document = docSnap.data() as Document;
        
        // Extract path from URL and delete file
        const pathMatch = document.url.match(/documents%2F.+\?/);
        if (pathMatch) {
          const path = decodeURIComponent(pathMatch[0].replace('?', ''));
          await StorageService.deleteFile(path);
        }
        
        // Eliminar documento de Firestore
        await deleteDoc(docRef);
      }
    } catch (error) {
      throw new Error('Error al eliminar el documento');
    }
  }

  static async searchDocuments(query: string): Promise<Document[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'documents'));
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

  static async searchDocumentsWithFilters(query: DocumentSearchQuery): Promise<Document[]> {
    try {
      let q = query(collection(db, 'documents'));
      
      // Aplicar filtros
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
      
      // Filtros adicionales que no se pueden hacer directamente en la consulta
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