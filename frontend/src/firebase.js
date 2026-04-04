// ─── Replace the values below with your Firebase project config ───────────────
// Go to: Firebase Console → Project Settings → Your Apps → Web App → Config

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAaVvDiFXmCQfZQQKAxCNGai0NxF3qulHU",
  authDomain: "foodlytics11.firebaseapp.com",
  projectId: "foodlytics11",
  storageBucket: "foodlytics11.firebasestorage.app",
  messagingSenderId: "72691594071",
  appId: "1:72691594071:web:f017ff4accf62ea4d30412",
  measurementId: "G-PVG8J4105Q"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
