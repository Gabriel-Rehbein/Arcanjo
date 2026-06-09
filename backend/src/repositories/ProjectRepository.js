import { getRepository } from "../config/db.js";
import ProjectSchema from "../entities/Project.js";

export async function findAll() {
  const repository = await getRepository(ProjectSchema);

  return repository
    .createQueryBuilder("project")
    .leftJoinAndSelect("project.user", "user")
    .where("project.is_public = true")
    .orWhere("project.scheduled_at IS NOT NULL AND project.scheduled_at <= NOW()")
    .orderBy("project.created_at", "DESC")
    .getMany();
}

export async function findByUserId(userId, includeScheduled = false) {
  const repository = await getRepository(ProjectSchema);

  const query = repository
    .createQueryBuilder("project")
    .leftJoinAndSelect("project.user", "user")
    .where("project.user_id = :userId", { userId });

  if (!includeScheduled) {
    query.andWhere("(project.is_public = true OR project.scheduled_at <= NOW())");
  }

  return query.orderBy("project.created_at", "DESC").getMany();
}

export async function findById(projectId) {
  const repository = await getRepository(ProjectSchema);

  return repository.findOne({
    where: { id: Number(projectId) },
    relations: ["user"],
  });
}

export async function remove(id) {
  const repository = await getRepository(ProjectSchema);

  const project = await repository.findOne({
    where: { id: Number(id) },
  });

  if (!project) {
    return null;
  }

  await repository.remove(project);

  return project;
}

export async function findByCategory(category) {
  const repository = await getRepository(ProjectSchema);

  return repository
    .createQueryBuilder("project")
    .leftJoinAndSelect("project.user", "user")
    .where("project.category = :category", { category })
    .andWhere("(project.is_public = true OR project.scheduled_at <= NOW())")
    .orderBy("project.created_at", "DESC")
    .getMany();
}

export async function findByPublicationType(postType) {
  const repository = await getRepository(ProjectSchema);

  return repository
    .createQueryBuilder("project")
    .leftJoinAndSelect("project.user", "user")
    .where("project.post_type = :postType", { postType })
    .andWhere("(project.is_public = true OR project.scheduled_at <= NOW())")
    .orderBy("project.created_at", "DESC")
    .getMany();
}

export async function searchProjects(query) {
  const repository = await getRepository(ProjectSchema);

  return repository
    .createQueryBuilder("project")
    .leftJoinAndSelect("project.user", "user")
    .where("(project.is_public = true OR project.scheduled_at <= NOW())")
    .andWhere("(project.title ILIKE :q OR project.description ILIKE :q OR project.tags ILIKE :q OR project.post_type ILIKE :q)", { q: `%${query}%` })
    .orderBy("project.created_at", "DESC")
    .getMany();
}

export async function findScheduledByUserId(userId) {
  const repository = await getRepository(ProjectSchema);

  return repository
    .createQueryBuilder("project")
    .leftJoinAndSelect("project.user", "user")
    .where("project.user_id = :userId", { userId })
    .andWhere("project.scheduled_at IS NOT NULL")
    .orderBy("project.scheduled_at", "ASC")
    .getMany();
}

export async function create(project) {
  const repository = await getRepository(ProjectSchema);
  const saved = await repository.save(project);
  return repository.findOne({ where: { id: saved.id }, relations: ["user"] });
}

export async function save(project) {
  const repository = await getRepository(ProjectSchema);
  return repository.save(project);
}
