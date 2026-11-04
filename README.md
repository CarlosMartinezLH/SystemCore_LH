# System Core LH — Lanahora

Sistema central de operaciones y CRM para **Lanahora**, enfocado en la gestión de créditos mediante vales.

---

## 📌 Visión General del Proyecto

El objetivo principal de esta primera etapa es construir el **CRM para Asesores de Crédito**, cuya función primordial es:
1. **Prospectar** potenciales distribuidoras de vales.
2. **Promocionar** el modelo de negocio y esquema de colocación de vales.
3. **Armar y validar expedientes digitales** (KYC, comprobantes, referencias, avales/pagarés).
4. **Validación y Activación** de nuevas distribuidoras para el otorgamiento de su línea de crédito inicial.

> *Nota a futuro:* Este núcleo se conectará con la aplicación móvil para distribuidoras (administración, colocación de vales digitales, cobranza y saldos).

---

## 🌿 Estrategia de Ramas (Git Flow)

El repositorio se estructura bajo la siguiente convención de ramas:

| Rama | Propósito | Entorno |
| :--- | :--- | :--- |
| **`production`** | Código estable, verificado y listo para usuarios finales. | Producción |
| **`test`** | Integración de pruebas, control de calidad y validación de usuario (QA/Staging). | Pruebas / QA |
| **`develop`** | Rama activa de desarrollo donde convergen las nuevas funcionalidades. | Desarrollo Local / Dev |

### Flujo de Trabajo
1. Los desarrollos y módulos nuevos se trabajan a partir de `develop`.
2. Una vez completada una funcionalidad, se integra a `develop` y se promueve a `test` para pruebas exhaustivas.
3. Tras la aprobación en `test`, se realiza el merge hacia `production`.

---

## 📁 Estructura del Proyecto (En Progreso)

```text
SystemCore_LH/
├── docs/               # Documentación funcional, técnica y flujos de Odoo
├── README.md           # Visión general y guía de inicio
```

---

## 📖 Documentación

Toda la documentación técnica, arquitectónica y guías de usuario se mantendrán sincronizadas en la carpeta `docs/` y en este archivo.
