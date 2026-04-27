import * as repo from "../repositories/MessageRepository.js";
import * as notificationService from "./NotificationService.js";

export async function getConversations(userId) {
  return await repo.findConversations(userId);
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
