import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const db = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "arcanjo",
  password: process.env.DB_PASSWORD || "123456",
  port: Number(process.env.DB_PORT || 5432),
});

export async function testConnection() {
  const client = await db.connect();
  try {
    await client.query("SELECT 1");
  } finally {
    client.release();
  }
}
