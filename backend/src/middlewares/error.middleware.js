export default function (err, req, res) {
  res.status(err.status || 500).json({
    error: err.message || "Erro interno",
  });
}