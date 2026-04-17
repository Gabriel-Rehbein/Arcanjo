import { db } from "../config/db.js";

export async function findAll() {
  const result = await db.query("SELECT * FROM projects");
  return result.rows;
}

export async function create(project) {
  const result = await db.query(
    "INSERT INTO projects (title, description, user_id) VALUES ($1,$2,$3) RETURNING *",
    [project.title, project.description, project.user_id]
  );
  return result.rows[0];
}