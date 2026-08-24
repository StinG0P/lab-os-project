import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prismaClient";

export interface AuthenticatedAgentRequest extends Request {
  machine?: {
    id: string;
  };
}

export const agentAuth = async (
  req: AuthenticatedAgentRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Invalid or missing machine token" });
      return;
    }

    const machine_token = authHeader.split(" ")[1];
    if (!machine_token) {
      res.status(401).json({ error: "Invalid or missing machine token" });
      return;
    }

    const machine = await prisma.machine.findUnique({
      where: { machine_token },
    });

    if (!machine) {
      res.status(401).json({ error: "Invalid or missing machine token" });
      return;
    }

    req.machine = { id: machine.id };
    next();
  } catch (error) {
    next(error);
  }
};
