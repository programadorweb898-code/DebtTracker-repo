'use server';
/**
 * @fileOverview A Genkit flow for a conversational chat about debtors.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getDebtorsTool } from '../tools/debtors-tool';

const ChatInputSchema = z.object({
  history: z.array(z.any()).describe('The chat history.'),
  prompt: z.string().describe('The user prompt.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe('The AI-generated response.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async ({ history, prompt }) => {
    const llmResponse = await ai.generate({
      prompt: prompt,
      history: history,
      model: 'googleai/gemini-2.5-flash',
      tools: [getDebtorsTool], 
      config: {
        // Lower temperature for more factual, data-driven answers
        temperature: 0.2,
      },
    });

    return { response: llmResponse.text };
  }
);
