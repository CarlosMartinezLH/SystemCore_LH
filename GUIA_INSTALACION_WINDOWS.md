# 💻 Guía Rápida de Instalación y Puesta en Marcha en Windows
### LanAhora SystemCore (Next.js 16 / React 19 / Keycloak 26 / TypeScript)

Esta guía contiene los pasos exactos y comandos necesarios para clonar, configurar y levantar el proyecto desde cero en una computadora con sistema operativo **Windows (Windows 10 o Windows 11)**.

---

## 📋 1. Requisitos Previos (Instalar en Windows antes de empezar)

Descarga e instala los siguientes programas oficiales si aún no los tienes en tu laptop:

1. **Git para Windows**
   * Descarga: [https://git-scm.com/download/win](https://git-scm.com/download/win)
   * Durante la instalación, puedes dejar todas las opciones predeterminadas (incluye **Git Bash**).
2. **Node.js LTS (Versión 20.x o 22.x LTS)**
   * Descarga: [https://nodejs.org/](https://nodejs.org/)
   * Verifica en tu terminal con: `node -v` y `npm -v`.
3. **Visual Studio Code** (Recomendado)
   * Descarga: [https://code.visualstudio.com/](https://code.visualstudio.com/)
   * Extensiones sugeridas: *Tailwind CSS IntelliSense*, *ESLint*, *Prettier*.
4. **Servidor de Identidad Keycloak (Elige UNA de las 2 opciones):**
   * **Opción A (Recomendada - Con Docker):** Instala [Docker Desktop para Windows](https://www.docker.com/products/docker-desktop/) (habilita WSL2).
   * **Opción B (Sin Docker - Nativo):** Instala [Eclipse Temurin Java JDK 21](https://adoptium.net/temurin/releases/?version=21) para ejecutar el archivo `kc.bat`.

---

## 🚀 2. Clonar el Proyecto y Descargar la Rama de Trabajo

Abre tu terminal favorita en Windows (**PowerShell**, **Símbolo del sistema (CMD)** o **Git Bash**) y ejecuta:

```bash
# 1. Ve a la carpeta donde guardas tus proyectos (por ejemplo, C:\proyectos o tu Escritorio)
cd C:\Users\%USERNAME%\Desktop

# 2. Clona el repositorio
git clone https://github.com/CarlosMartinezLH/SystemCore_LH.git

# 3. Entra a la carpeta del proyecto
cd SystemCore_LH

# 4. Asegúrate de posicionarte en la rama activa de desarrollo
git checkout develop

# 5. Configuración recomendada en Windows para saltos de línea (CRLF / LF)
git config core.autocrlf false
```

---

## ⚙️ 3. Configurar las Variables de Entorno (`.env.local`)

El repositorio incluye una plantilla preconfigurada con todas las variables requeridas para el entorno de desarrollo y conexión con servicios KYC de Nubarium y Keycloak.

En tu terminal de Windows ejecuta:

```cmd
:: En CMD o PowerShell copia el archivo de ejemplo:
copy .env.example .env.local
```

*(Si estás usando Git Bash, el comando es `cp .env.example .env.local`)*.

El contenido generado en `.env.local` es:
```env
PORT=3000
NUBARIUM_USERNAME=lanahora
NUBARIUM_PASSWORD=#vEJfpcF#
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=lanahora
KEYCLOAK_CLIENT_ID=systemcore-web
KEYCLOAK_CLIENT_SECRET=systemcore_keycloak_secret_2026
```

---

## 📦 4. Instalar Dependencias de Node.js

Instala los paquetes de npm necesarios para compilar y ejecutar Next.js 16:

```cmd
npm install
```

> [!NOTE]
> La instalación descargará Next.js 16, React 19, Lucide React, Sharp y todas las librerías del core financiero.

---

## 🔐 5. Iniciar el Servidor de Identidad Keycloak (IAM)

SystemCore utiliza Keycloak para la gestión de usuarios, roles (RBAC) y sesiones OpenID Connect. Puedes iniciarlo de dos formas:

### Opción A: Usando Docker Compose (Recomendada y más rápida)
Si tienes Docker Desktop abierto en Windows, simplemente corre en la raíz del proyecto:

```cmd
docker compose up -d
```
*Este comando descargará Postgres 16 y Keycloak 26, e importará automáticamente el archivo `keycloak/data/import/lanahora-realm.json`.*

### Opción B: Ejecución nativa sin Docker (`kc.bat`)
Si prefieres no usar Docker:
1. Descarga el archivo ZIP de **Keycloak 26.x** desde [keycloak.org](https://www.keycloak.org/downloads).
2. Descomprímelo en una carpeta, por ejemplo `C:\keycloak`.
3. Copia el archivo del reino al directorio de importación de Keycloak:
   ```cmd
   xcopy keycloak\data\import C:\keycloak\data\import /E /I /Y
   ```
4. Inicia Keycloak en modo desarrollo indicando las credenciales maestras:
   ```cmd
   cd C:\keycloak
   set KEYCLOAK_ADMIN=admin
   set KEYCLOAK_ADMIN_PASSWORD=admin_password
   bin\kc.bat start-dev --import-realm
   ```

*Keycloak quedará escuchando en `http://localhost:8080`.*

---

## 🌐 6. Iniciar el Servidor Web de Desarrollo (Next.js)

En la terminal ubicada en la carpeta `SystemCore_LH`, ejecuta:

```cmd
npm run dev
```

La consola mostrará:
```text
▲ Next.js 16.4.5 (Turbopack)
- Local:        http://localhost:3000
- Environments: .env.local
✓ Ready in 1200ms
```

¡Listo! Abre tu navegador en **`http://localhost:3000`**.

---

## 🔑 7. Accesos y Credenciales Preconfiguradas

### A. Portal Administrativo SystemCore (`http://localhost:3000`)
| Rol | Correo / Usuario | Contraseña | Alcance y Permisos |
| :--- | :--- | :--- | :--- |
| **Administrador General** | `admin@lanahora.com` | `lanahora2026` | Acceso total a todos los módulos, auditoría, configuración de sucursales y usuarios. |
| **Mesa de Crédito** | `credito@lanahora.com` | `credito2026` | Validación y autorización de prospectos, verificación de expedientes, mesa de control. |
| **Coordinador Regional** | `coordinador@lanahora.com` | `lanahora2026` | Supervisión de rutas, seguimiento a distribuidoras y comisiones. |

### B. Módulo E-Commerce LanaTienda (`http://localhost:3000/tienda`)
* **URL:** [http://localhost:3000/tienda](http://localhost:3000/tienda)
* **Funcionalidad:** Catálogo de productos (celulares, línea blanca, motos), carrito de compras a 16 quincenas, cálculo de pagos en vivo y generación de orden referenciada a distribuidoras.

### C. Consola de Keycloak (`http://localhost:8080/admin`)
* **Usuario Administrador:** `admin`
* **Contraseña:** `admin_password`
* **Reino de trabajo:** `lanahora`

---

## 📱 8. ¿Vas a trabajar en la App Móvil (Flutter)?

Si en la laptop con Windows también vas a ejecutar o compilar las apps móviles:

1. **Plataformas soportadas en Windows:**
   * **`LanApp` (Distribuidoras):** Puedes probarla y compilarla en **Android** (emulador o teléfono conectado por USB con Depuración activada). *(Nota: La compilación para iPhone requiere macOS/Xcode)*.
   * **`LH Asesores` (Fuerza de Ventas):** Exclusiva para **Android**.
2. **Ubicación del código móvil:**
   La carpeta del proyecto móvil se encuentra en la ruta hermana: `mobile_app` (o clonada en tu espacio de trabajo).
3. **Comandos básicos de Flutter en Windows:**
   ```bash
   cd mobile_app
   flutter pub get
   flutter analyze

   # Correr LanApp en teléfono o emulador Android:
   flutter run --flavor lanapp -t lib/main_lanapp.dart

   # Correr LH Asesores en Android:
   flutter run --flavor asesores -t lib/main_asesores.dart
   ```

---

## 🛠️ 9. Solución de Problemas Frecuentes en Windows

### 1. Error de PowerShell: *"La ejecución de scripts está deshabilitada en este sistema"*
Si al ejecutar `npm` o scripts en PowerShell recibes este mensaje de seguridad de Windows:
1. Abre PowerShell como **Administrador** (clic derecho -> Ejecutar como Administrador).
2. Ejecuta:
   ```powershell
   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
   ```
3. Presiona `S` (Sí) y vuelve a tu terminal normal.

### 2. El puerto 3000 u 8080 ya está ocupado (`EADDRINUSE`)
Si otro proceso dejó tomado el puerto 3000:
1. En CMD averigua el ID del proceso (PID):
   ```cmd
   netstat -ano | findstr :3000
   ```
2. Finaliza el proceso que estorba (reemplaza `<PID>` por el número que apareció al final de la línea):
   ```cmd
   taskkill /PID <PID> /F
   ```

### 3. Verificar que todo compila sin errores antes de hacer push
Antes de enviar cambios a GitHub desde tu nueva laptop:
```cmd
npm run build
```
Si el resultado es `✓ Compiled successfully`, todo tu código de TypeScript y Next.js está en perfecto orden.
