import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'lowstudy-9b369.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'lowstudy-9b369',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'lowstudy-9b369.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '639684084689',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:639684084689:web:950d0aa58e07859696f0',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-YK18HY1X8S',
};

/**
 * Checks whether client-side Firebase API key is provided in environment variables.
 */
export const isFirebaseConfigured = () => {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY.trim() !== ''
  );
};

let app = null;
let auth = null;
let googleProvider = null;

// Safe singleton Firebase App retrieval
export function getFirebaseApp() {
  if (getApps().length > 0) {
    return getApp();
  }
  if (isFirebaseConfigured()) {
    return initializeApp(firebaseConfig);
  }
  return null;
}

// Safe singleton Firebase Auth retrieval
export function getFirebaseAuth() {
  if (!auth) {
    const firebaseApp = getFirebaseApp();
    if (!firebaseApp) {
      throw new Error(
        'Firebase configuration is pending. Please set NEXT_PUBLIC_FIREBASE_API_KEY in your environment variables.'
      );
    }
    auth = getAuth(firebaseApp);
  }
  return auth;
}

// Safe singleton Google Auth Provider
export function getGoogleProvider() {
  if (!googleProvider) {
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: 'select_account',
    });
  }
  return googleProvider;
}

// Initial client-side initialization if key exists
if (typeof window !== 'undefined' && isFirebaseConfigured()) {
  try {
    app = getFirebaseApp();
    if (app) {
      auth = getAuth(app);
      googleProvider = getGoogleProvider();
    }
  } catch (error) {
    console.warn('[Firebase] Client initialization notice:', error?.message);
  }
}

export { app, auth, googleProvider };
