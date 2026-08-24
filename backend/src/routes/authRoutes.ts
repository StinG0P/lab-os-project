import { Router } from "express";
import rateLimit from "express-rate-limit";
import { login } from "../controllers/authController";

const router = Router();

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { error: "Too many login attempts. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/login", loginRateLimiter, login);

export default router;
