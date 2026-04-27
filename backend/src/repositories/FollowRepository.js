import { getRepository } from "../config/db.js";
import FollowSchema from "../entities/Follow.js";

export async function find(followerId, followingId) {
  const repository = await getRepository(FollowSchema);
  return repository.findOneBy({ follower_id: followerId, following_id: followingId });
}

export async function create(followerId, followingId) {
  const repository = await getRepository(FollowSchema);
  return repository.save({ follower_id: followerId, following_id: followingId });
}

export async function remove(followerId, followingId) {
  const repository = await getRepository(FollowSchema);
  const follow = await repository.findOneBy({ follower_id: followerId, following_id: followingId });
  if (!follow) return null;
  return repository.remove(follow);
}

export async function countFollowers(userId) {
  const repository = await getRepository(FollowSchema);
  return repository.count({ where: { following_id: userId } });
}

export async function countFollowing(userId) {
  const repository = await getRepository(FollowSchema);
  return repository.count({ where: { follower_id: userId } });
}
