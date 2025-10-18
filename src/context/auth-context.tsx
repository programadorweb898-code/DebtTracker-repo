"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useCallback } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

interface AuthContextType {
  user: any; // Using `any` for simplicity, but can be typed to Firebase User
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading, userError } = useUser();

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        return await signInWithEmailAndPassword(auth, email, password);
      } catch (error: any) {
        // Firebase provides specific error codes
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          throw new Error('Invalid email or password.');
        }
        throw new Error(error.message || 'An unknown error occurred during login.');
      }
    },
    [auth]
  );

  const register = useCallback(
    async (email: string, password: string) => {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Create a user profile document in Firestore
        const userDocRef = doc(firestore, "users", user.uid);
        const userProfile = {
          uid: user.uid,
          email: user.email,
          createdAt: new Date().toISOString(),
        };
        
        // Use non-blocking write
        setDocumentNonBlocking(userDocRef, userProfile, { merge: true });

        return userCredential;
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          throw new Error('This email address is already in use.');
        }
        throw new Error(error.message || 'An unknown error occurred during registration.');
      }
    },
    [auth, firestore]
  );

  const logout = useCallback(async () => {
    await signOut(auth);
  }, [auth]);

  return (
    <AuthContext.Provider value={{ user, loading: isUserLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
