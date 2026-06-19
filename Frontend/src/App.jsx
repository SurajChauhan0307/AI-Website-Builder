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

  // ✅ Variable yahan top-level par hona chahiye taaki poore component mein access ho sake
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ai-website-builder-d0n1.onrender.com';

  useEffect(() => {
    const fetchUser = async () => {
      const localToken = localStorage.getItem('token');
      
      // Agar token nahi hai toh request mat bhejo (401 error clear ho jayega)
      if (!localToken) {
        return; 
      }

      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/auth/me`,
          { 
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${localToken}`
            }
          }
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