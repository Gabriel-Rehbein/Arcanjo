import { getRepository } from "../config/db.js";
import CommentSchema from "../entities/Comment.js";

export async function create(comment) {
  const repository = await getRepository(CommentSchema);
  return repository.save(comment);
}

export async function findByUserAndProject(userId, projectId) {
  const repository = await getRepository(CommentSchema);
  return repository.findOneBy({
    user_id: Number(userId),
    project_id: Number(projectId),
  });
}

export async function findByProjectId(projectId) {
  const repository = await getRepository(CommentSchema);

  return repository.find({
    where: { project_id: Number(projectId) },
    relations: ["user"],
    order: { created_at: "DESC" },
  });
}

export async function findById(id) {
  const repository = await getRepository(CommentSchema);
  return repository.findOne({
    where: { id: Number(id) },
    relations: ["user"],
  });
}
