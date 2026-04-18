import * as repo from "../repositories/UserRepository.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";

export async function register(data) {
  if (!data.username || !data.password) {
    throw { status: 400, message: "Dados inválidos" };
  }

  const existingUser = await repo.findByUsername(data.username);
  if (existingUser) {
    throw { status: 409, message: "Usuário já existe" };
  }

  const hashed = await hashPassword(data.password);
  const user = await repo.create({ username: data.username, password: hashed });

  return user;
}

export async function login(data) {
  const user = await repo.findByUsername(data.username);

  if (!user) throw { status: 404, message: "Usuário não encontrado" };

  const valid = await comparePassword(data.password, user.password);
  if (!valid) throw { status: 401, message: "Senha inválida" };

  return generateToken(user);
}