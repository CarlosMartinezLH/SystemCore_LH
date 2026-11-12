import {
  PersonaCore,
  DistribuidorCore,
  DispersionSTP,
  PagoCore,
  CreditoCore,
  SpeiInboundPago,
  ClabeVirtualSTP,
} from '@/types/core';
import { Prospect } from '@/types/crm';
import {
  MobileNotification,
  NotificationRuleConfig,
  DEFAULT_NOTIFICATION_RULES,
  INITIAL_NOTIFICATIONS,
} from '@/types/notifications';
import {
  INITIAL_PERSONAS,
  INITIAL_DISTRIBUIDORES,
  INITIAL_DISPERSIONES,
  INITIAL_PAGOS,
  INITIAL_CREDITOS,
  INITIAL_CLABES_VIRTUALES,
  INITIAL_SPEI_INBOUND,
} from '@/lib/data/coreData';
import { validarCreditoGeneraCanje } from '@/lib/rules/businessRulesEngine';
import { INITIAL_PROSPECTS } from '@/lib/data/initialData';

export interface WebPushSubscriptionRecord {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  distribuidorId?: number;
  userAgent?: string;
  createdAt: string;
}

export interface CoreSyncData {
  personas: PersonaCore[];
  distribuidores: DistribuidorCore[];
  dispersiones: DispersionSTP[];
  pagos: PagoCore[];
  creditos: CreditoCore[];
  prospects: Prospect[];
  notifications: MobileNotification[];
  notificationRules: NotificationRuleConfig;
  mobileNotificationAccepted: boolean;
  clabesVirtuales?: ClabeVirtualSTP[];
  speiInboundPagos?: SpeiInboundPago[];
  pushSubscriptions?: WebPushSubscriptionRecord[];
  lastUpdate: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __coreSyncData: CoreSyncData | undefined;
}

export function getServerSyncData(): CoreSyncData {
  if (!globalThis.__coreSyncData) {
    globalThis.__coreSyncData = {
      personas: [...INITIAL_PERSONAS],
      distribuidores: [...INITIAL_DISTRIBUIDORES],
      dispersiones: [...INITIAL_DISPERSIONES],
      pagos: [...INITIAL_PAGOS],
      creditos: [...INITIAL_CREDITOS],
      prospects: [...INITIAL_PROSPECTS],
      notifications: [...INITIAL_NOTIFICATIONS],
      notificationRules: { ...DEFAULT_NOTIFICATION_RULES },
      mobileNotificationAccepted: false,
      clabesVirtuales: [...INITIAL_CLABES_VIRTUALES],
      speiInboundPagos: [...INITIAL_SPEI_INBOUND],
      lastUpdate: Date.now(),
    };
  } else {
    // Ensure any newly added personas from INITIAL_PERSONAS are loaded in correct order
    const existingIds = new Set(globalThis.__coreSyncData.personas.map((ep) => ep.personaId));
    const toAdd = INITIAL_PERSONAS.filter((p) => !existingIds.has(p.personaId));
    if (toAdd.length > 0) {
      globalThis.__coreSyncData.personas = [...toAdd, ...globalThis.__coreSyncData.personas];
    }
  }
  if (!globalThis.__coreSyncData.clabesVirtuales) {
    globalThis.__coreSyncData.clabesVirtuales = [...INITIAL_CLABES_VIRTUALES];
  }
  if (!globalThis.__coreSyncData.speiInboundPagos) {
    globalThis.__coreSyncData.speiInboundPagos = [...INITIAL_SPEI_INBOUND];
  }
  if (!globalThis.__coreSyncData.notifications) {
    globalThis.__coreSyncData.notifications = [...INITIAL_NOTIFICATIONS];
  }
  if (!globalThis.__coreSyncData.notificationRules) {
    globalThis.__coreSyncData.notificationRules = { ...DEFAULT_NOTIFICATION_RULES };
  }
  if (globalThis.__coreSyncData.mobileNotificationAccepted === undefined) {
    globalThis.__coreSyncData.mobileNotificationAccepted = false;
  }
  // Depurar registros de pruebas o folios temporales duplicados
  globalThis.__coreSyncData.creditos = globalThis.__coreSyncData.creditos.filter(
    (c) => c.noVale !== 'V-999888' && c.noVale !== 'TEST-01'
  );
  globalThis.__coreSyncData.dispersiones = globalThis.__coreSyncData.dispersiones.filter(
    (d) => d.creditoId !== 'V-999888' && d.creditoId !== 'TEST-01'
  );
  return globalThis.__coreSyncData;
}

export function recordCanjeSync(payload: {
  folio?: string;
  personaId?: number;
  clienteNombre?: string;
  distribuidorId?: number;
  monto: number;
  metodo?: 'PAYNET' | 'STP';
  banco?: string;
  clabe?: string;
  curp?: string;
}) {
  const data = getServerSyncData();
  const montoNum = Number(payload.monto) || 0;
  const distId = Number(payload.distribuidorId) || 1002;
  const folioFinal = payload.folio || `V-${Math.floor(10000 + Math.random() * 90000)}`;

  // 1. Crear o actualizar registro de Dispersión STP en tiempo real
  const folioSTP = `STP-${Date.now().toString().slice(-6)}`;
  const fechaHoy = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const claveRastreo = `STP844${fechaHoy}${Math.floor(1000 + Math.random() * 9000)}`;

  const dispersionExistenteIdx = data.dispersiones.findIndex(
    (d) => d.creditoId === folioFinal || d.beneficiario === (payload.clienteNombre || '').toUpperCase()
  );

  const nuevaDispersion: DispersionSTP = {
    id: dispersionExistenteIdx >= 0 ? data.dispersiones[dispersionExistenteIdx].id : `disp-${Date.now()}`,
    folioSTP: dispersionExistenteIdx >= 0 ? data.dispersiones[dispersionExistenteIdx].folioSTP : folioSTP,
    claveRastreo: dispersionExistenteIdx >= 0 ? data.dispersiones[dispersionExistenteIdx].claveRastreo : claveRastreo,
    creditoId: folioFinal,
    beneficiario: (payload.clienteNombre || 'MARYLYN SILVA TORRES').toUpperCase(),
    curp: (payload.curp || 'SITM890918MCLLRR02').toUpperCase(),
    clabe: payload.clabe || '012180015488920192',
    banco: payload.banco || (payload.metodo === 'PAYNET' ? 'Paynet Efectivo (7-Eleven / Farmacias)' : 'BBVA México'),
    monto: montoNum,
    fechaHora: new Date().toLocaleString('es-MX'),
    estatus: 'LIQUIDADO',
    concepto: `Desembolso Vale #${folioFinal} LanAhora`,
  };

  if (dispersionExistenteIdx >= 0) {
    data.dispersiones[dispersionExistenteIdx] = nuevaDispersion;
  } else {
    data.dispersiones = [nuevaDispersion, ...data.dispersiones];
  }

  // 2. Actualizar el saldo y cartera del Distribuidor
  const distIndex = data.distribuidores.findIndex((d) => d.noDist === distId);
  if (distIndex >= 0) {
    const dist = data.distribuidores[distIndex];
    const nuevoSaldo = dist.saldoActual + montoNum;
    const nuevoDisponible = Math.max(0, dist.creditoLimite - nuevoSaldo);
    data.distribuidores[distIndex] = {
      ...dist,
      saldoActual: nuevoSaldo,
      disponible: nuevoDisponible,
    };
  }

  // 3. Actualizar la persona / cliente con su crédito asignado
  const persIndex = data.personas.findIndex(
    (p) =>
      (payload.personaId && p.personaId === payload.personaId) ||
      (payload.curp && p.curp.toUpperCase() === payload.curp.toUpperCase()) ||
      (payload.clienteNombre && p.nombre.toLowerCase().includes(payload.clienteNombre.toLowerCase().split(' ')[0]))
  );

  if (persIndex >= 0) {
    const pers = data.personas[persIndex];
    data.personas[persIndex] = {
      ...pers,
      pagareCantidad: (pers.pagareCantidad || 0) + montoNum,
      pagareEstatusId: 'FIRMADO EN BLANCO',
      buroInternoEstatus: 'NORMAL',
    };
  }

  // 4. Agregar crédito al padrón de créditos
  const distNombre = data.distribuidores.find((d) => d.noDist === distId)?.nombreDistribuidor || 'BERTHA ALICIA TELLO LARA';
  const nuevoCredito: CreditoCore = {
    creditoId: `CR-${Date.now().toString().slice(-6)}`,
    noVale: folioFinal,
    noDist: distId,
    distribuidorNombre: distNombre,
    clienteNombre: (payload.clienteNombre || 'MARYLYN SILVA TORRES').toUpperCase(),
    monto: montoNum,
    saldo: montoNum,
    estatus: 'VIGENTE',
    fechaOtorgamiento: new Date().toLocaleDateString('es-MX'),
    quincenasPlazo: 12,
    sucursal: 'SALTILLO',
  };
  data.creditos = [nuevoCredito, ...data.creditos];

  // 5. Emitir Notificación Automática de Cobro de Vale a la Distribuidora
  let saldoDispFinal = 0;
  if (distIndex >= 0) {
    saldoDispFinal = data.distribuidores[distIndex].disponible;
  }
  const clienteFinal = (payload.clienteNombre || 'MARYLYN SILVA TORRES').toUpperCase();
  const notifCobro: MobileNotification = {
    id: `notif-${Date.now()}`,
    title: `¡Vale #${folioFinal} Cobrado con Éxito!`,
    body: `Tu cliente ${clienteFinal} canjeó un vale digital por $${montoNum.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN. Se autorizó la dispersión STP y tu saldo disponible actual es de $${saldoDispFinal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN.`,
    category: 'COBRO_VALE',
    target: 'TODAS_DISTRIBUIDORAS',
    targetId: distId,
    recipientName: distNombre,
    amount: montoNum,
    folio: folioFinal,
    createdAt: new Date().toISOString(),
    read: false,
    meta: {
      clienteNombre: clienteFinal,
      saldoDisponible: saldoDispFinal,
      claveRastreo: nuevaDispersion.claveRastreo,
      banco: nuevaDispersion.banco,
    },
  };
  data.notifications = [notifCobro, ...data.notifications];

  data.lastUpdate = Date.now();
  return { nuevaDispersion, nuevoCredito, notifCobro };
}

export function updateClienteSync(payload: Partial<PersonaCore> & { personaId: number }) {
  const data = getServerSyncData();
  const index = data.personas.findIndex((p) => p.personaId === payload.personaId);
  if (index >= 0) {
    data.personas[index] = {
      ...data.personas[index],
      ...payload,
    };
    data.lastUpdate = Date.now();
    return data.personas[index];
  }
  return null;
}

export function recordClienteSync(payload: {
  nombre: string;
  nombreAdicional?: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  curp: string;
  rfc?: string;
  telefono?: string;
  direccion?: string;
  sexoId?: 'FEMENINO' | 'MASCULINO';
  fechaNacimiento?: string;
  numeroExterior?: string;
  codigoPostal?: string;
  localidad?: string;
  tipoIdentificacion?: 'INE' | 'PASAPORTE' | 'CEDULA' | 'OTRA';
  numeroIdentificacion?: string;
  pagareEstatusId?: 'NO DEFINIDO' | 'FIRMADO EN BLANCO' | 'SIN PAGARE';
  pagareCantidad?: number;
  estadoNacimiento?: string;
  localidadNacimiento?: string;
  consultaBuroInicial?: boolean;
  folioBuroPrevia?: string;
}) {
  const data = getServerSyncData();
  const curpUpper = payload.curp.trim().toUpperCase();

  // Validación: Comprobar si ya existe en el Padrón Core por CURP
  const existe = data.personas.find((p) => p.curp.trim().toUpperCase() === curpUpper);
  if (existe) {
    return {
      yaExiste: true,
      nuevaPersona: existe,
      mensaje: `El cliente ya está registrado en el Padrón Core con el ID #${existe.personaId} (${existe.nombre} ${existe.apellidoPaterno}).`,
    };
  }

  const personaId = 122150 + Math.floor(Math.random() * 800);

  const nuevaPersona: PersonaCore = {
    personaId,
    nombre: payload.nombre.toUpperCase(),
    nombreAdicional: payload.nombreAdicional ? payload.nombreAdicional.toUpperCase() : undefined,
    apellidoPaterno: payload.apellidoPaterno.toUpperCase(),
    apellidoMaterno: payload.apellidoMaterno ? payload.apellidoMaterno.toUpperCase() : '',
    fechaNacimiento: payload.fechaNacimiento || '01/01/1995',
    pagareEstatusId: payload.pagareEstatusId || 'NO DEFINIDO',
    pagareCantidad: payload.pagareCantidad || (payload.pagareEstatusId === 'FIRMADO EN BLANCO' ? 25000 : 0.0),
    curp: curpUpper,
    rfc: payload.rfc ? payload.rfc.toUpperCase() : curpUpper.slice(0, 10),
    sexoId: payload.sexoId || 'FEMENINO',
    buroInternoEstatus: 'NORMAL',
    observaciones: 'Cliente registrado vía Padrón Core / Captura',
    isDistribuidor: false,
    telefono: payload.telefono || '8441002030',
    direccion: payload.direccion || '',
    numeroExterior: payload.numeroExterior,
    codigoPostal: payload.codigoPostal,
    localidad: payload.localidad,
    tipoIdentificacion: payload.tipoIdentificacion || 'INE',
    numeroIdentificacion: payload.numeroIdentificacion,
    estadoNacimiento: payload.estadoNacimiento || 'Coahuila',
    localidadNacimiento: payload.localidadNacimiento,
    consultaBuroInicial: payload.consultaBuroInicial,
    folioBuroPrevia: payload.folioBuroPrevia,
    scoreBuro: payload.consultaBuroInicial ? 695 : undefined,
  };

  data.personas = [nuevaPersona, ...data.personas];

  // También se refleja en CRM como prospecto
  const nuevoProspect: Prospect = {
    id: `prospect-${personaId}`,
    opportunityName: `Préstamo Vale - ${nuevaPersona.nombre} ${nuevaPersona.apellidoPaterno}`,
    stage: 'contacto',
    daysInStage: 0,
    priorityStars: 2,
    firstName: nuevaPersona.nombre,
    lastName: `${nuevaPersona.apellidoPaterno} ${nuevaPersona.apellidoMaterno}`.trim(),
    email: '',
    phone: nuevaPersona.telefono || '',
    curp: nuevaPersona.curp,
    rfc: nuevaPersona.rfc,
    advisorName: 'Alejandro Domínguez',
    advisorEmail: 'alejandro_dominguez@lanahora.com',
    salesTeam: 'Ventas Digitales',
    company: 'Lanahora',
    distributorType: 'DV',
    experienceType: '',
    origin: 'DISTRIBUIDOR',
    financialCurpStatus: 'VALIDO',
    street: nuevaPersona.direccion || '',
    extNumber: '',
    zipCode: '',
    neighborhood: '',
    municipality: 'Saltillo',
    city: 'Saltillo',
    state: 'Coahuila',
    bureauResult: 'BUENO',
    smsSent: true,
    smsAuthorized: true,
    assignedProfile: 'SIN_ASIGNAR',
    hasSpouse: false,
    hasGuarantor: false,
    hasAdditionalProperty: false,
    hasPepFamily: false,
    references: [],
    creditLines: { valelana: 5000, lanatienda: 0, personal: 0 },
    documents: [],
    messages: [
      {
        id: `msg-${Date.now()}`,
        author: 'Sistema Core',
        authorEmail: 'sistema@lanahora.com',
        type: 'sistema',
        content: 'Cliente sincronizado automáticamente desde LanApp Móvil / Sistema Core.',
        createdAt: new Date().toLocaleString('es-MX'),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.prospects = [nuevoProspect, ...data.prospects];
  data.lastUpdate = Date.now();
  return { nuevaPersona, nuevoProspect };
}

export function recordPagoSync(payload: {
  noDist: number;
  monto: number;
  medioPago?: 'PAYNET_TIENDAS' | 'STP_SPEI' | 'BANORTE_SUCURSAL' | 'CLUB_PAGO';
  establecimiento?: string;
  referencia?: string;
}) {
  const data = getServerSyncData();
  const montoNum = Number(payload.monto) || 0;
  const dist = data.distribuidores.find((d) => d.noDist === Number(payload.noDist));

  const nuevoPago: PagoCore = {
    id: `pago-${Date.now()}`,
    referencia: payload.referencia || `REC-${Date.now().toString().slice(-6)}`,
    medioPago: payload.medioPago || 'PAYNET_TIENDAS',
    noDist: Number(payload.noDist),
    distribuidorNombre: dist?.nombreDistribuidor || 'DISTRIBUIDOR',
    monto: montoNum,
    comision: Math.round(montoNum * 0.02),
    fechaPago: new Date().toLocaleString('es-MX'),
    estatus: 'APLICADO',
    establecimiento: payload.establecimiento || '7-Eleven Saltillo',
  };

  data.pagos = [nuevoPago, ...data.pagos];

  // Disminuir saldo actual del distribuidor y recuperar línea disponible
  if (dist) {
    const distIdx = data.distribuidores.findIndex((d) => d.noDist === dist.noDist);
    if (distIdx >= 0) {
      const nuevoSaldo = Math.max(0, dist.saldoActual - montoNum);
      data.distribuidores[distIdx] = {
        ...dist,
        saldoActual: nuevoSaldo,
        disponible: Math.min(dist.creditoLimite, dist.creditoLimite - nuevoSaldo),
      };
    }
  }

  data.lastUpdate = Date.now();
  return nuevoPago;
}

export function recordSpeiInboundSync(payload: {
  noDist: number;
  montoDepositado: number;
  bancoEmisorId?: string;
  bancoEmisorNombre?: string;
  claveRastreo?: string;
  diaCorte?: string;
  concepto?: string;
}) {
  const data = getServerSyncData();
  const noDist = Number(payload.noDist);
  const montoDep = Number(payload.montoDepositado) || 0;
  const dist = data.distribuidores.find((d) => d.noDist === noDist);

  if (!dist) {
    throw new Error(`Distribuidora #${noDist} no encontrada en Padrón Core.`);
  }

  // Encontrar CLABE virtual asignada
  const clabeInfo = (data.clabesVirtuales || []).find((c) => c.noDist === noDist);
  const clabeVirtual = clabeInfo?.clabe || `646180${noDist.toString().padStart(6, '0')}000018`;
  const perfilDV = clabeInfo?.perfil || (dist.nivel === 'DIAMANTE' ? 'D-AAA' : 'D-AA');

  // Tabla oficial de Bonificación por corte (30-15) del Excel de Reglas de Negocio
  const diaCorte = payload.diaCorte || '30 o 15';
  let tasaBonif = 0.18; // Default 18% para D-AAA día 30/15

  if (perfilDV === 'D-AAA') {
    if (diaCorte === '30 o 15') tasaBonif = 0.18;
    else if (diaCorte === '01 o 16') tasaBonif = 0.17;
    else if (diaCorte === '02 o 17') tasaBonif = 0.16;
    else if (diaCorte === '03 o 18') tasaBonif = 0.15;
    else if (diaCorte === '04 o 19') tasaBonif = 0.14;
    else if (diaCorte === '05 o 20') tasaBonif = 0.13;
    else if (diaCorte === '06 o 21') tasaBonif = 0.12;
    else if (diaCorte === '07 o 22') tasaBonif = 0.11;
    else tasaBonif = 0.10;
  } else if (perfilDV === 'D-AA' || perfilDV === 'E-AAA') {
    if (diaCorte === '30 o 15') tasaBonif = 0.16;
    else if (diaCorte === '01 o 16') tasaBonif = 0.15;
    else if (diaCorte === '02 o 17') tasaBonif = 0.14;
    else if (diaCorte === '03 o 18') tasaBonif = 0.13;
    else if (diaCorte === '04 o 19') tasaBonif = 0.12;
    else if (diaCorte === '05 o 20') tasaBonif = 0.11;
    else if (diaCorte === '06 o 21') tasaBonif = 0.10;
    else if (diaCorte === '07 o 22') tasaBonif = 0.09;
    else tasaBonif = 0.08;
  } else if (perfilDV === 'D-A' || perfilDV === 'E-AA') {
    if (diaCorte === '30 o 15') tasaBonif = 0.14;
    else if (diaCorte === '01 o 16') tasaBonif = 0.13;
    else if (diaCorte === '02 o 17') tasaBonif = 0.12;
    else if (diaCorte === '03 o 18') tasaBonif = 0.11;
    else if (diaCorte === '04 o 19') tasaBonif = 0.10;
    else if (diaCorte === '05 o 20') tasaBonif = 0.09;
    else if (diaCorte === '06 o 21') tasaBonif = 0.08;
    else if (diaCorte === '07 o 22') tasaBonif = 0.07;
    else tasaBonif = 0.06;
  } else {
    // Emprendedora E-A
    if (diaCorte === '30 o 15') tasaBonif = 0.12;
    else if (diaCorte === '01 o 16') tasaBonif = 0.11;
    else if (diaCorte === '02 o 17') tasaBonif = 0.10;
    else if (diaCorte === '03 o 18') tasaBonif = 0.09;
    else if (diaCorte === '04 o 19') tasaBonif = 0.08;
    else if (diaCorte === '05 o 20') tasaBonif = 0.07;
    else if (diaCorte === '06 o 21') tasaBonif = 0.06;
    else if (diaCorte === '07 o 22') tasaBonif = 0.05;
    else tasaBonif = 0.04;
  }

  // Cascada de aplicación:
  const saldoExigible = clabeInfo?.saldoPendienteQuincena || Math.min(dist.saldoActual, 10460);

  // Bonificación ganada por la Distribuidora
  const factorNeto = 1 - tasaBonif;
  const bonificacion = Math.round((montoDep / factorNeto) * tasaBonif * 100) / 100;
  const montoTotalAplicado = Math.round((montoDep + bonificacion) * 100) / 100;

  // Actualizar saldos de crédito de la distribuidora
  const distIdx = data.distribuidores.findIndex((d) => d.noDist === noDist);
  const lineaPrevia = dist.disponible;
  const nuevoSaldo = Math.max(0, dist.saldoActual - montoTotalAplicado);
  const nuevaLineaDisponible = Math.min(dist.creditoLimite, dist.creditoLimite - nuevoSaldo);

  if (distIdx >= 0) {
    data.distribuidores[distIdx] = {
      ...dist,
      saldoActual: nuevoSaldo,
      disponible: nuevaLineaDisponible,
    };
  }

  // Actualizar saldo de la CLABE virtual
  if (clabeInfo) {
    const clabeIdx = data.clabesVirtuales?.findIndex((c) => c.noDist === noDist) ?? -1;
    if (clabeIdx >= 0 && data.clabesVirtuales) {
      data.clabesVirtuales[clabeIdx].saldoPendienteQuincena = Math.max(
        0,
        clabeInfo.saldoPendienteQuincena - montoTotalAplicado
      );
    }
  }

  const timestamp = Date.now();
  const claveRastreo =
    payload.claveRastreo ||
    `20261109${payload.bancoEmisorId || '40012'}BBER${timestamp.toString().slice(-8)}`;
  const folioSTP = `STP-IN-${timestamp.toString().slice(-6)}`;
  const polizaId = `POL-ING-2026-${timestamp.toString().slice(-6)}`;

  const nuevoPagoSpei: SpeiInboundPago = {
    id: `spei-in-${timestamp}`,
    folioSTP,
    claveRastreo,
    bancoEmisorId: payload.bancoEmisorId || '40012',
    bancoEmisorNombre: payload.bancoEmisorNombre || 'BBVA México',
    clabeVirtual,
    noDist,
    distribuidorNombre: dist.nombreDistribuidor,
    perfilDV,
    saldoExigible,
    montoDepositado: montoDep,
    diaCorte,
    porcentajeBonificacion: Math.round(tasaBonif * 100),
    montoBonificacion: bonificacion,
    montoAplicadoCredito: montoTotalAplicado,
    montoMoratorios: 0,
    montoAmortVencida: 0,
    montoAmortCorriente: montoTotalAplicado,
    montoRemanenteFavor: Math.max(0, montoTotalAplicado - saldoExigible),
    lineaPrevia,
    lineaNuevaDisponible: nuevaLineaDisponible,
    fechaHora: new Date().toLocaleString('es-MX'),
    concepto: payload.concepto || `PAGO CORTE SPEI DV ${noDist}`,
    estatus: 'APLICADO_AUTOMATICO',
    cepUrl: `https://www.banxico.org.mx/cep/consultar?rastreo=${claveRastreo}`,
    polizaContableId: polizaId,
  };

  if (!data.speiInboundPagos) {
    data.speiInboundPagos = [...INITIAL_SPEI_INBOUND];
  }
  data.speiInboundPagos = [nuevoPagoSpei, ...data.speiInboundPagos];

  // También se registra en la tabla general de Pagos del Core
  const nuevoPagoCore: PagoCore = {
    id: `pago-${timestamp}`,
    referencia: claveRastreo,
    medioPago: 'STP_SPEI',
    noDist,
    distribuidorNombre: dist.nombreDistribuidor,
    monto: montoDep,
    comision: bonificacion,
    fechaPago: new Date().toLocaleString('es-MX'),
    estatus: 'APLICADO',
    establecimiento: `SPEI STP (${payload.bancoEmisorNombre || 'BBVA'})`,
  };
  data.pagos = [nuevoPagoCore, ...data.pagos];

  data.lastUpdate = Date.now();
  return { pagoSpei: nuevoPagoSpei, distribuidor: data.distribuidores[distIdx] };
}

export function recordCreditoSync(payload: {
  noVale?: string;
  clienteNombre: string;
  clienteId?: string;
  distribuidorId?: number;
  monto: number;
  plazos?: number;
  pagoPorPlazo?: number;
  clabe?: string;
  banco?: string;
  curp?: string;
}) {
  const data = getServerSyncData();
  const montoNum = Number(payload.monto) || 0;
  const distId = Number(payload.distribuidorId) || 1002;
  const dist = data.distribuidores.find((d) => d.noDist === distId);
  const distNombre = dist?.nombreDistribuidor || 'BERTHA ALICIA TELLO LARA';
  const folioVale = payload.noVale || `V-${Math.floor(10000 + Math.random() * 90000)}`;

  const nuevoCredito: CreditoCore = {
    creditoId: `CR-${Date.now().toString().slice(-6)}`,
    noVale: folioVale,
    noDist: distId,
    distribuidorNombre: distNombre,
    clienteNombre: payload.clienteNombre.toUpperCase(),
    monto: montoNum,
    saldo: montoNum,
    estatus: 'VIGENTE',
    fechaOtorgamiento: new Date().toLocaleDateString('es-MX'),
    quincenasPlazo: payload.plazos || 12,
    sucursal: dist?.sucursal || 'SALTILLO',
  };

  // Buscar persona asociada para obtener CURP
  const pers = data.personas.find(
    (p) =>
      (payload.clienteId && p.personaId.toString() === payload.clienteId.toString()) ||
      p.nombre.toLowerCase().includes(payload.clienteNombre.toLowerCase().split(' ')[0])
  );

  // Validación oficial dbo.CreditoGeneraCanje
  const validation = validarCreditoGeneraCanje({
    importe: montoNum,
    plazos: payload.plazos || 6,
    folioVale,
    distribuidor: dist || data.distribuidores[0],
    cliente: pers || data.personas[0],
    todosLosCreditos: data.creditos,
    todasLasPersonas: data.personas,
  });

  if (!validation.valido) {
    console.warn(`[CreditoGeneraCanje] Rechazado por regla ${validation.codigoError}: ${validation.mensajeError}`);
    return {
      error: validation.mensajeError,
      codigoError: validation.codigoError,
      rechazado: true,
      errores: validation.errores,
    };
  }

  data.creditos = [nuevoCredito, ...data.creditos];

  // 2. Crear inmediatamente la orden de dispersión SPEI (STP) en el módulo Dispersión & Pagos
  const folioSTP = `STP-${Date.now().toString().slice(-6)}`;
  const fechaHoy = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const claveRastreo = `STP844${fechaHoy}${Math.floor(1000 + Math.random() * 9000)}`;

  const nuevaDispersion: DispersionSTP = {
    id: `disp-${Date.now()}`,
    folioSTP,
    claveRastreo,
    creditoId: folioVale,
    beneficiario: payload.clienteNombre.toUpperCase(),
    curp: payload.curp || pers?.curp || 'SITM890918MCLLRR02',
    clabe: payload.clabe || '012180015488920192',
    banco: payload.banco || 'BBVA México',
    monto: montoNum,
    fechaHora: new Date().toLocaleString('es-MX'),
    estatus: 'LIQUIDADO',
    concepto: `Desembolso Vale #${folioVale} LanAhora`,
  };

  data.dispersiones = [nuevaDispersion, ...data.dispersiones];

  // 3. Actualizar cartera del distribuidor
  if (dist) {
    const distIdx = data.distribuidores.findIndex((d) => d.noDist === dist.noDist);
    if (distIdx >= 0) {
      const nuevoSaldo = dist.saldoActual + montoNum;
      data.distribuidores[distIdx] = {
        ...dist,
        saldoActual: nuevoSaldo,
        disponible: Math.max(0, dist.creditoLimite - nuevoSaldo),
      };
    }
  }

  // Actualizar pagaré del cliente si existe
  const persIdx = data.personas.findIndex(
    (p) =>
      (payload.clienteId && p.personaId.toString() === payload.clienteId.toString()) ||
      p.nombre.toLowerCase().includes(payload.clienteNombre.toLowerCase().split(' ')[0])
  );
  if (persIdx >= 0) {
    const pers = data.personas[persIdx];
    data.personas[persIdx] = {
      ...pers,
      pagareCantidad: (pers.pagareCantidad || 0) + montoNum,
      pagareEstatusId: 'FIRMADO EN BLANCO',
    };
  }

  data.lastUpdate = Date.now();
  return nuevoCredito;
}

export function sendNotificationSync(payload: Partial<MobileNotification>): MobileNotification {
  const data = getServerSyncData();
  const nueva: MobileNotification = {
    id: payload.id || `notif-${Date.now()}`,
    title: payload.title || 'Notificación LanAhora',
    body: payload.body || '',
    category: payload.category || 'AVISO_INSTITUCIONAL',
    target: payload.target || 'TODAS_DISTRIBUIDORAS',
    targetId: payload.targetId,
    recipientName: payload.recipientName || 'Todas las Distribuidoras',
    amount: payload.amount,
    folio: payload.folio,
    createdAt: new Date().toISOString(),
    read: false,
    meta: payload.meta,
  };
  data.notifications = [nueva, ...data.notifications];
  data.lastUpdate = Date.now();
  return nueva;
}

export function updateNotificationRulesSync(rules: Partial<NotificationRuleConfig>): NotificationRuleConfig {
  const data = getServerSyncData();
  data.notificationRules = {
    ...data.notificationRules,
    ...rules,
  };
  data.lastUpdate = Date.now();
  return data.notificationRules;
}

export function markNotificationReadSync(notifId: string): boolean {
  const data = getServerSyncData();
  const idx = data.notifications.findIndex((n) => n.id === notifId);
  if (idx >= 0) {
    data.notifications[idx].read = true;
    data.lastUpdate = Date.now();
    return true;
  }
  return false;
}

export function setMobileNotificationPermissionSync(accepted: boolean): boolean {
  const data = getServerSyncData();
  data.mobileNotificationAccepted = accepted;
  data.lastUpdate = Date.now();
  return data.mobileNotificationAccepted;
}

export function addPushSubscriptionSync(sub: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  distribuidorId?: number;
  userAgent?: string;
}): void {
  const data = getServerSyncData();
  if (!data.pushSubscriptions) {
    data.pushSubscriptions = [];
  }
  const existingIdx = data.pushSubscriptions.findIndex((s) => s.endpoint === sub.endpoint);
  const record: WebPushSubscriptionRecord = {
    endpoint: sub.endpoint,
    keys: sub.keys,
    distribuidorId: sub.distribuidorId,
    userAgent: sub.userAgent,
    createdAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    data.pushSubscriptions[existingIdx] = record;
  } else {
    data.pushSubscriptions.push(record);
  }
  data.mobileNotificationAccepted = true;
  data.lastUpdate = Date.now();
}

export function getPushSubscriptions(): WebPushSubscriptionRecord[] {
  const data = getServerSyncData();
  return data.pushSubscriptions || [];
}

export function removePushSubscription(endpoint: string): void {
  const data = getServerSyncData();
  if (!data.pushSubscriptions) return;
  data.pushSubscriptions = data.pushSubscriptions.filter((s) => s.endpoint !== endpoint);
  data.lastUpdate = Date.now();
}
