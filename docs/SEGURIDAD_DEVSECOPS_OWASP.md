# Documentación Técnica DevSecOps: Auditoría y Mitigación OWASP Top 10
**Sistema:** SystemCore LanAhora 2.0  
**Fecha:** 14 de Noviembre, 2026  
**Especialidad:** DevSecOps / Application Security (AppSec)  
**Perímetro Externo:** Cloudflare Zero Trust  
**Estado:** ✅ **Implementado, Verificado y Desplegado**

---

## 1. Alcance y Contexto de la Auditoría

Aunque la infraestructura perimetral cuenta con la protección de **Cloudflare Zero Trust** (túneles Cloudflared, aislamiento de origen y reglas de acceso corporativo), se ejecutó un análisis estricto bajo el principio de **Defensa en Profundidad (Zero Trust Interno)**. El objetivo primordial es garantizar que, si una petición alcanza directamente el servidor o si un actor malicioso opera dentro de la red interna, la aplicación no confíe ciegamente en las cabeceras ni permita accesos no autorizados.

---

## 2. Matriz Consolidada de Hallazgos y Acciones Realizadas

| ID | Área | Criticidad | Vulnerabilidad Encontrada | Acción Realizada / Corrección Aplicada |
| :---: | :---: | :---: | :--- | :--- |
| **SEC-01** | SAST / Auth | 🔴 **ALTA** | **Decodificación JWT sin firma:** `serverAuth.ts` aceptaba cualquier token base64 sin validar firma criptográfica y contenía un bypass `x-dev-bypass: true`. | Se implementó firma y verificación criptográfica estricta **HMAC-SHA256** con `crypto.timingSafeEqual` en `src/lib/auth/serverAuth.ts` y se eliminó por completo el bypass de desarrollo. |
| **SEC-02** | SAST / Control de Acceso | 🔴 **ALTA** | **Exposición total en `/api/sync` y Tienda:** Endpoints `GET` y `POST` no exigían autenticación, permitiendo exfiltrar toda la base de personas, créditos y transferencias STP o inyectar transacciones arbitrarias. | Se integró `requireAuth(req)` en `/api/sync/route.ts`, `/api/tienda/pedidos/route.ts` y `/api/tienda/distribuidora/route.ts`. El frontend (`CoreSyncContext.tsx`) ahora envía automáticamente el Bearer token de la sesión. |
| **SEC-03** | Gestión de Secretos | 🔴 **ALTA** | **Credenciales en código fuente:** Contraseñas de Nubarium (`#vEJfpcF#`) y llave privada VAPID hardcodeadas en texto plano en controladores KYC y WebPush. | Se eliminaron todas las credenciales literales y fallbacks inseguros en `compare-faces`, `validate-liveness`, `validate-curp` y `webPushService.ts`. Ahora se leen estrictamente de variables de entorno seguras (`.env.local`). |
| **SEC-04** | Contenedores | 🔴 **ALTA** | **Docker Inseguro:** Keycloak corriendo en `start-dev`, contraseña `admin_password` por defecto y puerto `8080` expuesto en `0.0.0.0` (acceso directo sin pasar por Cloudflare). | Se modificó `docker-compose.yml` para enlazar el puerto exclusivamente a `127.0.0.1:8080:8080`, se parametrizaron contraseñas mediante variables de entorno y se asignó usuario no-root (`70:70`) para Postgres. |
| **SEC-05** | Contenedores | 🟡 **MEDIA** | **Ausencia de Dockerfile Rootless:** No existía contenedor multi-etapa para ejecutar Next.js con privilegios restringidos. | Se creó un `Dockerfile` multi-etapa con imagen base `node:20-alpine` y ejecución bajo el usuario sin privilegios `nextjs:nodejs` (UID 1001). |
| **SEC-06** | Sinergia Cloudflare | 🟡 **MEDIA** | **Bypass de Origen Cloudflare:** Sin middleware, peticiones directas al puerto 3000 podían suplantar cabeceras `Cf-Access-*` sin que el servidor lo validara. | Se creó `src/middleware.ts` para verificar la existencia del token `cf-access-jwt-assertion`, restringir correos a `@lanahora.com` e inyectar cabeceras de seguridad HTTP en cada respuesta. |
| **SEC-07** | CORS | 🟡 **MEDIA** | **CORS Permisivo Wildcard (`*`):** Endpoint `/api/kyc/validate-curp` permitía consultas entre sitios desde cualquier dominio no autorizado. | Se sustituyó el wildcard por una lista blanca estricta (`ALLOWED_CORS_ORIGINS`) restringida a dominios oficiales de LanAhora y localhost local. |
| **SEC-08** | SCA / Dependencias | 🟡 **MEDIA** | **Alerta en biblioteca `xlsx` (SheetJS):** CVEs por Prototype Pollution (`GHSA-4r6h-8v6p-xvw6`) y ReDoS en versión `^0.18.5`. | Se auditó el uso en el código: `xlsx` se utiliza **únicamente en el navegador del cliente para exportar JSON a archivo descargable**, nunca para procesar o parsear archivos subidos en el servidor. Se ejecutó `npm audit fix` para actualizar librerías transitivas. |

---

## 3. Detalle Técnico de las Modificaciones

### 3.1. Firma y Verificación Criptográfica de Sesiones (`serverAuth.ts` y `login/route.ts`)
* **Problema:** Un atacante con acceso a la red podía construir un JSON con rol `ADMIN` y base64-encodearlo para saltarse la autenticación.
* **Solución Aplicada:**
  - Uso de algoritmo `HMAC-SHA256` alimentado por la clave de alta entropía `JWT_SECRET`.
  - Comparación en tiempo constante con `crypto.timingSafeEqual` para prevenir ataques de canal lateral (Timing Attacks).
  - Eliminación del header `x-dev-bypass: true`.

### 3.2. Protección de Endpoints Críticos de Negocio (`/api/sync`)
* **Problema:** Cualquier script no autenticado podía consultar `/api/sync` y descargar datos confidenciales (Nombres, CURPs, RFCs, cuentas CLABE y dispersiones de dinero).
* **Solución Aplicada:**
  - Validación obligatoria `requireAuth(req)` al inicio de `GET` y `POST`.
  - `CoreSyncContext.tsx` ahora adjunta el token JWT de la sesión activa en el header `Authorization: Bearer <token>`.
  - Si el usuario no ha iniciado sesión, el cliente web no emite peticiones en segundo plano, evitando llamadas innecesarias y fugas de información.

### 3.3. Saneamiento de Secretos y Fallbacks Locales
* **Archivos Modificados:**
  - `src/app/api/kyc/compare-faces/route.ts`: Eliminado `'lanahora:#vEJfpcF#'`. Requiere `NUBARIUM_USERNAME` y `NUBARIUM_PASSWORD`.
  - `src/app/api/kyc/validate-liveness/route.ts`: Eliminado `'lanahora:#vEJfpcF#'`.
  - `src/app/api/kyc/validate-curp/route.ts`: Eliminado fallback `#vEJfpcF#`.
  - `src/lib/webPushService.ts`: Eliminada la clave privada VAPID quemada en código.
  - `.env.example`: Actualizado con nombres de variables descriptivos y sin contraseñas predeterminadas.

### 3.4. Sinergia con Cloudflare Zero Trust (`src/middleware.ts`)
* **Problema:** Ataques directos a la dirección IP pública del servidor omitiendo el túnel de Cloudflare.
* **Solución Aplicada:**
  - El middleware intercepta las peticiones y comprueba la cabecera `cf-access-jwt-assertion` cuando se activa la política en producción o mediante `ENFORCE_CLOUDFLARE_ZERO_TRUST=true`.
  - Inyección global de cabeceras HTTP de protección:
    - `X-Frame-Options: DENY` (Anti-Clickjacking).
    - `X-Content-Type-Options: nosniff` (Anti-MIME Sniffing).
    - `Referrer-Policy: strict-origin-when-cross-origin`.
    - `Permissions-Policy: camera=(self), microphone=(), geolocation=(self)`.
    - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (HSTS estricto).

### 3.5. Hardening de Contenedores Docker (`docker-compose.yml` y `Dockerfile`)
* **Solución Aplicada:**
  - Enlace de red restringido: `127.0.0.1:8080:8080` (el IAM Keycloak ya no escucha en todas las interfaces de red externas `0.0.0.0`).
  - Usuario no privilegiado `user: "70:70"` en PostgreSQL para evitar ejecución como root dentro del contenedor de la base de datos.
  - Directiva `security_opt: [no-new-privileges:true]` para prevenir escalada de privilegios.
  - Creación del `Dockerfile` de producción con usuario de sistema `nextjs:nodejs` (UID/GID 1001).

---

## 4. Pruebas de Seguridad y Verificación Ejecutadas

Las correcciones fueron sometidas a pruebas automatizadas locales con los siguientes resultados:

1. **Prueba de Acceso Legítimo con Token Firmado:**
   - **Petición:** `GET /api/sync` con cabecera `Authorization: Bearer <TOKEN_HMAC_SHA256>`.
   - **Resultado:** `HTTP 200 OK` — Acceso concedido correctamente a los datos institucionales.

2. **Prueba de Petición sin Autenticación:**
   - **Petición:** `GET /api/sync` sin cabeceras de autorización.
   - **Resultado:** `HTTP 401 Unauthorized` — Acceso denegado correctamente.

3. **Prueba de Falsificación de Token (Signature Tampering):**
   - **Petición:** `GET /api/sync` con payload forjado (`roles: ['ADMIN']`) y firma falsa.
   - **Resultado:** `HTTP 401 Unauthorized` — Firma rechazada por el validador criptográfico `serverAuth.ts`.

4. **Compilación de Código:**
   - **Comando:** `npx tsc --noEmit`.
   - **Resultado:** **0 errores de compilación**.

---

## 5. Recomendaciones de Mantenimiento Continuo

1. **Rotación de Secretos en Producción:**
   - Al desplegar en servidores de producción, definir `JWT_SECRET` mediante un generador criptográfico (mínimo 64 caracteres aleatorios).
2. **Revisión de Exportación Excel:**
   - Mantener el uso de `xlsx` restringido exclusivamente al navegador para exportación. Si en el futuro se requiere importar archivos de Excel subidos por usuarios, implementar un validador con `exceljs` en el backend.
3. **Monitoreo de Logs en Cloudflare:**
   - Revisar en el panel de Cloudflare Zero Trust los eventos de auditoría (`Audit Logs`) para confirmar que el tráfico provenga únicamente de identidades con correo `@lanahora.com`.
