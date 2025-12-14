// src/app/api/[...genkit]/route.ts
import { ai } from '@/ai/genkit';

// Para Next.js API routes, necesitamos un approach diferente
// Exportamos un handler que procese las peticiones
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Aquí puedes manejar las peticiones a tus flows
    // Por ahora retornamos un placeholder
    return Response.json({ 
      error: 'Flow handling not implemented yet',
      message: 'Use the chat and summarizeDebts functions directly'
    });
  } catch (error) {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function GET() {
  return Response.json({ 
    status: 'ok',
    message: 'Genkit API endpoint is running'
  });
}
