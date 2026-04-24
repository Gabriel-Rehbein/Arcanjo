import express from "express";
import * as controller from "../controllers/UserController.js";

const router = express.Router();

router.get("/search", controller.searchUsers);
router.get("/:username/projects", controller.getUserProjects);
router.get("/:username", controller.getUserByUsername);

export default router;
