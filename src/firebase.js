import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCv_9O2ZhC9jW2C9L-2vNhOjoMbTQdGi5Y",
  authDomain: "student-fee-admission-system.firebaseapp.com",
  databaseURL: "https://student-fee-admission-system-default-rtdb.firebaseio.com",
  projectId: "student-fee-admission-system",
  storageBucket: "student-fee-admission-system.firebasestorage.app",
  messagingSenderId: "1009657295375",
  appId: "1:1009657295375:web:0d29155bec27997952e97a",
  measurementId: "G-09SMXLLJGX",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };
