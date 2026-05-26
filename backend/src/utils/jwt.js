import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "segredo";
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export function generateToken(user) {
  return jwt.sign({ id: user.id }, SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}