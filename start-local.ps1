$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

Start-Process -FilePath 'dotnet' `
  -ArgumentList @('run', '--project', 'backend\src\JordyTamayo.Api', '--urls', 'http://localhost:5188') `
  -WorkingDirectory $projectRoot `
  -WindowStyle Hidden

Start-Process -FilePath 'npm.cmd' `
  -ArgumentList @('run', 'dev') `
  -WorkingDirectory $projectRoot `
  -WindowStyle Hidden

Write-Host 'Sitio:  http://localhost:3000 (o el siguiente puerto disponible)'
Write-Host 'Admin:  http://localhost:3000/admin'
Write-Host 'API:    http://localhost:5188/api/health'
