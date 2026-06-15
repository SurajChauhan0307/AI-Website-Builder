import React, { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import { useSelector, useDispatch } from 'react-redux'
import Generate from './pages/Generate'
import WebsiteEditor from './pages/WebsiteEditor'
import LiveSite from './pages/LiveSite'
import Pricing from './pages/Pricing'
import axios from 'axios'
import { setUserData } from './redux/userSlice'

const App = () => {
  const { userData } = useSelector(state => state.user)
  const dispatch = useDispatch()

  // ✅ FIX 1: Updated variable to VITE_API_BASE_URL and attached the live Render production backend URL as backup fallback
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ai-website-builder-d0n1.onrender.com';

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // ✅ FIX 2: Replaced VITE_SERVER_URL string interpolation with stable API_BASE_URL
        const res = await axios.get(
          `${API_BASE_URL}/api/auth/me`,
          { withCredentials: true }
        )

        dispatch(setUserData(res.data.user))
      } catch (err) {
        console.error("❌ User fetch failed on initialization:", err.message)
      }
    }

    fetchUser()
  }, [API_BASE_URL, dispatch])

  return (
    <BrowserRouter>   
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/dashboard' element={userData ? <Dashboard/> : <Home/>}/>
        <Route path='/generate' element={userData ? <Generate/> : <Home/>}/>
        <Route path='/editor/:id' element={userData ? <WebsiteEditor/> : <Home/>}/>
        <Route path='/site/:id' element={<LiveSite/>}/>
        <Route path='/pricing' element={<Pricing/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App;