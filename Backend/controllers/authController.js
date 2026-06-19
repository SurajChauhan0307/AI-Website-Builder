import { User } from "../models/userModel.js"
import jwt from "jsonwebtoken"

export const googleAuth = async (req, res) => {
    try {
        const { name, email, avatar } = req.body

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            })
        }

        let user = await User.findOne({ email })

        if (!user) {
            user = await User.create({
                name,
                email,
                avatar
            })
        }

        if (!process.env.SECRET_KEY) {
            return res.status(500).json({
                success: false,
                message: "JWT secret not configured"
            })
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.SECRET_KEY,
            { expiresIn: "7d" }
        )

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        // ✅ FIX: Explicitly send 'token' in the JSON body so localStorage fallback can capture it cross-origin!
        return res.status(200).json({
            success: true,
            user,
            token
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const getMe = (req, res) => {
  try {
    const user = req.user || null;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    res.json({
      user
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const logoutUser = async (_, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        })

        return res.status(200).json({
            success: true,
            message: "User logged out successfully"
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}