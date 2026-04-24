import express from "express";
import auth from "../middlewares/auth.middleware.js";
import { getAll, create, search, getFeed } from "../controllers/ProjectController.js";

const router = express.Router();

router.get("/feed", getFeed);
router.get("/search", search);
router.get("/", getAll);
router.post("/", auth, create);

export default router;