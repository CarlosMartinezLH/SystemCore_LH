# ==============================================================================
# LanAhora - Script de Compilación Automática de LanApp Distribuidora
# ==============================================================================
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# Auto-detección de JDK 17 si está en rutas habituales
if ($env:JAVA_HOME -and (Test-Path "$env:JAVA_HOME\bin\java.exe")) {
    Write-Host "Usando JAVA_HOME existente: $env:JAVA_HOME"
} elseif (Test-Path "C:\Program Files\Microsoft\jdk-17.0.21.102-hotspot") {
    $env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.21.102-hotspot"
    $env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
}

Write-Host "Java version:"
java -version

Write-Host "`nIniciando compilacion de APK Debug para LanApp Distribuidora..."
flutter build apk --debug

Write-Host "`nResultado de compilacion (Exit code: $LASTEXITCODE)"
if ($LASTEXITCODE -eq 0) {
    Write-Host "APK generado exitosamente en: $ScriptDir\build\app\outputs\flutter-apk\app-debug.apk" -ForegroundColor Green
}
