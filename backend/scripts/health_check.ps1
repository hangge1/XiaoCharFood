$ErrorActionPreference = "Stop"

$port = if ($env:PORT) { $env:PORT } else { "3001" }
$url = "http://127.0.0.1:$port/health"

Invoke-RestMethod -Uri $url -Method Get | ConvertTo-Json -Compress

