import { Router } from "express";
import { zapController } from "../controllers/zapController";

const router = Router();

router.post("/extract-contacts", (req, res) => zapController.extractContacts(req, res));
router.post("/generate-messages", (req, res) => zapController.generateMessages(req, res));

export default router;
