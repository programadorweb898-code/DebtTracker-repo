// src/app/api/[...genkit]/route.ts
import { ai } from '@/ai/genkit';
import { nextJSHandler } from '@genkit-ai/next';

// This is the Next.js API route handler for Genkit.
// It's responsible for handling all requests to the /api/genkit endpoint.
// This is the only place where the Genkit configuration is initialized.
// We are using the ai object from @/ai/genkit to initialize the handler.
export const POST = nextJSHandler({
  ai,
});
