import express from "express";
import auth from "../middlewares/auth.middleware.js";
import { getAll, create } from "../controllers/ProjectController.js";

const router = express.Router();

router.get("/", getAll);
router.post("/", auth, create);

export default router;