import crypto from 'crypto';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import path from 'path';

import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/project.routes.js';
import userRoutes from './routes/user.routes.js';
import messageRoutes from './routes/message.routes.js';
import storyRoutes from './routes/story.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import errorMiddleware, { notFoundMiddleware } from './middlewares/error.middleware.js';
import { apiRateLimit, authRateLimit } from './middlewares/rateLimit.middleware.js';

const app = express();
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((origin) => origin.trim())
  : ['http://localhost:3001'];

app.disable('x-powered-by');
if (process.env.TRUST_PROXY) {
  app.set('trust proxy', Number(process.env.TRUST_PROXY));
}

app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
});

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  })
);
app.use(compression());
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '5mb', strict: true }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      const error = new Error('Origem nao autorizada pelo CORS.');
      error.status = 403;
      error.code = 'CORS_ORIGIN_DENIED';
      return callback(error);
    },
  })
);

app.get('/', (req, res) => {
  res.json({
    service: 'arcanjo-api',
    status: 'online',
    frontend: process.env.FRONTEND_URL || 'http://localhost:3001',
    health: '/health',
  });
});

app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'arcanjo-api',
    uptime_seconds: Math.round(process.uptime()),
    request_id: req.id,
  });
});

app.use('/auth', authRateLimit);
app.use(apiRateLimit);
app.use(
  '/uploads',
  express.static(path.join(process.cwd(), 'uploads'), { maxAge: '1d', immutable: true })
);

app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/users', userRoutes);
app.use('/messages', messageRoutes);
app.use('/stories', storyRoutes);
app.use('/notifications', notificationRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
