import express from 'express';
import * as storyService from '../services/StoryService.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/feed', async (req, res, next) => {
  try {
    const stories = await storyService.getAll();
    const now = new Date();
    const activeStories = stories.filter((story) => new Date(story.expires_at) > now);
    res.json(activeStories);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const story = await storyService.create(req.body, req.user.id);
    res.status(201).json(story);
  } catch (error) {
    next(error);
  }
});

router.get('/user/:userId', authenticateToken, async (req, res, next) => {
  try {
    const stories = await storyService.getByUserId(req.params.userId);
    res.json(stories);
  } catch (error) {
    next(error);
  }
});

export default router;
