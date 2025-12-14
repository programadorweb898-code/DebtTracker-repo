import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// This is the primary Genkit configuration.
// It is used by the Next.js API route handler.
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  model: 'googleai/gemini-2.5-flash',
});
