"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useCallback } from 'react';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
} from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useUser } from '@/firebase/provider';

interface AuthContextType {
  user: any; 
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// URLs de webhooks de n8n en Render
// Workflow ID: CxPrukFB2jbwjSlV
const N8N_PASSWORD_RESET_WEBHOOK = 'https://render-repo-36pu.onrender.com/webhook/password-reset';

// Workflow ID: 6N9ae63qlJmKgxz7
const N8N_REGISTRATION_WEBHOOK = 'https://render-repo-36pu.onrender.com/webhook/user-registration';

export const sendPasswordReset = async (auth: Auth, email: string) => {
    try {
      // Primero verificamos si el email existe en Firebase Auth
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      
      if (signInMethods.length === 0) {
        throw new Error('No se encontró ninguna cuenta registrada con este correo electrónico.');
      }
      
      // Llamar al webhook de n8n para validar y enviar email
      const response = await fetch(N8N_PASSWORD_RESET_WEBHOOK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Error al procesar la solicitud de recuperación.');
      }

      // Si n8n responde correctamente, enviamos el email de Firebase
      await sendPasswordResetEmail(auth, email);
      
    } catch (error: any) {
      // Si ya lanzamos un error personalizado, lo propagamos
      if (error.message.includes('No se encontró ninguna cuenta')) {
        throw error;
      }
      
      // Manejo de otros errores de Firebase
      if (error.code === 'auth/invalid-email') {
        throw new Error('El formato del correo electrónico no es válido.');
      }
      
      throw new Error(error.message || 'Ocurrió un error al enviar el correo de recuperación.');
    }
  };

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
        
        setDocumentNonBlocking(userDocRef, userProfile, { merge: true });

        // Enviar notificación a n8n sobre el nuevo registro (no bloqueante)
        try {
          await fetch(N8N_REGISTRATION_WEBHOOK, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              uid: user.uid,
              email: user.email,
              createdAt: userProfile.createdAt,
            }),
          });
        } catch (n8nError) {
          // No bloqueamos el registro si n8n falla, solo logueamos
          console.error('Error al notificar a n8n:', n8nError);
        }

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
    <AuthContext.Provider value={{ user, loading: isUserLoading, login, register, logout, sendPasswordReset: (email) => sendPasswordReset(auth, email) }}>
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
