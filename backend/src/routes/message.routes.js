import express from 'express';
import * as controller from '../controllers/MessageController.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  messageEditSchema,
  messageIdSchema,
  messageSendSchema,
  messageUserSchema,
} from '../validation/schemas.js';

const router = express.Router();

router.get('/conversations', authenticateToken, controller.getConversations);
router.get('/:userId', authenticateToken, validate(messageUserSchema), controller.getMessages);
router.post('/send', authenticateToken, validate(messageSendSchema), controller.sendMessage);
router.patch('/:messageId', authenticateToken, validate(messageEditSchema), controller.editMessage);
router.delete(
  '/:messageId',
  authenticateToken,
  validate(messageIdSchema),
  controller.deleteMessage
);

export default router;
