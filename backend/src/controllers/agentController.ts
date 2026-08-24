import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import prisma from "../utils/prismaClient";
import { AuthenticatedAgentRequest } from "../middlewares/agentAuth";

export const registerAgent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { org_token, hostname } = req.body;

    if (
      !org_token ||
      !hostname ||
      typeof org_token !== "string" ||
      typeof hostname !== "string" ||
      org_token.trim() === "" ||
      hostname.trim() === ""
    ) {
      res.status(400).json({ error: "org_token and hostname must be non-empty strings" });
      return;
    }

    // Query organization by token
    const organization = await prisma.organization.findUnique({
      where: { org_token },
    });

    if (!organization) {
      res.status(401).json({ error: "Invalid organization token" });
      return;
    }

    // Generate secure, unique machine_token
    const machine_token = crypto.randomBytes(32).toString("hex");

    // Create Machine record
    const machine = await prisma.machine.create({
      data: {
        org_id: organization.id,
        hostname,
        machine_token,
        status: "online",
      },
    });

    res.status(201).json({
      machine_id: machine.id,
      machine_token: machine.machine_token,
    });
  } catch (error) {
    next(error);
  }
};

export const checkin = async (
  req: AuthenticatedAgentRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      res.status(400).json({ error: "Request body cannot be empty" });
      return;
    }

    const {
      cpu_model,
      cpu_cores,
      ram_total_mb,
      ram_used_mb,
      disk_json,
      os_name,
      os_version,
      kernel_version,
      installed_packages,
      ip_address,
      mac_address,
      uptime_seconds,
      last_user,
    } = req.body;

    const machineId = req.machine?.id;
    if (!machineId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const finalDiskJson = disk_json ?? req.body.disks ?? {};

    await prisma.$transaction([
      prisma.machineSnapshot.create({
        data: {
          machine_id: machineId,
          cpu_model: cpu_model ?? "Unknown",
          cpu_cores: Number(cpu_cores) || 0,
          ram_total_mb: Number(ram_total_mb) || 0,
          ram_used_mb: Number(ram_used_mb) || 0,
          disk_json: finalDiskJson,
          os_name: os_name ?? "Unknown",
          os_version: os_version ?? "Unknown",
          kernel_version: kernel_version ?? "Unknown",
          installed_packages: installed_packages ?? {},
          ip_address: ip_address ?? "Unknown",
          mac_address: mac_address ?? "Unknown",
          uptime_seconds: Number(uptime_seconds) || 0,
          last_user: last_user ?? "Unknown",
        },
      }),
      prisma.machine.update({
        where: { id: machineId },
        data: {
          last_checkin_at: new Date(),
          status: "online",
        },
      }),
    ]);

    res.status(200).json({ success: true, message: "Snapshot recorded" });
  } catch (error) {
    next(error);
  }
};

