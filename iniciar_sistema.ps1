<#
.SYNOPSIS
    Script de Inicio y Puesta en Marcha - LanAhora SystemCore
.DESCRIPTION
    Ejecuta el entorno completo de desarrollo tras reiniciar el equipo.
    Requiere permisos de Administrador en PowerShell.
#>

#Requires -RunAsAdministrator

[CmdletBinding()]
param(
    [switch]$SkipBrowser,
    [switch]$SkipDocker,
    [switch]$SkipGitPull
)

# Configurar codificación UTF-8 para caracteres especiales y acentos
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# 1. Validar permisos de Administrador
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host ""
    Write-Host " [!] Este script requiere ejecutarse como Administrador en PowerShell." -ForegroundColor Yellow
    Write-Host "     Solicitando permisos elevados UAC..." -ForegroundColor Cyan
    Start-Process powershell.exe -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`""
    exit
}

# 2. Establecer política de ejecución temporal en el proceso
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force -ErrorAction SilentlyContinue

Clear-Host
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "   LANAHORA SYSTEMCORE - INICIO DE SERVICIOS (ADMINISTRADOR)     " -ForegroundColor White
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

# 3. Posicionarse en el directorio del proyecto
$ProjectDir = $PSScriptRoot
if (-not (Test-Path "$ProjectDir\package.json")) {
    $ProjectDir = "C:\Users\carlo\OneDrive\Desktop\Lanahora\SystemCore_LH"
}
Set-Location $ProjectDir
Write-Host " [+] Directorio de trabajo: $ProjectDir" -ForegroundColor Gray

# 4. Verificar Node.js y npm
Write-Host " [+] Verificando Node.js y npm..." -ForegroundColor Gray
try {
    $nodeVer = & node -v
    $npmVer = & npm -v
    Write-Host "     - Node.js: $nodeVer" -ForegroundColor Green
    Write-Host "     - npm:     v$npmVer" -ForegroundColor Green
} catch {
    Write-Host " [X] ERROR: Node.js no está instalado o no se encuentra en el PATH." -ForegroundColor Red
    Pause
    exit 1
}

# 5. Liberar puerto 3000 si quedó bloqueado
Write-Host " [+] Verificando disponibilidad del puerto 3000..." -ForegroundColor Gray
$occupiedPorts = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($occupiedPorts) {
    Write-Host "     - Puerto 3000 ocupado por proceso(s) previo(s). Liberando..." -ForegroundColor Yellow
    foreach ($conn in $occupiedPorts) {
        try {
            Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
            Write-Host "       Proceso PID $($conn.OwningProcess) detenido." -ForegroundColor DarkYellow
        } catch {}
    }
    Start-Sleep -Seconds 1
} else {
    Write-Host "     - Puerto 3000 libre y listo." -ForegroundColor Green
}

# 6. Levantar Keycloak / Docker si está disponible
if (-not $SkipDocker) {
    Write-Host " [+] Verificando Docker para servidor de identidad (Keycloak)..." -ForegroundColor Gray
    try {
        $dockerRunning = docker info 2>&1
        if ($LASTEXITCODE -eq 0 -and (Test-Path "$ProjectDir\docker-compose.yml")) {
            Write-Host "     - Docker detectado. Iniciando contenedores (Keycloak / Postgres)..." -ForegroundColor Cyan
            docker compose up -d 2>$null
            Write-Host "     - Keycloak activo en http://localhost:8080" -ForegroundColor Green
        } else {
            Write-Host "     - Docker Desktop no está iniciado (Continuando con modo dev bypass)..." -ForegroundColor DarkGray
        }
    } catch {
        Write-Host "     - Docker no disponible (Continuando con modo dev bypass)..." -ForegroundColor DarkGray
    }
}

# 7. Verificar dependencias de Node.js (node_modules)
if (-not (Test-Path "$ProjectDir\node_modules")) {
    Write-Host " [!] node_modules no encontrado. Instalando dependencias (npm install)..." -ForegroundColor Yellow
    npm.cmd install
}

# 8. Sincronizar rama de trabajo git
if (-not $SkipGitPull) {
    Write-Host " [+] Verificando estado de Git..." -ForegroundColor Gray
    try {
        $branch = (git branch --show-current).Trim()
        Write-Host "     - Rama actual: $branch" -ForegroundColor Cyan
        git status -s
    } catch {}
}

# 9. Iniciar el servidor Next.js
Write-Host ""
Write-Host "=================================================================" -ForegroundColor Green
Write-Host "   INICIANDO SYSTEMCORE EN MODO DESARROLLO (NEXT.JS 16)...       " -ForegroundColor White
Write-Host "   URL: http://localhost:3000                                    " -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Green
Write-Host ""

# Abrir el navegador tras 3 segundos en paralelo
if (-not $SkipBrowser) {
    Start-Job -ScriptBlock {
        Start-Sleep -Seconds 4
        Start-Process "http://localhost:3000"
    } | Out-Null
}

# Ejecutar el servidor de Next.js
npm.cmd run dev
