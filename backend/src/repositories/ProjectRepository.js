import { getRepository } from "../config/db.js";
import ProjectSchema from "../entities/Project.js";

export async function findAll() {
  const repository = await getRepository(ProjectSchema);
  return repository.find();
}

export async function findByUserId(userId) {
  const repository = await getRepository(ProjectSchema);
  return repository.find({ where: { user_id: userId } });
}

export async function searchProjects(query) {
  const repository = await getRepository(ProjectSchema);
  return repository
    .createQueryBuilder("project")
    .where("project.title ILIKE :q", { q: `%${query}%` })
    .orWhere("project.description ILIKE :q", { q: `%${query}%` })
    .orWhere("project.tag ILIKE :q", { q: `%${query}%` })
    .getMany();
}

export async function create(project) {
  const repository = await getRepository(ProjectSchema);
  return repository.save(project);
}
