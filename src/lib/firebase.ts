// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDddHpNVx_SfBYQO_f4o_USY7oN_lUGgGc",
  authDomain: "noisecleaner-auth.firebaseapp.com",
  projectId: "noisecleaner-auth",
  storageBucket: "noisecleaner-auth.firebasestorage.app",
  messagingSenderId: "215118739370",
  appId: "1:215118739370:web:f41b1ef7e8910405d8ddd3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
