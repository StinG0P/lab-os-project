import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fs from "node:fs";
import prisma from "../utils/prismaClient";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      res.status(400).json({ error: "Email and password are required and must be strings" });
      return;
    }

    // Query admin by email
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Sign JWT
    const jwtSecret = process.env.JWT_SECRET || "super_secret_dev_key_change_me_later";
    const token = jwt.sign(
      { adminId: admin.id, orgId: admin.org_id },
      jwtSecret,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      token,
      org_id: admin.org_id,
    });
  } catch (error: any) {
    console.error("\n[CRITICAL LOGIN ERROR]:", error, "\n");
    try {
      fs.appendFileSync(
        "backend-error.log",
        "\n[LOGIN ERROR] " +
          new Date().toISOString() +
          ": " +
          (error instanceof Error ? error.stack : JSON.stringify(error)) +
          "\n"
      );
    } catch (fsErr) {
      console.error("Failed to write to backend-error.log:", fsErr);
    }
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};
