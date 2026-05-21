import express from "express";
import * as controller from "../controllers/UserController.js";
import { authenticateToken, optionalAuthenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", controller.listUsers);
router.get("/search", controller.searchUsers);
router.get("/:username/projects", controller.getUserProjects);
router.get("/:username/projects", controller.getUserProjects);
router.put("/:username", authenticateToken, controller.updateUserByUsername);
router.get("/:username", optionalAuthenticateToken, controller.getUserByUsername);

router.post("/:id/follow", authenticateToken, controller.followUser);
router.post("/:id/unfollow", authenticateToken, controller.unfollowUser);

export default router;
