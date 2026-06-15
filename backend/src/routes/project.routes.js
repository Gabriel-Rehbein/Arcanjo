import express from 'express';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  commentCreateSchema,
  projectCreateSchema,
  projectIdSchema,
  projectScheduleSchema,
} from '../validation/schemas.js';

import {
  getAll,
  create,
  search,
  getFeed,
  getExplore,
  getByCategory,
  getByPublicationType,
  getTrending,
  getSaved,
  getScheduled,
  getProfileStats,
  likeProject,
  saveProject,
  deleteProject,
  getProjectComments,
  createProjectComment,
  updateScheduled,
} from '../controllers/ProjectController.js';

const router = express.Router();

router.get('/feed', authenticateToken, getFeed);
router.get('/explore', getExplore);
router.get('/category/:category', getByCategory);
router.get('/type/:postType', getByPublicationType);
router.get('/search', search);
router.get('/trending', getTrending);
router.get('/saved', authenticateToken, getSaved);
router.get('/scheduled', authenticateToken, getScheduled);
router.get('/profile-stats', authenticateToken, getProfileStats);

router.post('/:id/like', authenticateToken, validate(projectIdSchema), likeProject);
router.post('/:id/save', authenticateToken, validate(projectIdSchema), saveProject);

router.get('/:id/comments', validate(projectIdSchema), getProjectComments);
router.post(
  '/:id/comments',
  authenticateToken,
  validate(commentCreateSchema),
  createProjectComment
);

router.delete('/:id', authenticateToken, validate(projectIdSchema), deleteProject);
router.put('/:id/schedule', authenticateToken, validate(projectScheduleSchema), updateScheduled);

router.get('/', getAll);
router.post('/', authenticateToken, validate(projectCreateSchema), create);

export default router;
