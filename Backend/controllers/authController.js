import { User } from "../models/userModel.js"
import jwt from 'jsonwebtoken'

export const googleAuth = async (req, res) => {
    try {
        const { name, email, avatar } = req.body

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" })
        }

        let user = await User.findOne({ email })
        if (!user) {
            user = await User.create({ name, email, avatar })
            console.log(`🎯 Naya email successfully database mein register ho gaya: ${email}`);
        }

        // ✅ FIXED: Configured '_id' to align with layout middleware expectations
        const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY, { expiresIn: "7d" })
        
        res.cookie("token", token, { 
            httpOnly: true, 
            secure: true, 
            sameSite: "none", 
            maxAge: 7 * 24 * 60 * 60 * 1000 
        })

        // ✅ CRITICAL FIX: Wrapped the 'user' data inside an object matching frontend 'res.data.user' mapping
        return res.status(200).json({
            success: true,
            message: "Authentication successful",
            user: user // Frontend updates wrapper alignment
        })

    } catch (error) {
        console.error("❌ Google Auth Controller Crash:", error.message)
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const logoutUser = async (_, res) => {
    try {
         // ✅ FIXED: Matching production cookie keys configuration layout
         res.clearCookie("token", {
             httpOnly: true,
             secure: true,
             sameSite: "none"
         })
         
         return res.status(200).json({ success: true, message: "User Logout Successfully" })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}