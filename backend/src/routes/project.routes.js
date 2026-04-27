import express from "express";
import { optionalAuthenticateToken } from "../middlewares/auth.middleware.js";
import { getAll, create, search, getFeed, getExplore, getByCategory } from "../controllers/ProjectController.js";

const router = express.Router();

router.get("/feed", getFeed);
router.get("/explore", getExplore);
router.get("/category/:category", getByCategory);
router.get("/search", search);
router.get("/", getAll);
router.post("/", optionalAuthenticateToken, create);

export default router;