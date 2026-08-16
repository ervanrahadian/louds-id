import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAIgDddaaEDdZV7X7D_QlQITL46oD11IPw",
  authDomain: "loudid-app.firebaseapp.com",
  databaseURL: "https://loudid-app.firebaseio.com",
  projectId: "loudid-app",
  storageBucket: "loudid-app.appspot.com",
  messagingSenderId: "31253467132",
  appId: "1:31253467132:web:533a5ce34290102f206c79",
  measurementId: "G-NW5Z85JFHV",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({ prompt: "select_account" });
