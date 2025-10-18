// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { chat, type ChatInput } from '@/ai/flows/chat-flow';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatInput;
    const authHeader = req.headers.get('Authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.substring(7);

    // This is a simplified authorization check.
    // In a real app, you would verify the token and extract the UID.
    // For now, we just ensure a token is present.
    try {
        await admin.auth().verifyIdToken(idToken);
    } catch (error) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Temporarily attach headers for the server action context
    const headers = new Headers(req.headers);

    const result = await chat(body);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[CHAT_API_ERROR]', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
