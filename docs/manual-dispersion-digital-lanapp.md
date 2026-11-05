# Manual Oficial de Dispersión Digital — LanApp (Vales Digitales con Canje Inmediato)

Este documento detalla el funcionamiento de **LanApp** y el **Portal de Canje para Clientes (`acreditala.financialsoft.site`)**, integrados de extremo a extremo con **SystemCore LanAhora** y el canal de dispersión bancaria automatizada **STP SPEI**.

---

## 1. Arquitectura de las Soluciones Móviles LanAhora

LanAhora opera dos aplicaciones móviles independientes según el perfil de usuario:

| Aplicación | Usuario Destino | Funcionalidad Principal | Binario APK |
| :--- | :--- | :--- | :--- |
| **LanApp** | **Distribuidora (DV)** | Consulta de líneas de crédito, saldos de relación, administración de cartera de clientes y emisión de **Vales Digitales con Canje**. | `dist/apk/lanapp-distribuidoras.apk` |
| **App Móvil Asesores** | **Asesores de Campo (LH)** | Prospección en calle, validación de CURP en frío, geolocalización, captura de documentos de domicilio y expediente digital. | `dist/apk/lanahora-asesores-debug.apk` |
| **Portal Acredítala** | **Cliente Final** | Web App PWA que el cliente abre desde el enlace de WhatsApp recibido: validación de datos, captura de INE, biometría facial y firma digital. | `https://acreditala.financialsoft.site` |

---

## 2. Flujo Completo de 17 Pasos (Basado en el Manual Oficial)

### Fase 1: Experiencia de la Distribuidora en LanApp (Pasos 1 al 7)

1. **Paso 1 — Inicio de Sesión**:
   - Ingreso de credenciales de Distribuidora (Usuario y Contraseña).
   - Acceso alternativo a *Activar Cuenta* mediante código SMS.
   - Enlace directo de ayuda con el Coordinador de Negocios asignado.

2. **Paso 2 — Mi Perfil (Dashboard Financiero de la DV)**:
   - Badge metálico 3D representativo del nivel de lealtad (*Plata, Oro, Platino, Bronce*).
   - Datos clave: Nombre completo, No. Distribuidor (`#1004`), Estatus (`ACTIVO`), Nivel (`PLATA`).
   - Resumen de Líneas de Crédito:
     - **Línea VALE LANA**: Total \$55,000.00 / Disponible \$26,843.10.
     - **Línea LANATIENDA**: Total \$17,500.00 / Disponible \$17,500.00.
     - **Línea CRÉDITO PERSONALES**: Total \$10,000.00 / Disponible \$4,501.80.
   - Saldos y Relación de Cobro:
     - Saldo Total: \$55,148.19 | Saldo Atrasado: \$0.00.
     - Saldo Relación a Liquidar: \$10,460.00 (Fecha de corte/pago: 24/11/2025).
     - Coordinador asignado: José Miguel González Vargas.
   - Botón directo: **OTORGAR CRÉDITO**.

3. **Paso 3 — Mis Clientes & Buscador**:
   - Padrón de clientes registrados con estatus, fecha de último crédito y créditos activos.
   - Buscador predictivo por ID o Nombre Completo.
   - Botón **NUEVO CLIENTE** para alta ágil de prospectos.

4. **Paso 4 — Crédito Nuevo (Configurador de Vale Digital)**:
   - Selección del cliente destinatario (ej. *José Efraín Vázquez Sosa*).
   - Selector interactivo de plazos quincenales `[-] 6 [+]` (4 a 16 quincenas).
   - Selector interactivo de importe `[-] $1,000.00 [+]` (\$500 a \$15,000).
   - Cálculo dinámico en tiempo real del pago por plazo: **\$237.00** quincenal.
   - Botón **GUARDAR**.

5. **Paso 5 — Información / Autorización**:
   - Pantalla de confirmación con Folio de Crédito (ej. `#2`).
   - Confirmación de cliente, importe autorizado y fecha de primer pago (20/12/2026).
   - Botón **COMPARTIR**.

6. **Paso 6 — Envío por WhatsApp**:
   - Generación del mensaje predefinido con la URL única y tokenizada de canje:
     ```text
     Lanahora: Gracias por tu canje. Para darle seguimiento, compartir la siguiente url:
     https://acreditala.financialsoft.site/solicitud/1-356F3C37-FDCE-F011-B513-000C29AC7C09
     ```

7. **Paso 7 — Instrucción al Cliente**:
   - La Distribuidora solicita a su cliente abrir el enlace recibido para completar su registro y recibir la dispersión.

---

### Fase 2: Experiencia del Cliente en Portal Acredítala (Pasos 8 al 17)

8. **Paso 8 — Detalle de Vale**:
   - El cliente revisa los términos: Referencia `1-1575`, Monto \$1,000.00, 6 quincenas de \$237.00, Seguro de vida incluido (\$10,000).
   - Botón verde: **Sí, es correcta**.

9. **Paso 9 — Formulario de Domicilio**:
   - Captura de Calle, Número exterior, Número interior, Código Postal, Colonia, Ciudad y Estado.

10. **Paso 10 — Beneficiario del Seguro de Vida**:
    - Captura de Nombre completo, Apellidos, Parentesco (100% asignado) y Fecha de Nacimiento del beneficiario.

11. **Paso 11 — Datos Bancarios para Depósito**:
    - Selección entre Tarjeta de Débito (16 dígitos) o CLABE Interbancaria (18 dígitos).
    - Selección de banco receptor (BBVA, Santander, Banorte, Citibanamex, Banco Azteca, Nu STP, Spin).
    - Botón verde: **Registrar**.

12. **Pasos 12 y 13 — Captura de INE (Anverso y Reverso)**:
    - Guía de encuadre fotográfico con buena iluminación.
    - Captura del anverso (fotografía y datos) y reverso (código MRZ y firma).

13. **Paso 14 — Validación OCR Exitosa**:
    - Mensaje oficial: *"Información de INE obtenida correctamente."*

14. **Paso 15 — Selfie Biométrica Facial**:
    - Encuadre facial dentro del óvalo verde con autodetección de vida (*Liveness Detection*) con score superior al 98%.

15. **Paso 16 — Firma Digital Táctil**:
    - Lienzo digital donde el cliente traza su firma lo más similar posible a la de su credencial de elector.
    - Botón **Firmar**.

16. **Paso 17 — Confirmación y Dispersión STP**:
    - Mensaje final: *"Gracias por firmar pronto recibiras tu dinero."*
    - Se dispara automáticamente la orden de transferencia SPEI vía el canal STP de SystemCore con clave de rastreo bancaria única.

---

## 3. Binarios APK Generados

Los archivos ejecutables compilados se encuentran disponibles en:
- `dist/apk/lanapp-distribuidoras.apk` (177 MB) — Aplicación nativa Android de Distribuidoras (LanApp).
- `dist/apk/lanahora-asesores-debug.apk` (153 MB) — Aplicación nativa Android de Asesores de Campo.
