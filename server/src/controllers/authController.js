import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { sendVerificationCodeEmail } from "../services/mailer.js";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const issueToken = (userId) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return jwt.sign({ sub: userId }, jwtSecret, { expiresIn: "7d" });
};

const generateVerificationCode = () =>
  String(Math.floor(100000 + Math.random() * 900000));

export const register = async (req, res, next) => {
  try {
    const name = req.body?.name?.trim?.() || "";
    const email = req.body?.email?.trim?.().toLowerCase() || "";
    const password = req.body?.password || "";

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Please provide a valid email." });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationCode = generateVerificationCode();
    const verificationExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const user = await User.create({
      name,
      email,
      passwordHash,
      isVerified: false,
      verificationCode,
      verificationExpiresAt,
    });

    sendVerificationCodeEmail({ email, name, code: verificationCode }).catch((error) => {
      console.error("Verification email send failed:", error.message);
    });

    return res.status(201).json({
      message: "Registration successful. Please verify your email with the 6-digit code.",
      userId: user._id,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const email = req.body?.email?.trim?.().toLowerCase() || "";
    const code = req.body?.code?.trim?.() || "";

    if (!email || !code) {
      return res.status(400).json({ error: "Email and verification code are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (user.isVerified) {
      return res.status(200).json({ message: "Email is already verified." });
    }

    if (
      !user.verificationCode ||
      user.verificationCode !== code ||
      !user.verificationExpiresAt ||
      user.verificationExpiresAt.getTime() < Date.now()
    ) {
      return res.status(400).json({ error: "Invalid or expired verification code." });
    }

    user.isVerified = true;
    user.verificationCode = "";
    user.verificationExpiresAt = null;
    await user.save();

    return res.status(200).json({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    next(error);
  }
};

export const resendVerificationCode = async (req, res, next) => {
  try {
    const email = req.body?.email?.trim?.().toLowerCase() || "";
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: "This email is already verified." });
    }

    const verificationCode = generateVerificationCode();
    user.verificationCode = verificationCode;
    user.verificationExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    sendVerificationCodeEmail({ email, name: user.name, code: verificationCode }).catch((error) => {
      console.error("Verification resend failed:", error.message);
    });

    return res.status(200).json({ message: "Verification code resent." });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const email = req.body?.email?.trim?.().toLowerCase() || "";
    const password = req.body?.password || "";

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: "Please verify your email before logging in." });
    }

    const token = issueToken(user._id.toString());

    return res.status(200).json({
      message: "Logged in successfully.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (req, res) => {
  res.status(200).json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      isVerified: req.user.isVerified,
    },
  });
};
