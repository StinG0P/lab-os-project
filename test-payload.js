const orgToken = "test_token_123";
const hostname = "lab-gpu-rig-01";

async function main() {
  try {
    console.log("1. Registering agent...");
    const regRes = await fetch("http://localhost:5000/api/v1/agent/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ org_token: orgToken, hostname }),
    });

    if (!regRes.ok) {
      const errText = await regRes.text();
      throw new Error(`Registration failed: ${regRes.status} - ${errText}`);
    }

    const regData = await regRes.json();
    const machineToken = regData.machine_token;
    console.log(`[+] Registered successfully! Machine Token: ${machineToken}`);

    console.log("2. Sending telemetry check-in payload...");
    const payload = {
      cpu_model: "AMD Ryzen 9 5950X",
      cpu_cores: 16,
      ram_total_mb: 65536,
      ram_used_mb: 18432,
      os_name: "Ubuntu",
      os_version: "22.04 LTS",
      kernel_version: "5.15.0-76-generic",
      disk_json: [{ mount: "/", size_gb: 1024, used_gb: 450 }],
      installed_packages: ["docker-ce", "nvidia-cuda-toolkit", "python3"],
      ip_address: "192.168.1.105",
      mac_address: "00:1A:2B:3C:4D:5E",
      uptime_seconds: 345600,
      last_user: "student_ai_lab",
    };

    const checkinRes = await fetch("http://localhost:5000/api/v1/agent/checkin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${machineToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!checkinRes.ok) {
      const errText = await checkinRes.text();
      throw new Error(`Checkin failed: ${checkinRes.status} - ${errText}`);
    }

    const checkinData = await checkinRes.json();
    console.log("[+] Check-in successful!", checkinData);
  } catch (error) {
    console.error("[-] Test script error:", error);
  }
}

main();
