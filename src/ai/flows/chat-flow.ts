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
        The user has provided you with the following list of their debtors.
        Use this data as the source of truth to answer their questions.
        If the user asks to sort or order the list, use the setSortOrder tool.
        If the user asks to see details for a specific person, use the navigateToDebtor tool.
        Do not make up debtors that are not in the provided data.
        Debtors data:
        ${JSON.stringify(debtors)}
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
