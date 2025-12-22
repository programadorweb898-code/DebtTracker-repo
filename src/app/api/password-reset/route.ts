import { NextRequest, NextResponse } from 'next/server';

// URL del webhook de n8n
const N8N_PASSWORD_RESET_WEBHOOK = 'https://render-repo-36pu.onrender.com/webhook/a449f9ba-cbbc-499b-b512-db936a85696a';

// Timeout de 10 segundos (suficiente para servicio despierto, evita esperas largas)
const WEBHOOK_TIMEOUT = 10000; // 10 segundos

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
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    // Intentar llamar al webhook con timeout
    try {
      const response = await fetchWithTimeout(
        N8N_PASSWORD_RESET_WEBHOOK,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            timestamp: new Date().toISOString(),
          }),
        },
        WEBHOOK_TIMEOUT
      );

      if (!response.ok) {
        console.warn('⚠️ n8n webhook respondió con error:', response.status, response.statusText);
      } else {
        console.log('✅ n8n webhook ejecutado correctamente');
      }
    } catch (error) {
      // Si falla por timeout o cualquier error, no es crítico
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('⏱️ n8n webhook timeout (probablemente Render estaba dormido) - no crítico');
      } else {
        console.warn('⚠️ n8n webhook falló:', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    // SIEMPRE devolvemos éxito porque el email de Firebase ya se envió
    return NextResponse.json({ 
      success: true, 
      message: 'Password reset email sent successfully' 
    });

  } catch (error) {
    console.error('❌ Error en password-reset API route:', error);
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
