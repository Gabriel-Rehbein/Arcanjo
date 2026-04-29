import { Router } from "express";

import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controllers/NotificationController.js";

const router = Router();

router.get("/", getUserNotifications);
router.put("/:id/read", markNotificationAsRead);
router.put("/read-all", markAllNotificationsAsRead);

export default router;