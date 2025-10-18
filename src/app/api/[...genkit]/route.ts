// src/app/api/[...genkit]/route.ts
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { nextJSHandler } from '@genkit-ai/next';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

genkit({
  plugins: [
    googleAI(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

export const POST = nextJSHandler();
