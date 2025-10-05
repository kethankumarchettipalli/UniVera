// src/config/firebase.ts

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  getDoc,
  doc,
  DocumentData,
  serverTimestamp,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { College, PG } from '../types';

// --- Firebase Config ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// --- Social Auth Providers ---
export const googleProvider = new GoogleAuthProvider();

export const facebookProvider = new FacebookAuthProvider();
// ✅ request extra permissions
facebookProvider.addScope('email');
facebookProvider.addScope('public_profile');

export const twitterProvider = new TwitterAuthProvider();

// --- Auth Helpers (optional) ---
export const signInWithFacebookPopup = async () => {
  try {
    const result = await signInWithPopup(auth, facebookProvider);
    console.log('Facebook sign-in success:', result.user);
    return { ok: true, user: result.user };
  } catch (err) {
    console.error('Facebook popup sign-in failed:', err);
    return { ok: false, error: (err as Error).message };
  }
};

export const signInWithFacebookRedirect = async () => {
  try {
    await signInWithRedirect(auth, facebookProvider);
    // Handle result later in app load
  } catch (err) {
    console.error('Facebook redirect sign-in failed:', err);
  }
};

export const handleFacebookRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      console.log('Facebook redirect success:', result.user);
      return { ok: true, user: result.user };
    }
    return null;
  } catch (err) {
    console.error('Facebook redirect result error:', err);
    return { ok: false, error: (err as Error).message };
  }
};

// --- Firestore Collection References ---
const collegesCollectionRef = collection(db, 'colleges');
const pgsCollectionRef = collection(db, 'pgs');

// --- Database Functions ---

// COLLEGES
export const getColleges = async (): Promise<College[]> => {
  const snapshot = await getDocs(collegesCollectionRef);
  return snapshot.docs.map((doc: DocumentData) => ({
    id: doc.id,
    ...doc.data(),
  })) as College[];
};

export const addCollege = async (collegeData: Omit<College, 'id'>) => {
  await setDoc(doc(collegesCollectionRef), collegeData);
};

// FAVORITES (toggle add/remove, avoids duplicates)
export const toggleFavorite = async (
  userId: string,
  collegeId: string,
  payload: { name?: string }
) => {
  try {
    const favRef = doc(db, 'users', userId, 'favorites', collegeId);
    const snap = await getDoc(favRef);

    if (snap.exists()) {
      // Already favorited → remove it
      await deleteDoc(favRef);
      console.log(`[toggleFavorite] removed users/${userId}/favorites/${collegeId}`);
      return { ok: true, id: collegeId, action: 'removed' };
    } else {
      // Not favorited → add it
      const data = {
        collegeId,
        ...payload,
        createdAt: serverTimestamp(),
      };
      await setDoc(favRef, data);
      console.log(`[toggleFavorite] added users/${userId}/favorites/${collegeId}`, data);
      return { ok: true, id: collegeId, action: 'added' };
    }
  } catch (err) {
    console.error('[toggleFavorite] failed', err);
    return { ok: false, error: (err as Error).message };
  }
};

// PGs / ACCOMMODATIONS
export const getPgs = async (): Promise<PG[]> => {
  const snapshot = await getDocs(pgsCollectionRef);
  return snapshot.docs.map((doc: DocumentData) => ({
    id: doc.id,
    ...doc.data(),
  })) as PG[];
};

export const addPg = async (pgData: Omit<PG, 'id'>) => {
  await setDoc(doc(pgsCollectionRef), pgData);
};

export default app;

// expose auth to the browser window for quick debugging
;(window as any).__FIREBASE_AUTH = auth;
