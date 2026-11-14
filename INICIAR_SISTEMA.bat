@echo off
:: ============================================================================
:: LANAHORA SYSTEMCORE - INICIALIZADOR CON PRIVILEGIOS DE ADMINISTRADOR
:: ============================================================================
title LanAhora SystemCore - Lanzador Administrador

:: Verificar si ya se está ejecutando como Administrador
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Permisos de Administrador confirmados.
    powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0iniciar_sistema.ps1"
) else (
    echo [!] Solicitando elevacion a Administrador en PowerShell...
    powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "Start-Process powershell.exe -Verb RunAs -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File \"\"%~dp0iniciar_sistema.ps1\"\"'"
)
