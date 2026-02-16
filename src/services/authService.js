/**
 * authService.js — Firebase Authentication service
 */

import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    onAuthStateChanged,
} from 'firebase/auth';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

// Initialize Analytics (only in browser, safe to call)
let analytics = null;
try {
    analytics = getAnalytics(app);
} catch (e) {
    console.warn('[Analytics] Could not initialize:', e.message);
}

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
}

export async function signInWithTruecaller(_phoneNumber) {
    console.warn(
        '[Auth] Truecaller SDK requires a mobile environment. ' +
        'Use Google Sign-In on web, or deploy as a mobile app for Truecaller support.'
    );
    return null;
}

export async function signOut() {
    await firebaseSignOut(auth);
}

export function getCurrentUser() {
    return auth.currentUser;
}

export async function getIdToken() {
    const user = auth.currentUser;
    if (!user) return null;
    return user.getIdToken();
}

export function onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
}

export { analytics };
