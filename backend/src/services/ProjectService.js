import * as repo from "../repositories/ProjectRepository.js";
import { getCache, setCache } from "../utils/cache.js";

export async function getAll() {
  const cached = getCache("projects");
  if (cached) return cached;

  const data = await repo.findAll();
  setCache("projects", data);
  return data;
}

export async function create(data, userId) {
  if (!data.title) {
    throw { status: 400, message: "Título obrigatório" };
  }

  return await repo.create({
    ...data,
    user_id: userId,
  });
}