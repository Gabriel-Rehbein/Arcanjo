import * as repo from "../repositories/StoryRepository.js";

export async function getAll() {
  return await repo.findAll();
}

export async function getByUserId(userId) {
  return await repo.findByUserId(userId);
}

export async function create(data, userId) {
  if (!data.image_url) {
    throw { status: 400, message: "Imagem obrigatória" };
  }

  // Define expiração em 24 horas
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  return await repo.create({
    ...data,
    user_id: userId,
    expires_at: expiresAt,
  });
}