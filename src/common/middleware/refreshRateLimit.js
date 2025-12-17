import jwt from "jsonwebtoken";
import { redis } from "../../config/redis.js";

export function refreshRateLimit({maxAttempts = 10, windowSeconds = 30} = {}){
    return async function(req, res, next){

        const refreshToken = req.cookies?.refreshToken;

        if(!refreshToken){
            return res.status(401).json({ message: "Missing refresh token" });
        }

        let payload;
        try{
            payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        }
        catch(err){
             return res.status(401).json({ message: "Invalid refresh token" });
        }

        const key = `refresh:user:${payload.userId}`;

        try{
            const attempts = await redis.incr(key);

            if(attempts == 1){
                await redis.expire(key, windowSeconds);
            }

            if(attempts > maxAttempts){
               return res.status(429).json({ message: "Too many refresh attempts. Please log in again." });
            }
            
            next();
        }
        catch(err){
            // Redis failure should not break auth
            console.error("Redis refresh rate limit error", err);
            next();
        }


    }

}

