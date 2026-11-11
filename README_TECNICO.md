# LanAhora SystemCore — Especificación Técnica & Arquitectura de Software

Núcleo tecnológico, financiero y operativo de **LanAhora (SOFOM E.N.R.)** para la originación, colocación, validación biométrica, dispersión SPEI y administración de créditos mediante vales digitales.

---

## 1. Ficha Técnica del Proyecto

| Parámetro | Especificación |
| :--- | :--- |
| **Framework Web Core** | **Next.js 16.4.5** (App Router, Turbopack Engine, React 19.3.0, TypeScript 5.x) |
| **Estilos & UI System** | Tailwind CSS v4, Lucide Icons, Canvas Signature API |
| **Servidor de Identidad (IAM)** | **Keycloak 26.1.3** (OpenID Connect, Realm `lanahora`, Client `systemcore-web`, PKCE) |
| **Control de Acceso (RBAC)** | Middleware `serverAuth.ts` con validación estricta de roles y alcances por sucursal |
| **Enrutador Multi-Dominio** | `src/proxy.ts` (Next.js 16 Proxy con soporte estricto para `tienda.lanahora.com`) |
| **Framework Móvil** | **Flutter 3.x / Dart 3.x** Multiplataforma (iOS & Android) |
| **Compatibilidad Móvil** | **LanApp (Distribuidoras):** iPhone iOS 15+ & Android · **LH Asesores:** Exclusivo Android (Terminales de campo) |
| **Flavors Móviles** | `lanapp` (`com.lanahora.lanapp` - iOS & Android) y `asesores` (`com.lanahora.asesores` - Solo Android) |
| **Seguridad Móvil** | Apple Keychain / Face ID en iOS, R8 / ProGuard y Keystore en Android, Flutter Secure Storage |
| **Gateway ESB & Sync Bus** | RESTful JSON APIs, Serverless Edge Routes, mTLS y Bus de Sincronización Reactivo (`/api/sync`) |
| **Sincronización Multi-Sistema** | Replicación bidireccional inmediata en memoria + BroadcastChannel + ADB Reverse Port 3000 |
| **Almacenamiento Local** | SQLite encriptado (Mobile), LocalStorage tokenizado (Web) |
| **Estrategia Git** | Tronco central en rama `develop` |

---

## 2. Diagrama de Arquitectura de Sistemas & Bus de Sincronización

```mermaid
flowchart TD
    subgraph Clientes ["Capa de Clientes & Aplicaciones"]
        WEB["SystemCore Web (Next.js 16 / React 19)"]
        APP_ADV["LH Asesores Móvil (Solo Android)"]
        APP_LAN["LanApp Distribuidoras (iPhone iOS & Android)"]
        PWA_CAN["Portal de Canje Web PWA (Biometría / OCR)"]
    end

    subgraph SyncBus ["Capa de Sincronización e Integración en Tiempo Real"]
        API_SYNC["Next.js Sync Engine (/api/sync)"]
        STORE["Server Sync Store (Estado Global Compartido)"]
        ADB_REV["ADB Reverse Bridge (tcp:3000:3000)"]
    end

    subgraph MotoresCore ["Motores Internos de Negocio"]
        CRM_ENG["Motor de Originación & Matriz de 25 Documentos"]
        PADRON_ENG["Padrón Core: 122k Personas & 7k Distribuidoras"]
        STP_ENG["Motor de Dispersión Automática SPEI (STP)"]
        RH_ENG["Motor de Asistencia Satelital GPS & Talento"]
    end

    subgraph IntegracionesESB ["ESB & Servicios Externos"]
        NUBARIUM["Nubarium API (RENAPO & INE OCR)"]
        SAT_DB["Base Local Indexada SAT 69-B (O(1) Hash Table)"]
        BURO["Buró de Crédito México (REST API)"]
        STP_SPEI["Gateway Bancario STP (SPEI / Banxico)"]
        PAYNET["Paynet Openpay (Recaudación con Código de Barras)"]
        BOTMAKER["Botmaker Gateway (WhatsApp Cloud & SMS OTP)"]
    end

    WEB <--> API_SYNC
    APP_LAN <--> ADB_REV <--> API_SYNC
    APP_ADV <--> ADB_REV <--> API_SYNC
    PWA_CAN <--> API_SYNC

    API_SYNC <--> STORE
    STORE --> CRM_ENG
    STORE --> PADRON_ENG
    STORE --> STP_ENG
    STORE --> RH_ENG

    CRM_ENG --> SAT_DB
    CRM_ENG --> BURO
    STP_ENG --> STP_SPEI
    STP_ENG --> PAYNET
    PWA_CAN --> NUBARIUM
```

---

## 3. Matriz de Sincronización e Integración Multi-Sistema

Cualquier operación ejecutada en uno de los subsistemas se replica **inmediatamente** en los demás sin requerir recargas manuales:

| Evento Disparador | Subsistema Origen | Efecto en SystemCore Web | Efecto en Dispersión STP | Efecto en Red de Distribuidores (DV) | Efecto en App Móvil |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Canje de Vale Firmado** | LanApp Móvil / Simulador | Pagaré y estatus de cliente actualizados en Padrón de Personas | Se crea registro `DISPERSADO` en STP con folio y clave de rastreo SPEI | Se deduce saldo disponible del distribuidor y aumenta cartera activa | Recibo con clave de rastreo bancario en tiempo real |
| **Captura de Nuevo Cliente** | Personas Core / LanApp | Registro inmediato en tabla de Personas (# PersonaID asignado) | N/A | Cliente disponible para otorgamiento de vales de cualquier DV | Aparece en el buscador de prospectos y clientes de asesores |
| **Registro de Pago / Cobranza** | Dispersión & Pagos / Asesores | Reflejado en matriz de pagos y recibos emitidos | Se concilia la referencia Paynet / SPEI | Se libera línea de crédito y disminuye saldo deudor del distribuidor | Actualización del saldo disponible en tiempo real |
| **Validación KYC / Lista SAT** | App Móvil / Web | Marcado de expediente con resultado O(1) de listas negras SAT | N/A | Bloqueo automático si el cliente aparece en Art. 69-B | Bloqueo preventivo de desembolso antes de firma |

---

## 4. Motor Biométrico & Prueba de Vida (Liveness Detection)

Para garantizar la integridad en el canje de vales digitales sin costos por consultas externas innecesarias, el sistema implementa un motor biométrico asistido en 4 fases dentro de la misma aplicación (sin saltar a la app externa de cámara):

1. **Protocolo Previo de Verificación:** Diálogo modal que bloquea el inicio hasta que el usuario confirme expresamente haberse retirado lentes (graduados o de sol), gorras y cubrebocas.
2. **Fase 1 (Alejamiento & Centrado):** Alerta en pantalla `↔️ ALEJE EL TELÉFONO - Centre su rostro dentro del óvalo` con marco dinámico azul.
3. **Fase 2 (Acercamiento Progresivo):** Alerta en pantalla `🔍 ACÉRQUESE LENTAMENTE - Ajuste su rostro al óvalo` con marco dinámico ámbar.
4. **Fase 3 (Verificación sin Lentes & Parpadeo):** Alerta en pantalla `👁️ SIN LENTES Y PARPADEE - Mire a la cámara` con marco dinámico azul cielo.
5. **Fase 4 (Captura en Distancia Perfecta):** Alerta `✓ ¡DISTANCIA PERFECTA! Manténgase inmóvil...` con marco dinámico verde esmeralda y captura automática del frame en alta resolución.

---

## 3. Motores de Negocio & Módulos Técnicos

### 3.1. Motor KYC & Filtro de Listas Negras SAT (`/api/kyc/validate-curp`)
* **Endpoint:** `POST /api/kyc/validate-curp`
* **Mecanismo de Ejecución:**
  1. **Validación Sintáctica Estricta:** Comprobación mediante expresión regular oficial para CURP (`^[A-Z]{4}\d{6}[HM][A-Z]{2}[B-DF-HJ-NP-TV-Z]{3}[A-Z\d]\d$`).
  2. **Consulta a RENAPO vía Nubarium:** Extracción de nombres, apellidos, género y fecha de nacimiento oficial con token JWT (`Bearer`).
  3. **Búsqueda In-Memory SAT Art. 69-B:** Diccionario hash JSON (`sat_69b_index.json`) precompilado en memoria con tiempo de acceso $O(1)$ para descartar EFOS/EDOS (contribuyentes en lista negra definitiva, presunta o con sentencia).

### 3.2. Motor de Dispersión Bancaria STP SPEI
* **Protocolo:** JSON REST / mTLS con firma criptográfica RSA-SHA256.
* **Flujo de Ejecución:**
  1. Generación de `claveRastreo` única estructurada: `LAN{YYYYMMDD}{FOLIO_ALEATORIO}`.
  2. Firma del payload con llave privada de la SOFOM (`STP_PRIVATE_KEY`).
  3. Despacho hacia el concentrador de STP y recepción de folio de liquidación.
  4. Consulta del Comprobante Electrónico de Pago (CEP) ante el Banco de México (Banxico).

### 3.3. Motor de Geoposicionamiento & Asistencia GPS
* **Tecnología:** HTML5 High Accuracy Geolocation API en Web + Geolocator en Flutter.
* **Precisión:** Adquisición satelital con `enableHighAccuracy: true`, validando latitud, longitud, altitud y distancia radial contra el polígono de la sucursal o ruta de prospección.

### 3.4. Motor de Canje Digital & Biometría Facial
* **Captura de Documentos:** Cámara trasera en modo `environment` con resolución nativa 1080p y preprocesamiento de imagen en Canvas (conversión Base64 y extracción OCR de código bidimensional PDF417).
* **Selfie Biométrica Facial:** Cámara frontal en modo `user` con detección de vida (*liveness detection*), cálculo de distancia interocular y comparación facial contra la fotografía extraída del INE.

### 3.5. Módulo del Perfil del Distribuidor & Ficha Técnica Operativa (`PerfilDistribuidorView.tsx`)
* **Componente:** `src/components/PerfilDistribuidorView.tsx`
* **Arquitectura de Datos:** Modela la entidad central de la Distribuidora (`DistribuidorCore`): número DV, ContratoID, línea autorizada base (\$240,000), línea adicional (\$15,000), nivel de fidelidad (Plata/Oro/Diamante), coordinador regional asignado, gestor de cobranza, promotor, teléfono y geolocalización de domicilio.
* **Sección de Validación y Consolidación:** Registra trazabilidad de auditoría de contratos con sello de usuario (`Sistema`/`Mesa de Crédito`) y timestamp ISO.
* **Matriz de 25 Acciones Operativas:** Agrupa las operaciones del distribuidor en 4 dominios funcionales:
  1. *Cobranza & Reportes:* Relación quincenal oficial, recibos de cobranza, estado de cuenta descargable y auditoría de saldo.
  2. *Expediente & Validaciones:* Contrato legal digital, expediente con valeras, solicitud de validación y aumento de línea.
  3. *Financiamiento & Tiendita:* Dispersión de crédito personal para la DV, consulta de saldos LanaTienda y recálculo de relación.
  4. *Supervisión & Asignaciones:* Cambio dinámico de gestor y coordinador, bitácora de gestoría, asignación de Lanapuntos, convenios de liquidación y marcado preventivo de cartera legal.

### 3.6. Motor de Relación de Cobranza Quincenal Oficial (`RelacionCobranzaModal.tsx`)
* **Componente:** `src/components/modals/RelacionCobranzaModal.tsx`
* **Estructura Financiera Oficial:**
  * **Líneas de Crédito:** Vale Lana (\$240,000 / Disp. \$204,633.20), LanaTienda (\$15,000 / Disp. \$15,000), Créditos Personales (\$10,000 / Disp. \$5,000).
  * **Vales de Dinero:** Desglose pormenorizado de los 7 vales de la quincena (Esperanza Bustamante, Erika Luna, Alejandra Guillen, Ana Cecilia Aguilera, Paola Morales, Laura Bustamante, Andrea Alarcón) totalizando \$59,811.99 de saldo y \$9,974.00 de pago quincenal.
  * **Préstamo Personal DV:** Amortización quincenal 6/10 con pago de \$1,360.00.
  * **Seguro de Protección:** Cobertura de seguro de vida y saldo deudor de \$90.00 quincenales.
  * **Total Quincenal:** \$11,424.00.
  * **Tabla Escalar de Bonificaciones:** Matriz de descuento por pronto pago del **18.00%** (\$1,629.83 de bonificación directa), permitiendo liquidación neta de **\$9,795.00** a través de dispersión STP o Banorte, o \$9,806.00 vía Paynet (con tarifa de \$11.00 por transacción).

### 3.7. Motor de Originación CRM con Arrastre Nativo (Drag & Drop) & Auditoría (`KanbanBoard.tsx`)
* **Componente:** `src/components/KanbanBoard.tsx`
* **Implementación:** Eventos HTML5 nativos Drag and Drop (`onDragStart`, `onDragOver`, `onDragEnter`, `onDragLeave`, `onDrop`) con cero dependencias pesadas de terceros.
* **Sincronización Inmediata:** Al soltar la tarjeta en una columna, se despacha `onMoveStage(prospectId, newStage)` actualizando el pipeline en memoria y en `localStorage`, reseteando el contador de días en etapa a 0 y emitiendo un evento auditado de sistema en la bitácora del prospecto.

### 3.8. Mesa de Control & Dictamen de Crédito (`MesaCreditoView.tsx`)
* **Componente:** `src/components/MesaCreditoView.tsx`
* **Funcionalidad:** Permite a los analistas de riesgo revisar la carpeta de 25 documentos, verificar la validación biométrica facial, evaluar el score crediticio, dictaminar la viabilidad del crédito y autorizar la emisión de vales con firma electrónica.

### 3.9. Bitácora de Gestoría de Cobranza & Visitas de Campo (`GestoriaView.tsx`)
* **Componente:** `src/components/GestoriaView.tsx`
* **Funcionalidad:** Registro en tiempo real de visitas domiciliarias, llamadas de seguimiento preventivo, promesas de pago con fecha límite, convenios de reestructuración y alertas tempranas de riesgo de mora.

### 3.10. Motor de Reglas de Negocio Dinámicas (`businessRulesEngine.ts` & `BusinessRulesView.tsx`)
* **Motor:** `src/lib/rules/businessRulesEngine.ts`
* **Interfaz de Control:** `src/components/BusinessRulesView.tsx`
* **Capacidades:** Permite a la Dirección de Crédito y Riesgos ajustar en caliente matrices de capacidad de pago, topes de endeudamiento, límites de crédito por nivel (Plata, Oro, Platino, Diamante) y reglas de castigo automático sin necesidad de recompilar el código.

### 3.11. Motor Contable & Pólizas de Operación (`ContabilidadView.tsx`)
* **Componente:** `src/components/ContabilidadView.tsx`
* **Funcionalidad:** Generación de pólizas de diario, ingresos y egresos vinculadas a desembolsos SPEI, amortizaciones de vales, bonificaciones del 18% y conciliación de cuentas deudoras/acreedoras según el catálogo de cuentas de la CNBV.

### 3.12. Matriz de Cumplimiento PLD/FT & Buzón Confidencial (`BuzonPLDView.tsx`)
* **Componente:** `src/components/BuzonPLDView.tsx`
* **Funcionalidad:** Sistema integral para el Oficial de Cumplimiento con matriz de riesgo de clientes y distribuidoras, cruce contra listas de Personas Políticamente Expuestas (PEPs) y SAT 69-B, reporte de operaciones inusuales/relevantes y canal anónimo cifrado de denuncias conforme a la normativa de la UIF y CNBV.

### 3.13. Central de Notificaciones Push Web & ADB Android (`webPushService.ts` & `adbNotifications.ts`)
* **Servicio Web Push:** `src/lib/webPushService.ts` implementa suscripciones PWA según el estándar W3C Push API / VAPID con Service Worker (`public/sw.js`).
* **ADB Shell Bridge:** `src/lib/adbNotifications.ts` despacha notificaciones nativas en terminales Android conectadas por depuración USB/Wi-Fi mediante `adb shell cmd notification post` con soporte de texto enriquecido (BigText) e iconografía institucional.

---

## 4. Ciberseguridad & Pentesting Hardening

El sistema cuenta con directivas de seguridad implementadas y verificadas contra ataques de inyección, secuestro de clics, BFLA/BOLA, y robo de credenciales. La bitácora detallada de hallazgos, pruebas y estados se encuentra documentada en [`PRUEBAS_CIBERSEGURIDAD.md`](PRUEBAS_CIBERSEGURIDAD.md).

### 4.1. Encabezados HTTP de Seguridad (`next.config.ts`)
```typescript
headers: [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=(self)' },
  { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' http://127.0.0.1:* http://localhost:* https://api.nubarium.com https://*.sat.gob.mx;" }
]
```

### 4.2. Control de Acceso y Autorización en APIs (`src/lib/auth/serverAuth.ts`)
Validación estricta de tokens Bearer OIDC expedidos por Keycloak, expiración y control de roles institucionales (`ADMIN`, `DIRECTOR_GENERAL`, `MESA_CREDITO`) para proteger mutaciones en `/api/configuracion/*` y `/api/tienda/pedidos/[id]`.

### 4.3. Prevención de Inyección de Fórmulas en CSV (`src/lib/utils/csv.ts` — CWE-1236)
Sanitización automática de celdas anteponiendo un apóstrofe `'` a valores que comiencen con triggers de fórmulas (`=`, `+`, `-`, `@`, `\t`, `\r`) y codificación con BOM UTF-8 (`\uFEFF`) en todas las exportaciones del sistema.

### 4.4. Hardening de Proxy Multi-Dominio (`src/proxy.ts` — CWE-644)
Normalización del encabezado `Host` con lista blanca estricta (`ALLOWED_TIENDA_HOSTS`) para prevenir ataques de Host Header Injection y envenenamiento de caché.

### 4.5. Reglas de Ofuscación R8 / ProGuard (`mobile_app/android/app/proguard-rules.pro`)
* Retención de componentes Flutter esenciales (`io.flutter.app.**`, `io.flutter.plugin.**`).
* Supresión de advertencias en dependencias diferidas (`-dontwarn com.google.android.play.core.**`).
* Protección contra ingeniería inversa en SQLite y almacenamiento encriptado seguro (`FlutterSecureStorage`).

---

## 5. Estructura de Directorios

```text
SystemCore_LH/
├── docs/                                    # Especificaciones de arquitectura interna
│   ├── core-central.md                      # Arquitectura del Core Central LanAhora
│   ├── proceso-originacion-crm.md           # Pipeline comercial de 8 etapas
│   ├── capital-humano-rh.md                 # Control de Asistencia satelital GPS
│   ├── diseno-login-movil.md                # Design System corporativo y pantallas móviles
│   ├── manual-dispersion-digital-lanapp.md  # Protocolo de canje y dispersión STP
│   └── mapa-sistemas-integraciones.md       # Topología de la capa de integración ESB
├── keycloak/                                # Configuración y exportaciones de Realm IAM
│   └── data/import/lanahora-realm.json      # Realm OIDC oficial LanAhora (Roles y Clientes)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/                        # Endpoints de Login y Estado OIDC
│   │   │   ├── configuracion/               # CRUD protegido de Sucursales y Usuarios
│   │   │   ├── kyc/                         # APIs de RENAPO, Biometría y SAT 69-B
│   │   │   ├── notifications/               # API de suscripción Web Push PWA
│   │   │   ├── sync/                        # Bus reactivo de sincronización Core
│   │   │   └── tienda/                      # Catálogo y procesamiento de pedidos LanaTienda
│   │   ├── tienda/                          # Aplicación Web LanaTienda (Multi-Dominio)
│   │   ├── lanapp/                          # Portal Web complementario LanApp
│   │   ├── manifest.ts                      # Manifiesto oficial PWA instalable
│   │   ├── globals.css                      # Estilos globales con Tailwind v4 y tipografía Geist
│   │   ├── layout.tsx                       # Layout raíz
│   │   └── page.tsx                         # Orquestador del Core y control de sesión
│   ├── components/
│   │   ├── Header.tsx                       # Barra de navegación ejecutiva Ballast (Ctrl+K, SPEI, Sesión)
│   │   ├── Sidebar.tsx                      # Menú lateral unificado del Sistema Core
│   │   ├── LoginView.tsx                    # Autenticación segura por sucursal
│   │   ├── KanbanBoard.tsx                  # Tablero CRM interactivo con Drag & Drop nativo
│   │   ├── TableView.tsx                    # Vista tabular de prospectos comerciales
│   │   ├── LeadDetailView.tsx               # Expediente comercial y matriz de 25 documentos
│   │   ├── CoreDashboard.tsx                # Buscador central omnicanal (DV, Folio y CréditoID)
│   │   ├── PerfilDistribuidorView.tsx       # Ficha técnica de Distribuidora (Líneas y 25 Acciones)
│   │   ├── PersonasView.tsx                 # Padrón de 122,144 personas con sidebar
│   │   ├── DistribuidoresView.tsx           # Padrón de 7,171 distribuidoras con exportación
│   │   ├── MesaCreditoView.tsx              # Mesa de Control, evaluación documental y dictamen
│   │   ├── GestoriaView.tsx                 # Bitácora de gestoría de cobranza y visitas
│   │   ├── ReportesView.tsx                 # Centro de analítica gerencial y morosidad
│   │   ├── ContabilidadView.tsx             # Catálogo de cuentas y pólizas contables
│   │   ├── BuzonPLDView.tsx                 # Prevención de Lavado de Dinero (PLD/FT)
│   │   ├── BusinessRulesView.tsx            # Gestor dinámico de reglas de negocio crediticias
│   │   ├── NotificationManagerView.tsx      # Central de notificaciones push PWA y ADB Bridge
│   │   ├── RHView.tsx                       # Asistencia GPS, requisiciones y capacitaciones
│   │   ├── DispersionView.tsx               # Desembolsos SPEI STP y recaudación Paynet
│   │   ├── LanaTiendaAdminView.tsx          # Panel Core de Monitoreo y Despacho de Pedidos
│   │   ├── ConfiguracionView.tsx            # Gestión de Sucursales y Usuarios Institucionales
│   │   ├── IntegracionesView.tsx            # Monitor de salud ESB y consola interactiva
│   │   └── modals/
│   │       ├── RelacionCobranzaModal.tsx    # Relación Oficial Quincenal (3 líneas, bonificación 18%)
│   │       ├── DistribuidorModals.tsx       # Modales de Estado de Cuenta, Mensajes y Castigo
│   │       └── PersonaModals.tsx            # Modales de edición, bloqueo y expediente
│   ├── lib/
│   │   ├── auth/serverAuth.ts               # Middleware de validación JWT y roles RBAC
│   │   ├── rules/businessRulesEngine.ts     # Motor evaluador de reglas crediticias
│   │   ├── webPushService.ts                # Servicio de notificaciones Web Push PWA
│   │   ├── adbNotifications.ts              # Emisor de notificaciones push vía ADB Android
│   │   ├── utils/csv.ts                     # Sanitizador contra CSV Formula Injection
│   │   ├── store/                           # Almacenes de estado (Tienda, Servidor y Config)
│   │   ├── data/
│   │   │   ├── coreData.ts                  # Padrón de semillas operativas
│   │   │   ├── initialData.ts               # Semillas de prospectos y matriz documental
│   │   │   └── sat/sat_69b_index.json       # Padrón indexado de contribuyentes SAT Art. 69-B
│   │   └── security.ts                      # Sanitizadores y hashing criptográfico
│   ├── proxy.ts                             # Proxy perimetral multi-dominio Next.js 16
│   └── types/                               # Tipados TypeScript (Core, CRM, Auth, Tienda, Reglas)
├── README.md                                # Índice maestro y resumen de documentación
├── README_TECNICO.md                        # Este documento (Especificación técnica)
├── README_PUBLICO.md                        # Documentación funcional para público en general
├── PRUEBAS_CIBERSEGURIDAD.md                # Bitácora oficial de pruebas de pentesting y SAST
└── PRESENTACION_EJECUTIVA.md                # Presentación de 10 diapositivas para Dirección General
```

---

## 6. Variables de Entorno (`.env.local`)

```env
# Configuración del Entorno
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Servidor de Identidad Keycloak OIDC
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=lanahora
KEYCLOAK_CLIENT_ID=systemcore-web
KEYCLOAK_CLIENT_SECRET=systemcore_keycloak_secret_2026

# API Nubarium KYC (RENAPO & Biometría)
NUBARIUM_BASE_URL=https://api.nubarium.com
NUBARIUM_AUTH_USER=nubarium
NUBARIUM_AUTH_PASSWORD=_nub4r1mp4ssw0rd.
NUBARIUM_API_KEY=

# Gateway Bancario STP SPEI
STP_BASE_URL=https://mpos.insis.com.mx
STP_EMPRESA=LANA_AHORA_SOFOM
STP_CUENTA_ORDENANTE=646180157000000004

# Paynet / OpenPay Recaudación
OPENPAY_MERCHANT_ID=
OPENPAY_PRIVATE_KEY=
```

---

## 7. Compilación & Despliegue

> [!NOTE]
> **Puesta en marcha en laptops Windows:**  
> Si estás configurando una estación de trabajo con Windows 10/11, consulta **[`GUIA_INSTALACION_WINDOWS.md`](GUIA_INSTALACION_WINDOWS.md)** para una guía rápida paso a paso (Node, Git for Windows, Docker/Keycloak `kc.bat`, y scripts de PowerShell).

### 7.1. Sistema Web Core
```bash
# Copiar plantilla de entorno local
cp .env.example .env.local

# Instalación de dependencias
npm install

# Modo desarrollo con Turbopack
npm run dev

# Compilación de producción (Validación TypeScript y optimización de estáticos)
npm run build

# Ejecución en producción
npm run start
```

### 7.2. Aplicaciones Móviles (LanApp para iPhone & Android / LH Asesores solo Android)
```bash
cd mobile_app

# Nota de Plataformas:
# - LanApp (Distribuidoras): Multiplataforma (Apple iPhone iOS 15+ y Google Android).
# - LH Asesores (Fuerza de Ventas): Exclusivo para terminales Android corporativos de campo.

# --- A. ANDROID (LanApp y LH Asesores) ---
# Compilar APK Release de LanApp (Distribuidoras & Canje):
flutter build apk --flavor lanapp -t lib/main_lanapp.dart

# Compilar APK Release de LH Asesores (Fuerza de Ventas en Campo):
flutter build apk --flavor asesores -t lib/main_asesores.dart

# Instalación en dispositivo físico vía ADB:
adb -s <DEVICE_ID> install -r build/app/outputs/flutter-apk/app-lanapp-release.apk
adb -s <DEVICE_ID> install -r build/app/outputs/flutter-apk/app-asesores-release.apk

# --- B. APPLE iOS (iPHONE / TESTFLIGHT) ---
# 1. Obtener dependencias y pods nativos de iOS:
flutter pub get
cd ios && pod install && cd ..

# 2. Ejecución en Simulador de iPhone (sin equipo físico):
open -a Simulator
flutter run -t lib/main_lanapp.dart

# 3. Compilación de paquete .ipa para distribución TestFlight / App Store:
flutter build ipa -t lib/main_lanapp.dart --export-method app-store
```

---

## 8. LanaTienda (`tienda.lanahora.com`) — E-Commerce B2B2C & SystemCore

Módulo oficial de comercio electrónico donde los clientes eligen productos del catálogo institucional y los adquieren a través de la línea de crédito de su Distribuidora autorizada a **16 quincenas fijas**.

### 8.1. Arquitectura Técnica & Enrutamiento Multi-Dominio

```mermaid
flowchart TD
    DNS["tienda.lanahora.com"] --> PROXY["Next.js Proxy / Edge Router (src/proxy.ts)"]
    PROXY -->|"Reescritura Transparente"| TIENDA_APP["Portal LanaTienda (/tienda)"]
    
    subgraph TIENDA_APP ["LanaTienda (Frontend & Catálogo)"]
        CLIENT_UI["Catálogo Público Móvil-First\n- Búsqueda predictiva & Categorías\n- Desglose 16 Quincenas (Precio / 16)\n- Generador Link WhatsApp"]
        DIST_UI["Portal Distribuidora (Checkout)\n- SSO Keycloak (Realm lanahora)\n- Matriz de Líneas de Crédito\n- Asignación Cliente CRM\n- Selección Entrega (Sucursal vs Domicilio)"]
    end

    CLIENT_UI -->|"WhatsApp Link: /ref?sku=..."| DIST_UI
    DIST_UI <--> API_TIENDA["APIs Core LanaTienda (/api/tienda/...)"]
    
    subgraph SYSTEMCORE_BACKEND ["SystemCore Backend Central"]
        API_TIENDA --> STORE_TIENDA["TiendaStore (Estado Global & Validación)"]
        STORE_TIENDA --> CRM_CORE["CRM: Líneas de Crédito & Personas"]
        STORE_TIENDA --> ADMIN_VIEW["Panel de Control SystemCore Web (/lanatienda)"]
    end
```

### 8.2. Reglas de Negocio Oficiales (Manuales LNH-LTD-MAN-001 / 002 / 003)

1. **Cálculo Financiero Obligatorio:** Todo producto se financia de manera inamovible a **16 quincenas fijas** calculadas como:
   $$\text{Pago Quincenal} = \frac{\text{Precio Contado}}{16}$$
   *(No incluye seguro de canje opcional).*
2. **Garantía y Entrega:**
   - Plazo de entrega típico: 5 a 10 días hábiles.
   - El cliente dispone de **48 horas hábiles** posteriores a la entrega para reportar incidencias de producto dañado o incompleto.
3. **Flujo de Referencia por WhatsApp:**
   - El cliente no requiere registrarse para navegar; al presionar **"¡Compra con tu distribuidora aquí!"**, se genera un enlace deep-link `https://tienda.lanahora.com/ref?sku=XYZ` que abre WhatsApp con el mensaje pre-redactado para su distribuidora.
4. **Matriz de Líneas de Crédito de la Distribuidora:**
   - **Línea LanaTienda:** Monto total autorizado y disponible para compras de sus clientes.
   - **Línea Personal:** Monto total autorizado y disponible para compras propias.
   - **Límite Cliente Final por Nivel:** (ej. Nivel Bronce: \$9,000 MXN) del cual se deducen los Vales activos con canje y Kits de belleza para determinar la capacidad de compra del cliente.
5. **Modalidades de Entrega:**
   - **Opción A (Sucursal):** Entrega en mostrador de la sucursal asignada a la distribuidora (ej. *Saltillo Centro*).
   - **Opción B (Domicilio Cliente):** Envío a la dirección registrada en el CRM del cliente, requiriendo de forma obligatoria el campo de **Referencias del Domicilio** (color de fachada, tipo de portón, entrecalles).

### 8.3. Endpoints REST Core

| Endpoint | Método | Descripción |
| :--- | :--- | :--- |
| `/api/tienda/catalog` | `GET` | Catálogo de productos, categorías y cálculo quincenal. Soporta filtros `?q=`, `?categoria=` y `?sku=`. |
| `/api/tienda/distribuidora` | `GET` | Consulta de líneas autorizadas, disponibles, nivel y cartera de clientes asignados a la distribuidora. |
| `/api/tienda/pedidos` | `GET` | Listado de pedidos generados (filtrable por `?distribuidoraId=`). |
| `/api/tienda/pedidos` | `POST` | Creación de pedido, validación de línea de crédito, deducción de saldo y generación de folio `LTD-2026-XXXX`. |
| `/api/tienda/pedidos/[id]` | `PATCH` | Actualización de estatus (`APROBADO_MESA`, `EN_TRANSITO`, `LISTO_SUCURSAL`, `ENTREGADO`, `CANCELADO`) y asignación de guía. |

---

## 9. Módulo de Configuración: Sucursales & Usuarios Institucionales

Módulo de administración central en SystemCore (`/configuracion`) para la gestión integral de la infraestructura física (sucursales) y el talento humano con sus roles y alcances territoriales.

### 9.1. Submódulo de Sucursales
* **Catálogo de Sucursales:** Gestión de claves únicas (`SUC-CORP`, `SUC-SLT-CEN`, `SUC-TRN-CEN`, etc.), nombres comerciales, responsables/gerentes, direcciones, teléfonos y estados.
* **Operaciones Soportadas:**
  - **Alta de Nueva Sucursal:** Registro inmediato con clave y datos de contacto.
  - **Edición y Cambio de Nombre:** Actualización en cascada (si se renombra una sucursal, se actualiza automáticamente la asignación de todos los colaboradores asignados a ella).
  - **Activación / Desactivación:** Switch de estado operativo (`ACTIVA` / `INACTIVA`).
  - **Baja / Eliminación:** Eliminación segura con reasignación automática de los usuarios asociados a `Corporativo Saltillo`.
  - **Métrica en Vivo:** Conteo en tiempo real de colaboradores asignados a cada sucursal.

### 9.2. Submódulo de Usuarios Institucionales & Asignaciones
* **Roles y Permisos:** Integración con roles de Keycloak (`ADMINISTRADOR`, `MESA_CREDITO`, `GERENTE_SUCURSAL`, `COORDINADOR_COMERCIAL`, `COORDINADOR_NEGOCIOS`, `ASESOR_CAMPO`).
* **Asignación Territorial:** Asignación dinámica a cualquiera de las sucursales del catálogo y definición de alcance de permisos:
  - `ALL`: Acceso institucional global (todas las sucursales).
  - `BRANCH`: Acceso restringido exclusivamente a su sucursal designada.
* **Operaciones Soportadas:**
  - **Alta de Usuario:** Captura de nombre, correo `@lanahora.com`, puesto, rol, sucursal asignada y teléfono.
  - **Edición & Reasignación de Sucursal:** Cambio de sucursal y rol en cualquier momento.
  - **Activación / Bloqueo:** Suspensión inmediata del acceso con el estatus `INACTIVO`.
  - **Baja de Usuario:** Eliminación de credenciales del sistema.

### 9.3. Endpoints REST de Configuración

| Endpoint | Método | Descripción |
| :--- | :--- | :--- |
| `/api/configuracion/sucursales` | `GET` | Lista de sucursales registradas con estado y conteo. |
| `/api/configuracion/sucursales` | `POST` | Registro de una nueva sucursal en el catálogo. |
| `/api/configuracion/sucursales/[id]` | `PATCH` | Edición de datos, cambio de nombre o toggle de estatus (`ACTIVA`/`INACTIVA`). |
| `/api/configuracion/sucursales/[id]` | `DELETE` | Eliminación de sucursal con reasignación en cascada. |
| `/api/configuracion/usuarios` | `GET` | Lista de usuarios institucionales y sus sucursales asignadas. |
| `/api/configuracion/usuarios` | `POST` | Alta de nuevo colaborador con rol y sucursal. |
| `/api/configuracion/usuarios/[id]` | `PATCH` | Edición de usuario, cambio de sucursal o toggle de estatus (`ACTIVO`/`INACTIVO`). |
| `/api/configuracion/usuarios/[id]` | `DELETE` | Baja de colaborador del sistema. |


