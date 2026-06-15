import * as repo from '../repositories/UserRepository.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateToken } from '../utils/jwt.js';

const DEFAULT_USER_SEALS = [{ symbol: '*', label: 'Novo membro' }];

function publicUser(user) {
  const { password, ...safeUser } = user;
  void password;
  return safeUser;
}

export async function register(data) {
  const normalizedUsername = data.username.trim();
  const existingUser = await repo.findByUsername(normalizedUsername);

  if (existingUser) {
    throw { status: 409, message: 'Usuario ja existe' };
  }

  const hashed = await hashPassword(data.password);
  const user = await repo.create({
    username: normalizedUsername,
    password: hashed,
    selos: JSON.stringify(DEFAULT_USER_SEALS),
    badges: JSON.stringify(DEFAULT_USER_SEALS),
  });

  return publicUser(user);
}

export async function login(data) {
  const user = await repo.findByUsername(data.username.trim());

  if (!user) throw { status: 401, message: 'Credenciais invalidas' };

  const valid = await comparePassword(data.password, user.password);
  if (!valid) throw { status: 401, message: 'Credenciais invalidas' };

  return generateToken(user);
}
