import { getRepository } from "../config/db.js";
import NotificationSchema from "../entities/Notification.js";

export async function create(notification) {
  const repository = await getRepository(NotificationSchema);
  return repository.save(notification);
}

export async function findByUserId(userId, type) {
  const repository = await getRepository(NotificationSchema);
  const baseQuery = `
    SELECT n.*, u.username AS from_username, u.avatar_url AS from_avatar_url
    FROM notifications n
    LEFT JOIN users u ON u.id = n.from_user_id
    WHERE n.user_id = $1
  `;
  const params = [userId];
  const query = type
    ? `${baseQuery} AND n.type = $2 ORDER BY n.created_at DESC`
    : `${baseQuery} ORDER BY n.created_at DESC`;

  return repository.query(query, params);
}

export async function markAsRead(notificationId, userId) {
  const repository = await getRepository(NotificationSchema);
  const notification = await repository.findOneBy({ id: notificationId, user_id: userId });
  if (!notification) return null;
  notification.is_read = true;
  return repository.save(notification);
}

export async function markAllAsRead(userId) {
  const repository = await getRepository(NotificationSchema);
  return repository.query(
    `UPDATE notifications SET is_read = true WHERE user_id = $1 RETURNING *`,
    [userId]
  );
}
