import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Coins } from 'lucide-react';
import LoginModal from './LoginModal';
import { clearUserData } from '../redux/userSlice';
import api from '../api'; // ✅ use shared api instance

const Navbar = () => {
  const [openLogin,   setOpenLogin]   = useState(false);
  const [openProfile, setOpenProfile] = useState(false);

  const { userData, isLoggedIn } = useSelector((s) => s.user);
  const dispatch     = useDispatch();
  const navigate     = useNavigate();
  const dropdownRef  = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenProfile(false);
      }
    };
    if (openProfile) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openProfile]);

  const handleLogout = async () => {
    // 1. Clear Redux state
    dispatch(clearUserData());
    setOpenProfile(false);

    // 2. Clear all persisted local data
    localStorage.removeItem('persist:ai-website-builder');
    localStorage.removeItem('token');

    // 3. Tell the server to clear the HTTP-only cookie
    try {
      await api.get('/api/auth/logout');
    } catch {
      // non-critical
    }

    window.location.replace('/');
  };

  const isAuthenticated = isLoggedIn || !!userData?.email;

  return (
    <>
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer bg-white/5 p-2 px-4 rounded-2xl border border-zinc-600"
          >
            <img src="/ai2.png" className="w-7" alt="Logo" />
            <span className="font-semibold text-lg bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Promptic AI
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate('/pricing')}
              className="text-zinc-400 hover:text-white text-sm font-medium transition mr-1 hidden sm:block"
            >
              Pricing
            </button>

            {/* Credits badge */}
            {isAuthenticated && userData?.email && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate('/pricing')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm cursor-pointer hover:bg-white/10 transition"
              >
                <Coins size={14} className="text-yellow-400" />
                <span className="text-white">{userData.credits ?? 0}</span>
                <span className="text-zinc-300 hidden md:inline">Credits</span>
              </motion.div>
            )}

            {/* Avatar / Login */}
            {isAuthenticated && userData?.email ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setOpenProfile((p) => !p)}
                  className="flex items-center"
                >
                  <img
                    className="w-9 h-9 rounded-full border border-white/20 object-cover hover:scale-105 transition"
                    src={
                      userData?.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        userData?.name || 'User'
                      )}&background=6366f1&color=fff`
                    }
                    alt="Profile"
                  />
                </button>

                <AnimatePresence>
                  {openProfile && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-60 rounded-xl bg-[#0b0b0b] border border-white/10 shadow-2xl overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm font-medium text-white truncate">
                          {userData?.name}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">
                          {userData?.email}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setOpenProfile(false);
                          navigate('/dashboard');
                        }}
                        className="w-full px-4 py-3 text-left text-sm hover:bg-white/5 text-white"
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left text-sm hover:bg-white/5 text-red-400 border-t border-white/5"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setOpenLogin(true)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-semibold text-sm text-white transition"
              >
                Login
              </motion.button>
            )}
          </div>
        </div>
      </motion.nav>

      {openLogin && (
        <LoginModal open={openLogin} onClose={() => setOpenLogin(false)} />
      )}
    </>
  );
};

export default Navbar;