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