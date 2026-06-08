import React, { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { Coins } from "lucide-react"
import LoginModal from '../components/LoginModal'
import { useSelector } from 'react-redux'
import {setUserData} from '../redux/userSlice'
import axios from 'axios'
import { useDispatch } from 'react-redux'

const Navbar = () => {

    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [openLogin, setOpenLogin] = useState(false)
    const [openProfile, setOpenProfile] = useState(false)

    const user = useSelector(state => state?.user || {})

    const userState = user?.userState
    const userData = user?.userData

    const logoutHandler = async()=>{
        try{
            await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/auth/logout`, {withCredentials:true})
            dispatch(setUserData(null))
            setOpenProfile(false)
        } catch (error){
            console.log(error)
        }
    }
    return (
        <>
            <motion.div
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className='fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10'
            >

                <div className='max-w-7xl mx-auto px-6 py-4 flex justify-between items-center'>

                    {/* Logo */}
                    <div className='flex items-center gap-2 cursor-pointer bg-white/5 p-2 px-4 rounded-2xl border border-zinc-600'>
                        <img src="/ai2.png" alt="Promptic Ai" className="h-8 w-8" />

                        <span className='font-semibold text-lg bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent'>
                            Promptic Ai
                        </span>
                    </div>

                    {/* Right Side */}
                    <div className='flex items-center gap-5'>

                        <button
                            onClick={() => navigate('/pricing')}
                            className='hidden md:block text-sm text-zinc-400 hover:text-white transition'
                        >
                            Pricing
                        </button>

                        {/* Credits */}
                        {userData && (
                            <div className='hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm cursor-pointer hover:bg-white/10 transition'>
                                <Coins size={14} className='text-yellow-400' />

                                <span className='text-white'>
                                    {userData.credits}
                                </span>

                                <span className='text-zinc-200'>
                                    Credits
                                </span>

                                <span className='font-semibold text-zinc-200'>
                                    +
                                </span>
                            </div>
                        )}

                        {/* Profile or Login */}
                        {userData ? (
                            <div className='relative'>

                                <button
                                    onClick={() => setOpenProfile(!openProfile)}
                                    className='flex items-center'
                                >
                                    <img
                                        referrerPolicy='no-referrer'
                                        src={
                                            userData?.avatar
                                                ? userData.avatar
                                                : "https://ui-avatars.com/api/?name=Suraj+Chauhan"
                                        }
                                        alt="profile"
                                        className='w-9 h-9 rounded-full border border-white/20 object-cover hover:scale-105 transition'
                                    />
                                </button>

                                <AnimatePresence>
                                    {openProfile && (
                                        <motion.div
                                        initial={{opacity:0, y:-10, scale:0.95}}
                                        animate={{opacity:1, y:0, scale:1}}
                                        exit={{opacity:0, y:-10, scale:0.95}}
                                        transition={{duration:0.2}}
                                            className='absolute right-0 mt-3 w-60 rounded-xl bg-[#0b0b0b] border border-white/10 shadow-2xl overflow-hidden'
                                        >
                                            <div className='px-4 py-3 border-b border-white/10'>
                                                <p className='text-sm font-medium truncate text-white'>
                                                    {userData.name}
                                                </p>
                                                <p className='text-xs text-zinc-500 truncate'>{userData.email}</p>
                                            </div>
                                            <button 
                                            className='w-full px-4 py-3 text-left text-sm hover:bg-white/5 text-white'
                                            onClick={() =>navigate("/dashboard")}>Dashboard
                                            </button>
                                            <button
                                            onClick={logoutHandler}
                                            className='w-full px-4 py-3 text-left text-sm hover:bg-white/5 text-red-400'
                                            >Logout</button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                            </div>
                        ) : (
                            <button
                                onClick={() => setOpenLogin(true)}
                                className='px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-semibold text-sm transition text-white'
                            >
                                Login
                            </button>
                        )}

                    </div>
                </div>

            </motion.div>

            {/* Login Modal */}
            {openLogin && (
                <LoginModal
                    open={openLogin}
                    onClose={() => setOpenLogin(false)}
                />
            )}
        </>
    )
}

export default Navbar