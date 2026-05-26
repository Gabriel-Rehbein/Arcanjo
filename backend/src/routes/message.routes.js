import express from "express";
import * as controller from "../controllers/MessageController.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/conversations", authenticateToken, controller.getConversations);
router.get("/:userId", authenticateToken, controller.getMessages);
router.post("/send", authenticateToken, controller.sendMessage);
router.patch("/:messageId", authenticateToken, controller.editMessage);
router.delete("/:messageId", authenticateToken, controller.deleteMessage);

export default router;
