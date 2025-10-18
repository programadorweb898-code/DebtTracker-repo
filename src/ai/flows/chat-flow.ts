"use server";
/**
 * @fileOverview A Genkit flow for a conversational chat about debtors.
 */

import { ai } from '@/ai/genkit';
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
        You MUST use the provided data as the single source of truth to answer user questions.

        Key instructions:
        1.  **Conversational Context**: Pay close attention to the chat history. If a user asks a follow-up question without naming a debtor (e.g., "how much do they owe?"), assume they are referring to the debtor mentioned in the previous turn.
        2.  **Data Analysis**: You can answer questions about specific transaction details. For a given debtor, you can determine:
            *   **Debt Start Date**: The date of the very first debt record.
            *   **Last Transaction**: The date of the most recent record (debt or payment).
            *   **Last Payment**: The date of the most recent record with a negative amount.
        3.  **Data Integrity**: Do not make up debtors, amounts, or dates. All answers must be derived from the data below.

        Debtors data:
        ${JSON.stringify(debtors, null, 2)}
      `,
      config: {
        temperature: 0.1,
      },
    });

    return { response: llmResponse.text };
  }
);
