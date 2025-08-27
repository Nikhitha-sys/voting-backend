import express from "express";
import { signup, login, verifyOtp } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);

// Example protected route
router.get("/protected", protect, (req, res) => {
  res.json({ message: "Access granted", user: req.user });
});

export default router;
