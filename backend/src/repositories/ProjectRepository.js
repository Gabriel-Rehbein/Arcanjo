import { getRepository } from "../config/db.js";
import ProjectSchema from "../entities/Project.js";

export async function findAll() {
  const repository = await getRepository(ProjectSchema);
  return repository.find({ relations: ["user"], order: { created_at: "DESC" } });
}

export async function findByUserId(userId) {
  const repository = await getRepository(ProjectSchema);
  return repository.find({ where: { user_id: userId }, relations: ["user"], order: { created_at: "DESC" } });
}

export async function findById(projectId) {
  const repository = await getRepository(ProjectSchema);
  return repository.findOne({ where: { id: projectId }, relations: ["user"] });
}

export async function findByCategory(category) {
  const repository = await getRepository(ProjectSchema);
  return repository.find({ where: { category }, relations: ["user"], order: { created_at: "DESC" } });
}

export async function searchProjects(query) {
  const repository = await getRepository(ProjectSchema);
  return repository
    .createQueryBuilder("project")
    .leftJoinAndSelect("project.user", "user")
    .where("project.title ILIKE :q", { q: `%${query}%` })
    .orWhere("project.description ILIKE :q", { q: `%${query}%` })
    .orWhere("project.tags ILIKE :q", { q: `%${query}%` })
    .orderBy("project.created_at", "DESC")
    .getMany();
}

export async function create(project) {
  const repository = await getRepository(ProjectSchema);
  return repository.save(project);
}

export async function save(project) {
  const repository = await getRepository(ProjectSchema);
  return repository.save(project);
}
