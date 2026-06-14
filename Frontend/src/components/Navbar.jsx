import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Coins } from "lucide-react"
import LoginModal from '../components/LoginModal'
import { useSelector, useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'
import axios from 'axios'
import { motion, AnimatePresence } from "framer-motion"

const Navbar = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [openLogin, setOpenLogin] = useState(false)
  const [openProfile, setOpenProfile] = useState(false)

  const userData = useSelector((state) => state.user?.userData)

  const logoutHandler = async () => {
    try {
      await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/auth/logout`,
        { withCredentials: true }
      )
      dispatch(setUserData(null))
      setOpenProfile(false)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      {/* NAVBAR */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer bg-white/5 p-2 px-4 rounded-2xl border border-zinc-600"
          >
            <img src="/ai2.png" alt="logo" className="h-8 w-8" />
            <span className="font-semibold text-lg bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent">
              Promptic AI
            </span>
          </motion.div>

          <div className="flex items-center gap-5">

            {/* Pricing */}
            <motion.button
              onClick={() => navigate("/pricing")}
              whileHover={{ y: -2 }}
              className="hidden md:block text-sm text-zinc-400 hover:text-white"
            >
              Pricing
            </motion.button>

            {/* Credits */}
            {userData && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/pricing")}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm cursor-pointer"
              >
                <Coins size={14} className="text-yellow-400" />

                {/* ✅ CHANGED */}
                <span className="text-white font-semibold">
                  {userData.credits}
                </span>

                <span className="text-zinc-300">Credits</span>
                <span className="text-indigo-400">+</span>
              </motion.div>
            )}

            {/* Profile OR Login */}
            {userData ? (
              <div className="relative">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setOpenProfile((p) => !p)}
                  className="flex items-center"
                >
                  <img
                    src={
                      userData?.avatar ||
                      "https://ui-avatars.com/api/?name=User"
                    }
                    className="w-9 h-9 rounded-full border border-white/20"
                  />
                </motion.button>

                <AnimatePresence>
                  {openProfile && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-60 rounded-xl bg-[#0b0b0b] border border-white/10 shadow-xl overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm text-white">{userData.name}</p>
                        <p className="text-xs text-zinc-500">
                          {userData.email}
                        </p>
                      </div>

                      {/* ✅ CHANGED */}
                      <button
                        onClick={() => {
                          navigate("/dashboard")
                          setOpenProfile(false)
                        }}
                        className="w-full px-4 py-3 text-left text-sm hover:bg-white/5 text-white"
                      >
                        Dashboard
                      </button>

                      <button
                        onClick={logoutHandler}
                        className="w-full px-4 py-3 text-left text-sm hover:bg-white/5 text-red-400"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => setOpenLogin(true)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* LOGIN MODAL */}
      {openLogin && (
        <LoginModal open={openLogin} onClose={() => setOpenLogin(false)} />
      )}
    </>
  )
}

export default Navbar