import { getRepository } from "../config/db.js";
import UserSchema from "../entities/User.js";

export async function findByUsername(username) {
  const repository = await getRepository(UserSchema);
  return repository.findOneBy({ username });
}

export async function create(user) {
  const repository = await getRepository(UserSchema);
  return repository.save(user);
}
