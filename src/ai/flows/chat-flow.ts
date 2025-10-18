'use server';
/**
 * @fileOverview A Genkit flow for a conversational chat about debtors.
 */

import { ai } from '@/ai/genkit';
import type { Debtor } from '@/lib/types';
import { z } from 'genkit';

const DebtorSchema = z.object({
  id: z.string(),
  alias: z.string(),
  totalDebt: z.number(),
  ownerUid: z.string(),
  debts: z.array(z.object({
    id: z.string(),
    amount: z.number(),
    date: z.string(),
  })),
});

const ChatInputSchema = z.object({
  history: z.array(z.any()).describe('The chat history.'),
  prompt: z.string().describe('The user prompt.'),
  debtors: z.array(DebtorSchema).describe("The list of debtors to use as context."),
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
  async ({ history, prompt, debtors }) => {
    const llmResponse = await ai.generate({
      prompt: prompt,
      history: history,
      model: 'googleai/gemini-2.5-flash',
      system: `You are a financial assistant for the DebtTracker app.
        The user has provided you with the following list of their debtors.
        Use this data as the source of truth to answer their questions.
        Debtors data:
        ${JSON.stringify(debtors)}
      `,
      config: {
        // Lower temperature for more factual, data-driven answers
        temperature: 0.2,
      },
    });

    return { response: llmResponse.text };
  }
);
