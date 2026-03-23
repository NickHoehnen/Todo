import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FB_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FB_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FB_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FB_APP_ID!,
};

console.log("Firebase Project ID:", firebaseConfig.projectId);

// Prevent duplicate apps (VERY IMPORTANT in Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app, "todofirestore");
export const auth = getAuth(app);
export default app;