'use server';
/**
 * @fileOverview A Genkit flow for summarizing a list of debtors.
 *
 * - summarizeDebts - A function that takes a list of debtors and returns an AI-generated summary.
 * - SummarizeDebtsInput - The input type for the summarizeDebts function.
 * - SummarizeDebtsOutput - The return type for the summarizeDebts function.
 */

import { ai } from '@/ai/genkit';
import type { Debtor } from '@/lib/types';
import { z } from 'genkit';

// Define el esquema para la entrada usando Zod.
// Adaptado para recibir un array de objetos con la estructura de Debtor.
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

const SummarizeDebtsInputSchema = z.object({
  debtors: z.array(DebtorSchema).describe("The list of debtors to summarize"),
});
export type SummarizeDebtsInput = z.infer<typeof SummarizeDebtsInputSchema>;

// Define el esquema para la salida.
const SummarizeDebtsOutputSchema = z.object({
  summary: z.string().describe("The AI-generated summary of the debt situation."),
});
export type SummarizeDebtsOutput = z.infer<typeof SummarizeDebtsOutputSchema>;

// La función que el cliente llamará.
export async function summarizeDebts(debtors: Debtor[]): Promise<SummarizeDebtsOutput> {
  return summarizeDebtsFlow({ debtors });
}

const prompt = ai.definePrompt({
  name: 'summarizeDebtsPrompt',
  input: { schema: SummarizeDebtsInputSchema },
  output: { schema: SummarizeDebtsOutputSchema },
  prompt: `You are a helpful financial assistant integrated into a debt tracking application.
Your task is to provide a concise, insightful summary of the user's current debt situation based on a list of their debtors.

Analyze the provided list of debtors:
{{{json debtors}}}

Based on the data, provide a summary that includes:
1. The total number of debtors.
2. The total amount of money owed to the user across all debtors.
3. Identify the debtor who owes the most money and how much they owe.
4. Provide a brief, encouraging, and professional closing statement.

Present the information clearly and concisely. The response should be in Spanish.
Example output:
"Actualmente tienes 5 deudores que te deben un total de $1,250.50. El deudor con la mayor deuda es 'JuanPerez', que debe $700.00. ¡Sigue así con la gestión de tus cobros!"
`,
});

const summarizeDebtsFlow = ai.defineFlow(
  {
    name: 'summarizeDebtsFlow',
    inputSchema: SummarizeDebtsInputSchema,
    outputSchema: SummarizeDebtsOutputSchema,
  },
  async (input) => {
    // Si no hay deudores, devuelve un resumen predeterminado.
    if (input.debtors.length === 0) {
      return { summary: "No tienes deudores registrados actualmente. ¡Añade uno para empezar a gestionar tus deudas!" };
    }
  
    const { output } = await prompt(input);
    return output!;
  }
);
