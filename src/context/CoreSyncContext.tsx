'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
import { INITIAL_PROSPECTS } from '@/lib/data/initialData';

interface CoreSyncContextType {
  personas: PersonaCore[];
  distribuidores: DistribuidorCore[];
  dispersiones: DispersionSTP[];
  pagos: PagoCore[];
  creditos: CreditoCore[];
  prospects: Prospect[];
  clabesVirtuales: ClabeVirtualSTP[];
  speiInboundPagos: SpeiInboundPago[];
  notifications: MobileNotification[];
  notificationRules: NotificationRuleConfig;
  mobileNotificationAccepted: boolean;
  isLoading: boolean;
  refreshSync: () => Promise<void>;
  updatePersona: (updated: PersonaCore) => void;
  updateDistribuidor: (updated: DistribuidorCore) => void;
  sendNotification: (payload: Partial<MobileNotification>) => Promise<any>;
  updateNotificationRules: (rules: Partial<NotificationRuleConfig>) => Promise<any>;
  markNotificationRead: (id: string) => Promise<any>;
  setMobileNotificationPermission: (accepted: boolean) => Promise<any>;
  registrarCanje: (payload: {
    folio?: string;
    personaId?: number;
    clienteNombre?: string;
    distribuidorId?: number;
    monto: number;
    metodo?: 'PAYNET' | 'STP';
    banco?: string;
    clabe?: string;
    curp?: string;
  }) => Promise<any>;
  registrarCliente: (payload: {
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
    categoria?: import('@/types/core').CategoriaPersona;
    consultaBuroInicial?: boolean;
    folioBuroPrevia?: string;
  }) => Promise<any>;
  registrarPago: (payload: {
    noDist: number;
    monto: number;
    medioPago?: 'PAYNET_TIENDAS' | 'STP_SPEI' | 'BANORTE_SUCURSAL' | 'CLUB_PAGO';
    establecimiento?: string;
    referencia?: string;
  }) => Promise<any>;
  registrarSpeiInbound: (payload: {
    noDist: number;
    montoDepositado: number;
    bancoEmisorId?: string;
    bancoEmisorNombre?: string;
    claveRastreo?: string;
    diaCorte?: string;
    concepto?: string;
  }) => Promise<any>;
  updateProspect: (updated: Prospect) => void;
  pasarProspectoACore: (prospectId: string) => Promise<{
    success: boolean;
    distribuidor?: DistribuidorCore;
    persona?: PersonaCore;
    message: string;
  }>;
}

const CoreSyncContext = createContext<CoreSyncContextType | null>(null);

export function CoreSyncProvider({ children }: { children: React.ReactNode }) {
  const [personas, setPersonas] = useState<PersonaCore[]>(INITIAL_PERSONAS);
  const [distribuidores, setDistribuidores] = useState<DistribuidorCore[]>(INITIAL_DISTRIBUIDORES);
  const [dispersiones, setDispersiones] = useState<DispersionSTP[]>(INITIAL_DISPERSIONES);
  const [pagos, setPagos] = useState<PagoCore[]>(INITIAL_PAGOS);
  const [creditos, setCreditos] = useState<CreditoCore[]>(INITIAL_CREDITOS);
  const [prospects, setProspects] = useState<Prospect[]>(INITIAL_PROSPECTS);
  const [clabesVirtuales, setClabesVirtuales] = useState<ClabeVirtualSTP[]>(INITIAL_CLABES_VIRTUALES);
  const [speiInboundPagos, setSpeiInboundPagos] = useState<SpeiInboundPago[]>(INITIAL_SPEI_INBOUND);
  const [notifications, setNotifications] = useState<MobileNotification[]>(INITIAL_NOTIFICATIONS);
  const [notificationRules, setNotificationRules] = useState<NotificationRuleConfig>(DEFAULT_NOTIFICATION_RULES);
  const [mobileNotificationAccepted, setMobileNotificationAccepted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSyncData = useCallback(async () => {
    try {
      const res = await fetch('/api/sync', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setPersonas(json.data.personas);
          setDistribuidores(json.data.distribuidores);
          setDispersiones(json.data.dispersiones);
          setPagos(json.data.pagos);
          setCreditos(json.data.creditos);
          setProspects(json.data.prospects);
          if (json.data.clabesVirtuales) setClabesVirtuales(json.data.clabesVirtuales);
          if (json.data.speiInboundPagos) setSpeiInboundPagos(json.data.speiInboundPagos);
          if (json.data.notifications) setNotifications(json.data.notifications);
          if (json.data.notificationRules) setNotificationRules(json.data.notificationRules);
          if (json.data.mobileNotificationAccepted !== undefined) {
            setMobileNotificationAccepted(json.data.mobileNotificationAccepted);
          }
        }
      }
    } catch (e) {
      console.warn('Sync fetch warn (offline/local):', e);
    }
  }, []);

  useEffect(() => {
    fetchSyncData();
    // Polling regular para captar cambios hechos desde la app móvil o simulador
    const interval = setInterval(fetchSyncData, 2500);
    const onFocus = () => fetchSyncData();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchSyncData]);

  const updatePersona = async (updated: PersonaCore) => {
    setPersonas((prev) => prev.map((p) => (p.personaId === updated.personaId ? updated : p)));
    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'UPDATE_CLIENTE', payload: updated }),
      });
      await fetchSyncData();
    } catch (e) {
      console.warn('Update persona sync warn:', e);
    }
  };

  const updateDistribuidor = (updated: DistribuidorCore) => {
    setDistribuidores((prev) => prev.map((d) => (d.noDist === updated.noDist ? updated : d)));
  };

  const updateProspect = (updated: Prospect) => {
    setProspects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const pasarProspectoACore = async (prospectId: string) => {
    const prospect = prospects.find((p) => p.id === prospectId);
    if (!prospect) {
      return { success: false, message: 'Prospecto no encontrado en CRM.' };
    }

    if (prospect.coreSincronizado && prospect.coreDistribuidorId) {
      const existingDist = distribuidores.find((d) => d.noDist === prospect.coreDistribuidorId);
      const existingPer = personas.find((p) => p.personaId === prospect.corePersonaId);
      return {
        success: true,
        distribuidor: existingDist,
        persona: existingPer,
        message: `El prospecto ya está enlazado a Core Central como Distribuidora #${prospect.coreDistribuidorId}.`,
      };
    }

    // 1. Asignar nuevo noDist consecutivo y personaId
    const maxNoDist = distribuidores.length > 0
      ? Math.max(...distribuidores.map((d) => d.noDist))
      : 1042;
    const nuevoNoDist = maxNoDist >= 1000 ? maxNoDist + 1 : 1043;

    const maxPersonaId = personas.length > 0
      ? Math.max(...personas.map((p) => p.personaId))
      : 14080;
    const nuevaPersonaId = maxPersonaId + 1;

    const curpVal = (prospect.curp || `${prospect.firstName.slice(0, 2)}${prospect.lastName.slice(0, 2)}850101MCLRN01`).toUpperCase();
    const rfcVal = (prospect.rfc || curpVal.slice(0, 10)).toUpperCase();
    const nombreCompleto = `${prospect.firstName} ${prospect.lastName} ${prospect.secondLastName || ''}`.trim().toUpperCase();

    // 2. Crear Persona en Core
    const direccionFormateada = `${prospect.street || 'CALLE HIDALGO'} ${prospect.extNumber || '100'}, ${prospect.neighborhood || 'CENTRO'}, ${prospect.city || 'Gómez Palacio'}, ${prospect.state || 'Durango'}`.toUpperCase();
    const nuevaPersona: PersonaCore = {
      personaId: nuevaPersonaId,
      nombre: prospect.firstName.toUpperCase(),
      apellidoPaterno: prospect.lastName.toUpperCase(),
      apellidoMaterno: prospect.secondLastName ? prospect.secondLastName.toUpperCase() : '',
      fechaNacimiento: prospect.birthDate || '15/05/1985',
      categoria: 'DV',
      pagareEstatusId: 'FIRMADO EN BLANCO',
      pagareCantidad: 150000,
      curp: curpVal,
      rfc: rfcVal,
      sexoId: prospect.gender === 'MASCULINO' ? 'MASCULINO' : 'FEMENINO',
      buroInternoEstatus: 'NORMAL',
      observaciones: 'Originada y aprobada desde módulo CRM Originación.',
      isDistribuidor: true,
      distribuidorId: nuevoNoDist,
      telefono: prospect.phone || '8711002030',
      direccion: direccionFormateada,
      scoreBuro: prospect.bureauResult === 'BUENO' ? 685 : 630,
      tipoIdentificacion: 'INE',
      numeroIdentificacion: prospect.ineNumber || 'IDMEX1829482910',
    };

    // 3. Crear Distribuidor Oficial en Core
    const lineaAprobada = prospect.creditLines?.valelana || 150000;
    const lineaPersonalAprobada = prospect.creditLines?.personal || 15000;
    const lineaTiendaAprobada = prospect.creditLines?.lanatienda || 20000;

    const hoyStr = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const nuevoDistribuidor: DistribuidorCore = {
      noDist: nuevoNoDist,
      nombreDistribuidor: nombreCompleto,
      sucursal: prospect.city?.toUpperCase() || 'GÓMEZ PALACIO',
      zona: 'ZONA NORTE',
      subzona: 'LAGUNA',
      coordinador: prospect.salesTeam || 'MARIA GUADALUPE AGUILERA',
      promotor: prospect.advisorName || 'SIN PROMOTOR',
      genero: prospect.gender === 'MASCULINO' ? 'MASCULINO' : 'FEMENINO',
      estatus: 'ACTIVO',
      nivel: 'BRONCE',
      personaId: nuevaPersonaId,
      curp: curpVal,
      telefono: prospect.phone || '8711002030',
      creditoLimite: lineaAprobada,
      saldoActual: 0,
      disponible: lineaAprobada,
      lineaPersonal: lineaPersonalAprobada,
      disponiblePersonal: lineaPersonalAprobada,
      lineaLanaTienda: lineaTiendaAprobada,
      disponibleLanaTienda: lineaTiendaAprobada,
      tieneLanaApp: true,
      fechaAlta: hoyStr,
      usuarioValida: 'Mesa de Crédito / CRM',
      fechaValidacion: `${hoyStr} ${new Date().toLocaleTimeString('es-MX')}`,
      direccion: direccionFormateada,
      perfil: prospect.assignedProfile || 'D-AAA',
      valesActivos: 0,
    };

    // 4. Actualizar prospecto en CRM
    const updatedProspect: Prospect = {
      ...prospect,
      stage: 'activacion',
      coreSincronizado: true,
      coreDistribuidorId: nuevoNoDist,
      corePersonaId: nuevaPersonaId,
      fechaPaseCore: new Date().toLocaleString('es-MX'),
      messages: [
        {
          id: `msg-pase-${Date.now()}`,
          author: 'Sistema Core Central',
          authorEmail: 'sistema@core.lanahora.com.mx',
          type: 'sistema',
          content: `✓ Prospecto transferido a Core Central con éxito. Se dio de alta como Distribuidora Oficial No. ${nuevoNoDist} y Persona No. ${nuevaPersonaId} con línea autorizada de $${lineaAprobada.toLocaleString('es-MX')} MXN.`,
          createdAt: new Date().toLocaleString('es-MX'),
        },
        ...prospect.messages,
      ],
      updatedAt: new Date().toISOString(),
    };

    // 5. Aplicar cambios a memoria reactiva
    setPersonas((prev) => [nuevaPersona, ...prev]);
    setDistribuidores((prev) => [nuevoDistribuidor, ...prev]);
    setProspects((prev) => prev.map((p) => (p.id === prospectId ? updatedProspect : p)));

    return {
      success: true,
      distribuidor: nuevoDistribuidor,
      persona: nuevaPersona,
      message: `¡Distribuidora No. ${nuevoNoDist} activada con éxito en Core Central!`,
    };
  };

  const registrarCanje = async (payload: {
    folio?: string;
    personaId?: number;
    clienteNombre?: string;
    distribuidorId?: number;
    monto: number;
    metodo?: 'PAYNET' | 'STP';
    banco?: string;
    clabe?: string;
    curp?: string;
  }) => {
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CANJE_COMPLETED', payload }),
      });
      const data = await res.json();
      await fetchSyncData();
      return data;
    } catch (e) {
      console.error('Error registrando canje:', e);
      throw e;
    }
  };

  const registrarCliente = async (payload: {
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
    categoria?: import('@/types/core').CategoriaPersona;
    consultaBuroInicial?: boolean;
    folioBuroPrevia?: string;
  }) => {
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'NUEVO_CLIENTE', payload }),
      });
      const data = await res.json();
      await fetchSyncData();
      return data;
    } catch (e) {
      console.error('Error registrando cliente:', e);
      throw e;
    }
  };

  const registrarPago = async (payload: {
    noDist: number;
    monto: number;
    medioPago?: 'PAYNET_TIENDAS' | 'STP_SPEI' | 'BANORTE_SUCURSAL' | 'CLUB_PAGO';
    establecimiento?: string;
    referencia?: string;
  }) => {
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REGISTRAR_PAGO', payload }),
      });
      const data = await res.json();
      await fetchSyncData();
      return data;
    } catch (e) {
      console.error('Error registrando pago:', e);
      throw e;
    }
  };

  const sendNotification = async (payload: Partial<MobileNotification>) => {
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SEND_NOTIFICATION', payload }),
      });
      const data = await res.json();
      await fetchSyncData();
      return data;
    } catch (e) {
      console.error('Error enviando notificación:', e);
      throw e;
    }
  };

  const updateNotificationRules = async (rules: Partial<NotificationRuleConfig>) => {
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'UPDATE_NOTIFICATION_RULES', payload: rules }),
      });
      const data = await res.json();
      await fetchSyncData();
      return data;
    } catch (e) {
      console.error('Error actualizando reglas de notificación:', e);
      throw e;
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'MARK_NOTIFICATION_READ', payload: { id } }),
      });
      const data = await res.json();
      await fetchSyncData();
      return data;
    } catch (e) {
      console.error('Error marcando notificación como leída:', e);
      throw e;
    }
  };

  const setMobileNotificationPermission = async (accepted: boolean) => {
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SET_MOBILE_NOTIFICATION_PERMISSION', payload: { accepted } }),
      });
      const data = await res.json();
      await fetchSyncData();
      return data;
    } catch (e) {
      console.error('Error actualizando permiso de notificaciones:', e);
      throw e;
    }
  };

  const registrarSpeiInbound = async (payload: {
    noDist: number;
    montoDepositado: number;
    bancoEmisorId?: string;
    bancoEmisorNombre?: string;
    claveRastreo?: string;
    diaCorte?: string;
    concepto?: string;
  }) => {
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REGISTRAR_SPEI_INBOUND', payload }),
      });
      const data = await res.json();
      await fetchSyncData();
      return data;
    } catch (e) {
      console.error('Error registrando pago SPEI inbound:', e);
      throw e;
    }
  };

  return (
    <CoreSyncContext.Provider
      value={{
        personas,
        distribuidores,
        dispersiones,
        pagos,
        creditos,
        prospects,
        clabesVirtuales,
        speiInboundPagos,
        notifications,
        notificationRules,
        mobileNotificationAccepted,
        isLoading,
        refreshSync: fetchSyncData,
        updatePersona,
        updateDistribuidor,
        sendNotification,
        updateNotificationRules,
        markNotificationRead,
        setMobileNotificationPermission,
        registrarCanje,
        registrarCliente,
        registrarPago,
        registrarSpeiInbound,
        updateProspect,
        pasarProspectoACore,
      }}
    >
      {children}
    </CoreSyncContext.Provider>
  );
}

export function useCoreSync() {
  const context = useContext(CoreSyncContext);
  if (!context) {
    throw new Error('useCoreSync debe usarse dentro de un CoreSyncProvider');
  }
  return context;
}
