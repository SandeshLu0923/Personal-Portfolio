import app from "./app.js";
import { connectDB } from "./config/db.js";
import { loadEnv } from "./config/loadEnv.js";

loadEnv();

const port = Number(process.env.PORT) || 5000;

const listenWithFallback = (startPort, maxAttempts = 10) =>
  new Promise((resolve, reject) => {
    let attempts = 0;
    let currentPort = startPort;

    const tryListen = () => {
      const server = app.listen(currentPort, () => {
        console.log(`Server running on http://localhost:${currentPort}`);
        resolve(server);
      });

      server.on("error", (error) => {
        if (error.code === "EADDRINUSE" && attempts < maxAttempts - 1) {
          attempts += 1;
          currentPort += 1;
          console.warn(
            `Port ${currentPort - 1} is in use. Trying port ${currentPort}...`
          );
          setTimeout(tryListen, 50);
          return;
        }
        reject(error);
      });
    };

    tryListen();
  });

const start = async () => {
  try {
    await connectDB();
    await listenWithFallback(port);
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

start();
