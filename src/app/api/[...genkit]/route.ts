// src/app/api/[...genkit]/route.ts
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { nextJSHandler } from '@genkit-ai/next';

genkit({
  plugins: [
    googleAI(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

export const POST = nextJSHandler();
