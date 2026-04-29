import * as userRepo from "../repositories/UserRepository.js";
import * as projectRepo from "../repositories/ProjectRepository.js";

export async function getUserProjects(username) {
  const user = await userRepo.findByUsername(username);

  if (!user) {
    return [];
  }

  return await projectRepo.findByUserId(user.id);
}