import React from 'react'
import { motion } from 'motion/react'
import { Sparkles } from "lucide-react"
import { auth, provider } from '../../firebase'
import { signInWithPopup } from "firebase/auth"
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'

const LoginModal = ({ open, onClose }) => {
  const dispatch = useDispatch()

  const handleGoogleAuth = async () => {
    try {
      const result = await signInWithPopup(auth, provider)

      console.log("Firebase User:", result.user)

      // ✅ ONLY FIX ADDED (safe env check)
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

      if (!API_BASE_URL) {
        console.error("VITE_API_BASE_URL missing in Vercel env")
        return
      }

      const { data } = await axios.post(
        `${API_BASE_URL}/api/auth/google`,
        {
          name: result.user.displayName,
          email: result.user.email,
          avatar: result.user.photoURL
        },
        {
          withCredentials: true
        }
      )

      // ✅ FIX ADDED (correct backend response mapping)
      dispatch(setUserData(data.user || data))

    } catch (error) {
      console.log("Google Auth Error:", error)
    }
  }

  return (
    <div>
      {open && (

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className='fixed inset-0 flex z-[100] items-center justify-center bg-black/80 backdrop-blur-xl px-4'
        >

          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 60 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className='relative w-full max-w-md p-px rounded-3xl bg-gradient-to-br from-purple-500/40 via-blue-500/30 to-transparent'
          >

            <div className='relative rounded-3xl bg-[#0b0b0b] border border-white/10 overflow-hidden'>

              {/* Glow Background */}
              <motion.div className='absolute -top-32 -left-32 w-80 h-80 bg-purple-500/30 blur-[140px]' />
              <motion.div className='absolute -bottom-32 -right-32 w-80 h-80 bg-blue-500/30 blur-[140px]' />

              {/* Close Button */}
              <button
                onClick={onClose}
                className='absolute top-5 right-5 z-20 text-zinc-400 hover:text-white transition text-lg'
              >
                X
              </button>

              {/* Content */}
              <div className='relative px-8 pt-14 pb-10 text-center'>

                <div className='inline-flex items-center gap-2 px-4 py-2 mb-8 border border-white/10 rounded-full bg-white/5 backdrop-blur'>
                  <Sparkles className='w-4 h-4 text-purple-400' />
                  <span className='text-sm text-gray-300'>
                    AI Website Builder
                  </span>
                </div>

                <h2 className='text-3xl font-semibold leading-tight mb-3 text-white'>
                  Welcome to{" "}
                  <span className='bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent'>
                    Promptic AI
                  </span>
                </h2>

                <p className='text-sm text-zinc-400 mb-8'>
                  Sign in to continue building stunning AI websites
                </p>

                {/* Google Button */}
                <motion.button
                  onClick={handleGoogleAuth}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className='group relative w-full h-14 rounded-xl bg-white text-black font-semibold shadow-xl overflow-hidden'
                >
                  <div className='relative flex items-center justify-center gap-3'>
                    <img
                      className='h-5 w-5'
                      src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                      alt="Google"
                    />
                    Continue with Google
                  </div>
                </motion.button>

                {/* Divider */}
                <div className='flex items-center gap-4 my-10'>
                  <div className='h-px flex-1 bg-white/10' />
                  <span className='text-xs tracking-tight text-zinc-500'>
                    Secure Login
                  </span>
                  <div className='h-px flex-1 bg-white/10' />
                </div>

                <p className='text-xs text-zinc-500 leading-relaxed'>
                  By Continuing you agree to our{" "}
                  <span className='underline cursor-pointer hover:text-zinc-300'>
                    Terms of Service
                  </span>{" "}
                  and{" "}
                  <span className='underline cursor-pointer hover:text-zinc-300'>
                    Privacy Policy
                  </span>
                </p>

              </div>

            </div>

          </motion.div>

        </motion.div>

      )}
    </div>
  )
}

export default LoginModal