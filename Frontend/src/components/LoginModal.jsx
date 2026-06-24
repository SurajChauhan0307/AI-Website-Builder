import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';
import { auth, provider } from '../firebase';
import api from '../api';                      // ✅ use shared api instance
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';

const LoginModal = ({ open, onClose }) => {
  const dispatch   = useDispatch();
  const calledRef  = useRef(false); // prevent double-call on StrictMode

  // ─── Core: send Firebase user to our backend, save token ─────────────────
  const processBackendLogin = async (firebaseUser) => {
    try {
      const { data } = await api.post('/api/auth/google', {
        name:   firebaseUser.displayName,
        email:  firebaseUser.email,
        avatar: firebaseUser.photoURL,
      });

      // Backend sends { success, user, token }
      const token = data?.token;
      if (token) {
        localStorage.setItem('token', token);
      }

      dispatch(setUserData(data.user));
      onClose?.();
    } catch (err) {
      console.error('Backend login error:', err?.response?.data || err.message);
      alert('Login failed. Please try again.');
    }
  };

  // ─── Button click: try popup first, fall back to redirect ────────────────
  const handleGoogleAuth = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      if (result?.user) {
        await processBackendLogin(result.user);
      }
    } catch (error) {
      // Popup blocked (common on mobile) → use redirect flow
      if (
        error.code === 'auth/popup-blocked' ||
        error.code === 'auth/cancelled-popup-request' ||
        error.code === 'auth/popup-closed-by-user'
      ) {
        try {
          await signInWithRedirect(auth, provider);
        } catch (redirectErr) {
          console.error('Redirect error:', redirectErr);
        }
      } else {
        console.error('Google sign-in error:', error.code, error.message);
      }
    }
  };

  // ─── On mount: pick up the redirect result if we came back from Google ───
  useEffect(() => {
    if (!open || calledRef.current) return;
    calledRef.current = true;

    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          processBackendLogin(result.user);
        }
      })
      .catch((err) => {
        // auth/no-auth-event is normal when there is no pending redirect
        if (err.code !== 'auth/no-auth-event') {
          console.error('Redirect result error:', err);
        }
      });
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 flex z-50 items-center justify-center bg-black/80 backdrop-blur-xl px-4"
        >
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 60 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="relative w-full max-w-md p-px rounded-3xl bg-gradient-to-br from-purple-500/40 via-blue-500/30 to-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative rounded-3xl bg-[#0b0b0b] border border-white/10 shadow-[0_30px_120px_rgba(0,0,0,0.8)] overflow-hidden">
              {/* Ambient blobs */}
              <motion.div
                animate={{ opacity: [0.25, 0.4, 0.25] }}
                transition={{ duration: 6, repeat: Infinity }}
                className="absolute -top-32 -left-32 w-80 h-80 bg-purple-500/30 blur-[140px]"
              />
              <motion.div
                animate={{ opacity: [0.2, 0.35, 0.2] }}
                transition={{ duration: 6, repeat: Infinity, delay: 2 }}
                className="absolute -bottom-32 -right-32 w-80 h-80 bg-blue-500/25 blur-[140px]"
              />

              {/* Close */}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-5 right-5 z-20 text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <X />
              </button>

              <div className="relative px-8 pt-14 pb-10 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 border border-white/10 rounded-full bg-white/5 backdrop-blur">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-300">AI Website Builder</span>
                </div>

                <h2 className="text-3xl font-semibold leading-tight mb-8">
                  <span className="text-white">Welcome to</span>
                  <br />
                  <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent font-bold">
                    Promptic AI
                  </span>
                </h2>

                <motion.button
                  type="button"
                  onClick={handleGoogleAuth}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative w-full py-3.5 rounded-xl bg-white text-black font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer"
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/3840px-Google_%22G%22_logo.svg.png"
                    alt="Google"
                    className="h-5 w-5 object-contain"
                  />
                  <span className="tracking-wide">Continue with Google</span>
                </motion.button>

                <div className="flex items-center gap-4 my-10">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-xs text-zinc-500">Secure Login</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <p className="text-xs text-zinc-500 leading-relaxed">
                  By continuing you agree to our{' '}
                  <span className="underline cursor-pointer hover:text-zinc-300">
                    Terms of Service
                  </span>{' '}
                  and{' '}
                  <span className="underline cursor-pointer hover:text-zinc-300">
                    Privacy Policy
                  </span>
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;