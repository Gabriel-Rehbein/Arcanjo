import * as repo from "../repositories/MessageRepository.js";
import * as notificationService from "./NotificationService.js";

export async function getConversations(userId) {
  const conversations = await repo.findConversations(userId);
  return Array.isArray(conversations)
    ? conversations.map((conv) => ({
        id: conv.contact_id || conv.user_id,
        username: conv.username,
        full_name: conv.full_name,
        avatar_url: conv.avatar_url,
        last_message: conv.last_message,
        last_at: conv.last_at,
      }))
    : [];
}

export async function getMessages(userId, otherUserId) {
  const messages = await repo.findMessagesBetween(userId, otherUserId);
  return messages.map((message) => ({
    ...message,
    is_own: message.sender_id === userId,
  }));
}

export async function sendMessage(senderId, receiverId, content) {
  if (!senderId) {
    throw { status: 401, message: "Sem token" };
  }

  if (!receiverId || !content) {
    throw { status: 400, message: "Dados de mensagem inválidos" };
  }

  const message = await repo.create({
    sender_id: senderId,
    receiver_id: receiverId,
    content,
  });

  await notificationService.createNotification({
    user_id: receiverId,
    from_user_id: senderId,
    type: "message",
    message: "Enviou uma nova mensagem",
  });

  return message;
}
