import jwt from "jsonwebtoken";

export function requireAuth(req, res, next){
    
   const authHeader = req.headers.authorization;

   if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Missing or invalid Authorization header",
    });
   }

   const token = authHeader.split(" ")[1];

   try{
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = {
      id: payload.userId,
      role: payload.role,
    };
    next();
   }
   catch(err){
    return res.status(401).json({
      message: "Invalid or expired access token",
    });
   }


}