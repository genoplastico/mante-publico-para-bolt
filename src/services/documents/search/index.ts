import {
  collection,
  query,
  getDocs,
  where,
  orderBy,
  limit,
  startAfter,
  QuerySnapshot,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { AuthService } from '../../auth';
import { SEARCH_CONFIG } from './constants';
import { buildSearchQuery, normalizeSearchText, calculateRelevanceScore } from './utils';
import type { Document } from '../../../types';
import type { SearchOptions } from './types';

export class DocumentSearchService {
  static async searchDocuments(
    searchText: string = '',
    options: SearchOptions = {}
  ): Promise<{
    documents: Document[];
    hasMore: boolean;
    lastDoc?: DocumentSnapshot;
  }> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Aplicar filtros iniciales
      const constraints: QueryConstraint[] = [];

      // Aplicar restricciones de usuario
      if (user.role === 'secondary' && user.projectIds?.length) {
        constraints.push(where('projectId', 'in', user.projectIds));
      }

      // Aplicar filtros de tipo de documento
      if (options.filters?.type?.length) {
        constraints.push(where('type', 'in', options.filters.type));
      }

      // Aplicar filtros de estado
      if (options.filters?.status?.length) {
        constraints.push(where('status', 'in', options.filters.status));
      }

      // Aplicar filtros de fecha
      if (options.filters?.dateRange) {
        if (options.filters.dateRange.start) {
          constraints.push(where('uploadedAt', '>=', options.filters.dateRange.start));
        }
        if (options.filters.dateRange.end) {
          constraints.push(where('uploadedAt', '<=', options.filters.dateRange.end));
        }
      }

      // Construir query final
      const finalQuery = query(collection(db, 'documents'), ...constraints);

      // Ejecutar búsqueda
      const snapshot = await getDocs(finalQuery);
      
      // Procesar resultados
      let documents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Document));

      // Aplicar búsqueda de texto si existe
      if (searchText) {
        const normalizedSearch = normalizeSearchText(searchText);
        documents = documents
          .filter(doc => this.documentMatchesSearch(doc, normalizedSearch))
          .sort((a, b) => 
            calculateRelevanceScore(b, searchText) - calculateRelevanceScore(a, searchText)
          );
      }

      // Determinar si hay más resultados
      const hasMore = documents.length === (options.pagination?.pageSize || SEARCH_CONFIG.PAGE_SIZE);

      return {
        documents,
        hasMore,
        lastDoc: snapshot.docs[snapshot.docs.length - 1]
      };
    } catch (error) {
      console.error('Error searching documents:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Error al buscar documentos');
    }
  }

  private static documentMatchesSearch(document: Document, normalizedSearch: string): boolean {
    // Buscar en campos indexados
    return SEARCH_CONFIG.SEARCHABLE_FIELDS.some(field => {
      const value = this.getFieldValue(document, field);
      if (Array.isArray(value)) {
        return value.some(v => 
          normalizeSearchText(String(v)).includes(normalizedSearch)
        );
      }
      return normalizeSearchText(String(value || '')).includes(normalizedSearch);
    });
  }

  private static getFieldValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  }
}

export type { SearchOptions, SearchFilters, SortOption, PaginationOptions } from './types';
export { SEARCH_CONFIG } from './constants';