import express from 'express'
import { googleAuth, logoutUser } from '../controllers/authController.js'
import { isAuthenticated } from '../middlewares/authMiddleware.js' // ✅ Token check karne ke liye import karo

const router = express.Router()

// 1. Google Authentication Route
router.post('/google', googleAuth)

// 2. 🚨 FIX 1: Changed from .get to .post because frontend trigers a POST request for logout
router.post('/logout', logoutUser)

// 3. 🚨 CRITICAL FIX 2: Added the missing /me route that frontend initialization relies on
router.get('/me', isAuthenticated, (req, res) => {
    try {
        // Since isAuthenticated middleware sets req.user, we return it here
        return res.status(200).json({
            success: true,
            message: "User session authenticated successfully",
            user: req.user // Matches frontend res.data.user expectations
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal error inside user session route",
            error: error.message
        })
    }
})

export default router