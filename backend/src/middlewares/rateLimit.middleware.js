import rateLimit from "express-rate-limit";

export default rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Muitas requisições. Aguarde um momento e tente novamente.",
  },
});
