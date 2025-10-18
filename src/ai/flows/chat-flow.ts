"use server";
/**
 * @fileOverview A Genkit flow for a conversational chat about debtors.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { navigateToDebtor, setSortOrder } from '../tools/ui-actions-tool';

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


const SortActionSchema = z.object({
    type: z.literal('sort'),
    payload: z.enum(['debt-desc', 'debt-asc', 'alias-asc']),
});

const NavigateActionSchema = z.object({
    type: z.literal('navigate'),
    payload: z.string().describe('The alias of the debtor to navigate to.'),
});

const ChatOutputSchema = z.object({
  response: z.string().describe('The AI-generated response.'),
  action: z.optional(z.union([SortActionSchema, NavigateActionSchema])).describe('An optional UI action to perform.'),
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
      tools: [setSortOrder, navigateToDebtor],
      system: `You are a financial assistant for the DebtTracker app.
        You MUST use the provided data as the single source of truth to answer user questions.

        Key instructions:
        1.  **Conversational Context**: Pay close attention to the chat history. If a user asks a follow-up question without naming a debtor (e.g., "how much do they owe?"), assume they are referring to the debtor mentioned in the previous turn.
        2.  **Data Analysis**: You can answer questions about specific transaction details. For a given debtor, you can determine:
            *   **Debt Start Date**: The date of the very first debt record.
            *   **Last Transaction**: The date of the most recent record (debt or payment).
            *   **Last Payment**: The date of the most recent record with a negative amount.
        3.  **Tool Usage**:
            *   If the user asks to sort or order the list (e.g., "sort by name", "show me highest debt first"), you MUST use the \`setSortOrder\` tool.
            *   If the user asks to see details for a specific person (e.g., "show me JohnDoe's details"), you MUST use the \`navigateToDebtor\` tool.
            *   You can also handle sorting by debt ranges if requested.
        4.  **Data Integrity**: Do not make up debtors, amounts, or dates. All answers must be derived from the data below.

        Debtors data:
        ${JSON.stringify(debtors, null, 2)}
      `,
      config: {
        temperature: 0.1, // Lower temperature for more deterministic, tool-driven responses
      },
      output: 'prompt', // Tell Genkit to not expect tool responses.
    });

    const textResponse = llmResponse.text;
    const toolCalls = llmResponse.toolCalls;

    if (toolCalls && toolCalls.length > 0) {
        // For this use case, we are not executing the tool on the backend.
        // We are just forwarding the tool's intent to the frontend.
        // We will only handle the first tool call.
        const toolCall = toolCalls[0];
        const toolName = toolCall.tool.name;
        const toolArgs = toolCall.input;

        if (toolName === 'setSortOrder') {
            return {
                response: textResponse || `Ok, sorting by ${toolArgs.sortBy} in ${toolArgs.direction} order.`,
                action: {
                    type: 'sort',
                    payload: `${toolArgs.sortBy}-${toolArgs.direction}`
                }
            };
        }

        if (toolName === 'navigateToDebtor') {
            return {
                response: textResponse || `Sure, here are the details for ${toolArgs.alias}.`,
                action: {
                    type: 'navigate',
                    payload: toolArgs.alias,
                }
            };
        }
    }

    return { response: textResponse };
  }
);
