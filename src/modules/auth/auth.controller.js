import { redis } from "../../config/redis.js";
import { loginUser, registerUser, refreshSession, logoutSession } from "./auth.service.js";

export async function register(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await registerUser(email, password);

    res.status(201).json({
      id: user.id,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next){
  try{
    const { email, password } = req.body;

    if(!email || !password){
      return res.status(400).json({ message: "Missing credentials" });
    }

    const { accessToken, refreshToken, user } = await loginUser(
      email,
      password,
      {
        userAgent: req.headers["user-agent"],
        ip: req.ip,
      }
    );

    const key = `login:${email}:${req.ip}`;
    await redis.del(key);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: false, // true in production
      path: "/auth/refresh",
    });

    res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });

  }
  catch(err){
    next(err);
  }
}

export async function refresh(req, res, next){
  try{
    const refreshToken = req.cookies.refreshToken;

    if(!refreshToken){
      return res.status(401).json({ message: "Missing refresh token" });
    }

    const { accessToken, newRefreshToken } = await refreshSession(refreshToken,
      {
        userAgent: req.headers["user-agent"],
        ip: req.ip,
      }
    );

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: false, // true in production
      path: "/auth/refresh",
    });

    res.json({ accessToken });

  }
  catch(err){
    next(err);
  }

}


export async function logout(req, res, next){
  try{
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      // idempotent logout
      return res.status(204).end();
    }

    await logoutSession(refreshToken);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: false, // true in production
      path: "/auth/refresh",
    });

    return res.status(204).end();

  }
  catch(err){
    next(err);
  }
}