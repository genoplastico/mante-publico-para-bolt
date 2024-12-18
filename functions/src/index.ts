import * as admin from 'firebase-admin';
import { deleteUserAuth } from './auth/deleteUser';

admin.initializeApp();

export { deleteUserAuth };