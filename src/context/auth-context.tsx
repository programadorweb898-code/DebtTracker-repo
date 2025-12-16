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
      // Limpiar el email de espacios en blanco
      const cleanEmail = email.trim().toLowerCase();
      
      console.log("🔍 Validando email:", cleanEmail);

      // Intentar enviar el email directamente
      // Firebase Auth NO expone si el usuario existe por razones de seguridad
      // Pero sí enviará el email si el usuario existe
      await sendPasswordResetEmail(auth, cleanEmail);
      
      console.log("✅ Email de Firebase enviado");

      // Llamar al webhook de n8n para enviar email de confirmación
      try {
        const response = await fetch(N8N_PASSWORD_RESET_WEBHOOK, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: cleanEmail,
            timestamp: new Date().toISOString(),
          }),
        });

        if (response.ok) {
          console.log("✅ Email de confirmación (n8n) enviado");
        } else {
          console.warn("⚠️ n8n webhook falló, pero el reset de Firebase se envió");
        }
      } catch (n8nError) {
        // No bloqueamos si n8n falla
        console.error('⚠️ Error en n8n (no crítico):', n8nError);
      }
      
    } catch (error: any) {
      console.error("❌ Error en sendPasswordReset:", error);
      
      // Errores comunes de Firebase
      if (error.code === 'auth/invalid-email') {
        throw new Error('El formato del correo electrónico no es válido.');
      }
      
      if (error.code === 'auth/user-not-found') {
        throw new Error('No se encontró ninguna cuenta registrada con este correo electrónico.');
      }
      
      if (error.code === 'auth/too-many-requests') {
        throw new Error('Demasiados intentos. Por favor, espera unos minutos e intenta de nuevo.');
      }

      // Otros errores
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
        return await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
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
        const cleanEmail = email.trim().toLowerCase();
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
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
