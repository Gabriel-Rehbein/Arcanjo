import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controllers/NotificationController.js";

const router = Router();

router.use(authenticateToken);

router.get("/", getUserNotifications);
router.put("/:id/read", markNotificationAsRead);
router.put("/read-all", markAllNotificationsAsRead);

export default router;