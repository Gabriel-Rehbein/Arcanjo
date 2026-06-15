import { getRepository } from '../config/db.js';
import FollowSchema from '../entities/Follow.js';
import UserSchema from '../entities/User.js';

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

export async function listFollowers(userId) {
  const userRepository = await getRepository(UserSchema);

  return userRepository
    .createQueryBuilder('user')
    .innerJoin('follows', 'follow', 'follow.follower_id = user.id')
    .where('follow.following_id = :userId', { userId })
    .orderBy('follow.created_at', 'DESC')
    .getMany();
}

export async function listFollowing(userId) {
  const userRepository = await getRepository(UserSchema);

  return userRepository
    .createQueryBuilder('user')
    .innerJoin('follows', 'follow', 'follow.following_id = user.id')
    .where('follow.follower_id = :userId', { userId })
    .orderBy('follow.created_at', 'DESC')
    .getMany();
}
