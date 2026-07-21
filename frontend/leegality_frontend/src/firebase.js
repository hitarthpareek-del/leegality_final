// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAkmqt_TiLYMArjXSLoHyUMfyeGS7lNN1I",
  authDomain: "leegality-auth.firebaseapp.com",
  projectId: "leegality-auth",
  storageBucket: "leegality-auth.firebasestorage.app",
  messagingSenderId: "748545321312",
  appId: "1:748545321312:web:6115b895151b2542a25605",
  measurementId: "G-HCBDS8BRH1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const provider = new GoogleAuthProvider();

export { signInWithPopup, signOut };
