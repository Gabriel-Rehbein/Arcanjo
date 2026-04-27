import { getRepository } from "../config/db.js";
import MessageSchema from "../entities/Message.js";

export async function create(message) {
  const repository = await getRepository(MessageSchema);
  return repository.save(message);
}

export async function findMessagesBetween(userId, otherUserId) {
  const repository = await getRepository(MessageSchema);
  return repository.query(
    `
      SELECT *
      FROM messages
      WHERE (sender_id = $1 AND receiver_id = $2)
         OR (sender_id = $2 AND receiver_id = $1)
      ORDER BY created_at ASC
    `,
    [userId, otherUserId]
  );
}

export async function findConversations(userId) {
  const repository = await getRepository(MessageSchema);
  return repository.query(
    `
      SELECT
        contact_id,
        u.id AS user_id,
        u.username,
        u.full_name,
        u.avatar_url,
        MAX(created_at) AS last_at,
        SUBSTRING(MAX(content) FROM 1 FOR 100) AS last_message
      FROM (
        SELECT
          sender_id,
          receiver_id,
          content,
          created_at,
          CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END AS contact_id
        FROM messages
        WHERE sender_id = $1 OR receiver_id = $1
      ) AS convo
      LEFT JOIN users u ON u.id = convo.contact_id
      GROUP BY contact_id, u.id, u.username, u.full_name, u.avatar_url
      ORDER BY last_at DESC
    `,
    [userId]
  );
}
