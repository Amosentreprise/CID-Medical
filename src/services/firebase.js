
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCgZaa7mdbqCLVVeYO-AgGBR7EWJgRC0B8",
  authDomain: "calendrier-medical-81320.firebaseapp.com",
  projectId: "calendrier-medical-81320",
  storageBucket: "calendrier-medical-81320.firebasestorage.app",
  messagingSenderId: "778650366802",
  appId: "1:778650366802:web:ea56b1972dbc5c60e7c08b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);