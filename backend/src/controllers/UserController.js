import * as userRepo from "../repositories/UserRepository.js";
import * as projectRepo from "../repositories/ProjectRepository.js";

function sanitizeUser(user) {
  if (!user) return null;
  const {
    password,
    ...safeUser
  } = user;
  return {
    id: safeUser.id,
    username: safeUser.username,
    full_name: safeUser.full_name,
    bio: safeUser.bio,
    avatar_url: safeUser.avatar_url,
    banner_url: safeUser.banner_url,
    email: safeUser.email,
    followers_count: safeUser.followers_count || 0,
    following_count: safeUser.following_count || 0,
    created_at: safeUser.created_at,
  };
}

export async function getUserByUsername(req, res) {
  const { username } = req.params;
  const user = await userRepo.findByUsername(username);

  if (!user) {
    return res.status(404).json({ message: "Usuário não encontrado" });
  }

  res.json(sanitizeUser(user));
}

export async function getUserProjects(req, res) {
  const { username } = req.params;
  const user = await userRepo.findByUsername(username);

  if (!user) {
    return res.status(404).json({ message: "Usuário não encontrado" });
  }

  const projects = await projectRepo.findByUserId(user.id);
  res.json(projects || []);
}

export async function searchUsers(req, res) {
  const query = String(req.query.q || "").trim();
  if (!query) {
    return res.json([]);
  }

  const users = await userRepo.searchUsers(query);
  res.json(users.map(sanitizeUser));
}
