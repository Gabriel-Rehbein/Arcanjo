import { getRepository } from "../config/db.js";
import UserSchema from "../entities/User.js";

export async function findByUsername(username) {
  const repository = await getRepository(UserSchema);
  return repository.findOneBy({ username });
}

export async function searchUsers(query) {
  const repository = await getRepository(UserSchema);
  return repository
    .createQueryBuilder("user")
    .where("user.username ILIKE :q", { q: `%${query}%` })
    .orWhere("user.full_name ILIKE :q", { q: `%${query}%` })
    .getMany();
}

export async function create(user) {
  const repository = await getRepository(UserSchema);
  return repository.save(user);
}

export async function findById(id) {
  const repository = await getRepository(UserSchema);

  return repository.findOne({
    where: { id: Number(id) },
  });
}

export async function getAll(limit = 100, offset = 0) {
  const repository = await getRepository(UserSchema);
  return repository.find({
    take: Number(limit),
    skip: Number(offset),
    order: { created_at: 'DESC' },
  });
}

export async function findBots(limit = 50) {
  const repository = await getRepository(UserSchema);
  return repository.find({
    where: { is_bot: true },
    take: Number(limit),
    order: { created_at: "DESC" },
  });
}

export async function markArcanjoSeedUsersAsBots() {
  const repository = await getRepository(UserSchema);

  return repository
    .createQueryBuilder()
    .update()
    .set({ is_bot: true })
    .where("email ILIKE :email", { email: "%@arcanjo.com" })
    .execute();
}

export async function update(id, fields) {
  const repository = await getRepository(UserSchema);
  const user = await repository.findOneBy({ id: Number(id) });
  if (!user) return null;

  Object.assign(user, fields);

  return repository.save(user);
}
