import express from "express";

const router = express.Router();

// Retornar stories do feed (vazio por enquanto)
router.get("/feed", (req, res) => {
  res.json([]);
});

export default router;
