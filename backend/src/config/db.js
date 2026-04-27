import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import UserSchema from "../entities/User.js";
import ProjectSchema from "../entities/Project.js";
import LikeSchema from "../entities/Like.js";
import CommentSchema from "../entities/Comment.js";
import FollowSchema from "../entities/Follow.js";
import NotificationSchema from "../entities/Notification.js";
import StorySchema from "../entities/Story.js";
import SaveSchema from "../entities/Save.js";
import MessageSchema from "../entities/Message.js";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "senacrs",
  database: process.env.DB_NAME || "arcanjo",
  synchronize: false, // Desabilitado para evitar queries simultâneas
  logging: false,
  entities: [UserSchema, ProjectSchema, LikeSchema, CommentSchema, FollowSchema, NotificationSchema, StorySchema, SaveSchema, MessageSchema],
  extra: {
    max: 1, // Limitar a 1 conexão para evitar queries simultâneas
  },
});

export async function initializeDatabase() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    // Criar tabelas manualmente se não existirem
    await createTablesIfNotExist();
  }
}

export async function testConnection() {
  await initializeDatabase();
  await AppDataSource.query("SELECT 1");
}

export async function createTablesIfNotExist() {
  try {
    // Criar tabela users se não existir
    await AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        full_name VARCHAR(255),
        bio TEXT,
        avatar_url VARCHAR(255),
        banner_url VARCHAR(255),
        is_private BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await AppDataSource.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS email VARCHAR(255),
      ADD COLUMN IF NOT EXISTS full_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS bio TEXT,
      ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255),
      ADD COLUMN IF NOT EXISTS banner_url VARCHAR(255),
      ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);

    // Criar tabela projects se não existir
    await AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        user_id INTEGER,
        image_url VARCHAR(255),
        category VARCHAR(100),
        tags TEXT,
        link VARCHAR(255),
        likes_count INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        is_featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await AppDataSource.query(`
      ALTER TABLE projects
      ALTER COLUMN user_id DROP NOT NULL
    `);

    // Criar tabela likes
    await AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS likes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        project_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, project_id)
      )
    `);

    // Criar tabela comments
    await AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        project_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela follows
    await AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS follows (
        id SERIAL PRIMARY KEY,
        follower_id INTEGER NOT NULL,
        following_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(follower_id, following_id)
      )
    `);

    // Criar tabela notifications
    await AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        from_user_id INTEGER NOT NULL,
        type VARCHAR(50) NOT NULL,
        project_id INTEGER,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela stories
    await AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS stories (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        content TEXT,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela saves
    await AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS saves (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        project_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, project_id)
      )
    `);

    // Criar tabela messages
    await AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Adicionar colunas faltantes na tabela projects
    await AppDataSource.query(`
      ALTER TABLE projects
      ADD COLUMN IF NOT EXISTS image_url VARCHAR(255),
      ADD COLUMN IF NOT EXISTS category VARCHAR(100),
      ADD COLUMN IF NOT EXISTS tags TEXT,
      ADD COLUMN IF NOT EXISTS link VARCHAR(255),
      ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);

    console.log("✅ Tabelas criadas/verficadas com sucesso");
  } catch (error) {
    console.error("❌ Erro ao criar tabelas:", error.message);
  }
}

export async function getRepository(entity) {
  await initializeDatabase();
  return AppDataSource.getRepository(entity);
}
