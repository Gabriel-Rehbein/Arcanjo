import "dotenv/config";
import rateLimit from "express-rate-limit";

const isProduction = process.env.NODE_ENV === "production";

export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX || (isProduction ? 300 : 1000)),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Muitas requisições. Aguarde um momento e tente novamente.",
  },
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX || (isProduction ? 10 : 100)),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    error: "Muitas tentativas de autenticacao. Aguarde e tente novamente.",
  },
});
