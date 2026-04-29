import * as userRepo from "../repositories/UserRepository.js";
import * as projectService from "../services/ProjectService.js";

const TEST_USER_ID = 1;

function sanitizeUser(user) {
  if (!user) return null;

  const { password, ...safeUser } = user;

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

export async function getUserByUsername(req, res, next) {
  try {
    const { username } = req.params;

    let user = await userRepo.findByUsername(username);

    if (!user) {
      user = await userRepo.findById(TEST_USER_ID);
    }

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    res.json(sanitizeUser(user));
  } catch (err) {
    next(err);
  }
}

export async function getUserProjects(req, res, next) {
  try {
    const projects = await projectService.getByUserId(TEST_USER_ID);

    res.json(projects || []);
  } catch (err) {
    next(err);
  }
}

export async function searchUsers(req, res, next) {
  try {
    const query = String(req.query.q || "").trim();

    if (!query) {
      return res.json([]);
    }

    const users = await userRepo.searchUsers(query);
    res.json(users.map(sanitizeUser));
  } catch (err) {
    next(err);
  }
}