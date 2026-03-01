import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : "";

    if (!token) {
      return res.status(401).json({ error: "Authorization token is required." });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ error: "JWT_SECRET is not configured." });
    }

    const payload = jwt.verify(token, jwtSecret);
    const user = await User.findById(payload.sub).lean();

    if (!user) {
      return res.status(401).json({ error: "Invalid authentication token." });
    }

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired authentication token." });
  }
};
