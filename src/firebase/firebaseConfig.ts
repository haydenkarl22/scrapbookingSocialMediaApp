import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBSEYOyg7bA6OuhxwiFFTvy9Y7_YHD5YYg",
  authDomain: "p2pscrapbook.firebaseapp.com",
  projectId: "p2pscrapbook",
  storageBucket: "p2pscrapbook.appspot.com",
  messagingSenderId: "326837624075",
  appId: "1:326837624075:web:744362faa23c3f4a61560e",
  measurementId: "G-5D5J8GKX65"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app)
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };