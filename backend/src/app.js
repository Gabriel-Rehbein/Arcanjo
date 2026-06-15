import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import userRoutes from "./routes/user.routes.js";
import messageRoutes from "./routes/message.routes.js";
import storyRoutes from "./routes/story.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import { apiRateLimit, authRateLimit } from "./middlewares/rateLimit.middleware.js";
import { testConnection } from "./config/db.js";
import { seedDatabase } from "./seed.js";
import { startBotSimulation, stopBotSimulation } from "./services/BotService.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((origin) => origin.trim())
  : ["http://localhost:3001"];

app.use(express.json());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use("/auth", authRateLimit);
app.use(apiRateLimit);
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use("/auth", authRoutes);
app.use("/projects", projectRoutes);
app.use("/users", userRoutes);
app.use("/messages", messageRoutes);
app.use("/stories", storyRoutes);
app.use("/notifications", notificationRoutes);

app.use(errorMiddleware);

const server = app.listen(PORT, async () => {
  try {
    await testConnection();
    console.log("✅ Banco conectado");

    if (process.env.RUN_SEED === "true") {
      await seedDatabase();
    }

    await startBotSimulation();
  } catch (err) {
    console.error("❌ Erro banco:", err.message || err);
    process.exit(1);
  }

  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
});

process.on("SIGINT", () => {
  stopBotSimulation();
  server.close(() => process.exit(0));
});

process.on("SIGTERM", () => {
  stopBotSimulation();
  server.close(() => process.exit(0));
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Porta ${PORT} já está em uso. Pare o processo que usa essa porta ou defina PORT diferente.`);
    process.exit(1);
  }

  console.error("❌ Erro no servidor:", err);
  process.exit(1);
});
