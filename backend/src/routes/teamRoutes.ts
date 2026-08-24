import { Router } from "express";
import { adminAuth } from "../middlewares/adminAuth";
import { getTeamMembers, createTeamMember } from "../controllers/teamController";

const router = Router();

router.get("/", adminAuth, getTeamMembers);
router.post("/", adminAuth, createTeamMember);

export default router;
