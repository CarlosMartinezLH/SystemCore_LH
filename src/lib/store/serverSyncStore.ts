import { PersonaCore, DistribuidorCore, DispersionSTP, PagoCore, CreditoCore } from '@/types/core';
import { Prospect } from '@/types/crm';
import {
  INITIAL_PERSONAS,
  INITIAL_DISTRIBUIDORES,
  INITIAL_DISPERSIONES,
  INITIAL_PAGOS,
  INITIAL_CREDITOS,
} from '@/lib/data/coreData';
import { INITIAL_PROSPECTS } from '@/lib/data/initialData';

export interface CoreSyncData {
  personas: PersonaCore[];
  distribuidores: DistribuidorCore[];
  dispersiones: DispersionSTP[];
  pagos: PagoCore[];
  creditos: CreditoCore[];
  prospects: Prospect[];
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
      lastUpdate: Date.now(),
    };
  }
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

  data.lastUpdate = Date.now();
  return { nuevaDispersion, nuevoCredito };
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
    pagareEstatusId: 'NO DEFINIDO',
    pagareCantidad: 0.0,
    curp: curpUpper,
    rfc: payload.rfc ? payload.rfc.toUpperCase() : curpUpper.slice(0, 10),
    sexoId: payload.sexoId || 'FEMENINO',
    buroInternoEstatus: 'NORMAL',
    observaciones: 'Cliente registrado vía LanApp / Core',
    isDistribuidor: false,
    telefono: payload.telefono || '8441002030',
    direccion: payload.direccion || 'SALTILLO, COAHUILA',
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

  data.creditos = [nuevoCredito, ...data.creditos];

  // 2. Crear inmediatamente la orden de dispersión SPEI (STP) en el módulo Dispersión & Pagos
  const folioSTP = `STP-${Date.now().toString().slice(-6)}`;
  const fechaHoy = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const claveRastreo = `STP844${fechaHoy}${Math.floor(1000 + Math.random() * 9000)}`;

  // Buscar persona asociada para obtener CURP
  const pers = data.personas.find(
    (p) =>
      (payload.clienteId && p.personaId.toString() === payload.clienteId.toString()) ||
      p.nombre.toLowerCase().includes(payload.clienteNombre.toLowerCase().split(' ')[0])
  );

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
