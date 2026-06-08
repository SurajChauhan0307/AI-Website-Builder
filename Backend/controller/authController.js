import jwt from "jsonwebtoken";
import User from "../models/userModels.js";

export const googleAuth = async (req, res) => {
    try {
        const { name, email, avatar } = req.body;

        let existingUser = await User.findOne({ email });

        if (!existingUser) {
            existingUser = await User.create({ name, email, avatar });
        }

        const token = jwt.sign(
            { id: existingUser._id },
            process.env.SECRET_KEY,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json(existingUser);

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const logoutUser = async (req, res) => {
    try {
        res.clearCookie("token");

        return res.status(200).json({
            message: "Logged out successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};