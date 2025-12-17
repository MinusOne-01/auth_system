import { redis } from "../../config/redis.js"

export function loginRateLimit({maxAttempts = 5, windowSeconds = 100} = {}){
    return async function(req, res, next){

        const email = req.body?.email;
        const ip = req.ip;

        if(!email){
            return next();
        }

        const key = `login:${email}:${ip}`;

        try{
            const attempts = await redis.incr(key);

            if (attempts === 1) {
                await redis.expire(key, windowSeconds);
            }

            if(attempts > maxAttempts){
                return res.status(429).json({ message: "Too many login attempts. Please try again later.", });
            }
            next();
        }
        catch (err) {
            // Redis failure should not break auth
            console.error("Redis rate limit error", err);
            next();
        }

    }
}