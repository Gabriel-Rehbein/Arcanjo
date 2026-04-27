import * as repo from "../repositories/FollowRepository.js";
import * as notificationService from "./NotificationService.js";

export async function isFollowing(followerId, followingId) {
  if (!followerId || !followingId) return false;
  const follow = await repo.find(followerId, followingId);
  return Boolean(follow);
}

export async function follow(followerId, followingId) {
  if (followerId === followingId) {
    throw { status: 400, message: "Você não pode seguir a si mesmo." };
  }

  const existing = await repo.find(followerId, followingId);
  if (existing) {
    return existing;
  }

  const follow = await repo.create(followerId, followingId);
  await notificationService.createNotification({
    user_id: followingId,
    from_user_id: followerId,
    type: "follow",
    message: "Começou a seguir você",
  });
  return follow;
}

export async function unfollow(followerId, followingId) {
  if (followerId === followingId) {
    throw { status: 400, message: "Operação inválida." };
  }

  return await repo.remove(followerId, followingId);
}

export async function getFollowerCount(userId) {
  return await repo.countFollowers(userId);
}

export async function getFollowingCount(userId) {
  return await repo.countFollowing(userId);
}
