# Manual de Proceso: Originación de Crédito y CRM LanAhora

**Código:** `LNH-VTAD-PRO-001-PROCESO PARA LA ORIGINACION DE UN NUEVO CRÉDITO CON CRM`  
**Objetivo:** Garantizar la originación de créditos en el modelo digital mediante el CRM para prospección, seguimiento en tiempo real e integración de expedientes con firma electrónica, culminando en la activación de la Distribuidora (DV) en LanaApp con su primer canje en un plazo máximo de 48 horas hábiles.

---

## 1. Puestos y Roles Involucrados

| Rol | Responsabilidad Principal |
| :--- | :--- |
| **Asesor de Crédito** | Prospección en campo/digital, abordaje (7 pasos), captura inicial de prospecto en CRM, recolección de documentos y fotos, firma digital de solicitud. |
| **Coordinador Comercial** | Planeación semanal de zonas, asignación de cuentas, validación en RENAPO, verificación comercial del expediente, pase a Core Central LH y escalamiento con Mesa de Crédito. |
| **Mesa de Crédito** | Validación de datos vs fotos, envío de SMS para autorización de Buró de Crédito, dictamen (Bueno/Regular/Malo/Rechazo), verificación telefónica de referencias (LNH-OP-FOR-006) y asignación de líneas de crédito. |
| **Gerente de Sucursal** | Supervisión general, acompañamiento a visita domiciliaria, validación final física/digital, asignación a Coordinador de Negocios y resguardo de pagaré verde. |
| **Coordinador de Negocios** | Agendamiento de visita domiciliaria, bienvenida y capacitación en laptop, recolección de firmas legales, asistencia en instalación de LanaApp y gestión del 1er canje (máx. 72 hrs). |
| **Gerente Administrativo** | Soporte en consultas manuales de Buró y procesos administrativos. |

---

## 2. Etapas del Pipeline en CRM (Embudo de Ventas)

1. **Contacto**
   - Captura rápida de oportunidad (`Nombre de Oportunidad`, `Nombre`, `Teléfono`).
   - Captura completa de datos de identidad (todo en mayúsculas como en INE/Pasaporte):
     - `Nombre`, `Segundo Nombre`, `Primer Apellido`, `Segundo Apellido`
     - `Correo electrónico`, `Teléfono`, `CURP`, `RFC`
     - `Tipo de distribuidor`, `Tipo de experiencia`, `Origen` (ej. Coordinador de Negocios, Distribuidor, Cambaceo, etc.)
   - Acción clave: Botón **Validar CURP** contra sistema Core Central LH:
     - **No Válido:** Saldo activo, liquidado con quita/reestructura por DV/CF, liquidado en gestoría o jurídico, estatus bloqueado / No sujeto a crédito.
     - **Válido:** No existe en registro, o existe sin saldo activo ni historial reciente, o BC dictaminado con más de 3 meses.
   - Pestaña **Contacto** (Domicilio y datos socioeconómicos):
     - Dirección completa (Calle, No. Ext, No. Int, Colonia con búsqueda por C.P. automática: Municipio y Ciudad).
     - Fecha de nacimiento, Género, Estado civil, Empresa, Puesto, Sueldo, Antigüedad (años), No. Dependientes, Nacionalidad.
   - Pestaña **INE**: Carga de fotos (anverso/reverso) y captura de número de identificación.

2. **Consulta de Buró**
   - Mesa de Crédito valida coherencia de datos vs fotografías de INE.
   - Envío de SMS al prospecto con enlace web para autorizar la consulta.
   - Emisión de dictamen de buró: **Bueno**, **Regular**, **Malo**, o **Rechazo**.
   - Si es **Rechazo** $\rightarrow$ se marca como **Perdido** y se detiene el flujo.
   - Si es **Aprobatorio** $\rightarrow$ se define el Perfil (`Emprendedor` o `DV`) y avanza a Solicitud de Crédito.

3. **Solicitud de Crédito**
   - Formulario dinámico adaptado al perfil y categoría:
     - Datos del Cónyuge (si aplica).
     - Datos del Aval (si aplica).
     - Vivienda adicional (si aplica).
     - Información de PEPs (Personas Expuestas Políticamente / familiares con funciones públicas).
   - **Firma Digital del Prospecto:** En el dispositivo móvil/tablet mediante stylus o dedo.
   - Generación y resguardo del PDF de solicitud firmada.

4. **Integración de Expediente**
   - Carga documental y fotográfica requerida según matriz (Anexo 1).
   - El Asesor envía el expediente a **Autorización / Validación Comercial**.

5. **Autorización Comercial (Validación Comercial)**
   - El Asesor pasa a modo solo lectura.
   - El Coordinador Comercial revisa documentos y realiza verificaciones (negocio, laboral, segunda propiedad, aval).
   - Si hay errores, regresa al Asesor para corrección con notas de bitácora.
   - Al aprobar, da clic en **Enviar documentos** hacia Core Central LH y remite a Mesa de Crédito.

6. **Mesa de Crédito**
   - Revisión minuciosa de expediente y validación telefónica de 3 referencias (formato `LNH-OP-FOR-006`).
   - Dictamen de líneas de crédito: *Valelana*, *LanAtienda* y *Préstamo Personal*.
   - Si autoriza, pasa el estatus a **Legales**.

7. **Legales (Activación y Primer Canje)**
   - Se notifica al Gerente de Sucursal y se asigna al Coordinador de Negocios.
   - Visita domiciliaria conjunta (Gerente + Coord. de Negocios) con la DV y un cliente acompañante para 1er canje.
   - Firma digital de documentación legal (aplicada a todos los contratos y pagarés) o respaldo físico.
   - Capacitación, entrega de kit de bienvenida y firma de pagaré verde físico.
   - Activación en **LanaApp** y ejecución del **Primer Canje Digital**.

8. **Perdido**
   - Estado de cierre para prospectos no viables (rechazo en buró, falta de INE/documentos, abandono).

---

## 3. Matriz de Documentos y Fotografías (Anexo 1)

| Documento en Core Central LH | Campo en CRM / CRM Originación LH | Tipo de Archivo |
| :--- | :--- | :---: |
| COMPROBANTE DE DOMICILIO TITULAR | comprobante de domicilio | PDF |
| COMPROBANTE DE EXPERIENCIA | comprobante de experiencia | PDF |
| COMPROBANTE DE INGRESOS TITULAR | comprobante de ingreso | PDF |
| PROPIEDAD DE TITULAR | comprobante de propiedad | PDF |
| VERIFICACION AVAL | documentación del aval | PDF |
| SOLICITUD DE CREDITO | solicitud de crédito (firmada) | PDF |
| INE TITULAR | identificación oficial (anverso y reverso) | PDF / FOTO |
| COMPROBANTE DE ANTIGUEDAD TITULAR | comprobante de antigüedad | PDF |
| ACTA DE MATRIMONIO DE AVAL | acta de matrimonio | PDF |
| VERIFICACION TITULAR | verificación de coordinador | PDF |
| FOTO EXTERIOR 1 TITULAR | fachada casa 1 | FOTO |
| FOTO EXTERIOR 2 TITULAR | fachada casa 2 | FOTO |
| Foto exterior 1 negocio titular | fachada negocio 1 | FOTO |
| Foto exterior 2 negocio titular | fachada negocio 2 | FOTO |
| FOTO INTERIOR 1 TITULAR | interior casa 1 | FOTO |
| FOTO INTERIOR 2 TITULAR | interior casa 2 | FOTO |
| FOTO INTERIOR 3 TITULAR | interior casa 3 | FOTO |
| Foto interior 1 negocio titular | interior negocio 1 | FOTO |
| Foto interior 2 negocio titular | interior negocio 2 | FOTO |
| Foto interior 3 negocio titular | interior negocio 3 | FOTO |
| FOTO EXTERIOR SEG PROP 1 TITULAR | interior segunda casa 1 | FOTO |
| FOTO INTERIOR SEGUNDA CASA 2 | interior segunda casa 2 | FOTO |
| Foto interior segunda casa 3 | interior segunda casa 3 | FOTO |
| FOTO INTERIOR SEGUNDA CASA 3 | fachada segunda casa 1 | FOTO |
| FOTO EXTERIOR SEG PROP 2 TITULAR | fachada segunda casa 2 | FOTO |

---

## 4. Tabla de Perfiles y Comisiones

| Perfil | Comisión Asesor | Comisión Coord. Negocios |
| :---: | :---: | :---: |
| **D-AAA** | $750 | $500 |
| **D-AA** | $500 | $500 |
| **D-A** | $500 | $250 |
| **E-AAA** | $500 | $500 |
| **E-AA** | $500 | $250 |
| **E-A** | $300 | $200 |

*(D = Distribuidor de Vales tradicional, E = Emprendedor)*

