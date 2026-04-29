import { getRepository } from "../config/db.js";
import CommentSchema from "../entities/Comment.js";

export async function create(comment) {
  const repository = await getRepository(CommentSchema);
  return repository.save(comment);
}

export async function findByProjectId(projectId) {
  const repository = await getRepository(CommentSchema);

  return repository.find({
    where: { project: { id: Number(projectId) } },
    relations: ["user"],
    order: { created_at: "DESC" },
  });
}