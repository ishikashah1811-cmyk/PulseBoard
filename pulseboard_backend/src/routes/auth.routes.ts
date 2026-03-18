import { Router } from "express";
import { register, login, googleCallback, verifyOtp, resendOtp } from "../controllers/auth.controller";

const router = Router();

router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", login);
router.post("/google/callback", googleCallback);

export default router;