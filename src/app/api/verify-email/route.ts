import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Importar Firebase Admin
    const admin = await import('firebase-admin');
    
    // Verificar si ya está inicializado
    if (!admin.apps.length) {
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      
      if (!serviceAccount) {
        console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY no está configurado');
        return NextResponse.json(
          { error: 'Configuración del servidor incompleta' },
          { status: 500 }
        );
      }

      try {
        const parsedServiceAccount = JSON.parse(serviceAccount);
        admin.initializeApp({
          credential: admin.credential.cert(parsedServiceAccount),
        });
      } catch (parseError) {
        console.error('❌ Error al parsear FIREBASE_SERVICE_ACCOUNT_KEY:', parseError);
        return NextResponse.json(
          { error: 'Error de configuración del servidor' },
          { status: 500 }
        );
      }
    }

    const db = admin.firestore();
    const auth = admin.auth();

    // Verificar primero en Firebase Authentication
    let userInAuth = null;
    try {
      userInAuth = await auth.getUserByEmail(cleanEmail);
      console.log('✅ Email encontrado en Authentication:', userInAuth.uid);
    } catch (authError: any) {
      if (authError.code === 'auth/user-not-found') {
        console.log('❌ Email no encontrado en Authentication');
        return NextResponse.json(
          { exists: false, message: 'Este correo electrónico no está registrado en el sistema.' },
          { status: 404 }
        );
      }
      throw authError;
    }

    // Verificar también en Firestore (doble validación)
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', cleanEmail).limit(1).get();

    if (snapshot.empty) {
      console.log('⚠️ Email en Auth pero no en Firestore - posible desincronización');
      // Aún así, permitir el reset porque existe en Authentication
    }

    return NextResponse.json(
      { exists: true, message: 'Email encontrado' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ Error en verificación de email:', error);
    return NextResponse.json(
      { error: error.message || 'Error al verificar el email' },
      { status: 500 }
    );
  }
}
