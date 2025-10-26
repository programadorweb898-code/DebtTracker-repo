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
  debtors: z.array(DebtorSchema).describe("La lista de deudores a resumir"),
});
export type SummarizeDebtsInput = z.infer<typeof SummarizeDebtsInputSchema>;

// Define el esquema para la salida.
const SummarizeDebtsOutputSchema = z.object({
  summary: z.string().describe("El resumen de la situación de la deuda generado por la IA."),
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
  prompt: `Eres un útil asistente financiero integrado en una aplicación de seguimiento de deudas.
Tu tarea es proporcionar un resumen conciso y perspicaz de la situación actual de la deuda del usuario basado en una lista de sus deudores.

Analiza la lista de deudores proporcionada:
{{{json debtors}}}

Basándote en los datos, proporciona un resumen que incluya:
1. El número total de deudores.
2. La cantidad total de dinero que se le debe al usuario entre todos los deudores.
3. Identifica al deudor que debe más dinero y cuánto debe.
4. Proporciona una breve, alentadora y profesional declaración de cierre.

Presenta la información de forma clara y concisa. La respuesta debe estar en español.
Ejemplo de salida:
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
