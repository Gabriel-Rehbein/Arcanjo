import * as messageService from "../services/MessageService.js";

export async function getConversations(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Autenticação necessária" });

    const conversations = await messageService.getConversations(userId);
    res.json(conversations);
  } catch (err) {
    next(err);
  }
}

export async function getMessages(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Autenticação necessária" });

    const otherUserId = Number(req.params.userId);
    if (!otherUserId) return res.status(400).json({ error: "ID de usuário inválido" });

    const messages = await messageService.getMessages(userId, otherUserId);
    res.json(messages);
  } catch (err) {
    next(err);
  }
}

export async function sendMessage(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Autenticação necessária" });

    const { receiver_id, content } = req.body || {};
    const receiverId = Number(receiver_id);

    const message = await messageService.sendMessage(userId, receiverId, String(content || "").trim());
    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
}
