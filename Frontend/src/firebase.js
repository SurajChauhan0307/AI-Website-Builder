import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "prompticai.firebaseapp.com",
  projectId: "prompticai",
  storageBucket: "prompticai.appspot.com",
  messagingSenderId: "135622679337",
  appId: "1:135622679337:web:071e2413d77d1d8add3538"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };