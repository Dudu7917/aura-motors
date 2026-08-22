import { Router } from "express";
import { leadsController } from "../controllers/leadsController";

const router = Router();

router.get("/", (req, res) => leadsController.getLeads(req, res));
router.post("/", (req, res) => leadsController.saveLead(req, res));
router.delete("/", (req, res) => leadsController.clearAll(req, res));
router.delete("/:id", (req, res) => leadsController.deleteLead(req, res));
router.post("/import", (req, res) => leadsController.importFromFile(req, res));
router.post("/batch", (req, res) => leadsController.batchSave(req, res));

export default router;
