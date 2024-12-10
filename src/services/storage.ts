import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';
import { AuthService } from './auth';

export class StorageService {
  static async uploadFile(file: File, path: string): Promise<string> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user || !user.id) {
        throw new Error('Debe iniciar sesión para realizar esta acción');
      }

      const storageRef = ref(storage, path);
      
      try {
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        return url;
      } catch (uploadError: any) {
        if (uploadError.code === 'storage/unauthorized') {
          throw new Error('No tiene permisos para subir archivos. Verifique su rol de usuario.');
        }
        console.error('Error uploading to storage:', uploadError);
        throw new Error('Error al subir el archivo');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  static async deleteFile(path: string): Promise<void> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user || user.role !== 'super') {
        throw new Error('No tiene permisos para eliminar archivos');
      }

      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('No se pudo eliminar el archivo');
    }
  }

  static generateFilePath(workerId: string, fileName: string): string {
    const timestamp = Date.now();
    // Sanitizar el nombre del archivo y mantener la extensión
    const extension = fileName.split('.').pop();
    const baseName = fileName.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_');
    const sanitizedFileName = `${baseName}.${extension}`;
    return `documents/${workerId}/${timestamp}_${sanitizedFileName}`;
  }

  static validateFile(file: File): string | null {
    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return 'El archivo no debe superar los 5MB';
    }

    // Validar tipo de archivo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return 'Solo se permiten archivos PDF, JPG o PNG';
    }

    return null;
  }
}