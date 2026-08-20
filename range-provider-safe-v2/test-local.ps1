$ErrorActionPreference = "Stop"
$apiKey = "fortify-local-dev-change-me"

Write-Host "Health publico:"
curl.exe http://127.0.0.1:8787/health
Write-Host "`nDocker health:"
curl.exe -H "Authorization: Bearer $apiKey" http://127.0.0.1:8787/health/local
