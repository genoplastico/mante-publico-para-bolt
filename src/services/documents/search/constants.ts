export const SEARCH_CONFIG = {
  // Campos indexados para búsqueda
  SEARCHABLE_FIELDS: [
    'name',
    'type',
    'metadata.description',
    'metadata.keywords',
    'metadata.tags',
    'metadata.category'
  ] as const,

  // Límites de paginación
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // Opciones de ordenamiento
  SORT_OPTIONS: {
    CREATED_DESC: { field: 'uploadedAt', direction: 'desc' },
    CREATED_ASC: { field: 'uploadedAt', direction: 'asc' },
    EXPIRY_DESC: { field: 'expiryDate', direction: 'desc' },
    EXPIRY_ASC: { field: 'expiryDate', direction: 'asc' }
  } as const
} as const;