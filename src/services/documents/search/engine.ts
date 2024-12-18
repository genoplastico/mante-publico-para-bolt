import { collection, query, where, getDocs, QueryConstraint, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { AuthService } from '../../auth';
import { DOCUMENT_TYPES } from '../constants';
import { SEARCH_CONFIG } from './constants';
import { getWorkersMap } from './workers';
import type { Document, DocumentType } from '../../../types';
import type { SearchOptions, SearchResult } from './types';

export class SearchEngine {
  static async search(options: SearchOptions): Promise<SearchResult> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user || !user.id) {
        throw new Error('Usuario no autenticado');
      }

      // Construir constraints base
      const constraints: QueryConstraint[] = [
        where('createdBy', '==', user.id),
        where('deleted', '==', false)
      ];

      // Aplicar filtros de tipo
      if (options.filters?.type?.length) {
        constraints.push(where('type', 'in', options.filters.type));
      }

      // Aplicar filtros de estado
      if (options.filters?.status?.length) {
        constraints.push(where('status', 'in', options.filters.status));
      }

      // Ejecutar query
      const q = query(collection(db, 'documents'), ...constraints);
      const snapshot = await getDocs(q);

      // Obtener mapa de trabajadores solo si hay resultados
      let workersMap = new Map();
      if (!snapshot.empty) {
        try {
          workersMap = await getWorkersMap();
        } catch (error) {
          console.warn('Error loading workers map:', error);
        }
      }

      // Transformar resultados
      let documents = snapshot.docs.map(doc => { 
        const data = doc.data();
        const worker = data.workerId ? workersMap.get(data.workerId) : null;
        const documentType = DOCUMENT_TYPES[data.type as DocumentType] || data.type;

        return {
          id: doc.id,
          ...data,
          documentType,
          workerName: worker?.name || 'Trabajador no encontrado'
        } as Document;
      });

      // Aplicar búsqueda por texto
      if (options.text) {
        documents = this.applyTextFilter(documents, options.text);
      }

      // Ordenar resultados
      documents = this.sortResults(documents, options.sort);

      return {
        total: documents.length,
        items: documents,
        metadata: {
          filters: options.filters || {},
          appliedText: options.text || null
        }
      };
    } catch (error) {
      console.error('Error en búsqueda:', error);
      throw error instanceof Error ? error : new Error('Error al realizar la búsqueda');
    }
  }

  static async deleteDocument(documentId: string): Promise<void> {
    const docRef = doc(db, 'documents', documentId);
    await updateDoc(docRef, {
      deleted: true,
      deletedAt: new Date().toISOString()
    });
  }

  private static applyTextFilter(documents: Document[], text: string): Document[] {
    const searchText = text.toLowerCase();
    return documents.filter(doc => {
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

  private static applyDateFilter(
    documents: Document[], 
    dateRange: { start?: string; end?: string }
  ): Document[] {
    return documents.filter(doc => {
      const docDate = new Date(doc.uploadedAt);
      if (dateRange.start && docDate < new Date(dateRange.start)) return false;
      if (dateRange.end && docDate > new Date(dateRange.end)) return false;
      return true;
    });
  }

  private static sortResults(
    documents: Document[], 
    sort?: { field: string; order: 'asc' | 'desc' }
  ): Document[] {
    if (!sort) return documents;

    return [...documents].sort((a, b) => {
      const aValue = this.getFieldValue(a, sort.field);
      const bValue = this.getFieldValue(b, sort.field);
      
      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sort.order === 'asc' ? comparison : -comparison;
    });
  }

  private static getFieldValue(doc: Document, field: string): any {
    const fields = field.split('.');
    return fields.reduce((obj, key) => obj?.[key], doc);
  }
}