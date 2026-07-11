$ErrorActionPreference = "Stop"

$backendRoot = Split-Path -Parent $PSScriptRoot
Set-Location $backendRoot

python -m src.server

