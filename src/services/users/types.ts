import { DocumentReference } from 'firebase/firestore';

export interface BatchOperation {
  ref: DocumentReference;
  type: 'update' | 'delete';
  data?: any;
}