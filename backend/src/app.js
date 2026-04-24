import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import userRoutes from "./routes/user.routes.js";
import storyRoutes from "./routes/story.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import { testConnection } from "./config/db.js";

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 API
app.use("/auth", authRoutes);
app.use("/projects", projectRoutes);
app.use("/users", userRoutes);
app.use("/stories", storyRoutes);

app.use(errorMiddleware);

app.listen(3000, async () => {
  const url = "http://localhost:3000";
  try {
    await testConnection();
    console.log("✅ Banco de dados conectado com sucesso");
  } catch (err) {
    console.error("❌ Falha ao conectar ao banco de dados:", err.message || err);
    process.exit(1);
  }

  console.log(`🚀 Backend rodando em ${url}`);
});
