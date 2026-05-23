import express from "express";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import userRoutes from "./routes/user.routes.js";
import messageRoutes from "./routes/message.routes.js";
import storyRoutes from "./routes/story.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import { testConnection } from "./config/db.js";
import { seedDatabase } from "./seed.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use("/auth", authRoutes);
app.use("/projects", projectRoutes);
app.use("/users", userRoutes);
app.use("/messages", messageRoutes);
app.use("/stories", storyRoutes);
app.use("/notifications", notificationRoutes);

app.use(errorMiddleware);

app.listen(3000, async () => {
  try {
    await testConnection();
    console.log("✅ Banco conectado");
    await seedDatabase();
  } catch (err) {
    console.error("❌ Erro banco:", err.message || err);
    process.exit(1);
  }

  console.log("🚀 Backend rodando em http://localhost:3000");
});