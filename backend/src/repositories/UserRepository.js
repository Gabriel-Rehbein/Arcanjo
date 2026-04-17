import { db } from "../config/db.js";

export async function findByUsername(username) {
  const result = await db.query("SELECT * FROM users WHERE username=$1", [username]);
  return result.rows[0];
}

export async function create(user) {
  const result = await db.query(
    "INSERT INTO users (username, password) VALUES ($1,$2) RETURNING *",
    [user.username, user.password]
  );
  return result.rows[0];
}