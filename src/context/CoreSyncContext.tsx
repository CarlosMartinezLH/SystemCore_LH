'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

interface CoreSyncContextType {
  personas: PersonaCore[];
  distribuidores: DistribuidorCore[];
  dispersiones: DispersionSTP[];
  pagos: PagoCore[];
  creditos: CreditoCore[];
  prospects: Prospect[];
  isLoading: boolean;
  refreshSync: () => Promise<void>;
  updatePersona: (updated: PersonaCore) => void;
  updateDistribuidor: (updated: DistribuidorCore) => void;
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
  }) => Promise<any>;
  registrarPago: (payload: {
    noDist: number;
    monto: number;
    medioPago?: 'PAYNET_TIENDAS' | 'STP_SPEI' | 'BANORTE_SUCURSAL' | 'CLUB_PAGO';
    establecimiento?: string;
    referencia?: string;
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

  return (
    <CoreSyncContext.Provider
      value={{
        personas,
        distribuidores,
        dispersiones,
        pagos,
        creditos,
        prospects,
        isLoading,
        refreshSync: fetchSyncData,
        updatePersona,
        updateDistribuidor,
        registrarCanje,
        registrarCliente,
        registrarPago,
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
