export function notFoundMiddleware(req, res, next) {
  void res;
  const error = new Error(`Rota nao encontrada: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  error.code = 'ROUTE_NOT_FOUND';
  next(error);
}

export default function errorMiddleware(err, req, res, next) {
  void next;

  const status = Number(err.status || err.statusCode || 500);
  const isServerError = status >= 500;
  const exposeMessage = !isServerError || process.env.NODE_ENV !== 'production';

  if (isServerError) {
    console.error(`[${req.method} ${req.originalUrl}]`, err);
  }

  res.status(status).json({
    error: {
      code: err.code || (isServerError ? 'INTERNAL_ERROR' : 'REQUEST_ERROR'),
      message: exposeMessage ? err.message || 'Erro interno.' : 'Erro interno.',
      ...(err.details ? { details: err.details } : {}),
    },
  });
}
