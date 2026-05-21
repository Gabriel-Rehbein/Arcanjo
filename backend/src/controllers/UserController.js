import * as userRepo from "../repositories/UserRepository.js";
import * as projectService from "../services/ProjectService.js";
import * as followService from "../services/FollowService.js";

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

    const user = await userRepo.findByUsername(username);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const followers_count = await followService.getFollowerCount(user.id);
    const following_count = await followService.getFollowingCount(user.id);
    const is_following = req.user ? await followService.isFollowing(req.user.id, user.id) : false;

    const safe = sanitizeUser(user);

    res.json({
      ...safe,
      followers_count,
      following_count,
      is_following,
    });
  } catch (err) {
    next(err);
  }
}

export async function followUser(req, res, next) {
  try {
    const targetId = parseInt(req.params.id, 10);
    if (!targetId) return res.status(400).json({ message: "ID inválido" });

    const followerId = req.user?.id || TEST_USER_ID;

    await followService.follow(followerId, targetId);

    const followers_count = await followService.getFollowerCount(targetId);
    const following_count = await followService.getFollowingCount(followerId);
    const is_following = await followService.isFollowing(followerId, targetId);

    res.json({ success: true, followers_count, following_count, is_following });
  } catch (err) {
    next(err);
  }
}

export async function unfollowUser(req, res, next) {
  try {
    const targetId = parseInt(req.params.id, 10);
    if (!targetId) return res.status(400).json({ message: "ID inválido" });

    const followerId = req.user?.id || TEST_USER_ID;

    await followService.unfollow(followerId, targetId);

    const followers_count = await followService.getFollowerCount(targetId);
    const following_count = await followService.getFollowingCount(followerId);
    const is_following = await followService.isFollowing(followerId, targetId);

    res.json({ success: true, followers_count, following_count, is_following });
  } catch (err) {
    next(err);
  }
}

export async function getUserProjects(req, res, next) {
  try {
    const { username } = req.params;

    const user = await userRepo.findByUsername(username);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const projects = await projectService.getByUserId(user.id);

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