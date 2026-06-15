import { z } from 'zod';

const username = z
  .string()
  .trim()
  .min(3, 'Usuario deve ter pelo menos 3 caracteres.')
  .max(40, 'Usuario deve ter no maximo 40 caracteres.')
  .regex(/^[a-zA-Z0-9_.-]+$/, 'Usuario contem caracteres invalidos.');

const password = z
  .string()
  .min(8, 'Senha deve ter pelo menos 8 caracteres.')
  .max(72, 'Senha deve ter no maximo 72 caracteres.')
  .regex(/[a-zA-Z]/, 'Senha deve conter uma letra.')
  .regex(/[0-9]/, 'Senha deve conter um numero.');

const numericId = z.coerce.number().int().positive();
const optionalUrl = z.union([z.string().trim().url(), z.literal(''), z.null()]).optional();
const tags = z
  .union([z.array(z.string().trim().min(1).max(40)).max(20), z.string().max(500)])
  .optional();

export const authRegisterSchema = z.object({
  body: z.object({ username, password }).strict(),
  params: z.object({}),
  query: z.object({}),
});

export const authLoginSchema = z.object({
  body: z.object({ username, password: z.string().min(1).max(72) }).strict(),
  params: z.object({}),
  query: z.object({}),
});

export const projectBody = z
  .object({
    title: z.string().trim().min(3).max(150),
    description: z.string().trim().min(10).max(5000),
    post_type: z.string().trim().min(1).max(50).optional(),
    category: z.string().trim().min(1).max(100).optional(),
    tags,
    image_url: optionalUrl,
    link: optionalUrl,
    scheduled_at: z.string().datetime().nullable().optional(),
  })
  .strict();

export const projectCreateSchema = z.object({
  body: projectBody,
  params: z.object({}),
  query: z.object({}),
});

export const projectScheduleSchema = z.object({
  body: projectBody.partial().extend({ scheduled_at: z.string().datetime() }).strict(),
  params: z.object({ id: numericId }),
  query: z.object({}),
});

export const projectIdSchema = z.object({
  body: z.unknown().optional(),
  params: z.object({ id: numericId }),
  query: z.object({}).passthrough(),
});

export const commentCreateSchema = z.object({
  body: z.object({ content: z.string().trim().min(1).max(500) }).strict(),
  params: z.object({ id: numericId }),
  query: z.object({}),
});

export const messageSendSchema = z.object({
  body: z.object({ receiver_id: numericId, content: z.string().trim().min(1).max(2000) }).strict(),
  params: z.object({}),
  query: z.object({}),
});

export const messageEditSchema = z.object({
  body: z.object({ content: z.string().trim().min(1).max(2000) }).strict(),
  params: z.object({ messageId: numericId }),
  query: z.object({}),
});

export const messageUserSchema = z.object({
  body: z.unknown().optional(),
  params: z.object({ userId: numericId }),
  query: z.object({}),
});

export const messageIdSchema = z.object({
  body: z.unknown().optional(),
  params: z.object({ messageId: numericId }),
  query: z.object({}),
});

export const notificationListSchema = z.object({
  body: z.unknown().optional(),
  params: z.object({}),
  query: z.object({ type: z.enum(['all', 'like', 'comment', 'follow', 'message']).optional() }),
});

export const notificationIdSchema = z.object({
  body: z.unknown().optional(),
  params: z.object({ id: numericId }),
  query: z.object({}),
});
