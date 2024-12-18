export const STORAGE_CONFIG = {
  // Tamaño máximo de archivo (20MB)
  maxFileSize: 20 * 1024 * 1024,
  
  // Configuración por defecto para compresión de imágenes
  defaultMaxSizeMB: 5,
  defaultMaxWidthOrHeight: 2048,
  
  // Tipos de archivo permitidos
  allowedTypes: [
    'application/pdf',
    'image/jpeg',
    'image/png'
  ]
} as const;