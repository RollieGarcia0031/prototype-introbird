// src/contexts/AuthContext.tsx
"use client";

import type { FC, ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  Auth,
  User,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth as firebaseAuth, updateUserProfileName as fbUpdateUserProfileName } from '@/lib/firebase'; 

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<User | null>;
  logIn: (email: string, password: string) => Promise<User | null>;
  logOut: () => Promise<void>;
  updateUserDisplayName: (newName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string): Promise<User | null> => {
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    return userCredential.user;
  };

  const logIn = async (email: string, password: string): Promise<User | null> => {
    const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
    return userCredential.user;
  };

  const logOut = async () => {
    await firebaseSignOut(firebaseAuth);
  };

  const updateUserDisplayName = async (newName: string): Promise<void> => {
    if (!user) {
      throw new Error("User not authenticated.");
    }
    await fbUpdateUserProfileName(firebaseAuth, newName);
    // Manually update local user state for immediate UI reflection
    // Firebase Auth might take a moment to propagate this change via onAuthStateChanged
    setUser(prevUser => {
      if (prevUser) {
        // Create a new object for the user to ensure React detects the change
        const updatedUser = { ...prevUser, displayName: newName } as User;
        return updatedUser;
      }
      return null;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, logIn, logOut, updateUserDisplayName }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
