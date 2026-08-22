import { Router } from "express";
import { salesArenaController } from "../controllers/salesArenaController";

const router = Router();

router.post("/chat", (req, res) => salesArenaController.handleChat(req, res));
router.post("/evaluate", (req, res) => salesArenaController.evaluate(req, res));

export default router;
