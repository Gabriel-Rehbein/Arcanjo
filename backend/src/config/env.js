import { z } from 'zod';

const DEVELOPMENT_JWT_SECRET = 'arcanjo-local-development-secret-32-chars-minimum';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET deve ter no minimo 32 caracteres'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  DATABASE_URL: z.string().url().optional(),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().int().min(1).max(65535).default(5432),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().optional(),
  DB_NAME: z.string().default('arcanjo'),
});

export function validateEnvironment(environment = process.env) {
  const nodeEnvironment = environment.NODE_ENV || 'development';
  const normalizedEnvironment = {
    ...environment,
    JWT_SECRET:
      environment.JWT_SECRET ||
      (nodeEnvironment === 'development' ? DEVELOPMENT_JWT_SECRET : undefined),
  };
  const result = environmentSchema.safeParse(normalizedEnvironment);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Configuracao de ambiente invalida: ${details}`);
  }

  return result.data;
}
