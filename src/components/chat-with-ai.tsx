"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, User, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { chat, type ChatInput } from '@/ai/flows/chat-flow';
import { useDebtors } from '@/context/debtors-context';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export function ChatWithAI() {
  const { debtors, isLoading: areDebtorsLoading } = useDebtors();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!input.trim() || areDebtorsLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      console.log('Messages before mapping:', messages);
      
      // Crear historial en formato correcto para Gemini
      const formattedHistory = messages
        .filter(m => m && m.role && m.content && m.content.trim()) // Filtrar mensajes inválidos
        .map(m => {
          // Gemini espera 'user' o 'model' como roles, no 'assistant'
          const role = m.role === 'assistant' ? 'model' : 'user';
          return {
            role: role,
            parts: [{ text: m.content }]
          };
        });

      console.log('Formatted history being sent:', formattedHistory);
      
      const chatInput: ChatInput = {
        history: formattedHistory,
        prompt: input,
        debtors: debtors,
      };

      console.log('Chat input being sent:', chatInput);

      const result = await chat(chatInput);
      
      console.log('Chat result:', result);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: result.response,
      };
      setMessages((prev) => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error completo con el flujo de chat:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      const errorMessage: Message = {
        role: 'assistant',
        content: "Lo siento, estoy teniendo problemas para conectarme a mi cerebro en este momento. Por favor, inténtalo de nuevo más tarde.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot /> Chatea con tu Asistente Financiero
        </CardTitle>
        <CardDescription>
          Haz preguntas sobre tus deudores en lenguaje sencillo. Prueba con "¿Quién me debe más?".
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col h-[400px] border rounded-lg">
          <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-start gap-3 my-4 ${
                    message.role === 'user' ? 'justify-end' : ''
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="p-2 bg-primary rounded-full text-primary-foreground">
                      <Bot size={20} />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-secondary text-secondary-foreground'
                        : 'bg-card text-card-foreground border'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                   {message.role === 'user' && (
                    <div className="p-2 bg-secondary rounded-full text-secondary-foreground">
                      <User size={20} />
                    </div>
                  )}
                </motion.div>
              ))}
              {isLoading && (
                 <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-start gap-3 my-4"
                >
                   <div className="p-2 bg-primary rounded-full text-primary-foreground">
                      <Bot size={20} />
                    </div>
                  <div className="max-w-[75%] p-3 rounded-lg bg-card text-card-foreground border">
                    <Loader className="animate-spin" size={20} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </ScrollArea>
          <div className="p-4 border-t">
            <div className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Haz una pregunta..."
                disabled={isLoading || areDebtorsLoading}
              />
              <Button onClick={handleSend} disabled={isLoading || areDebtorsLoading}>
                <Send size={16} />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
