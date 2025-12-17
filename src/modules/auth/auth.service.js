import bcrypt from "bcrypt";
import { prisma } from "../../config/db.js";
import { signAccessToken, signRefreshToken } from "../../common/utils/jwt.js";
import jwt from "jsonwebtoken";

export async function registerUser(email, password) {
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw {
      status: 409,
      message: "User already exists"
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash
    }
  });

  return user;
}

export async function loginUser(email, password, meta){
  
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw { status: 401, message: "Invalid credentials" };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);

  if (!valid) {
    throw { status: 401, message: "Invalid credentials" };
  }

  const accessToken = signAccessToken({
    userId: user.id,
    role: user.role
  });

  const refreshToken = signRefreshToken({
    userId: user.id
  });

  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  await prisma.session.create({
    data: {
      userId: user.id,
      refreshTokenHash,
      userAgent: meta.userAgent,
      ipAddress: meta.ip,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { accessToken, refreshToken, user };

}


export async function refreshSession(refreshToken, meta){

  let payload;
  
  try{
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  }
  catch(err){
     throw { status: 401, message: "Invalid refresh token (inside service logic)" };
  }

  const sessions = await prisma.session.findMany({
    where: {
      userId: payload.userId,
      revokedAt: null,
    },
  });


   if (sessions.length === 0) {
    throw { status: 401, message: "Session not found" };
  }

  let matchedSession = null;

  for(const session of sessions){
    const match = await bcrypt.compare(refreshToken, session.refreshTokenHash);
    if(match){
      matchedSession = session;
      break;
    }
  }
  
  // Token reuse detection
  if (!matchedSession) {
    await prisma.session.updateMany({
      where: { userId: payload.userId },
      data: { revokedAt: new Date() },
    });

    throw {
      status: 401,
      message: "Refresh token reuse detected",
    };
  }

  // Rotate refresh token
  const newRefreshToken = signRefreshToken({
    userId: payload.userId,
  });

  const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);

  await prisma.session.update({
    where: { id: matchedSession.id },
    data: {
      refreshTokenHash: newRefreshTokenHash,
      userAgent: meta.userAgent,
      ipAddress: meta.ip,
      expiresAt: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ),
    },
  });

  const accessToken = signAccessToken({
    userId: payload.userId,
  });

  return { accessToken, newRefreshToken };

}


export async function logoutSession(refreshToken){

  let payload;

  try{
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  }
  catch(err){
    return;
  }

  const sessions = await prisma.session.findMany({
    where: {
      userId: payload.userId,
      revokedAt: null,
    },
  });

  for (const session of sessions) {
    const match = await bcrypt.compare(refreshToken, session.refreshTokenHash);
    if(match){
    const updated = await prisma.session.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
    });
    
    break;
   }
 }
  
}