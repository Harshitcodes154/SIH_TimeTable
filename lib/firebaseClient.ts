// Firebase initialization for the Class Scheduling Platform
// This file initializes Firebase services (Auth, Firestore, Storage, Analytics)
// It prefers environment variables (recommended for production). If env vars are
// not provided it will fall back to the embedded development values below.

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyC4ubRb6v7GFbc8XxP_x65mf3XckLcARcI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "time-ca154.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "time-ca154",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "time-ca154.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "512803277275",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:512803277275:web:fbd35d42e3a253b71d3ffe",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-ZE4SF1XEJQ",
};

// Initialize or reuse existing app instance
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Analytics is only available in the browser and if supported
let analytics = null;
if (typeof window !== "undefined") {
  (async () => {
    try {
      if (await isSupported()) {
        analytics = getAnalytics(app);
      }
    } catch (e) {
      // Ignore analytics initialization failures
      // (for example when running in environments that don't support it)
      console.warn("Firebase analytics not available:", e);
    }
  })();
}

export { app, auth, db, storage, analytics, firebaseConfig };

// Usage notes:
// - Prefer reading configuration from environment variables in production.
// - Example imports elsewhere in the project:
//    import { auth, db } from '@/lib/firebaseClient'
// - Firestore is recommended for structured app data in this migration away from Supabase.
