import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Inicializar Firebase Admin (solo una vez)
if (!admin.apps.length) {
  try {
    // Intentar inicializar con variables de entorno o service account
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY 
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      : null;

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('✅ Firebase Admin SDK initialized with service account');
    } else {
      // Inicializar con Application Default Credentials (para desarrollo local)
      admin.initializeApp();
      console.log('✅ Firebase Admin SDK initialized with default credentials');
    }
  } catch (error) {
    console.error('⚠️ Could not initialize Firebase Admin:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, uid } = await request.json();

    if (!email || !uid) {
      return NextResponse.json(
        { success: false, message: 'Email y UID son requeridos' },
        { status: 400 }
      );
    }

    console.log(`🗑️ Intentando eliminar usuario de Authentication: ${email}`);

    // Intentar eliminar con Firebase Admin SDK
    if (admin.apps.length > 0) {
      try {
        await admin.auth().deleteUser(uid);
        console.log('✅ Usuario eliminado de Authentication:', uid);
        
        return NextResponse.json({
          success: true,
          message: 'Usuario eliminado completamente de Authentication',
        });
      } catch (adminError: any) {
        console.error('❌ Error al eliminar con Admin SDK:', adminError);
        
        // Si el error es porque el usuario no existe, considerarlo éxito
        if (adminError.code === 'auth/user-not-found') {
          return NextResponse.json({
            success: true,
            message: 'Usuario no existía en Authentication',
          });
        }
        
        throw adminError;
      }
    }

    // Si Firebase Admin no está configurado, retornar instrucciones
    console.warn('⚠️ Firebase Admin SDK no disponible');
    return NextResponse.json({
      success: false,
      message: 'Firebase Admin SDK no configurado. Elimina manualmente en Firebase Console.',
      instructions: {
        step1: 'Ve a Firebase Console',
        step2: 'Authentication → Users',
        step3: `Busca: ${email}`,
        step4: 'Click en ⋮ → Delete account',
      },
      userInfo: {
        email,
        uid,
      }
    });

  } catch (error) {
    console.error('❌ Error en delete-auth-user:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error al eliminar usuario',
        error: error instanceof Error ? error.message : 'Unknown error',
        instructions: {
          step1: 'Ve a Firebase Console',
          step2: 'Authentication → Users',
          step3: 'Busca el usuario por email',
          step4: 'Click en ⋮ → Delete account',
        }
      },
      { status: 500 }
    );
  }
}
