$ErrorActionPreference = "Stop"

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw "Docker CLI nao encontrado. Instale/inicie o Docker Desktop."
}

docker version | Out-Null

if (-not (Test-Path ".env")) {
  Copy-Item ".env.local.example" ".env"
  Write-Host "Criado range-provider/.env a partir do exemplo local."
}

node --check server.mjs
node --check providers/local-docker.mjs
node --env-file=.env server.mjs
