// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "livingapp-ce503.firebaseapp.com",
  projectId: "livingapp-ce503",
  storageBucket: "livingapp-ce503.appspot.com",
  messagingSenderId: "482311767910",
  appId: "1:482311767910:web:64b86c22468612bf342aa7"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);