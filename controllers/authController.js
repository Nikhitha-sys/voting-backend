import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/User.js";
import Otp from "../models/Otp.js";

const JWT_SECRET = "supersecretjwtkey"; // ⚠️ move this to .env in production

// ✅ Signup
export const signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error("❌ Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Login + Send OTP
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP
    await Otp.findOneAndUpdate(
      { email },
      { email, code: otpCode, createdAt: new Date() },
      { upsert: true }
    );

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "your_email@gmail.com", // replace
        pass: "your_app_password", // replace with Gmail app password
      },
    });

    await transporter.sendMail({
      from: "your_email@gmail.com",
      to: email,
      subject: "Your Voting System OTP",
      text: `Your OTP is: ${otpCode}. It will expire in 5 minutes.`,
    });

    res.json({ message: "Login successful, OTP generated" });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Verify OTP and issue JWT
export const verifyOtp = async (req, res) => {
  try {
    const { email, code } = req.body;

    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({ message: "OTP not found. Please login again." });
    }

    const now = new Date();
    const otpAge = (now - otpRecord.createdAt) / 1000 / 60;
    if (otpAge > 5) {
      return res.status(400).json({ message: "OTP expired. Please login again." });
    }

    if (otpRecord.code !== code) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Delete OTP
    await Otp.deleteOne({ email });

    // Generate JWT
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ message: "OTP verified successfully", token });
  } catch (err) {
    console.error("❌ OTP verify error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
