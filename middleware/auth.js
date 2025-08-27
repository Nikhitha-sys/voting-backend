// middleware/auth.js
import jwt from "jsonwebtoken";

export const requireAuth = (req, res, next) => {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { email }
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
