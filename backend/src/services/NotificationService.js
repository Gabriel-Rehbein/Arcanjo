import * as repo from "../repositories/NotificationRepository.js";

export async function getNotifications(userId, type) {
  return await repo.findByUserId(userId, type);
}

export async function markAsRead(notificationId, userId) {
  const notification = await repo.markAsRead(notificationId, userId);
  if (!notification) {
    throw { status: 404, message: "Notificação não encontrada" };
  }
  return notification;
}

export async function markAllAsRead(userId) {
  return await repo.markAllAsRead(userId);
}

export async function createNotification(data) {
  return await repo.create(data);
}
