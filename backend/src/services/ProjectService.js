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

export async function search(query) {
  if (!query || typeof query !== 'string') {
    return [];
  }

  return await repo.searchProjects(query.trim());
}

export async function getFeed(userId) {
  // Retorna projetos públicos (feed simples)
  // TODO: Implementar busca de projetos dos usuários que o user segue
  const cached = getCache("feed");
  if (cached) return cached;

  const data = await repo.findAll();
  const publicProjects = data.filter(p => p.is_public !== false);
  setCache("feed", publicProjects);
  return publicProjects;
}