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
