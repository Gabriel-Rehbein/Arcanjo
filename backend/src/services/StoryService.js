import * as repo from "../repositories/StoryRepository.js";
import { assertSafeImageUrl } from "../utils/contentSafety.js";

const STORY_TTL_HOURS = 20;

export async function getAll() {
  return await repo.findAll();
}

export async function getByUserId(userId) {
  return await repo.findByUserId(userId);
}

export async function create(data, userId) {
  if (!data.image_url) {
    throw { status: 400, message: "Imagem obrigatoria" };
  }

  const imageUrl = assertSafeImageUrl(data.image_url, "Imagem da story");

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + STORY_TTL_HOURS);

  return await repo.create({
    ...data,
    image_url: imageUrl,
    user_id: userId,
    expires_at: expiresAt,
  });
}
