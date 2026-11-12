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

  const updatePersona = (updated: PersonaCore) => {
    setPersonas((prev) => prev.map((p) => (p.personaId === updated.personaId ? updated : p)));
  };

  const updateDistribuidor = (updated: DistribuidorCore) => {
    setDistribuidores((prev) => prev.map((d) => (d.noDist === updated.noDist ? updated : d)));
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
