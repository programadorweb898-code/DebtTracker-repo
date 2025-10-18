'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

/**
 * A tool that the AI can use to request a change in the sorting order of the UI.
 * The frontend will be responsible for applying the sort.
 */
export const setSortOrder = ai.defineTool(
  {
    name: 'setSortOrder',
    description: 'Sets the sorting order for the list of debtors in the user interface.',
    inputSchema: z.object({
      sortBy: z.enum(['alias', 'debt']).describe('The field to sort by.'),
      direction: z.enum(['asc', 'desc']).describe('The sort direction.'),
    }),
    outputSchema: z.void(),
  },
  async () => {
    // This tool does not have a backend implementation.
    // Its purpose is to signal the frontend to perform an action.
    // The frontend will interpret the tool call and update its state.
  }
);


/**
 * A tool that the AI can use to navigate to a debtor's detail page.
 */
export const navigateToDebtor = ai.defineTool(
  {
    name: 'navigateToDebtor',
    description: 'Navigates to the detail page for a specific debtor.',
    inputSchema: z.object({
      alias: z.string().describe('The unique alias of the debtor to navigate to.'),
    }),
    outputSchema: z.void(),
  },
  async () => {
    // This tool does not have a backend implementation.
    // Its purpose is to signal the frontend to perform an action.
  }
);
