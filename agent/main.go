package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"time"
)

type Disk struct {
	Mount  string `json:"mount"`
	SizeGB int    `json:"size_gb"`
	UsedGB int    `json:"used_gb"`
}

type SnapshotPayload struct {
	MachineToken      string   `json:"machine_token"`
	Hostname          string   `json:"hostname"`
	CPUModel          string   `json:"cpu_model"`
	CPUCores          int      `json:"cpu_cores"`
	RAMTotalMB        int      `json:"ram_total_mb"`
	RAMUsedMB         int      `json:"ram_used_mb"`
	Disks             []Disk   `json:"disks"`
	OSName            string   `json:"os_name"`
	OSVersion         string   `json:"os_version"`
	KernelVersion     string   `json:"kernel_version"`
	InstalledPackages []string `json:"installed_packages"`
	IPAddress         string   `json:"ip_address"`
	MACAddress        string   `json:"mac_address"`
	UptimeSeconds     int      `json:"uptime_seconds"`
	LastUser          string   `json:"last_user"`
}

type RegisterPayload struct {
	OrgToken string `json:"org_token"`
	Hostname string `json:"hostname"`
}

type RegisterResponse struct {
	MachineID    string `json:"machine_id"`
	MachineToken string `json:"machine_token"`
}

func getHostname() string {
	hostname, err := os.Hostname()
	if err != nil {
		return "unknown-host"
	}
	return hostname
}

func getOSInfo() (name string, version string) {
	name = "Linux"
	version = "Unknown"
	file, err := os.Open("/etc/os-release")
	if err != nil {
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "NAME=") {
			name = strings.Trim(strings.TrimPrefix(line, "NAME="), `"`)
		} else if strings.HasPrefix(line, "VERSION_ID=") {
			version = strings.Trim(strings.TrimPrefix(line, "VERSION_ID="), `"`)
		}
	}
	return
}

func getKernelVersion() string {
	out, err := exec.Command("uname", "-r").Output()
	if err != nil {
		return "unknown-kernel"
	}
	return strings.TrimSpace(string(out))
}

func getUptime() int {
	data, err := os.ReadFile("/proc/uptime")
	if err != nil {
		return 0
	}
	fields := strings.Fields(string(data))
	if len(fields) > 0 {
		uptimeFloat, err := strconv.ParseFloat(fields[0], 64)
		if err == nil {
			return int(uptimeFloat)
		}
	}
	return 0
}

func getCPUInfo() (model string, cores int) {
	model = "Unknown CPU"
	cores = 0

	file, err := os.Open("/proc/cpuinfo")
	if err != nil {
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "processor") {
			cores++
		} else if model == "Unknown CPU" && strings.Contains(line, "model name") {
			parts := strings.SplitN(line, ":", 2)
			if len(parts) == 2 {
				model = strings.TrimSpace(parts[1])
			}
		}
	}
	if cores == 0 {
		cores = 1
	}
	return
}

func getRAMInfo() (totalMB int, usedMB int) {
	file, err := os.Open("/proc/meminfo")
	if err != nil {
		return 0, 0
	}
	defer file.Close()

	var memTotalkB, memAvailablekB int
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "MemTotal:") {
			fields := strings.Fields(line)
			if len(fields) >= 2 {
				memTotalkB, _ = strconv.Atoi(fields[1])
			}
		} else if strings.HasPrefix(line, "MemAvailable:") {
			fields := strings.Fields(line)
			if len(fields) >= 2 {
				memAvailablekB, _ = strconv.Atoi(fields[1])
			}
		}
	}

	totalMB = memTotalkB / 1024
	availableMB := memAvailablekB / 1024
	usedMB = totalMB - availableMB
	if usedMB < 0 {
		usedMB = 0
	}
	return
}

func getDiskInfo() []Disk {
	var disks []Disk
	out, err := exec.Command("df", "-B1G", "/").Output()
	if err != nil {
		return disks
	}

	lines := strings.Split(string(out), "\n")
	if len(lines) >= 2 {
		for i := 1; i < len(lines); i++ {
			line := strings.TrimSpace(lines[i])
			if line == "" {
				continue
			}
			fields := strings.Fields(line)
			if len(fields) >= 6 {
				sizeGB, _ := strconv.Atoi(strings.TrimSuffix(fields[1], "G"))
				usedGB, _ := strconv.Atoi(strings.TrimSuffix(fields[2], "G"))
				mount := fields[5]
				disks = append(disks, Disk{
					Mount:  mount,
					SizeGB: sizeGB,
					UsedGB: usedGB,
				})
			}
		}
	}
	return disks
}

func getNetworkInfo() (ip string, mac string) {
	ip = "127.0.0.1"
	mac = "00:00:00:00:00:00"
	interfaces, err := net.Interfaces()
	if err != nil {
		return
	}
	for _, iface := range interfaces {
		if iface.Flags&net.FlagLoopback != 0 || iface.Flags&net.FlagUp == 0 {
			continue
		}
		addrs, err := iface.Addrs()
		if err != nil || len(addrs) == 0 {
			continue
		}
		for _, addr := range addrs {
			var ipNet *net.IPNet
			switch v := addr.(type) {
			case *net.IPNet:
				ipNet = v
			}
			if ipNet != nil && ipNet.IP.To4() != nil {
				ip = ipNet.IP.String()
				mac = iface.HardwareAddr.String()
				return
			}
		}
	}
	return
}

func getLastUser() string {
	out, err := exec.Command("who").Output()
	if err == nil {
		lines := strings.Split(strings.TrimSpace(string(out)), "\n")
		if len(lines) > 0 && lines[0] != "" {
			fields := strings.Fields(lines[0])
			if len(fields) > 0 {
				return fields[0]
			}
		}
	}
	return "unknown"
}

func getInstalledPackages() []string {
	out, err := exec.Command("dpkg-query", "-f", "${binary:Package}\n", "-W").Output()
	if err != nil {
		return []string{}
	}

	lines := strings.Split(strings.TrimSpace(string(out)), "\n")
	var pkgs []string
	for _, l := range lines {
		trimmed := strings.TrimSpace(l)
		if trimmed != "" {
			pkgs = append(pkgs, trimmed)
		}
	}
	return pkgs
}

func collectRealData(machineToken string) SnapshotPayload {
	osName, osVersion := getOSInfo()
	cpuModel, cpuCores := getCPUInfo()
	ramTotal, ramUsed := getRAMInfo()
	ipAddress, macAddress := getNetworkInfo()

	return SnapshotPayload{
		MachineToken:      machineToken,
		Hostname:          getHostname(),
		CPUModel:          cpuModel,
		CPUCores:          cpuCores,
		RAMTotalMB:        ramTotal,
		RAMUsedMB:         ramUsed,
		Disks:             getDiskInfo(),
		OSName:            osName,
		OSVersion:         osVersion,
		KernelVersion:     getKernelVersion(),
		InstalledPackages: getInstalledPackages(),
		IPAddress:         ipAddress,
		MACAddress:        macAddress,
		UptimeSeconds:     getUptime(),
		LastUser:          getLastUser(),
	}
}

func registerAgent(orgToken string, apiURL string) (string, error) {
	hostname := getHostname()
	payload := RegisterPayload{
		OrgToken: orgToken,
		Hostname: hostname,
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("failed to marshal register payload: %w", err)
	}

	resp, err := http.Post(apiURL, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("failed to send register request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		return "", fmt.Errorf("registration failed with status code: %d", resp.StatusCode)
	}

	var regResp RegisterResponse
	err = json.NewDecoder(resp.Body).Decode(&regResp)
	if err != nil {
		return "", fmt.Errorf("failed to decode register response: %w", err)
	}

	return regResp.MachineToken, nil
}

func sendCheckin(payload SnapshotPayload, apiURL string, machineToken string) error {
	jsonData, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal payload: %w", err)
	}

	req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+machineToken)

	client := &http.Client{
		Timeout: 5 * time.Second,
	}

	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("unexpected response status: %s", resp.Status)
	}

	return nil
}

func main() {
	baseAPIURL := "http://localhost:5000/api/v1"
	registerURL := baseAPIURL + "/agent/register"
	checkinURL := baseAPIURL + "/agent/checkin"

	tokenPath := "/etc/lab-agent/org_token.txt"
	tokenBytes, err := os.ReadFile(tokenPath)
	if err != nil {
		fmt.Printf("Error: Failed to read organization token from %s: %v\n", tokenPath, err)
		fmt.Println("Check-in agent exiting since registration credentials are not found.")
		os.Exit(1)
	}
	orgToken := strings.TrimSpace(string(tokenBytes))

	fmt.Println("Registering agent with organization...")
	machineToken, err := registerAgent(orgToken, registerURL)
	if err != nil {
		fmt.Printf("Error: Registration failed: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("Registration successful!")
	fmt.Println("Starting lab-agent telemetry checking loop...")

	for {
		payload := collectRealData(machineToken)
		err := sendCheckin(payload, checkinURL, machineToken)
		if err != nil {
			fmt.Printf("[%s] Check-in failed: %v\n", time.Now().Format(time.RFC3339), err)
		} else {
			fmt.Printf("[%s] Check-in successful\n", time.Now().Format(time.RFC3339))
		}

		time.Sleep(10 * time.Second)
	}
}
