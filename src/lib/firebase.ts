// src/lib/firebase.ts
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Ensure your .env.local file has these variables defined.
// Example .env.local:
// NEXT_PUBLIC_FIREBASE_API_KEY="your_api_key"
// NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_auth_domain"
// NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project_id"
// NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_storage_bucket"
// NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_messaging_sender_id"
// NEXT_PUBLIC_FIREBASE_APP_ID="your_app_id"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app); // Firestore instance, can be used later for saving user data

export { app, auth, db };

// For server-side Firebase (e.g., using Firebase Admin SDK in server actions or API routes):
/*
import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID, // Note: Server-side env vars don't need NEXT_PUBLIC_
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      // databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com` // if using Realtime Database
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

const adminDb = admin.firestore();
// const adminAuth = admin.auth();

export { adminDb, adminAuth };
*/
