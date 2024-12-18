import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import type { DeleteUserResult } from '../types';

export const deleteUserAuth = functions.https.onCall(async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Debe estar autenticado para realizar esta acción'
    );
  }

  // Verificar permisos de admin
  const callerDoc = await admin.firestore().collection('saas_admins').doc(context.auth.uid).get();
  if (!callerDoc.exists) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'No tiene permisos para realizar esta acción'
    );
  }

  const { userId } = data;
  if (!userId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Se requiere el ID del usuario'
    );
  }

  try {
    // Verificar si el usuario existe en Auth
    const userRecord = await admin.auth().getUser(userId);
    if (!userRecord) {
      return {
        success: true,
        message: 'Usuario no encontrado en autenticación',
        authDeleted: false
      } as DeleteUserResult;
    }

    await admin.auth().deleteUser(userId);
    return {
      success: true,
      message: 'Usuario eliminado correctamente',
      authDeleted: true
    } as DeleteUserResult;
  } catch (error) {
    console.error('Error deleting user:', error);
    
    throw new functions.https.HttpsError(
      'internal',
      'Error al eliminar el usuario de autenticación'
    );
  }
});