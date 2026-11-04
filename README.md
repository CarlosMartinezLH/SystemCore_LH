# System Core LH — LanAhora Enterprise Platform

Plataforma integral y núcleo operativo de **LanAhora** (SOFOM E.N.R.), especializada en la originación, colocación, administración y cobranza de créditos mediante vales. Integra y moderniza el CRM de Originación (sustitución de Odoo), el Core Central (sustitución de Financialsoft), la gestión de Capital Humano (sustitución de Buk) y la capa de integración con instituciones financieras y servicios externos (Buró de Crédito, STP SPEI, Nubarium KYC, Paynet, Banorte y Botmaker).

---

## 📌 Módulos Principales del Sistema

1. **CRM de Originación (Odoo Modernizado)**:
   - Tubería Kanban interactiva de 8 etapas reglamentarias según manual `LNH-VTAD-PRO-001`.
   - Formulario de detalle con 6 pestañas: *Notas & Bitácora*, *Contacto & Domicilio*, *Fotografías INE*, *Solicitud Dinámica & Firma Digital*, *Integración de Expediente (25 Documentos del Anexo 1)* y *Mesa de Crédito & Buró*.
   - Dictamen de perfiles de distribuidora (`D-AAA`, `D-AA`, `D-A`, `E-AAA`, `E-AA`, `E-A`).

2. **Core Central Operativo (Financialsoft)**:
   - **Buscador Core**: Localizador instantáneo por No. de DV, Identificador CréditoID, Folio de Vale y Nombre de Persona.
   - **Padrón de Personas (122,144 registros)**: Con panel lateral de acciones operativas, consulta de Buró de Crédito en tiempo real, registro de cuentas CLABE STP, expediente digital Nextcloud, canje de vales Paynet, carta declaratoria prestanombres y exportación a Excel.
   - **Padrón de Distribuidores (7,171 DVs)**: Estado de cuenta oficial imprimible, relación de cobranza y recibos, mensajería masiva WhatsApp (Botmaker), levantamiento de castigo, push notifications a LanaApp y exportación XLS.

3. **Capital Humano & Asistencia (Buk Integrado)**:
   - Control de asistencia para corporativo, sucursales foráneas y asesores en calle mediante geolocalización satelital GPS (latitud, longitud y validación contra zona comercial asignada).
   - Bandeja de requisiciones de uniformes y gafetes institucionales con autorización de Dirección.
   - Academia LanAhora con certificaciones obligatorias en Prevención de Lavado de Dinero (PLD / FT) y técnicas de prospección.

4. **Dispersión & Pagos (STP / Paynet / Banorte)**:
   - Dispersión masiva vía SPEI con el Gateway de STP (Sistema de Transferencias y Pagos) y descarga de comprobantes CEP de Banxico.
   - Recaudación y conciliación de pagos en tiendas de conveniencia afiliadas a Paynet (7-Eleven, Farmacias del Ahorro, Circle K) y ventanillas Banorte.

5. **Capa de Integración & ESB (API Gateway Hub)**:
   - Monitor en tiempo real de salud, latencia y disponibilidad de las 6 integraciones externas del mapa tecnológico:
     - **Buró de Crédito México** (API v2 REST)
     - **STP SPEI** (WebServices REST/SOAP)
     - **Nubarium KYC** (Validación RENAPO, INE OCR y listas negras SAT 69-B)
     - **Paynet / Openpay** (Generación de códigos de barras para tiendas)
     - **CRM Odoo** (JSON-RPC v16)
     - **Botmaker WhatsApp & SMS** (Meta Cloud API)
   - Consola interactiva JSON con pruebas de ping y simulación de peticiones en vivo.

6. **Aplicación Móvil de Asesores de Campo (Android APK)**:
   - Aplicación nativa Android compilada con Gradle 9.3 y Android SDK para su instalación directa en dispositivos de los asesores (`dist/apk/lanahora-asesores-debug.apk`).

---

## 🎨 Identidad Corporativa y Diseño Oficial

La interfaz sigue fielmente los colores institucionales oficiales de LanAhora:
* **Azul Rey Corporativo (`#1d4ed8` a `#2563eb`)**: Cabeceras maestras, barras de herramientas y botones principales.
* **Amarillo Sol / Dorado (`#facc15` / `#eab308`)**: Listón superior de pestaña activa, botones clave de acción (*"Avanzar Etapa"*, *"Crear Oportunidad"*, *"Nueva Dispersión"*) y badges de nivel.
* **Lienzo Limpio y Pulcro (`#f0f4fa` y `#ffffff`)**: Fondos claros y tarjetas blancas con sombras sutiles, sustituyendo interfaces oscuras previas.
* **Verde Éxito (`#16a34a` / `#22c55e`)**: Validaciones de CURP exitosas, firmas capturadas y asistencias GPS puntuales.

---

## 🌿 Estrategia de Ramas (Git Flow)

Siguiendo las directrices del proyecto, todo el desarrollo se concentra en la rama **`develop`**:

| Rama | Propósito | Entorno |
| :--- | :--- | :--- |
| **`develop`** | **Rama activa de trabajo.** Todas las nuevas funcionalidades, vistas y módulos convergen aquí. | Desarrollo Local / Dev |
| **`test`** | Integración de pruebas, control de calidad y validación de usuario (QA/Staging). | Pruebas / QA |
| **`production`** | Código estable, verificado y listo para usuarios finales. | Producción |

> ⚠️ **Regla de oro:** Todo se sube estrictamente a `develop` hasta que el usuario dé la orden explícita de promover hacia `test` y posteriormente a `production`.

---

## 📁 Estructura del Repositorio

```text
SystemCore_LH/
├── docs/                                    # Manuales y especificaciones de arquitectura
│   ├── proceso-originacion-crm.md           # Flujo LNH-VTAD-PRO-001 (Originación CRM LanAhora)
│   ├── core-financialsoft.md                # Arquitectura del Core Central (FinancialSoft)
│   ├── recursos-humanos-buk.md              # Módulo de Capital Humano, Asistencia GPS y Buk
│   ├── diseno-login-movil.md                # Sistema de Diseño Oficial y Aplicación Móvil
│   └── mapa-sistemas-integraciones.md       # Mapa oficial de Sistemas, Infraestructura y ESB
├── dist/
│   └── apk/                                 # Paquetes Android listos para instalación
│       └── lanahora-asesores-debug.apk      # APK compilado de la App Móvil para Asesores
├── src/
│   ├── app/                                 # Rutas y páginas de Next.js (App Router)
│   │   ├── globals.css                      # Variables CSS y paleta oficial LanAhora
│   │   ├── layout.tsx                       # Layout raíz
│   │   └── page.tsx                         # Orquestador principal y protector de sesión
│   ├── components/                          # Componentes UI de los módulos
│   │   ├── Header.tsx                       # Barra superior con navegación corporativa
│   │   ├── LoginView.tsx                    # Pantalla de acceso por sucursal
│   │   ├── KanbanBoard.tsx                  # Tablero Kanban de originación de créditos
│   │   ├── TableView.tsx                    # Vista tabular de prospectos
│   │   ├── LeadDetailView.tsx               # Ficha de detalle de crédito (6 pestañas)
│   │   ├── NewLeadModal.tsx                 # Modal para crear oportunidades
│   │   ├── CoreDashboard.tsx                # Buscador Core por DV, Crédito y Vale
│   │   ├── PersonasView.tsx                 # Padrón de Personas con panel de acciones
│   │   ├── DistribuidoresView.tsx           # Padrón de Distribuidoras y coordinadores
│   │   ├── RHView.tsx                       # Capital Humano, Asistencia GPS y Capacitaciones
│   │   ├── DispersionView.tsx               # Dispersión SPEI STP y Recaudación Paynet
│   │   ├── IntegracionesView.tsx            # Consola ESB y monitor de APIs externas
│   │   ├── SignaturePad.tsx                 # Lienzo para firma digital vectorial
│   │   └── modals/                          # Modales de interacción operativa
│   │       ├── PersonaModals.tsx            # Buró API, CLABE STP, Canje Paynet, Prestanombres
│   │       └── DistribuidorModals.tsx       # Estado de Cuenta, WhatsApp Botmaker, Castigos
│   ├── lib/                                 # Semillas y datos de Financialsoft
│   └── types/                               # Definiciones de TypeScript (Auth, CRM, Core, RH)
└── README.md                                # Documentación general del proyecto
```

---

## 🚀 Inicio Rápido (Entorno Local)

Para ejecutar la plataforma localmente:

```bash
# 1. Asegurar dependencias instaladas
npm install

# 2. Iniciar servidor de desarrollo en http://localhost:3000
npm run dev

# 3. Compilar para producción (validación de tipos TypeScript)
npm run build
```

---

## 📱 Compilación del APK Móvil para Asesores

La aplicación móvil para Android se compila utilizando el SDK de Android y Gradle:

```bash
# Compilar el APK debug directamente:
cd "/Users/cmartinez/Desktop/proyectos/Lanahora/mobile_app/android"
JAVA_HOME=/opt/homebrew/opt/openjdk@17 ANDROID_HOME=/opt/homebrew/share/android-commandlinetools ./gradlew assembleDebug

# El archivo APK generado se ubica en:
# /Users/cmartinez/Desktop/System Core LH/SystemCore_LH/dist/apk/lanahora-asesores-debug.apk
```

---

## 📖 Documentación de Referencia

* [Manual de Originación y Flujo de CRM](docs/proceso-originacion-crm.md)
* [Arquitectura del Sistema Core Principal (FinancialSoft)](docs/core-financialsoft.md)
* [Módulo de Capital Humano & Asistencia (Buk)](docs/recursos-humanos-buk.md)
* [Diseño Institucional y App Móvil](docs/diseno-login-movil.md)
* [Mapa Oficial de Sistemas, Infraestructura y Capa de Integración](docs/mapa-sistemas-integraciones.md)
