import * as repo from "../repositories/ProjectRepository.js";
import * as likeRepo from "../repositories/LikeRepository.js";
import * as saveRepo from "../repositories/SaveRepository.js";
import { getCache, setCache } from "../utils/cache.js";

function parseTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.filter(Boolean);

  if (typeof tags === "string") {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
      return tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function normalizeProject(project) {
  if (!project) return null;
  return {
    ...project,
    tags: parseTags(project.tags),
  };
}

function normalizeProjects(projects) {
  return Array.isArray(projects) ? projects.map(normalizeProject) : [];
}

export async function getAll() {
  const cached = getCache("projects");
  if (cached) return cached;

  const data = await repo.findAll();
  const normalized = normalizeProjects(data);
  setCache("projects", normalized);
  return normalized;
}

export async function create(data, userId = null) {
  if (!data.title) {
    throw { status: 400, message: "Título obrigatório" };
  }

  const createdProject = await repo.create({
    ...data,
    tags: Array.isArray(data.tags) ? JSON.stringify(data.tags) : data.tags,
    user_id: userId,
  });

  const normalized = normalizeProject(createdProject);
  setCache("projects", null);
  setCache("feed", null);

  return normalized;
}

export async function search(query) {
  if (!query || typeof query !== 'string') {
    return [];
  }

  const data = await repo.searchProjects(query.trim());
  return normalizeProjects(data);
}

export async function getByUserId(userId) {
  const data = await repo.findByUserId(userId);
  return normalizeProjects(data);
}

export async function getByCategory(category) {
  const data = await repo.findByCategory(category);
  return normalizeProjects(data);
}

export async function getSaved(userId, category) {
  if (!userId) {
    throw { status: 401, message: "Sem token" };
  }

  const data = await saveRepo.findSavedByUserId(userId, category);
  return data.map((project) => ({
    ...project,
    user: {
      id: project.user_id,
      username: project.username,
      full_name: project.full_name,
      avatar_url: project.avatar_url,
      banner_url: project.banner_url,
    },
    tags: parseTags(project.tags),
  }));
}

export async function getFeed(userId) {
  const cached = getCache("feed");
  if (cached) return cached;

  const data = await repo.findAll();
  const normalized = normalizeProjects(data);
  setCache("feed", normalized);
  return normalized;
}

export async function likeProject(projectId, userId) {
  if (!userId) {
    throw { status: 401, message: "Sem token" };
  }

  const project = await repo.findById(Number(projectId));
  if (!project) {
    throw { status: 404, message: "Projeto não encontrado" };
  }

  const existingLike = await likeRepo.findByUserAndProject(userId, project.id);
  if (existingLike) {
    await likeRepo.remove(userId, project.id);
    project.likes_count = Math.max((project.likes_count || 1) - 1, 0);
  } else {
    await likeRepo.create(userId, project.id);
    project.likes_count = (project.likes_count || 0) + 1;
  }

  await repo.save(project);
  setCache("projects", null);
  setCache("feed", null);

  return { project_id: project.id, likes_count: project.likes_count, liked: !existingLike };
}

export async function saveProject(projectId, userId) {
  if (!userId) {
    throw { status: 401, message: "Sem token" };
  }

  const existingSave = await saveRepo.findByUserAndProject(userId, Number(projectId));
  if (existingSave) {
    await saveRepo.remove(userId, Number(projectId));
    return { project_id: Number(projectId), saved: false };
  }

  await saveRepo.create(userId, Number(projectId));
  return { project_id: Number(projectId), saved: true };
}