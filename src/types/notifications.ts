export type NotificationCategory =
  | 'COBRO_VALE'
  | 'RECORDATORIO_PAGO'
  | 'DISPERSION_STP'
  | 'PROMOCION_TIENDA'
  | 'AVISO_INSTITUCIONAL';

export type NotificationTarget =
  | 'TODAS_DISTRIBUIDORAS'
  | 'DISTRIBUIDORA_INDIVIDUAL'
  | 'ASESORES_CAMPO'
  | 'TODOS';

export interface MobileNotification {
  id: string;
  title: string;
  body: string;
  category: NotificationCategory;
  target: NotificationTarget;
  targetId?: number | string; // Ej: noDist para distribuidora específica
  recipientName?: string;
  amount?: number;
  folio?: string;
  createdAt: string; // ISO string
  read: boolean;
  actionUrl?: string;
  meta?: {
    diasRestantes?: number;
    fechaCorte?: string;
    banco?: string;
    claveRastreo?: string;
    clienteNombre?: string;
    saldoDisponible?: number;
    medioPago?: string;
    nuevoDisponible?: number;
    [key: string]: unknown;
  };
}

export interface NotificationRuleConfig {
  // 1. Alerta de Cobro / Canje de Vale Digital
  alertCobroValeEnabled: boolean;
  alertCobroValeCanalPush: boolean;
  alertCobroValeCanalSms: boolean;
  alertCobroValeCanalWhatsApp: boolean;
  plantillaCobroVale: string;

  // 2. Recordatorios Preventivos de Pago a Distribuidoras
  alertRecordatorioPagoEnabled: boolean;
  diasAnticipacionCorte: number; // Ej: 3 días antes del corte quincenal
  horaDisparoRecordatorio: string; // Ej: "09:00"
  bonificacionPorcentaje: number; // Ej: 12%
  mensajeRecordatorio: string;

  // 3. Alertas de Dispersión STP SPEI
  alertDispersionEnabled: boolean;
  alertDispersionPush: boolean;

  // 4. Promociones y Tienda
  alertPromocionesEnabled: boolean;
}

export const DEFAULT_NOTIFICATION_RULES: NotificationRuleConfig = {
  alertCobroValeEnabled: true,
  alertCobroValeCanalPush: true,
  alertCobroValeCanalSms: true,
  alertCobroValeCanalWhatsApp: false,
  plantillaCobroVale: '¡Vale #{FOLIO} cobrado exitosamente por ${MONTO}! Cliente: {CLIENTE}. Tu nuevo saldo disponible es ${DISPONIBLE}.',

  alertRecordatorioPagoEnabled: true,
  diasAnticipacionCorte: 3,
  horaDisparoRecordatorio: '09:30',
  bonificacionPorcentaje: 12,
  mensajeRecordatorio: 'Recordatorio LanAhora: Tu pago quincenal vence en {DIAS} días ({FECHA_CORTE}). Paga a tiempo para asegurar tu bonificación del {BONIF}%.',

  alertDispersionEnabled: true,
  alertDispersionPush: true,

  alertPromocionesEnabled: true,
};

export const INITIAL_NOTIFICATIONS: MobileNotification[] = [
  {
    id: 'notif-1',
    title: '¡Vale #V-10492 Cobrado con Éxito!',
    body: 'Tu cliente MARYLYN SILVA TORRES concluyó el canje digital por $2,500.00 MXN. Se generó la orden STP y tu saldo disponible se actualizó a $25,000.00 MXN.',
    category: 'COBRO_VALE',
    target: 'TODAS_DISTRIBUIDORAS',
    targetId: 1002,
    recipientName: 'MARTHA LAURA REYES SOSA',
    amount: 2500,
    folio: 'V-10492',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    read: false,
    meta: {
      clienteNombre: 'MARYLYN SILVA TORRES',
      saldoDisponible: 25000,
    },
  },
  {
    id: 'notif-2',
    title: '📅 Recordatorio: Fecha Límite de Pago Quincenal',
    body: 'Faltan 3 días para tu fecha de corte (15 de Noviembre). Monto estimado a liquidar: $4,280.00 MXN. Recuerda pagar a tiempo para conservar tu 12% de bonificación en comisiones.',
    category: 'RECORDATORIO_PAGO',
    target: 'TODAS_DISTRIBUIDORAS',
    recipientName: 'Todas las Distribuidoras',
    amount: 4280,
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    read: false,
    meta: {
      diasRestantes: 3,
      fechaCorte: '15 de Noviembre',
    },
  },
  {
    id: 'notif-3',
    title: '⚡ Transferencia SPEI Exitosa',
    body: 'Dispersión bancaria STP completada a la cuenta CLABE terminación 0192 por $3,000.00 MXN. Clave de rastreo: STP844202611071001.',
    category: 'DISPERSION_STP',
    target: 'TODAS_DISTRIBUIDORAS',
    targetId: 1001,
    amount: 3000,
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    read: true,
    meta: {
      claveRastreo: 'STP844202611071001',
      banco: 'BBVA México',
    },
  },
];
