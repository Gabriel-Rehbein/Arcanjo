import bcrypt from 'bcrypt';

export async function hashPassword(password) {
  const rounds = Number(process.env.BCRYPT_ROUNDS || 12);
  return bcrypt.hash(password, rounds);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}
