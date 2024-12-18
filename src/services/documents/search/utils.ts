import { query, where, orderBy, limit, startAfter, QueryConstraint } from 'firebase/firestore';
import { SEARCH_CONFIG } from './constants';
import type { SearchOptions, SearchFilters } from './types';

export function buildSearchQuery(baseQuery: any, options: SearchOptions): QueryConstraint[] {
  const constraints: QueryConstraint[] = [];

  // Aplicar filtros
  if (options.filters) {
    const filterConstraints = buildFilterConstraints(options.filters);
    constraints.push(...filterConstraints);
  }

  // Aplicar ordenamiento
  if (options.sort) {
    constraints.push(orderBy(options.sort.field, options.sort.direction));
  } else {
    // Ordenamiento por defecto
    constraints.push(orderBy('uploadedAt', 'desc'));
  }

  // Aplicar paginación
  if (options.pagination) {
    const pageSize = Math.min(
      options.pagination.pageSize || SEARCH_CONFIG.PAGE_SIZE,
      SEARCH_CONFIG.MAX_PAGE_SIZE
    );
    constraints.push(limit(pageSize));
  }

  return constraints;
}

function buildFilterConstraints(filters: SearchFilters): QueryConstraint[] {
  const constraints: QueryConstraint[] = [];

  if (filters.type?.length) {
    constraints.push(where('type', 'in', filters.type));
  }

  if (filters.status?.length) {
    constraints.push(where('status', 'in', filters.status));
  }

  if (filters.dateRange) {
    if (filters.dateRange.start) {
      constraints.push(where('uploadedAt', '>=', filters.dateRange.start));
    }
    if (filters.dateRange.end) {
      constraints.push(where('uploadedAt', '<=', filters.dateRange.end));
    }
  }

  if (filters.metadata?.category) {
    constraints.push(where('metadata.category', '==', filters.metadata.category));
  }

  if (filters.metadata?.tags?.length) {
    constraints.push(where('metadata.tags', 'array-contains-any', filters.metadata.tags));
  }

  return constraints;
}

export function normalizeSearchText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function calculateRelevanceScore(document: any, searchText: string): number {
  let score = 0;
  const normalizedSearch = normalizeSearchText(searchText);

  // Puntuación por coincidencia exacta en nombre
  if (normalizeSearchText(document.name).includes(normalizedSearch)) {
    score += 10;
  }

  // Puntuación por coincidencia en palabras clave
  if (document.metadata?.keywords) {
    const matchingKeywords = document.metadata.keywords.filter(
      (keyword: string) => normalizeSearchText(keyword).includes(normalizedSearch)
    );
    score += matchingKeywords.length * 5;
  }

  // Puntuación por coincidencia en descripción
  if (document.metadata?.description) {
    if (normalizeSearchText(document.metadata.description).includes(normalizedSearch)) {
      score += 3;
    }
  }

  return score;
}