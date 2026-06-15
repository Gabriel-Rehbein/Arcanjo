import { verifyToken } from '../utils/jwt.js';
import AppError from '../utils/AppError.js';

export function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return next(new AppError('Token de autenticacao ausente', 401, 'AUTH_TOKEN_MISSING'));
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    next(new AppError('Token de autenticacao invalido', 401, 'AUTH_TOKEN_INVALID'));
  }
}

export function optionalAuthenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return next();
  }

  try {
    req.user = verifyToken(token);
  } catch {
    // Invalid optional tokens are treated as anonymous access.
  }

  next();
}

export default authenticateToken;
