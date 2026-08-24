#!/bin/bash

# Production-grade Lab Telemetry Agent Installer Script
set -e

# 1. Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "[-] Error: This script must be run as root (sudo)."
  exit 1
fi

# 2. Parse arguments to capture --token
TOKEN=""
for i in "$@"; do
  case $i in
    --token=*)
      TOKEN="${i#*=}"
      shift
      ;;
    *)
      # Ignore other options
      ;;
  esac
done

if [ -z "$TOKEN" ]; then
  echo "[-] Error: Organization token is missing."
  echo "Usage: sudo bash install.sh --token=YOUR_ORG_TOKEN"
  exit 1
fi

echo "[+] Initializing installation..."

# 3. Create restricted system user lab-agent if not exists
if ! id -u lab-agent >/dev/null 2>&1; then
  echo "[+] Creating restricted system user 'lab-agent'..."
  useradd -r -s /bin/false lab-agent
else
  echo "[+] System user 'lab-agent' already exists."
fi

# 4. Download agent binary
echo "[+] Downloading agent binary..."
curl -sSL -o /usr/local/bin/lab-agent http://localhost:5000/static/lab-agent
chmod +x /usr/local/bin/lab-agent

# 5. Create secure configuration directory
echo "[+] Configuring organization credentials..."
mkdir -p /etc/lab-agent
echo "$TOKEN" > /etc/lab-agent/org_token.txt

# Secure configuration directory and credentials file
chown -R lab-agent:lab-agent /etc/lab-agent
chmod 700 /etc/lab-agent
chmod 600 /etc/lab-agent/org_token.txt

# 6. Create systemd service file
echo "[+] Creating systemd service configuration..."
cat <<EOF > /etc/systemd/system/lab-agent.service
[Unit]
Description=Lab Telemetry Agent Service
After=network.target

[Service]
Type=simple
User=lab-agent
ExecStart=/usr/local/bin/lab-agent
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# 7. Start and enable service
echo "[+] Starting lab-agent daemon..."
systemctl daemon-reload
systemctl enable lab-agent.service
systemctl start lab-agent.service

# 8. Success Output
echo "============================================="
echo -e "\e[32m[+] SUCCESS: Installation Complete!\e[0m"
echo -e "\e[32m[+] The Lab Telemetry Agent is running securely as a daemon.\e[0m"
echo -e "\e[32m[+] This node is now streaming metrics to the inventory dashboard.\e[0m"
echo "============================================="
