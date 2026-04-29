import express from "express";
import { optionalAuthenticateToken } from "../middlewares/auth.middleware.js";

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

router.get("/feed", getFeed);
router.get("/explore", getExplore);
router.get("/category/:category", getByCategory);
router.get("/search", search);
router.get("/trending", getTrending);
router.get("/saved", getSaved);

router.post("/:id/like", likeProject);
router.post("/:id/save", saveProject);

router.get("/:id/comments", getProjectComments);
router.post("/:id/comments", createProjectComment);

router.delete("/:id", deleteProject);

router.get("/", getAll);
router.post("/", optionalAuthenticateToken, create);

export default router;