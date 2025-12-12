// This configuration is now loaded from environment variables
// See .env.example for the list of required variables.

// For production deployments, it is recommended to use environment variables.
// For local development, you can hardcode the values here.
// Example for Render, Vercel, etc.:
// apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
