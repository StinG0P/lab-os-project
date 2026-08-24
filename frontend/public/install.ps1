param (
    [Parameter(Mandatory=$true)]
    [string]$token
)

# Host telemetry endpoints
$baseUrl = "https://lab-os-project-1.onrender.com/api/v1"
$hostname = $env:COMPUTERNAME

# 1. Registration Phase
Write-Host "[+] Initializing registration with organization token..."
$regBody = @{
    org_token = $token
    hostname  = $hostname
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
}

try {
    $regResponse = Invoke-RestMethod -Uri "$baseUrl/agent/register" -Method Post -Body $regBody -Headers $headers
    $machineToken = $regResponse.machine_token
    Write-Host "[+] SUCCESS: Node registered. Machine Token: $machineToken"
} catch {
    Write-Error "[-] Registration failed: $_"
    exit 1
}

# 2. Telemetry Gathering Phase
Write-Host "[+] Gathering system hardware specifications..."
$osCim = Get-CimInstance Win32_OperatingSystem
$cpuCim = Get-CimInstance Win32_Processor

$cpuModel = $cpuCim.Name
$cpuCores = [int]$cpuCim.NumberOfCores

$totalMemoryMb = [int][Math]::Round($osCim.TotalVisibleMemorySize / 1024)
$freeMemoryMb = [int][Math]::Round($osCim.FreePhysicalMemory / 1024)
$usedMemoryMb = $totalMemoryMb - $freeMemoryMb

$osName = $osCim.Caption
$osVersion = $osCim.Version

$checkinBody = @{
    cpu_model    = $cpuModel
    cpu_cores    = $cpuCores
    ram_total_mb = $totalMemoryMb
    ram_used_mb  = $usedMemoryMb
    os_name      = $osName
    os_version   = $osVersion
} | ConvertTo-Json

# 3. Check-in Phase
Write-Host "[+] Initiating telemetry check-in stream..."
$checkinHeaders = @{
    "Authorization" = "Bearer $machineToken"
    "Content-Type"  = "application/json"
}

try {
    $checkinResponse = Invoke-RestMethod -Uri "$baseUrl/agent/checkin" -Method Post -Body $checkinBody -Headers $checkinHeaders
    Write-Host "[+] SUCCESS: Telemetry data streaming online!"
    Write-Host ($checkinResponse | Out-String)
} catch {
    Write-Error "[-] Check-in stream transmission failed: $_"
    exit 1
}
