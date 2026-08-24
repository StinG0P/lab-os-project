import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedAdminRequest extends Request {
  adminId?: string;
  orgId?: string;
}

export const adminAuth = (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized: Missing or invalid token format" });
      return;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      res.status(401).json({ error: "Unauthorized: Missing token" });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET || "super_secret_dev_key_change_me_later";
    const decoded = jwt.verify(token, jwtSecret) as {
      adminId: string;
      orgId: string;
    };

    req.adminId = decoded.adminId;
    req.orgId = decoded.orgId;
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};
