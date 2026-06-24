import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'prompticai.firebaseapp.com',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID  || 'prompticai',
  storageBucket:     'prompticai.appspot.com',
  messagingSenderId: '135622679337',
  appId:             '1:135622679337:web:071e2413d77d1d8add3538',
};

const app      = initializeApp(firebaseConfig);
const auth     = getAuth(app);
const provider = new GoogleAuthProvider();

// Force account-selection dialog every time
provider.setCustomParameters({ prompt: 'select_account' });

export { auth, provider };