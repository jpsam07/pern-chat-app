import jwt from "jsonwebtoken";
import { Response } from "express";

const generateToken = (userId: String, res: Response) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET!, {
        expiresIn: "15d",
    });

    res.cookie("jwt", token, {
        maxAge: 15 * 24 * 60 * 60 * 1000, // milliseconds
        httpOnly: true, // prevent XSS cross side scripting attacks
        sameSite: "strict", // prevent CSRF attack or cross site request forgery
        secure: process.env.NODE_ENV !== "development", // HTTPS
    });

    return token;
};

export default generateToken;