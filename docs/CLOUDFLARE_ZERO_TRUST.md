# 🛡️ Guía de Configuración: Cloudflare Zero Trust (Access)
### Acceso Institucional LanAhora SystemCore con Código al Correo (14 Días)

Esta arquitectura implementa un **doble cinturón de seguridad** bancario:
1. **Perímetro de Red (Cloudflare Access):** Protege la entrada a la plataforma mediante código OTP enviado al correo corporativo, con **sesión persistente de 14 días** (sin fricción diaria para ningún usuario, incluyendo Dirección General).
2. **Autorización Crítica en la Aplicación (Step-Up Auth OTP):** Si un usuario intenta **dispersar dinero (SPEI STP)** o **eliminar usuarios**, el sistema le exige un segundo código de 6 dígitos enviado en tiempo real a su correo institucional para procesar la transacción.

---

## 🚀 Paso a Paso: Configurar Cloudflare Access para SystemCore

### 1. Iniciar sesión en Cloudflare
1. Entra a [dash.cloudflare.com](https://dash.cloudflare.com/) y selecciona tu cuenta.
2. En el menú lateral izquierdo, haz clic en **Zero Trust**.

---

### 2. Configurar el Proveedor de Identidad (One-Time PIN)
1. En el panel de **Zero Trust**, navega a:
   `Settings` -> `Authentication` -> `Login methods`.
2. Verifica que **One-time PIN (Correo electrónico)** esté activo (viene habilitado por defecto).
3. *(Opcional)* Si tu empresa usa Google Workspace o Microsoft 365, también puedes vincularlos con un solo clic.

---

### 3. Registrar la Aplicación de SystemCore
1. En el menú lateral de Zero Trust, ve a **Access** -> **Applications**.
2. Haz clic en **Add an Application** y elige el tipo **Self-hosted**.
3. Completa los datos básicos:
   - **Application name:** `LanAhora SystemCore`
   - **Session Duration:** Selecciona **`14 days`** (336 horas).
   - **Application domain:** Escribe tu subdominio de producción, por ejemplo:
     - Subdomain: `core`
     - Domain: `lanahora.com`
     - URL resultante: `https://core.lanahora.com`

---

### 4. Definir las Reglas de Acceso (Quién puede entrar)
En la pestaña de **Policies** de la misma aplicación:
1. **Policy name:** `Acceso Empleados LanAhora`
2. **Action:** `Allow`
3. En la sección **Configure rules**:
   - **Selector:** `Emails ending in`
   - **Value:** `@lanahora.com` (todos los colaboradores con correo institucional).
   - *(O si prefieres correos puntuales)*: Selecciona `Emails` y añade la lista de correos autorizados.
4. Haz clic en **Next** y guarda la aplicación (**Save application**).

---

### 5. Conexión del Servidor (Cloudflare Tunnel - Cloudflared)
Para no abrir puertos en tu servidor y proteger la IP real:
1. Ve a **Networks** -> **Tunnels** -> **Create a tunnel**.
2. Nómbralo `systemcore-tunnel`.
3. Cloudflare te dará un comando de instalación para Windows o Linux:
   ```cmd
   cloudflared.exe service install <TOKEN_PROPORCIONADO>
   ```
4. Asigna la ruta pública:
   - **Subdomain:** `core`
   - **Domain:** `lanahora.com`
   - **Service:** `HTTP://localhost:3000`

---

## 🔒 Mecánica de Seguridad en Operación

```
Usuario ingresa a https://core.lanahora.com
                  │
                  ▼
   [ 1. CLOUDFLARE ACCESS (Borde de Red) ]
   - Solicita correo institucional (@lanahora.com).
   - Envía código de 6 dígitos a la bandeja.
   - Tras validar: SESIÓN VÁLIDA POR 14 DÍAS.
   - Navegación libre y fluida en CRM, Sucursales, Cobranza y Catálogos.
                  │
                  ▼
   ¿El usuario intenta una OPERACIÓN CRÍTICA?
                  ├─── A) Consulta de reportes / prospectos ──► Acceso Inmediato
                  │
                  └─── B) DISPERSIÓN DE DINERO (SPEI STP) o ELIMINAR USUARIO
                              │
                              ▼
                     [ 2. STEP-UP AUTH EN LA APP ]
                     - El sistema genera un código OTP de 6 dígitos.
                     - Se envía a su correo corporativo.
                     - Requiere ingresar el código antes de dispersar o borrar.
                     - Queda registrado en la bitácora de auditoría.
```

---

## 💰 Costo del Servicio
* **Cloudflare Zero Trust Free Tier:** Gratuito hasta **50 usuarios**.
* No requiere tarjetas de crédito adicionales ni licencias de pago para empezar.
