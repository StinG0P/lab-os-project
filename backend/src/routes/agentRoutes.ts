import { Router } from "express";
import { registerAgent, checkin } from "../controllers/agentController";
import { agentAuth } from "../middlewares/agentAuth";

const router = Router();

router.post("/register", registerAgent);
router.post("/checkin", agentAuth, checkin);

export default router;
