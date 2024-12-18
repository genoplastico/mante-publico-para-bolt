export function getStorageErrorMessage(error: any): string {
  if (!error) return 'Error desconocido';

  // Errores de red
  if (!navigator.onLine) {
    return 'No hay conexión a internet. Por favor, intente más tarde.';
  }

  // Errores de Firebase Storage
  if (error.code) {
    switch (error.code) {
      case 'storage/unauthorized':
        return 'No tiene permisos para realizar esta acción';
      case 'storage/canceled':
        return 'Operación cancelada';
      case 'storage/invalid-argument':
        return 'Archivo inválido';
      case 'storage/no-default-bucket':
        return 'Error de configuración del almacenamiento';
      case 'storage/cannot-slice-blob':
        return 'Error al procesar el archivo';
      case 'storage/server-file-wrong-size':
        return 'Error en la transferencia del archivo';
      default:
        return `Error: ${error.message || error.code}`;
    }
  }

  // Error genérico
  return error.message || 'Error al procesar el archivo';
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    switch (error.message) {
      case 'ERR_NOT_AUTHENTICATED':
        return 'Debe iniciar sesión para acceder a esta función';
      case 'ERR_PERMISSION_DENIED':
        return 'No tiene permisos para realizar esta acción';
      case 'ERR_DOCUMENT_NOT_FOUND':
        return 'El documento no fue encontrado';
      case 'ERR_FETCH_DOCUMENTS':
        return 'Error al cargar los documentos';
      case 'ERR_DELETE_DOCUMENT':
        return 'Error al eliminar el documento';
      case 'ERR_GET_STATS':
        return 'Error al obtener estadísticas';
      default:
        return error.message;
    }
  }
  return 'Error inesperado';
}