import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBjPaXcfu4hqlWw6fDRH-QylDAag5HC3vs",
  authDomain: "obrasdoc-dev.firebaseapp.com",
  projectId: "obrasdoc-dev",
  storageBucket: "obrasdoc-dev.firebasestorage.app",
  messagingSenderId: "669636892913",
  appId: "1:669636892913:web:12827b6078f830a62f3150"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);