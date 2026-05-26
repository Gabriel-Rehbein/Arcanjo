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
    content: message.is_deleted ? '[Mensagem removida]' : message.content,
    is_own: message.sender_id === userId,
  }));
}

export async function editMessage(userId, messageId, content) {
  if (!userId) {
    throw { status: 401, message: 'Sem token' };
  }

  if (!messageId || !content || !content.trim()) {
    throw { status: 400, message: 'Conteúdo de mensagem inválido' };
  }

  const message = await repo.findById(messageId);
  if (!message) {
    throw { status: 404, message: 'Mensagem não encontrada' };
  }

  if (message.sender_id !== userId) {
    throw { status: 403, message: 'Ação não autorizada' };
  }

  if (message.is_deleted) {
    throw { status: 400, message: 'Não é possível editar uma mensagem removida' };
  }

  await repo.editMessageContent(messageId, content);

  return repo.findById(messageId);
}

export async function deleteMessage(userId, messageId) {
  if (!userId) {
    throw { status: 401, message: 'Sem token' };
  }

  if (!messageId) {
    throw { status: 400, message: 'ID de mensagem inválido' };
  }

  const message = await repo.findById(messageId);
  if (!message) {
    throw { status: 404, message: 'Mensagem não encontrada' };
  }

  if (message.sender_id !== userId) {
    throw { status: 403, message: 'Ação não autorizada' };
  }

  return repo.softDeleteMessage(messageId);
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
