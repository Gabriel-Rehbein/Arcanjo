import jwt from 'jsonwebtoken';

const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET deve possuir pelo menos 32 caracteres.');
  }
  return secret;
}

export function generateToken(user) {
  return jwt.sign({ id: user.id }, getSecret(), {
    expiresIn: EXPIRES_IN,
    algorithm: 'HS256',
    issuer: 'arcanjo-api',
    audience: 'arcanjo-web',
  });
}

export function verifyToken(token) {
  return jwt.verify(token, getSecret(), {
    algorithms: ['HS256'],
    issuer: 'arcanjo-api',
    audience: 'arcanjo-web',
  });
}
