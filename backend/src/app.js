import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import open from "open";

import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import { testConnection } from "./config/db.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔥 caminho correto do frontend
const frontendPath = path.join(__dirname, "../../frontend");

app.use(cors());
app.use(express.json());

// 🔥 serve css, js, etc
app.use(express.static(frontendPath));

// 🔥 API
app.use("/auth", authRoutes);
app.use("/projects", projectRoutes);

// 🔥 abre login automaticamente
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "legacy-pages/login.html"));
});

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

  console.log(`🚀 ${url}`);

  // 🔥 abre automaticamente no navegador
  await open(url);
});
