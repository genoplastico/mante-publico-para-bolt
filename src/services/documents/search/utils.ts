import { where, QueryConstraint } from 'firebase/firestore';
import { DOCUMENT_TYPES } from '../constants';
import type { SearchOptions } from './types';
import type { Document } from '../../../types';

export function buildSearchQuery(options: SearchOptions, userId: string): QueryConstraint[] {
  const constraints: QueryConstraint[] = [
    where('createdBy', '==', userId)
  ];

  // Aplicar filtros de tipo
  if (options.filters?.type?.length) {
    constraints.push(where('type', 'in', options.filters.type));
  }

  // Aplicar filtros de estado
  if (options.filters?.status?.length) {
    constraints.push(where('status', 'in', options.filters.status));
  }

  return constraints;
}

export function enrichSearchResults(documents: Document[], options: SearchOptions): Document[] {
  let results = documents;

  // Aplicar filtro de texto si existe
  if (options.text) {
    const searchText = options.text.toLowerCase();
    results = results.filter(doc => {
      const searchableText = [
        doc.documentType, // Usar el tipo de documento formateado
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

  // Aplicar filtro de fecha si existe
  if (options.filters?.dateRange) {
    const { start, end } = options.filters.dateRange;
    const startDate = start ? new Date(start) : null;
    const endDate = end ? new Date(end) : null;

    results = results.filter(doc => {
      const docDate = new Date(doc.uploadedAt);
      if (startDate && docDate < startDate) return false;
      if (endDate && docDate > endDate) return false;
      return true;
    });
  }

  return results;
}