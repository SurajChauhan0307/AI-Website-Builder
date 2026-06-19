import express from 'express'
import { googleAuth, logoutUser } from '../controllers/authController.js'
import { getMe } from '../controllers/authController.js'

const router = express.Router()

router.post('/google', googleAuth)
router.get('/logout', logoutUser)

router.get('/me', getMe)

export default router