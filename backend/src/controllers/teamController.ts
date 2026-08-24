import { Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import prisma from "../utils/prismaClient";
import { AuthenticatedAdminRequest } from "../middlewares/adminAuth";

export const getTeamMembers = async (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orgId = req.orgId;
    if (!orgId) {
      res.status(401).json({ error: "Unauthorized: Missing organization identifier" });
      return;
    }

    const members = await prisma.admin.findMany({
      where: { org_id: orgId },
      select: {
        id: true,
        email: true,
        role: true,
        created_at: true,
      },
      orderBy: {
        created_at: "asc",
      },
    });

    res.status(200).json({ members });
  } catch (error) {
    next(error);
  }
};

export const createTeamMember = async (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orgId = req.orgId;
    if (!orgId) {
      res.status(401).json({ error: "Unauthorized: Missing organization identifier" });
      return;
    }

    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      res.status(400).json({ error: "Email, password, and role are required" });
      return;
    }

    // Check if email already registered
    const existing = await prisma.admin.findUnique({
      where: { email },
    });

    if (existing) {
      res.status(409).json({ error: "Email is already registered" });
      return;
    }

    // Hash the password using bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    // Create the team member admin record
    const member = await prisma.admin.create({
      data: {
        org_id: orgId,
        email,
        password_hash: passwordHash,
        role,
      },
      select: {
        id: true,
        email: true,
        role: true,
        created_at: true,
      },
    });

    res.status(201).json({ message: "Team member created successfully", member });
  } catch (error) {
    next(error);
  }
};
