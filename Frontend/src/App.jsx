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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/auth/me`,
          { withCredentials: true }
        )

        dispatch(setUserData(res.data.user))
      } catch (err) {
        console.log("User fetch failed")
      }
    }

    fetchUser()
  }, [])

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

export default App