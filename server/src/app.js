import cors from "cors";
import express from "express";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import screenshotRoutes from "./routes/screenshotRoutes.js";

const app = express();

const normalizeOrigin = (origin) => origin.replace(/\/+$/, "");

const normalizedClientOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)
  .map((origin) =>
    origin.startsWith("http://") || origin.startsWith("https://")
      ? origin
      : `https://${origin}`
  )
  .map(normalizeOrigin);

const allowVercelPreviewOrigins = process.env.ALLOW_VERCEL_PREVIEWS === "true";

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const normalizedOrigin = normalizeOrigin(origin);
      if (normalizedClientOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      if (allowVercelPreviewOrigins) {
        try {
          const parsed = new URL(normalizedOrigin);
          if (parsed.hostname.endsWith(".vercel.app")) {
            return callback(null, true);
          }
        } catch {
          // Ignore parse errors and continue to rejection.
        }
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/screenshots", screenshotRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;
