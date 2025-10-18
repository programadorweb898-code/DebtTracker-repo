'use server';
/**
 * @fileOverview A Genkit tool for fetching debtor data from Firestore.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from 'firebase-admin/firestore';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { DecodedIdToken } from 'firebase-admin/auth';
import { headers } from 'next/headers';

// Initialize Firebase Admin SDK if not already initialized
let adminApp: App;
if (!getApps().length) {
  adminApp = initializeApp();
} else {
  adminApp = getApps()[0];
}

const db = getFirestore(adminApp);

// Define output schema for the tool
const DebtorSchema = z.object({
  id: z.string(),
  alias: z.string(),
  totalDebt: z.number(),
  ownerUid: z.string(),
  debts: z.array(
    z.object({
      id: z.string(),
      amount: z.number(),
      date: z.string(),
    })
  ),
});

const DebtorsToolOutputSchema = z.array(DebtorSchema);

// This function gets the currently logged-in user's UID.
// It's a placeholder and in a real app would involve securely getting the user session.
async function getCurrentUserId(): Promise<string | null> {
  const authHeader = headers().get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    console.warn('No Firebase Auth Bearer token found in headers.');
    return null;
  }
  const idToken = authHeader.substring(7);

  try {
    const decodedToken: DecodedIdToken = await getApps()[0]
      .auth()
      .verifyIdToken(idToken, true);
    return decodedToken.uid;
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return null;
  }
}

export const getDebtorsTool = ai.defineTool(
  {
    name: 'getDebtorsTool',
    description:
      'Fetches the list of debtors and their debts for the current user. Use this to answer any questions about who owes money, how much they owe, debt history, etc.',
    outputSchema: DebtorsToolOutputSchema,
  },
  async () => {
    console.log('getDebtorsTool called');
    const userId = await getCurrentUserId();
    if (!userId) {
      console.log('No user ID found, returning empty array.');
      return [];
    }
    console.log(`Fetching debtors for user: ${userId}`);
    const debtorsColRef = collection(db, 'debtors');
    const q = query(debtorsColRef, where('ownerUid', '==', userId));

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('No debtors found for this user.');
      return [];
    }

    const debtors = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`Found ${debtors.length} debtors.`);
    return debtors as z.infer<typeof DebtorsToolOutputSchema>;
  }
);
