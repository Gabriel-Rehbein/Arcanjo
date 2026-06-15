import express from 'express';
import { login, register } from '../controllers/AuthController.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authLoginSchema, authRegisterSchema } from '../validation/schemas.js';

const router = express.Router();

router.post('/login', validate(authLoginSchema), login);
router.post('/register', validate(authRegisterSchema), register);

export default router;
