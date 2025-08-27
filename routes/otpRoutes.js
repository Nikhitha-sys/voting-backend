// routes/otpRoutes.js
import express from "express";
import { requestOtp, verifyOtp } from "../controllers/otpController.js";

const router = express.Router();

// The endpoint to request a new OTP
router.post("/request", requestOtp);

// The endpoint to verify the OTP
router.post("/verify", verifyOtp);

export default router;