import express from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";

import {
  getAll,
  create,
  search,
  getFeed,
  getExplore,
  getByCategory,
  getTrending,
  getSaved,
  likeProject,
  saveProject,
  deleteProject,
  getProjectComments,
  createProjectComment
} from "../controllers/ProjectController.js";

const router = express.Router();

router.get("/feed", authenticateToken, getFeed);
router.get("/explore", getExplore);
router.get("/category/:category", getByCategory);
router.get("/search", search);
router.get("/trending", getTrending);
router.get("/saved", authenticateToken, getSaved);

router.post("/:id/like", authenticateToken, likeProject);
router.post("/:id/save", authenticateToken, saveProject);

router.get("/:id/comments", getProjectComments);
router.post("/:id/comments", authenticateToken, createProjectComment);

router.delete("/:id", authenticateToken, deleteProject);

router.get("/", getAll);
router.post("/", authenticateToken, create);

export default router;