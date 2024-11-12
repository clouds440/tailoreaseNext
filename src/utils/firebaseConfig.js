import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth";
import { getStorage, uploadBytes } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDlgnmzqwtxUjeirfRA20IcYMi7-KThPfk",
  authDomain: "tailorapp-a6960.firebaseapp.com",
  databaseURL:
    "https://tailorapp-a6960-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tailorapp-a6960",
  storageBucket: "tailorapp-a6960.appspot.com",
  messagingSenderId: "347972565408",
  appId: "1:347972565408:web:1cd9cb376db0dc88920cc5",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export {
  db,
  auth,
  createUserWithEmailAndPassword,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  onAuthStateChanged,
  signOut,
  updateDoc,
  storage,
  uploadBytes,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  setDoc,
  getDoc,
  sendPasswordResetEmail,
  sendEmailVerification,
};
