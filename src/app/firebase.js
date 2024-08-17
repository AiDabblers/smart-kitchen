// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDnsMQWSo_Tz0HVYr2UwjhEM0wcVNg_oEY",
  authDomain: "smart-kitchen-85925.firebaseapp.com",
  projectId: "smart-kitchen-85925",
  storageBucket: "smart-kitchen-85925.appspot.com",
  messagingSenderId: "475369340394",
  appId: "1:475369340394:web:7a06dce2e00722ffd44693",
  measurementId: "G-JLJT2K6BNF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };