import { Router } from 'express';

import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../controllers/NotificationController.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { notificationIdSchema, notificationListSchema } from '../validation/schemas.js';

const router = Router();

router.use(authenticateToken);
router.get('/', validate(notificationListSchema), getUserNotifications);
router.put('/read-all', markAllNotificationsAsRead);
router.put('/:id/read', validate(notificationIdSchema), markNotificationAsRead);

export default router;
