import { NextRequest, NextResponse } from 'next/server';

// URL del webhook de n8n para registro de usuario desde variable de entorno
const N8N_REGISTRATION_WEBHOOK = process.env.NEXT_PUBLIC_WEBHOOK_URL || 'https://render-repo-36pu.onrender.com/webhook/32e8ee1f-bcff-4c8d-8c64-1dca826b1d5c';

// Timeout de 10 segundos
const WEBHOOK_TIMEOUT = 10000;

// Helper para fetch con timeout
async function fetchWithTimeout(url: string, options: RequestInit, timeout: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, email, createdAt } = body;

    if (!uid || !email) {
      return NextResponse.json(
        { error: 'uid y email son requeridos' },
        { status: 400 }
      );
    }

    // Intentar llamar al webhook con timeout
    try {
      const response = await fetchWithTimeout(
        N8N_REGISTRATION_WEBHOOK,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            destinatario: email, // Email del usuario que se registró
            uid,
            createdAt: createdAt || new Date().toISOString(),
          }),
        },
        WEBHOOK_TIMEOUT
      );

      if (!response.ok) {
        console.warn('⚠️ n8n registration webhook respondió con error:', response.status, response.statusText);
      } else {
        console.log('✅ n8n registration webhook ejecutado correctamente');
      }
    } catch (error) {
      // Si falla por timeout o cualquier error, no es crítico
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('⏱️ n8n registration webhook timeout (probablemente Render estaba dormido) - no crítico');
      } else {
        console.warn('⚠️ n8n registration webhook falló:', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    // SIEMPRE devolvemos éxito porque el registro ya se completó
    return NextResponse.json({ 
      success: true, 
      message: 'User registration notification sent successfully' 
    });

  } catch (error) {
    console.error('❌ Error en user-registration API route:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
