// src/lib/firebase.ts
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, type Firestore } from 'firebase/firestore';

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
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

auth = getAuth(app);
db = getFirestore(app);

// Firestore helper functions for user customization data
const USER_CUSTOMIZATION_COLLECTION = "Introbird_users";

export async function saveUserCustomization(userId: string, customizationText: string): Promise<void> {
  if (!userId) throw new Error("User ID is required to save customization data.");
  const userDocRef = doc(db, USER_CUSTOMIZATION_COLLECTION, userId);
  await setDoc(userDocRef, { customizationText }, { merge: true }); // merge: true to avoid overwriting other fields if any
}

export async function getUserCustomization(userId: string): Promise<string | null> {
  if (!userId) throw new Error("User ID is required to get customization data.");
  const userDocRef = doc(db, USER_CUSTOMIZATION_COLLECTION, userId);
  const docSnap = await getDoc(userDocRef);
  if (docSnap.exists()) {
    return docSnap.data()?.customizationText || null;
  }
  return null;
}


export { app, auth, db };
