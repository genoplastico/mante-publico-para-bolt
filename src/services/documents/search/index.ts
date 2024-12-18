import { collection, query, getDocs, where, QueryConstraint } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { AuthService } from '../../auth';
import { DOCUMENT_TYPES } from '../constants';
import { getWorkersMap } from './workers';
import type { Document, DocumentType } from '../../../types';
import type { SearchFilters } from './types';

interface SearchQuery {
  text?: string;
  filters?: SearchFilters;
}

export class DocumentSearchService {
  static async searchDocuments(searchQuery: SearchQuery = {}): Promise<Document[]> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Construir constraints base
      const constraints: QueryConstraint[] = [
        where('createdBy', '==', user.id)
      ];

      // Aplicar filtros de tipo
      if (searchQuery.filters?.type?.length) {
        constraints.push(where('type', 'in', searchQuery.filters.type));
      }

      // Aplicar filtros de estado
      if (searchQuery.filters?.status?.length) {
        constraints.push(where('status', 'in', searchQuery.filters.status));
      }

      // Obtener mapa de trabajadores
      const workersMap = await getWorkersMap();

      // Ejecutar búsqueda
      const q = query(collection(db, 'documents'), ...constraints);
      const snapshot = await getDocs(q);
      
      let documents = snapshot.docs.map(doc => {
        const data = doc.data();
        const documentType = DOCUMENT_TYPES[data.type as DocumentType];
        const workerName = data.workerId ? workersMap.get(data.workerId)?.name : 'Trabajador no encontrado';

        return {
          id: doc.id,
          ...data,
          documentType,
          workerName
        } as Document;
      });

      // Aplicar filtro de texto si existe
      if (searchQuery.text) {
        const searchText = searchQuery.text.toLowerCase();
        documents = documents.filter(doc => {
          const searchableText = [
            doc.documentType,
            doc.workerName,
            doc.metadata?.description,
            ...(doc.metadata?.keywords || []),
            ...(doc.metadata?.tags || [])
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

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
}