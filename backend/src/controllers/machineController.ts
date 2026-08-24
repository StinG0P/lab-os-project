import { Response, NextFunction } from "express";
import wol from "wake_on_lan";
import prisma from "../utils/prismaClient";
import { AuthenticatedAdminRequest } from "../middlewares/adminAuth";

export const getMachines = async (
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

    const machines = await prisma.machine.findMany({
      where: { org_id: orgId },
      select: {
        id: true,
        hostname: true,
        status: true,
        last_checkin_at: true,
      },
      orderBy: {
        last_checkin_at: "desc",
      },
    });

    res.status(200).json({ machines });
  } catch (error) {
    next(error);
  }
};

export const getMachineDetail = async (
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

    const id = req.params.id;
    if (!id || typeof id !== "string") {
      res.status(400).json({ error: "Machine ID is required and must be a string" });
      return;
    }

    const machine = await prisma.machine.findFirst({
      where: {
        id,
        org_id: orgId,
      },
      select: {
        id: true,
        hostname: true,
        status: true,
        last_checkin_at: true,
        org_id: true,
        snapshots: {
          orderBy: {
            recorded_at: "desc",
          },
          take: 1,
        },
      },
    });

    if (!machine) {
      res.status(404).json({ error: "Machine not found" });
      return;
    }

    res.status(200).json(machine);
  } catch (error) {
    next(error);
  }
};

export const exportMachines = async (
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

    const machines = await prisma.machine.findMany({
      where: { org_id: orgId },
      orderBy: {
        last_checkin_at: "desc",
      },
    });

    const headers = ["ID", "Hostname", "Status", "Last Check-in"];
    const rows = machines.map((m) => [
      m.id,
      m.hostname,
      m.status,
      m.last_checkin_at ? m.last_checkin_at.toISOString() : "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="lab-inventory.csv"');
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

export const getMachineHistory = async (
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

    const id = req.params.id;
    if (!id || typeof id !== "string") {
      res.status(400).json({ error: "Machine ID is required and must be a string" });
      return;
    }

    const machine = await prisma.machine.findFirst({
      where: {
        id,
        org_id: orgId,
      },
    });

    if (!machine) {
      res.status(404).json({ error: "Machine not found" });
      return;
    }

    const snapshots = await prisma.machineSnapshot.findMany({
      where: { machine_id: id },
      select: {
        recorded_at: true,
        cpu_cores: true,
        ram_used_mb: true,
        ram_total_mb: true,
      },
      orderBy: {
        recorded_at: "desc",
      },
      take: 24,
    });

    const history = snapshots.reverse().map((snapshot) => ({
      timestamp: snapshot.recorded_at,
      cpu_usage: snapshot.cpu_cores,
      ram_used: snapshot.ram_used_mb,
      ram_total: snapshot.ram_total_mb,
    }));

    res.status(200).json({ history });
  } catch (error) {
    next(error);
  }
};

export const wakeMachine = async (
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

    const id = req.params.id;
    if (!id || typeof id !== "string") {
      res.status(400).json({ error: "Machine ID is required and must be a string" });
      return;
    }

    const machine = await prisma.machine.findFirst({
      where: {
        id,
        org_id: orgId,
      },
      select: {
        hostname: true,
        snapshots: {
          orderBy: {
            recorded_at: "desc",
          },
          take: 1,
          select: {
            mac_address: true,
          },
        },
      },
    });

    if (!machine) {
      res.status(404).json({ error: "Machine not found" });
      return;
    }

    const latestSnapshot = machine.snapshots?.[0];
    if (!latestSnapshot || !latestSnapshot.mac_address) {
      res.status(400).json({ error: "Cannot wake machine: MAC address is not available" });
      return;
    }

    wol.wake(latestSnapshot.mac_address, (error) => {
      if (error) {
        console.error(`[WoL] Failed to wake machine ${machine.hostname}:`, error);
        res.status(500).json({ error: "Failed to send magic packet", details: error.message });
      } else {
        console.log(`[WoL] Sent magic packet to ${latestSnapshot.mac_address} for ${machine.hostname}`);
        res.status(200).json({
          message: `Magic packet sent to ${latestSnapshot.mac_address}`,
        });
      }
    });
  } catch (error) {
    next(error);
  }
};
