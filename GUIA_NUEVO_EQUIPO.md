# 🚀 LanAhora - Guía de Inicio Rápido en un Equipo Nuevo

Esta guía contiene todo lo necesario para clonar, configurar y poner en marcha tanto el **Sistema Core Web** como la aplicación móvil **LanApp Distribuidora** en una computadora nueva recién formateada.

---

## 📋 1. Requisitos Previos en el Nuevo Equipo

1. **Git para Windows**:
   - Descargar e instalar desde: https://git-scm.com/
2. **Node.js (versión 20 o 22 LTS)**:
   - Descargar e instalar desde: https://nodejs.org/
3. **Flutter SDK (3.24 o 3.27+)**:
   - Descargar desde: https://docs.flutter.dev/get-started/install/windows/mobile
   - Extraer en una ruta corta, por ejemplo: `C:\src\flutter`
   - Agregar `C:\src\flutter\bin` al `PATH` del sistema.
4. **Java JDK 17 (Esencial para Flutter / Android)**:
   - Descargar **Microsoft Build of OpenJDK 17**: https://learn.microsoft.com/en-us/java/openjdk/download
   - O mediante winget en PowerShell:
     ```powershell
     winget install Microsoft.OpenJDK.17
     ```
5. **Android SDK / Platform Tools**:
   - Instalar Android Studio o descargar Platform Tools (`adb.exe`) desde: https://developer.android.com/tools/releases/platform-tools
6. **Docker Desktop** (Opcional, para levantar Keycloak o base de datos local):
   - Descargar desde: https://www.docker.com/products/docker-desktop/

---

## 📥 2. Clonar el Repositorio Monorepo Completo

Abre una terminal (PowerShell) y ejecuta:

```powershell
git clone https://github.com/CarlosMartinezLH/SystemCore_LH.git
cd SystemCore_LH
```

> **Estructura del Proyecto:**
> - `/` &rarr; Sistema Core Web (Next.js 16 + Turbopack + Tailwind)
> - `/apps/lanapp_distribuidora` &rarr; App Móvil de Distribuidoras en Flutter

---

## 🌐 3. Poner en Marcha el Sistema Core Web

Dentro de la carpeta `SystemCore_LH`:

```powershell
# 1. Instalar dependencias de Node.js
npm install

# 2. Configurar variables de entorno
# Puedes copiar el archivo de ejemplo o restaurar tus llaves:
copy .env.example .env.local

# 3. Iniciar el servidor de desarrollo
npm run dev
```

El sistema estará disponible inmediatamente en: **http://localhost:3000**

---

## 🔑 4. Respaldo de Variables de Entorno (`.env.local`)

Para que el nuevo equipo conserve exactamente las llaves de autenticación, notificaciones WebPush VAPID, Nubarium y SMTP, tu `.env.local` debe tener estos valores:

```bash
# Puerto de ejecución local (Next.js)
PORT=3000

# Secreto Criptográfico Institucional para Firma de Sesiones JWT (HMAC-SHA256)
JWT_SECRET=lanahora_systemcore_production_hmac_secret_key_2026_saltillo

# Perímetro y Sinergia Cloudflare Zero Trust (false en local para desarrollo)
ENFORCE_CLOUDFLARE_ZERO_TRUST=false
CLOUDFLARE_ZERO_TRUST_TEAM=lanahora

# Credenciales de Servicio Nubarium (Validación Oficial CURP / RENAPO / Biometría)
NUBARIUM_USERNAME=lanahora
NUBARIUM_PASSWORD=#vEJfpcF#

# Servidor de Identidad Keycloak (IAM OIDC)
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=lanahora
KEYCLOAK_CLIENT_ID=systemcore-web
KEYCLOAK_CLIENT_SECRET=systemcore_keycloak_secret_2026

# Web Push VAPID Keys para Notificaciones Reales en Celulares
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BFDy2CwbSkeP1gE-Klz7QDteiOpVKM7JzXMuxpXbxiux_RcM3wqS9mTeKxy4tDsccW95-aa0l1CRu9FnJ59ynog
VAPID_PRIVATE_KEY=6U5Zi8NK43BJ8cMQGoJLE0pYJ_V1ZS3nMNK2qfnMZ9E
VAPID_SUBJECT=mailto:soporte@lanahora.com.mx

# Configuración de Envío Real de Correo (SMTP / Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=carlos_martinez@lanahora.com
SMTP_PASS=gdlljgffdeictzie
SMTP_FROM="LanAhora Seguridad" <carlos_martinez@lanahora.com>
```

---

## 📱 5. Poner en Marcha la App Móvil (LanApp Distribuidora)

Para compilar y probar la app de distribuidoras en el nuevo equipo:

```powershell
cd apps\lanapp_distribuidora

# 1. Descargar dependencias de Flutter
flutter pub get

# 2. Compilar APK Debug automáticamente con el script incluido
powershell -ExecutionPolicy Bypass -File .\build_lanapp.ps1
```

O directamente mediante Flutter:
```powershell
flutter build apk --debug
```

### Instalar en Celular (Samsung S25 Ultra u otro) vía USB:
```powershell
adb devices
adb install -r build\app\outputs\flutter-apk\app-debug.apk
```

---

## 🚀 6. Comandos Rápidos de Verificación

- Verificar tipos en Web: `npx tsc --noEmit`
- Compilar para producción Web: `npm run build`
- Diagnóstico de Flutter: `flutter doctor`
