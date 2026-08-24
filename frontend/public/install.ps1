param (
    [Parameter(Mandatory=$true)]
    [string]$token
)

# Extract system telemetry using standard PowerShell commands
$hostname = $env:COMPUTERNAME
$os = (Get-CimInstance Win32_OperatingSystem).Caption
$cpu = (Get-CimInstance Win32_Processor).Name
$total_ram = [Math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1MB)

$body = @{
    hostname = $hostname
    os = $os
    cpu = $cpu
    ram_total_mb = $total_ram
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "[+] Registering Windows node..."
try {
    $response = Invoke-RestMethod -Uri "https://lab-os-project-1.onrender.com/api/v1/machines" -Method Post -Body $body -Headers $headers
    Write-Host "[+] SUCCESS: Node registered successfully!"
    Write-Host ($response | Out-String)
} catch {
    Write-Error "[-] Failed to register node: $_"
}
