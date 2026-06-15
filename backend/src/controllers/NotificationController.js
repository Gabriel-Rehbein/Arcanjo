import { getNotifications, markAsRead, markAllAsRead } from '../services/NotificationService.js';

export async function getUserNotifications(req, res, next) {
  try {
    const userId = req.user.id;
    const type = req.query.type;

    const notifications = await getNotifications(userId, type);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
}

export async function markNotificationAsRead(req, res, next) {
  try {
    const notificationId = parseInt(req.params.id);
    const userId = req.user.id;

    const notification = await markAsRead(notificationId, userId);
    res.json(notification);
  } catch (error) {
    next(error);
  }
}

export async function markAllNotificationsAsRead(req, res, next) {
  try {
    const userId = req.user.id;

    const notifications = await markAllAsRead(userId);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
}
