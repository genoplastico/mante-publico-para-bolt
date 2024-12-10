import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyD-UrtFZSxac5Q0WD7hoMs3Cie5DU80VJE",
  authDomain: "obrasdoc.firebaseapp.com",
  projectId: "obrasdoc",
  storageBucket: "obrasdoc.firebasestorage.app",
  messagingSenderId: "486195482101",
  appId: "1:486195482101:web:60b891ac4d4adf99c864bc",
  measurementId: "G-VJYZZ0XVDK"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);