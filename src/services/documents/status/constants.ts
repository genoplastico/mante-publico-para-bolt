export const DOCUMENT_STATUS_CONFIG = {
  // Umbrales de vencimiento en días
  WARNING_THRESHOLD: 15,  // Documentos próximos a vencer
  CRITICAL_THRESHOLD: 7,  // Documentos en estado crítico
  
  // Estados posibles de documentos
  STATUS: {
    VALID: 'valid',
    EXPIRED: 'expired',
    EXPIRING_SOON: 'expiring_soon'
  } as const
} as const;