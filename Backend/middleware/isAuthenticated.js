import jwt from "jsonwebtoken"
import User from "../models/userModels.js"

export const isAuthenticated = async (req, res, next) => {
    try {
        console.log("DEBUG: Incoming Cookies ->", req.cookies);

        const token = req.cookies.token

        if (!token) {
            return res.status(401).json({
                message: "Token not found"
            })
        }

        const decoded = jwt.verify(
            token,
            process.env.SECRET_KEY
        )

        req.user = await User.findById(decoded.id)

        if (!req.user) {
            return res.status(401).json({
                message: "User not found"
            })
        }

        console.log("DEBUG: Authenticated User ->", req.user);

        next()
    } catch (error) {
        return res.status(401).json({
            message: "Invalid Token"
        })
    }
}