import { Router } from "express";
import { getMachines, getMachineDetail, exportMachines, getMachineHistory, wakeMachine } from "../controllers/machineController";
import { adminAuth } from "../middlewares/adminAuth";

const router = Router();

router.get("/", adminAuth, getMachines);
router.get("/export", adminAuth, exportMachines);
router.get("/:id/history", adminAuth, getMachineHistory);
router.post("/:id/wake", adminAuth, wakeMachine);
router.get("/:id", adminAuth, getMachineDetail);

export default router;
