import { Router } from "express";
import { agentController } from "../controllers/agentController";

const router = Router();

router.post("/run", (req, res) => agentController.runAgent(req, res));
router.get("/status/:id", (req, res) => agentController.getStatus(req, res));
router.get("/files/:env_id", (req, res) => agentController.getFiles(req, res));

export default router;
