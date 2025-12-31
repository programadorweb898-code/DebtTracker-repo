"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useCallback } from 'react';
import {useRouter} from "next/navigation"
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

// Las URLs de n8n ahora se manejan desde API routes para evitar problemas de CORS

export const sendPasswordReset = async (auth: Auth, email: string) => {
    try {
      // Limpiar el email de espacios en blanco
      const cleanEmail = email.trim().toLowerCase();
      
      console.log("🔍 Validando email:", cleanEmail);

      // Usando la configuración por defecto de Firebase para el enlace de reseteo
      await sendPasswordResetEmail(auth, cleanEmail);
      
      console.log("✅ Email de Firebase enviado (enlace por defecto).");

      // Llamar a nuestra API route para enviar email de confirmación (desde el servidor)
      try {
        const response = await fetch('/api/password-reset', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: cleanEmail,
          }),
        });

        if (response.ok) {
          console.log("✅ Email de confirmación (n8n) enviado desde el servidor");
        } else {
          console.warn("⚠️ n8n webhook falló, pero el reset de Firebase se envió");
        }
      } catch (n8nError) {
        // No bloqueamos si n8n falla
        console.error('⚠️ Error en n8n (no crítico):', n8nError);
      }
      
    } catch (error: any) {
      console.error("❌ Error completo en sendPasswordReset:", error);
      
      let errorMessage = 'Ocurrió un error desconocido.';
      if (typeof error === 'object' && error !== null) {
        // Los errores de Firebase suelen tener code y message
        if ('code' in error && 'message' in error) {
            errorMessage = `Código: ${error.code}. Mensaje: ${error.message}`;
        } else if ('message' in error) {
          errorMessage = String(error.message);
        } else {
          try {
            // Como último recurso, intentar convertir el error a string
            errorMessage = JSON.stringify(error);
          } catch {
            errorMessage = 'No se pudo procesar el objeto de error.';
          }
        }
      } else if (error) {
        errorMessage = String(error);
      }

      throw new Error(errorMessage);
    }
  };

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router=useRouter();
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        // Primero autenticarse con Firebase Auth
        //const router=useRouter();
        const userCredential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
        const user = userCredential.user;
        
        console.log('✅ Autenticado en Firebase Auth:', user.uid);
        
        // Verificar que el usuario exista en Firestore con un 'get' directo
        const { doc, getDoc } = await import('firebase/firestore');
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          // El usuario no existe en Firestore, cerrar sesión y mostrar error genérico
          console.error('❌ Usuario no encontrado en Firestore');
          await signOut(auth);
          throw new Error('Credenciales incorrectas.');
        }
        
        console.log('✅ Usuario encontrado en Firestore');
        return userCredential;
      } catch (error: any) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          throw new Error('Credenciales incorrectas.');
        }
        // Si el error ya tiene un mensaje personalizado, mantenerlo
        throw new Error(error.message || 'Ocurrió un error desconocido durante el inicio de sesión.');
      }
    },
    [auth, firestore,router]
  );

  const register = useCallback(
    async (email: string, password:string) => {
      let userCredential;
      try {
        const cleanEmail = email.trim().toLowerCase();
        userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        const user = userCredential.user;
        
        console.log('✅ Usuario creado en Authentication:', user.uid);
        
        const userDocRef = doc(firestore, "users", user.uid);
        const userProfile = {
          uid: user.uid,
          email: user.email,
          createdAt: new Date().toISOString(),
          role: 'user', // Rol por defecto
        };
        
        // Función para intentar crear el documento con reintento
        const createUserDocumentWithRetry = async (retries = 1, delay = 500) => {
          try {
            const { setDoc } = await import('firebase/firestore');
            await setDoc(userDocRef, userProfile, { merge: true });
            console.log('✅ Documento de usuario creado en Firestore');
          } catch (error: any) {
            // Si es un error de permisos y aún tenemos reintentos, lo intentamos de nuevo
            if ((error.code === 'permission-denied' || error.message?.includes('permission-denied')) && retries > 0) {
              console.warn(`⚠️ Firestore permission error, retrying in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              await createUserDocumentWithRetry(retries - 1, delay); // Llamada recursiva
            } else {
              // Si no es un error de permisos o no quedan reintentos, lanzamos el error
              throw error;
            }
          }
        };

        await createUserDocumentWithRetry();

        // Enviar notificación a n8n (no crítico, puede fallar)
        try {
          await fetch('/api/user-registration', {
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
          console.log("✅ Notificación de registro enviada");
        } catch (n8nError) {
          console.error('⚠️ Error al notificar a n8n (no crítico):', n8nError);
        }

        // Desloguear al usuario para que no inicie sesión automáticamente
        await signOut(auth);

        return userCredential;
      } catch (error: any) {
        // Si llegó aquí y se creó el usuario en Auth pero falló Firestore,
        // mostrar mensaje específico
        if (userCredential) {
          console.error('❌ Usuario creado en Auth pero falló Firestore');
          throw new Error('Tu cuenta fue creada pero hubo un problema al configurar tu perfil. Por favor, ve a /sync-users para completar el proceso.');
        }
        
        if (error.code === 'auth/email-already-in-use') {
          throw new Error('Esta dirección de correo electrónico ya está en uso.');
        }
        
        if (error.code === 'permission-denied' || error.message?.includes('permission')) {
          throw new Error('Error de permisos al crear tu perfil. Por favor contacta al administrador.');
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
