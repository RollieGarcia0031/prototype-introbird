// src/lib/firebase.ts
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// IMPORTANT:
// For production or any real deployment, these credentials should be moved to
// environment variables (e.g., .env.local) prefixed with NEXT_PUBLIC_
// Example: NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
const firebaseConfig = {
  apiKey: "AIzaSyDlo69Mwe9GplwNQZoWjo12WhBYs8LAxXQ",
  authDomain: "charot-af5c5.firebaseapp.com",
  projectId: "charot-af5c5",
  storageBucket: "charot-af5c5.firebasestorage.app",
  messagingSenderId: "791506204744",
  appId: "1:791506204744:web:f97747ff1d9d1dac46407d"
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
        projectId: process.env.FIREBASE_PROJECT_ID,
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
