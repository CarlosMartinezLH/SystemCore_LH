# 🐧 LanAhora - Guía de Instalación Rápida para Linux Mint / Ubuntu

Esta guía te permite poner en marcha el **Sistema Core Web** y la aplicación móvil **LanApp Distribuidora** en tu nueva instalación de **Linux Mint**.

---

## ⚡ Instalación en 1 Solo Paso (Automática)

Abre la terminal en Linux Mint (`Ctrl + Alt + T`) y ejecuta:

```bash
# 1. Clonar el repositorio
git clone https://github.com/CarlosMartinezLH/SystemCore_LH.git
cd SystemCore_LH

# 2. Dar permisos de ejecución y correr el instalador automático
chmod +x setup_linux.sh
./setup_linux.sh
```

El script `setup_linux.sh` hará todo por ti automáticamente:
1. Actualiza los repositorios de Linux Mint e instala dependencias (`curl`, `build-essential`, `adb`, etc.).
2. Instala y configura **Java OpenJDK 17** (`JAVA_HOME`).
3. Instala **Node.js 20 LTS**.
4. Descarga y configura **Flutter SDK**.
5. Restaura automáticamente tu archivo `.env.local` con todas las credenciales de LanAhora (JWT, Nubarium, Keycloak, VAPID WebPush, SMTP).
6. Instala los módulos de `npm install` y `flutter pub get`.
7. Crea un acceso directo en tu Escritorio (`LanAhora_SystemCore.desktop`) y el script `iniciar_sistema.sh`.

---

## 🚀 Cómo Iniciar el Sistema en Linux Mint

Una vez terminada la instalación, puedes arrancar el sistema con cualquiera de estas opciones:

### Opción A (Recomendada):
Doble clic en el icono **LanAhora SystemCore** en tu Escritorio de Linux Mint.

### Opción B (Desde Terminal):
```bash
cd SystemCore_LH
./iniciar_sistema.sh
```

### Opción C (Comando estándar):
```bash
cd SystemCore_LH
npm run dev
```

Abre tu navegador (Chrome o Firefox) en: **http://localhost:3000**

---

## 📱 Compilar y Probar LanApp Distribuidora en Linux Mint

Conecta tu celular (Samsung Galaxy S25 Ultra u otro Android) por cable USB a tu laptop con Linux Mint:

```bash
cd SystemCore_LH/apps/lanapp_distribuidora

# 1. Verificar que tu celular sea detectado
adb devices

# 2. Compilar e instalar directamente en el teléfono
flutter run

# O compilar el paquete APK:
flutter build apk --debug
```

---

## 🔑 Respaldo de Variables de Entorno (`.env.local`)

El instalador `setup_linux.sh` ya lo genera automáticamente, pero se incluye aquí como respaldo:

```bash
PORT=3000
JWT_SECRET=lanahora_systemcore_production_hmac_secret_key_2026_saltillo

ENFORCE_CLOUDFLARE_ZERO_TRUST=false
CLOUDFLARE_ZERO_TRUST_TEAM=lanahora

NUBARIUM_USERNAME=lanahora
NUBARIUM_PASSWORD=#vEJfpcF#

KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=lanahora
KEYCLOAK_CLIENT_ID=systemcore-web
KEYCLOAK_CLIENT_SECRET=systemcore_keycloak_secret_2026

NEXT_PUBLIC_VAPID_PUBLIC_KEY=BFDy2CwbSkeP1gE-Klz7QDteiOpVKM7JzXMuxpXbxiux_RcM3wqS9mTeKxy4tDsccW95-aa0l1CRu9FnJ59ynog
VAPID_PRIVATE_KEY=6U5Zi8NK43BJ8cMQGoJLE0pYJ_V1ZS3nMNK2qfnMZ9E
VAPID_SUBJECT=mailto:soporte@lanahora.com.mx

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=carlos_martinez@lanahora.com
SMTP_PASS=gdlljgffdeictzie
SMTP_FROM="LanAhora Seguridad" <carlos_martinez@lanahora.com>
```
