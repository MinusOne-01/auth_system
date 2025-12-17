import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

export function signAccessToken(payload){
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_TTL,
        }
    );      
}

export function signRefreshToken(payload){
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_TTL,
        }
    );
}

export function verifyRefreshToken(token){
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}
