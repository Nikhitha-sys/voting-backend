// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

const app = express();
app.use(express.json());
app.use(cors());

// -------------------- MongoDB Connection --------------------
mongoose
  .connect("mongodb://127.0.0.1:27017/votingdb")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// -------------------- Schemas --------------------
const candidateSchema = new mongoose.Schema({
  id: String,
  name: String,
  votes: { type: Number, default: 0 },
});

const ballotSchema = new mongoose.Schema({
  title: String,
  description: String,
  candidates: [candidateSchema],
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  otp: String,
  votes: [
    {
      ballotId: String,       
      candidateId: String     
    }
  ],
});

export const Ballot = mongoose.model("Ballot", ballotSchema);
const User = mongoose.model("User", userSchema);

// -------------------- Auth Middleware --------------------
const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, "secret123");
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

// -------------------- Email Transporter --------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "vakkalanikhitha@gmail.com", 
    pass: "sfjm vhws srux cqin",    
  },
});

// -------------------- Routes --------------------

// Signup
app.post("/api/signup", async (req, res) => {
  const { email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ error: "Email already exists" });

  const hashed = await bcrypt.hash(password, 10);
  await User.create({ email, password: hashed });
  res.json({ message: "✅ User created" });
});

// Login (send OTP)
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: "Invalid password" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  await user.save();

  await transporter.sendMail({
    from: "your_email@gmail.com",
    to: email,
    subject: "Your OTP for Voting System",
    text: `Your OTP is: ${otp}`,
  });

  res.json({ message: "OTP sent to email" });
});

// Verify OTP
app.post("/api/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email, otp });
  if (!user) return res.status(400).json({ error: "Invalid OTP" });

  user.otp = null;
  await user.save();

  const token = jwt.sign({ email }, "secret123", { expiresIn: "1h" });
  res.json({ token });
});

// Get Ballots
app.get("/api/ballots", authMiddleware, async (req, res) => {
  const ballots = await Ballot.find();
  res.json(ballots);
});

// Submit Vote (one vote per ballot per user)
app.post("/api/vote", authMiddleware, async (req, res) => {
  const { ballotId, candidateId } = req.body;
  const user = await User.findOne({ email: req.user.email });
  if (!user) return res.status(400).json({ error: "User not found" });

  const alreadyVoted = user.votes.find(v => v.ballotId === ballotId);
  if (alreadyVoted) return res.status(400).json({ error: "Already voted" });

  const ballot = await Ballot.findById(ballotId);
  if (!ballot) return res.status(404).json({ error: "Ballot not found" });

  const candidate = ballot.candidates.find(c => c.id === candidateId);
  if (!candidate) return res.status(404).json({ error: "Candidate not found" });

  candidate.votes += 1;
  await ballot.save();

  user.votes.push({ ballotId, candidateId });
  await user.save();

  res.json({ message: "✅ Vote submitted successfully" });
});

// Get Results
app.get("/api/results", authMiddleware, async (req, res) => {
  const ballots = await Ballot.find();
  res.json(ballots);
});

// -------------------- Start Server --------------------
app.listen(5000, () => {
  console.log("✅ Server running on http://localhost:5000");
});
