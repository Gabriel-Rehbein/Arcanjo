import { getNotifications, markAsRead, markAllAsRead } from "../services/NotificationService.js";

export async function getUserNotifications(req, res) {
  try {
    const userId = req.user.id;
    const type = req.query.type;
    const notifications = await getNotifications(userId, type);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function markNotificationAsRead(req, res) {
  try {
    const notificationId = parseInt(req.params.id);
    const userId = req.user.id;
    const notification = await markAsRead(notificationId, userId);
    res.json(notification);
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
}

export async function markAllNotificationsAsRead(req, res) {
  try {
    const userId = req.user.id;
    const notifications = await markAllAsRead(userId);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}