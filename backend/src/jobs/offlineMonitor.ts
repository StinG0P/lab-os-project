import cron from "node-cron";
import axios from "axios";
import prisma from "../utils/prismaClient";

export const startOfflineMonitor = (): void => {
  console.log("Offline monitor job initialized.");

  // Schedule task to run every 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    try {
      const thresholdTime = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago

      // Find machines that have timed out and are currently marked online
      const machinesToMarkOffline = await prisma.machine.findMany({
        where: {
          last_checkin_at: {
            lt: thresholdTime,
          },
          status: "online",
        },
      });

      if (machinesToMarkOffline.length > 0) {
        console.log(
          `[Offline Monitor] Found ${machinesToMarkOffline.length} machine(s) going offline.`
        );

        for (const machine of machinesToMarkOffline) {
          try {
            // Update machine status to offline
            await prisma.machine.update({
              where: { id: machine.id },
              data: { status: "offline" },
            });
            console.log(`[Offline Monitor] Marked ${machine.hostname} as offline.`);

            // Trigger alert webhook if configured
            const webhookUrl = process.env.ALERT_WEBHOOK_URL;
            if (webhookUrl) {
              await axios.post(webhookUrl, {
                text: `🚨 ALERT: Machine ${machine.hostname} has gone offline!`,
              });
              console.log(`[Offline Monitor] Webhook fired for ${machine.hostname}`);
            }
          } catch (innerError) {
            console.error(
              `[Offline Monitor] Failed to process status update/alert for ${machine.hostname}:`,
              innerError
            );
          }
        }
      }
    } catch (error) {
      console.error("[Offline Monitor] Error checking machine status:", error);
    }
  });
};
