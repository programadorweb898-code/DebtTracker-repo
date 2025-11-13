"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useCallback } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase'; // Eliminado useUser ya que no se usa directamente aquí
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useUser } from '@/firebase/provider'; // Importación correcta para useUser

interface AuthContextType {
  user: any; // Usar `any` por simplicidad, pero puede ser tipado a Firebase User
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        return await signInWithEmailAndPassword(auth, email, password);
      } catch (error: any) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          throw new Error('Email o contraseña inválidos.');
        }
        throw new Error(error.message || 'Ocurrió un error desconocido durante el inicio de sesión.');
      }
    },
    [auth]
  );

  const register = useCallback(
    async (email: string, password: string) => {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        const userDocRef = doc(firestore, "users", user.uid);
        const userProfile = {
          uid: user.uid,
          email: user.email,
          createdAt: new Date().toISOString(),
        };
        
        // Se utiliza la escritura no bloqueante para mayor robustez
        setDocumentNonBlocking(userDocRef, userProfile, { merge: true });

        return userCredential;
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          throw new Error('Esta dirección de correo electrónico ya está en uso.');
        }
        throw new Error(error.message || 'Ocurrió un error desconocido durante el registro.');
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
    throw new Error('useAuthContext debe ser usado dentro de un AuthProvider');
  }
  return context;
};
