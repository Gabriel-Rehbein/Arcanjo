import { getRepository } from "../config/db.js";
import StorySchema from "../entities/Story.js";

export async function findAll() {
  const repository = await getRepository(StorySchema);
  return repository.find({ relations: ["user"] });
}

export async function findByUserId(userId) {
  const repository = await getRepository(StorySchema);
  return repository.find({ where: { user_id: userId }, relations: ["user"] });
}

export async function create(story) {
  const repository = await getRepository(StorySchema);
  const savedStory = await repository.save(story);
  return repository.findOne({ where: { id: savedStory.id }, relations: ["user"] });
}