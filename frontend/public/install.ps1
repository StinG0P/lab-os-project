param (
    [Parameter(Mandatory=$true)]
    [string]$token
)

# Extract system telemetry
$hostname = $env:COMPUTERNAME

$body = @{
    org_token = $token
    hostname  = $hostname
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "[+] Registering Windows node..."
try {
    $response = Invoke-RestMethod -Uri "https://lab-os-project-1.onrender.com/api/v1/agent/register" -Method Post -Body $body -Headers $headers
    Write-Host "[+] SUCCESS: Node registered successfully!"
    Write-Host ($response | Out-String)
} catch {
    Write-Error "[-] Failed to register node: $_"
}
