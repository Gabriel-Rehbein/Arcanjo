import { getRepository } from "../config/db.js";
import StorySchema from "../entities/Story.js";

export async function findAll() {
  const repository = await getRepository(StorySchema);
  return repository.find();
}

export async function findByUserId(userId) {
  const repository = await getRepository(StorySchema);
  return repository.find({ where: { user_id: userId } });
}

export async function create(story) {
  const repository = await getRepository(StorySchema);
  return repository.save(story);
}