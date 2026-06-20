import React, { useEffect } from 'react'
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from 'lucide-react'
import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth'
import { auth, provider } from '../firebase'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'

const LoginModal = ({ open, onClose }) => {
    const dispatch = useDispatch()

    const processBackendLogin = async (firebaseUser) => {
        try {
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_SERVER_URL || 'https://ai-website-builder-d0n1.onrender.com';

            const { data } = await axios.post(
                `${API_BASE_URL}/api/auth/google`,
                {
                    name: firebaseUser.displayName,
                    email: firebaseUser.email,
                    avatar: firebaseUser.photoURL
                },
                { withCredentials: true }
            )

            // Token storage logic (Fixed: ensures token is saved correctly)
            const token = data?.token || data?.user?.token;
            if (token) {
                localStorage.setItem('token', token);
            }

            dispatch(setUserData(data.user || data));
            onClose?.();
        } catch (err) {
            console.error("Backend synchronisation error:", err);
        }
    }

    const handleGoogleAuth = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            if (result?.user) {
                await processBackendLogin(result.user);
            }
        } catch (error) {
            if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
                console.warn("Popup blocked, switching to redirect:", error);
                await signInWithRedirect(auth, provider);
            } else {
                console.error("Authentication error:", error);
            }
        }
    }

    useEffect(() => {
        if (!open) return;

        getRedirectResult(auth)
            .then((result) => {
                if (result?.user) {
                    processBackendLogin(result.user);
                }
            })
            .catch((error) => {
                console.error("Authentication redirect tracking error:", error);
            });
    }, [open, auth]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className='fixed inset-0 flex z-50 items-center justify-center bg-black/80 backdrop-blur-xl px-4'
                >
                    <motion.div
                        initial={{ scale: 0.88, opacity: 0, y: 60 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 40 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className='relative w-full max-w-md p-px rounded-3xl bg-gradient-to-br from-purple-500/40 via-blue-500/30 to-transparent'
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className='relative rounded-3xl bg-[#0b0b0b] border border-white/10 shadow-[0_30px_120px_rgba(0,0,0,0.8)] overflow-hidden'>
                            
                            <motion.div animate={{ opacity: [0.25, 0.4, 0.25] }} transition={{ duration: 6, repeat: Infinity }} className='absolute -top-32 -left-32 w-80 h-80 bg-purple-500/30 blur-[140px]' />
                            <motion.div animate={{ opacity: [0.2, 0.35, 0.2] }} transition={{ duration: 6, repeat: Infinity, delay: 2 }} className='absolute -bottom-32 -right-32 w-80 h-80 bg-blue-500/25 blur-[140px]' />

                            <button
                                type="button"
                                onClick={onClose}
                                className='absolute top-5 right-5 z-20 text-zinc-400 hover:text-white transition text-lg cursor-pointer'
                            >
                                <X />
                            </button>

                            <div className='relative px-8 pt-14 pb-10 text-center'>
                                <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 border border-white/10 rounded-full bg-white/5 backdrop-blur">
                                    <Sparkles className="w-4 h-4 text-purple-400" />
                                    <span className="text-sm text-gray-300">AI Website Builder</span>
                                </div>

                                <h2 className='text-3xl font-semibold leading-tight mb-8'>
                                    <span className='text-white'>Welcome to</span><br />
                                    <span className='bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent font-bold'>Promptic AI</span>
                                </h2> 

                                <motion.button
                                    type="button"
                                    onClick={handleGoogleAuth}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className='group relative w-full py-3.5 rounded-xl bg-white text-black font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer'
                                >
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/3840px-Google_%22G%22_logo.svg.png" alt="google" className='h-5 w-5 object-contain' />
                                    <span className="tracking-wide">Continue with Google</span>
                                </motion.button>

                                <div className='flex items-center gap-4 my-10'>
                                    <div className='h-px flex-1 bg-white/10' />
                                    <span className='text-xs text-zinc-500'>Secure Login</span>
                                    <div className='h-px flex-1 bg-white/10' />
                                </div>

                                <p className='text-xs text-zinc-500 leading-relaxed'>
                                    By continuing you agree to our{" "}
                                    <span className='underline cursor-pointer hover:text-zinc-300'>Terms of Services</span> and{" "}
                                    <span className='underline cursor-pointer hover:text-zinc-300'>Privacy Policy</span>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default LoginModal