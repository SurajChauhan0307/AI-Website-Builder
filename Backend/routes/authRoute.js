import express from 'express'
import { googleAuth, getMe, logoutUser } from '../controllers/authController.js'
import { isAuthenticated } from '../middlewares/isAuthenticated.js'

const router = express.Router()

// Public — no token needed (this is the login endpoint)
router.post('/google', googleAuth)

// Public — clears the cookie
router.get('/logout', logoutUser)

// ✅ FIX: /me MUST be protected by isAuthenticated so req.user is populated.
// Without this middleware, req.user is undefined → always returns 401.
router.get('/me', isAuthenticated, getMe)

export default router