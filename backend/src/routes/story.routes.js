import express from "express";
import * as storyService from "../services/StoryService.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Retornar stories do feed (stories não expiradas)
router.get("/feed", async (req, res) => {
  try {
    const stories = await storyService.getAll();
    const now = new Date();
    const activeStories = stories.filter(story => new Date(story.expires_at) > now);
    res.json(activeStories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar uma nova story
router.post("/", authenticateToken, async (req, res) => {
  try {
    const story = await storyService.create(req.body, req.user.id);
    res.status(201).json(story);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

// Obter stories de um usuário
router.get("/user/:userId", authenticateToken, async (req, res) => {
  try {
    const stories = await storyService.getByUserId(req.params.userId);
    res.json(stories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
