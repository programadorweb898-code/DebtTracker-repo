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
  history: z.array(z.any()).describe('El historial del chat.'),
  prompt: z.string().describe('El mensaje del usuario.'),
  debtors: z.array(DebtorSchema).describe("La lista de deudores para usar como contexto."),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe('La respuesta generada por la IA.'),
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
    console.log('Chat flow received:', { 
      historyLength: history?.length, 
      prompt, 
      debtorsLength: debtors?.length,
      historyContent: JSON.stringify(history, null, 2)
    });

    // Validar y limpiar el historial
    const validHistory = Array.isArray(history) 
      ? history.filter(msg => {
          const isValid = msg && 
                         typeof msg === 'object' && 
                         msg.role && 
                         (msg.role === 'user' || msg.role === 'model') && // Solo roles válidos
                         msg.parts && 
                         Array.isArray(msg.parts) &&
                         msg.parts.length > 0 &&
                         msg.parts[0] &&
                         msg.parts[0].text &&
                         typeof msg.parts[0].text === 'string' &&
                         msg.parts[0].text.trim() !== '';
          if (!isValid) {
            console.warn('Invalid history message filtered out:', JSON.stringify(msg));
          }
          return isValid;
        })
      : [];

    console.log('Valid history after filtering:', JSON.stringify(validHistory, null, 2));

    try {
      // Crear el prompt completo incluyendo el historial como contexto
      let fullPrompt = prompt;
      
      if (validHistory && validHistory.length > 0) {
        console.log('Including history in prompt context');
        const historyText = validHistory.map(msg => 
          `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.parts[0].text}`
        ).join('\n');
        fullPrompt = `Historial de conversación:\n${historyText}\n\nNueva pregunta del usuario: ${prompt}`;
      } else {
        console.log('No history to include');
      }

      console.log('Full prompt:', fullPrompt);

      const llmResponse = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        prompt: fullPrompt,
        system: `Eres un asistente financiero para la aplicación DebtTracker.
          DEBES usar los datos proporcionados como la única fuente de verdad para responder las preguntas de los usuarios.

          Instrucciones clave:
          1. **Contexto Conversacional**: Presta mucha atención al historial del chat. Si un usuario hace una pregunta de seguimiento sin nombrar a un deudor (por ejemplo, "¿cuánto debe?"), asume que se refiere al deudor mencionado en el turno anterior.
          2. **Análisis de Datos**: Puedes responder preguntas sobre detalles específicos de transacciones. Para un deudor dado, puedes determinar:
              * **Fecha de Inicio de la Deuda**: La fecha del primer registro de deuda.
              * **Última Transacción**: La fecha del registro más reciente (deuda o pago).
              * **Último Pago**: La fecha del registro más reciente con un monto negativo.
          3. **Integridad de los Datos**: No inventes deudores, montos o fechas. Todas las respuestas deben derivarse de los datos a continuación.

          Datos de los deudores:
          ${JSON.stringify(debtors, null, 2)}
        `,
        config: {
          temperature: 0.1,
        },
      });

      return { response: llmResponse.text };
    } catch (error) {
      console.error('Error in chat flow generation:', error);
      throw error;
    }
  }
);
