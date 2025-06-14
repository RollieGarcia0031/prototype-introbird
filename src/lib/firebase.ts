// src/lib/firebase.ts
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, type Firestore } from 'firebase/firestore';

// Ensure your .env.local file has these variables defined.
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
let authInstance: Auth; // Renamed to avoid conflict with auth export
let db: Firestore;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

authInstance = getAuth(app);
db = getFirestore(app);

// Firestore helper functions for user customization data
const USER_CUSTOMIZATION_COLLECTION = "Introbird_users";

export interface UserCustomizationData {
  customizationText?: string;
  resumeSummary?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  address?: string;
  updatedAt?: Date;
}

export async function saveUserCustomization(userId: string, data: Partial<UserCustomizationData>): Promise<void> {
  if (!userId) throw new Error("User ID is required to save customization data.");
  const userDocRef = doc(db, USER_CUSTOMIZATION_COLLECTION, userId);
  const dataToSave = { 
    ...data,
    updatedAt: new Date()
   };
  await setDoc(userDocRef, dataToSave, { merge: true });
}

export async function getUserCustomization(userId: string): Promise<UserCustomizationData | null> {
  if (!userId) throw new Error("User ID is required to get customization data.");
  const userDocRef = doc(db, USER_CUSTOMIZATION_COLLECTION, userId);
  const docSnap = await getDoc(userDocRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      customizationText: data?.customizationText || '',
      resumeSummary: data?.resumeSummary || '',
      firstName: data?.firstName || '',
      lastName: data?.lastName || '',
      email: data?.email || '',
      address: data?.address || '',
      updatedAt: data?.updatedAt?.toDate() || null,
    };
  }
  return null;
}

export async function updateUserProfileName(authService: Auth, newName: string): Promise<void> {
  if (!authService.currentUser) {
    throw new Error("User not authenticated to update profile name.");
  }
  await updateProfile(authService.currentUser, { displayName: newName });
}


export { app, authInstance as auth, db }; // Export renamed authInstance as auth
