export default function (err, req, res, next) {
  void req;
  void next;

  res.status(err.status || 500).json({
    message: err.message || "Erro interno",
    error: err.message || "Erro interno",
  });
}
