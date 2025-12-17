import { Router } from "express";
import { register, login, refresh, logout } from "./auth.controller.js";
import { loginRateLimit } from "../../common/middleware/ratelimit.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", loginRateLimit(), logout);

export default router;
