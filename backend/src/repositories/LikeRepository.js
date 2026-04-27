import { getRepository } from "../config/db.js";
import LikeSchema from "../entities/Like.js";

export async function findByUserAndProject(userId, projectId) {
  const repository = await getRepository(LikeSchema);
  return repository.findOneBy({ user_id: userId, project_id: projectId });
}

export async function create(userId, projectId) {
  const repository = await getRepository(LikeSchema);
  return repository.save({ user_id: userId, project_id: projectId });
}

export async function remove(userId, projectId) {
  const repository = await getRepository(LikeSchema);
  const like = await repository.findOneBy({ user_id: userId, project_id: projectId });
  if (!like) return null;
  return repository.remove(like);
}

export async function countByProject(projectId) {
  const repository = await getRepository(LikeSchema);
  return repository.count({ where: { project_id: projectId } });
}
