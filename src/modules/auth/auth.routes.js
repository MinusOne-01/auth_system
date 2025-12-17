import { Router } from "express";
import { register, login, refresh, logout } from "./auth.controller.js";
import { loginRateLimit } from "../../common/middleware/ratelimit.js";
import { refreshRateLimit } from "../../common/middleware/refreshRateLimit.js";

const router = Router();

router.post("/register", register);
router.post("/login", loginRateLimit({ maxAttempts: 5 }), login);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;
