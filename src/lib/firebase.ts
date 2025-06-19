
// src/lib/firebase.ts
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// These values are sourced from your .env file
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
// Check if all required config values are present before initializing
let app;
if (
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId
) {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} else {
  console.error(
    'Firebase configuration is missing or incomplete. Please check your .env file and Firebase project settings.'
  );
  // You might want to throw an error here or handle this case appropriately
  // For now, app will be undefined, and subsequent Firebase calls will fail
}

const auth = app ? getAuth(app) : undefined;
const db = app ? getFirestore(app) : undefined;

export { app, auth, db };
