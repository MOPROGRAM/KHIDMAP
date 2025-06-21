// src/lib/firebase.ts
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// These values are sourced from your .env file
const firebaseConfigValues = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined = undefined;
let auth: Auth | undefined = undefined;
let db: Firestore | undefined = undefined;
let storage: FirebaseStorage | undefined = undefined;

if (
  firebaseConfigValues.apiKey &&
  firebaseConfigValues.authDomain &&
  firebaseConfigValues.projectId
) {
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfigValues);
    } catch (e) {
      console.error("Error initializing Firebase app:", e);
    }
  } else {
    app = getApp();
  }

  if (app) {
    try {
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);
    } catch (e) {
      console.error("Error getting Firebase auth, firestore, or storage instance:", e);
      // auth, db, and storage will remain undefined
    }
  } else {
     console.error(
      'CRITICAL: Firebase app could not be initialized. Firebase services will not be available.'
    );
  }

} else {
  console.error(
    'CRITICAL: Firebase configuration is missing or incomplete (apiKey, authDomain, or projectId). Firebase services will not be available. Please check your environment variables.'
  );
  // app, auth, db, and storage will remain undefined
}

export { app, auth, db, storage };
