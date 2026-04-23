import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import UserSchema from "../entities/User.js";
import ProjectSchema from "../entities/Project.js";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "senacrs",
  database: process.env.DB_NAME || "arcanjo",
  synchronize: true,
  logging: false,
  entities: [UserSchema, ProjectSchema],
});

export async function initializeDatabase() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
}

export async function testConnection() {
  await initializeDatabase();
  await AppDataSource.query("SELECT 1");
}

export async function getRepository(entity) {
  await initializeDatabase();
  return AppDataSource.getRepository(entity);
}
