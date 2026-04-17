import jwt from "jsonwebtoken";

const SECRET = "segredo";

export function generateToken(user) {
  return jwt.sign({ id: user.id }, SECRET, { expiresIn: "1h" });
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}