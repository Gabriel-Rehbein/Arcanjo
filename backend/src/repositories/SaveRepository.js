import { getRepository } from "../config/db.js";
import SaveSchema from "../entities/Save.js";

export async function findByUserAndProject(userId, projectId) {
  const repository = await getRepository(SaveSchema);
  return repository.findOneBy({ user_id: userId, project_id: projectId });
}

export async function create(userId, projectId) {
  const repository = await getRepository(SaveSchema);
  return repository.save({ user_id: userId, project_id: projectId });
}

export async function remove(userId, projectId) {
  const repository = await getRepository(SaveSchema);
  const save = await repository.findOneBy({ user_id: userId, project_id: projectId });
  if (!save) return null;
  return repository.remove(save);
}

export async function findSavedByUserId(userId, category) {
  const repository = await getRepository(SaveSchema);
  const baseQuery = `
    SELECT p.*, u.id AS user_id, u.username, u.full_name, u.avatar_url, u.banner_url
    FROM saves s
    JOIN projects p ON p.id = s.project_id
    LEFT JOIN users u ON u.id = p.user_id
    WHERE s.user_id = $1
  `;
  const params = [userId];

  const query = category
    ? `${baseQuery} AND p.category = $2 ORDER BY s.created_at DESC`
    : `${baseQuery} ORDER BY s.created_at DESC`;

  return repository.query(query, params);
}
