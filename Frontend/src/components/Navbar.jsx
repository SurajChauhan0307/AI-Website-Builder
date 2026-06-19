import { AnimatePresence, motion } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux" // ✅ Sahi import
import { useNavigate } from "react-router-dom"
import axios from "axios" // ✅ Sahi import (HTTP library)
import { Coins, CreditCard } from "lucide-react"
import LoginModal from "./LoginModal"
import { clearUserData } from "../redux/userSlice"

const Navbar = () => {
  const [openLogin, setOpenLogin] = useState(false)
  const [openProfile, setOpenProfile] = useState(false)

  // Redux selection
  const { userData, isLoggedIn } = useSelector(state => state.user)

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const dropdownRef = useRef(null)

  const handleLogout = async () => {
    dispatch(clearUserData());
    setOpenProfile(false);

    localStorage.removeItem('persist:ai-website-builder');
    localStorage.removeItem('token');
    localStorage.clear();
    sessionStorage.clear();

    try {
      const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";
      await axios.get(`${SERVER_URL}/api/auth/logout`, { withCredentials: true });
    } catch (error) {
      console.log("Logout cleanup:", error);
    } finally {
      window.location.replace("/");
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenProfile(false)
      }
    }
    if (openProfile) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [openProfile])

  const isUserAuthenticated = isLoggedIn || (userData && userData.email);

  return (
    <>
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer bg-white/5 p-2 px-4 rounded-2xl border border-zinc-600">
            <img src="/ai2.png" className="w-7" alt="Logo" />
            <span className="font-semibold text-lg bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Promptic AI</span>
          </div>

          <div className="flex items-center gap-5">
            <button onClick={() => navigate("/pricing")} className="text-zinc-400 hover:text-white text-sm font-medium transition mr-1 hidden sm:block">Pricing</button>

            {isUserAuthenticated && userData?.email && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate("/pricing")}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm cursor-pointer hover:bg-white/10 transition"
              >
                <Coins size={14} className="text-yellow-400" />
                <span className="text-white">{userData.credits ?? 0}</span>
                <span className="text-zinc-300 hidden md:inline">Credits</span>
              </motion.div>
            )}

            {isUserAuthenticated && userData?.email ? (
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setOpenProfile(!openProfile)} className="flex items-center">
                  <img
                    className="w-9 h-9 rounded-full border border-white/20 object-cover hover:scale-105 transition"
                    src={userData?.avatar || `https://ui-avatars.com/api/?name=${userData?.name || "User"}`}
                    alt="Profile"
                  />
                </button>

                <AnimatePresence>
                  {openProfile && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="absolute right-0 mt-3 w-60 rounded-xl bg-[#0b0b0b] border border-white/10 shadow-2xl overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm font-medium text-white">{userData?.name}</p>
                        <p className="text-xs text-zinc-500">{userData?.email}</p>
                      </div>
                      <button onClick={() => { setOpenProfile(false); navigate("/dashboard") }} className="w-full px-4 py-3 text-left text-sm hover:bg-white/5 text-white">Dashboard</button>
                      <button onClick={handleLogout} className="w-full px-4 py-3 text-left text-sm hover:bg-white/5 text-red-400 border-t border-white/5">Logout</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setOpenLogin(true)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-semibold text-sm text-white"
              >
                Login
              </motion.button>
            )}
          </div>
        </div>
      </motion.nav>

      {openLogin && <LoginModal open={openLogin} onClose={() => setOpenLogin(false)} />}
    </>
  )
}

export default Navbar