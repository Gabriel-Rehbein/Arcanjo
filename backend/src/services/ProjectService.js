import * as repo from "../repositories/ProjectRepository.js";
import * as likeRepo from "../repositories/LikeRepository.js";
import * as saveRepo from "../repositories/SaveRepository.js";
import { getCache, setCache } from "../utils/cache.js";
import * as commentRepo from "../repositories/CommentRepository.js";
import { assertSafeContent, assertSafeImageUrl, assertSafeUrl } from "../utils/contentSafety.js";

const TEST_USER_ID = 1;

function parseTags(tags) {
  if (!tags) return [];

  if (Array.isArray(tags)) {
    return tags.filter(Boolean);
  }

  if (typeof tags === "string") {
    try {
      const parsed = JSON.parse(tags);

      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean);
      }
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

  const scheduledAt = project.scheduled_at ? new Date(project.scheduled_at) : null;
  const isScheduled = scheduledAt && scheduledAt > new Date();

  return {
    ...project,
    tags: parseTags(project.tags),
    status: isScheduled ? "scheduled" : project.status || "published",
    is_scheduled: Boolean(isScheduled),
  };
}

function normalizeProjects(projects) {
  return Array.isArray(projects) ? projects.map(normalizeProject) : [];
}

function sanitizeComment(comment) {
  if (!comment) return comment;

  const { user, ...safeComment } = comment;

  if (!user) {
    return safeComment;
  }

  const { password, ...safeUser } = user;
  void password;

  return {
    ...safeComment,
    user: safeUser,
  };
}

export async function getAll() {
  const cached = getCache("projects");

  if (cached) {
    const hasUsers = Array.isArray(cached) && cached.every((p) => p.user || p.author || p.user_id);
    if (hasUsers) return cached;
  }

  const data = await repo.findAll();
  const normalized = normalizeProjects(data);

  setCache("projects", normalized);

  return normalized;
}

export async function create(data, userId = TEST_USER_ID) {
  if (!data.title || !data.title.trim()) {
    throw { status: 400, message: "Título obrigatório" };
  }

  const tags = parseTags(data.tags);
  const title = data.title.trim();
  const description = String(data.description || "").trim();

  assertSafeContent({
    titulo: title,
    descricao: description,
    categoria: data.category,
    tags,
  });

  const imageUrl = assertSafeImageUrl(data.image_url, "URL da imagem");
  const projectLink = assertSafeUrl(data.link, "Link do projeto");
  const scheduledAt = data.scheduled_at ? new Date(data.scheduled_at) : null;
  const isScheduled = scheduledAt && !Number.isNaN(scheduledAt.getTime()) && scheduledAt > new Date();

  if (data.scheduled_at && Number.isNaN(scheduledAt.getTime())) {
    throw { status: 400, message: "Data de agendamento invalida" };
  }

  const createdProject = await repo.create({
    ...data,
    title,
    description,
    image_url: imageUrl || null,
    link: projectLink || null,
    tags: JSON.stringify(tags),
    scheduled_at: scheduledAt || null,
    is_public: !isScheduled,
    status: isScheduled ? "scheduled" : "published",
    user_id: userId || TEST_USER_ID,
  });

  const normalized = normalizeProject(createdProject);

  setCache("projects", null);
  setCache("feed", null);

  return normalized;
}

export async function search(query) {
  if (!query || typeof query !== "string") {
    return [];
  }

  const data = await repo.searchProjects(query.trim());

  return normalizeProjects(data);
}

export async function getByUserId(userId = TEST_USER_ID) {
  const data = await repo.findByUserId(userId || TEST_USER_ID);

  return normalizeProjects(data);
}

export async function getScheduledByUserId(userId = TEST_USER_ID) {
  const data = await repo.findScheduledByUserId(userId || TEST_USER_ID);

  return normalizeProjects(data);
}

export async function getProfileStats(userId = TEST_USER_ID) {
  const projects = await repo.findByUserId(userId || TEST_USER_ID, true);
  const normalized = normalizeProjects(projects);
  const saves_count = await saveRepo.countSavesForProjectOwner(userId || TEST_USER_ID);

  const totals = normalized.reduce(
    (acc, project) => ({
      projects_count: acc.projects_count + 1,
      scheduled_count: acc.scheduled_count + (project.is_scheduled ? 1 : 0),
      published_count: acc.published_count + (project.is_scheduled ? 0 : 1),
      likes_count: acc.likes_count + Number(project.likes_count || 0),
      comments_count: acc.comments_count + Number(project.comments_count || 0),
      views_count: acc.views_count + Number(project.views_count || 0),
    }),
    {
      projects_count: 0,
      scheduled_count: 0,
      published_count: 0,
      likes_count: 0,
      comments_count: 0,
      views_count: 0,
    }
  );

  return {
    ...totals,
    saves_count,
  };
}

export async function getByCategory(category) {
  const data = await repo.findByCategory(category);

  return normalizeProjects(data);
}

export async function getSaved(userId = TEST_USER_ID, category) {
  const data = await saveRepo.findSavedByUserId(
    userId || TEST_USER_ID,
    category
  );

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

export async function getFeed(userId = TEST_USER_ID) {
  const cached = getCache("feed");

  if (cached) {
    const hasUsers = Array.isArray(cached) && cached.every((p) => p.user || p.author || p.user_id);
    if (hasUsers) return cached;
  }

  const data = await repo.findAll(userId || TEST_USER_ID);
  const normalized = normalizeProjects(data);

  setCache("feed", normalized);

  return normalized;
}

export async function likeProject(projectId, userId = TEST_USER_ID) {
  const fixedUserId = userId || TEST_USER_ID;
  const fixedProjectId = Number(projectId);

  if (!fixedProjectId) {
    throw { status: 400, message: "ID do projeto inválido" };
  }

  const project = await repo.findById(fixedProjectId);

  if (!project) {
    throw { status: 404, message: "Projeto não encontrado" };
  }

  const existingLike = await likeRepo.findByUserAndProject(
    fixedUserId,
    fixedProjectId
  );

  if (existingLike) {
    await likeRepo.remove(fixedUserId, fixedProjectId);
    project.likes_count = Math.max((project.likes_count || 1) - 1, 0);
  } else {
    await likeRepo.create(fixedUserId, fixedProjectId);
    project.likes_count = (project.likes_count || 0) + 1;
  }

  await repo.save(project);

  setCache("projects", null);
  setCache("feed", null);

  return {
    project_id: fixedProjectId,
    likes_count: project.likes_count,
    liked: !existingLike,
  };
}

export async function saveProject(projectId, userId = TEST_USER_ID) {
  const fixedUserId = userId || TEST_USER_ID;
  const fixedProjectId = Number(projectId);

  if (!fixedProjectId) {
    throw { status: 400, message: "ID do projeto inválido" };
  }

  const project = await repo.findById(fixedProjectId);

  if (!project) {
    throw { status: 404, message: "Projeto não encontrado" };
  }

  const existingSave = await saveRepo.findByUserAndProject(
    fixedUserId,
    fixedProjectId
  );

  if (existingSave) {
    await saveRepo.remove(fixedUserId, fixedProjectId);

    return {
      project_id: fixedProjectId,
      saved: false,
    };
  }

  await saveRepo.create(fixedUserId, fixedProjectId);

  return {
    project_id: fixedProjectId,
    saved: true,
  };
}

export async function deleteProject(projectId, userId = TEST_USER_ID) {
  const fixedProjectId = Number(projectId);
  const fixedUserId = userId || TEST_USER_ID;

  if (!fixedProjectId) {
    throw { status: 400, message: "ID do projeto inválido" };
  }

  const project = await repo.findById(fixedProjectId);

  if (!project) {
    throw { status: 404, message: "Projeto não encontrado" };
  }

  if (Number(project.user_id) !== Number(fixedUserId)) {
    throw { status: 403, message: "Você só pode excluir suas próprias publicações" };
  }

  await repo.remove(fixedProjectId);

  setCache("projects", null);
  setCache("feed", null);

  return {
    message: "Publicação excluída com sucesso",
    project_id: fixedProjectId,
  };
}

export async function getProjectComments(projectId) {
  const comments = await commentRepo.findByProjectId(projectId);
  return Array.isArray(comments) ? comments.map(sanitizeComment) : [];
}

export async function createProjectComment(projectId, data, userId = TEST_USER_ID) {
  const fixedProjectId = Number(projectId);
  const fixedUserId = userId || TEST_USER_ID;
  const content = String(data.content || "").trim();

  if (!fixedProjectId) {
    throw { status: 400, message: "ID do projeto inválido" };
  }

  if (!content) {
    throw { status: 400, message: "Comentário obrigatório" };
  }

  assertSafeContent({ comentario: content });

  const project = await repo.findById(fixedProjectId);
  if (!project) {
    throw { status: 404, message: "Projeto não encontrado" };
  }

  const comment = await commentRepo.create({
    content,
    user_id: fixedUserId,
    project_id: fixedProjectId,
  });

  project.comments_count = (project.comments_count || 0) + 1;
  await repo.save(project);

  setCache("projects", null);
  setCache("feed", null);

  const createdComment = await commentRepo.findById(comment.id);
  return sanitizeComment(createdComment || comment);
}
