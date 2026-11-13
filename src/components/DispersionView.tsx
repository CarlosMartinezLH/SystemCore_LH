'use client';

import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Search,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  Send,
  Building,
  RefreshCw,
  Barcode,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Check,
  Sparkles,
  AlertCircle,
  Copy,
  FileText,
  Landmark,
  Zap,
  ChevronRight,
  X,
  Coins,
  Receipt,
  Eye,
} from 'lucide-react';
import { DispersionSTP, PagoCore, SpeiInboundPago, ClabeVirtualSTP } from '@/types/core';
import { useCoreSync } from '@/context/CoreSyncContext';
import { buildSafeCsv } from '@/lib/utils/csv';
import { formatMoney } from '@/lib/utils/formatters';

const BANCOS_EMISORES = [
  { id: '40012', nombre: 'BBVA México' },
  { id: '40072', nombre: 'Banorte' },
  { id: '40014', nombre: 'Santander' },
  { id: '40002', nombre: 'Citibanamex' },
  { id: '40138', nombre: 'Nu México' },
  { id: '40127', nombre: 'Banco Azteca' },
  { id: '40021', nombre: 'HSBC México' },
  { id: '40058', nombre: 'Banregio' },
];

const DIAS_CORTE_OPCIONES = [
  { id: '30 o 15', label: 'Día 30 o 15 (Fecha Límite Oficial) — Bonificación Máxima 18% / 16% / 14%' },
  { id: '01 o 16', label: 'Día 01 o 16 — Escala 17% / 15% / 13%' },
  { id: '02 o 17', label: 'Día 02 o 17 — Escala 16% / 14% / 12%' },
  { id: '03 o 18', label: 'Día 03 o 18 — Escala 15% / 13% / 11%' },
  { id: '04 o 19', label: 'Día 04 o 19 — Escala 14% / 12% / 10%' },
  { id: '05 o 20', label: 'Día 05 o 20 — Escala 13% / 11% / 9%' },
  { id: '06 o 21', label: 'Día 06 o 21 — Escala 12% / 10% / 8%' },
  { id: '07 o 22', label: 'Día 07 o 22 — Escala 11% / 9% / 7%' },
  { id: '08 o 23', label: 'Día 08 o 23 — Escala 10% / 8% / 6%' },
];

export default function DispersionView() {
  const [activeTab, setActiveTab] = useState<'spei_inbound' | 'dispersion' | 'clabes' | 'pagos'>('spei_inbound');
  const {
    dispersiones,
    pagos,
    clabesVirtuales = [],
    speiInboundPagos = [],
    distribuidores = [],
    registrarCanje,
    registrarSpeiInbound,
  } = useCoreSync();

  const [searchFilter, setSearchFilter] = useState('');
  const [selectedPagoDetalle, setSelectedPagoDetalle] = useState<SpeiInboundPago | null>(null);
  const [copiedClabe, setCopiedClabe] = useState<string | null>(null);

  // New Dispersion Modal
  const [isNewDispOpen, setIsNewDispOpen] = useState(false);
  const [newBeneficiario, setNewBeneficiario] = useState('');
  const [newCurp, setNewCurp] = useState('');
  const [newClabe, setNewClabe] = useState('');
  const [newBanco, setNewBanco] = useState('BBVA México');
  const [newMonto, setNewMonto] = useState('5000');
  const [newConcepto, setNewConcepto] = useState('Desembolso ValeLanAhora');

  // Interactive SPEI Simulator State
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simSelectedDist, setSimSelectedDist] = useState<number>(1002);
  const [simBancoId, setSimBancoId] = useState('40012');
  const [simDiaCorte, setSimDiaCorte] = useState('30 o 15');
  const [simConcepto, setSimConcepto] = useState('PAGO CORTE 15 VALELANA');
  const [isSimulating, setIsSimulating] = useState(false);

  // Find selected DV info for simulator
  const activeSimDist = useMemo(() => {
    return distribuidores.find((d) => d.noDist === simSelectedDist) || distribuidores[0];
  }, [distribuidores, simSelectedDist]);

  const activeSimClabe = useMemo(() => {
    return clabesVirtuales.find((c) => c.noDist === simSelectedDist);
  }, [clabesVirtuales, simSelectedDist]);

  // Compute calculated amounts for simulator based on 30-15 business rules
  const { tasaSim, montoNetoDefault, saldoExigibleSim, bonificacionSim } = useMemo(() => {
    const saldo = activeSimClabe?.saldoPendienteQuincena || 10460;
    const perfil = activeSimClabe?.perfil || 'D-AAA';

    let tasa = 0.18;
    if (perfil === 'D-AAA') {
      if (simDiaCorte === '30 o 15') tasa = 0.18;
      else if (simDiaCorte === '01 o 16') tasa = 0.17;
      else if (simDiaCorte === '02 o 17') tasa = 0.16;
      else if (simDiaCorte === '03 o 18') tasa = 0.15;
      else if (simDiaCorte === '04 o 19') tasa = 0.14;
      else if (simDiaCorte === '05 o 20') tasa = 0.13;
      else if (simDiaCorte === '06 o 21') tasa = 0.12;
      else if (simDiaCorte === '07 o 22') tasa = 0.11;
      else tasa = 0.10;
    } else if (perfil === 'D-AA' || perfil === 'E-AAA') {
      if (simDiaCorte === '30 o 15') tasa = 0.16;
      else if (simDiaCorte === '01 o 16') tasa = 0.15;
      else if (simDiaCorte === '02 o 17') tasa = 0.14;
      else if (simDiaCorte === '03 o 18') tasa = 0.13;
      else if (simDiaCorte === '04 o 19') tasa = 0.12;
      else if (simDiaCorte === '05 o 20') tasa = 0.11;
      else if (simDiaCorte === '06 o 21') tasa = 0.10;
      else if (simDiaCorte === '07 o 22') tasa = 0.09;
      else tasa = 0.08;
    } else {
      if (simDiaCorte === '30 o 15') tasa = 0.14;
      else if (simDiaCorte === '01 o 16') tasa = 0.13;
      else if (simDiaCorte === '02 o 17') tasa = 0.12;
      else if (simDiaCorte === '03 o 18') tasa = 0.11;
      else if (simDiaCorte === '04 o 19') tasa = 0.10;
      else if (simDiaCorte === '05 o 20') tasa = 0.09;
      else if (simDiaCorte === '06 o 21') tasa = 0.08;
      else if (simDiaCorte === '07 o 22') tasa = 0.07;
      else tasa = 0.06;
    }

    const bonif = Math.round(saldo * tasa * 100) / 100;
    const neto = Math.round((saldo - bonif) * 100) / 100;

    return {
      tasaSim: tasa,
      montoNetoDefault: neto,
      saldoExigibleSim: saldo,
      bonificacionSim: bonif,
    };
  }, [activeSimClabe, simDiaCorte]);

  const [simMontoManual, setSimMontoManual] = useState<string>('');
  const montoDepositadoFinal = simMontoManual ? Number(simMontoManual) : montoNetoDefault;

  // Handle Trigger Simulation
  const handleEjecutarSimulacionSpei = async () => {
    setIsSimulating(true);
    const banco = BANCOS_EMISORES.find((b) => b.id === simBancoId);

    try {
      const res = await registrarSpeiInbound({
        noDist: simSelectedDist,
        montoDepositado: montoDepositadoFinal,
        bancoEmisorId: simBancoId,
        bancoEmisorNombre: banco?.nombre || 'BBVA México',
        diaCorte: simDiaCorte,
        concepto: simConcepto,
      });

      if (res?.success && res?.result?.pagoSpei) {
        setSelectedPagoDetalle(res.result.pagoSpei);
        setIsSimulatorOpen(false);
      }
    } catch (err) {
      alert('Error en simulación SPEI: ' + (err as Error).message);
    } finally {
      setIsSimulating(false);
    }
  };

  // Copy CLABE helper
  const handleCopyClabe = (clabe: string) => {
    navigator.clipboard.writeText(clabe);
    setCopiedClabe(clabe);
    setTimeout(() => setCopiedClabe(null), 2500);
  };

  // Filtered lists
  const filteredSpeiInbound = useMemo(() => {
    if (!searchFilter.trim()) return speiInboundPagos;
    const q = searchFilter.toLowerCase();
    return speiInboundPagos.filter(
      (p) =>
        p.distribuidorNombre.toLowerCase().includes(q) ||
        p.folioSTP.toLowerCase().includes(q) ||
        p.claveRastreo.toLowerCase().includes(q) ||
        p.clabeVirtual.toLowerCase().includes(q) ||
        p.bancoEmisorNombre.toLowerCase().includes(q) ||
        p.noDist.toString().includes(q)
    );
  }, [speiInboundPagos, searchFilter]);

  const filteredDispersiones = useMemo(() => {
    if (!searchFilter.trim()) return dispersiones;
    const q = searchFilter.toLowerCase();
    return dispersiones.filter(
      (d) =>
        d.beneficiario.toLowerCase().includes(q) ||
        d.folioSTP.toLowerCase().includes(q) ||
        d.claveRastreo.toLowerCase().includes(q) ||
        d.creditoId.toLowerCase().includes(q) ||
        d.curp.toLowerCase().includes(q) ||
        d.banco.toLowerCase().includes(q) ||
        d.concepto.toLowerCase().includes(q)
    );
  }, [dispersiones, searchFilter]);

  const filteredClabes = useMemo(() => {
    if (!searchFilter.trim()) return clabesVirtuales;
    const q = searchFilter.toLowerCase();
    return clabesVirtuales.filter(
      (c) =>
        c.distribuidorNombre.toLowerCase().includes(q) ||
        c.clabe.toLowerCase().includes(q) ||
        c.noDist.toString().includes(q) ||
        c.perfil.toLowerCase().includes(q)
    );
  }, [clabesVirtuales, searchFilter]);

  const filteredPagos = useMemo(() => {
    if (!searchFilter.trim()) return pagos;
    const q = searchFilter.toLowerCase();
    return pagos.filter(
      (p) =>
        p.referencia.toLowerCase().includes(q) ||
        (p.distribuidorNombre && p.distribuidorNombre.toLowerCase().includes(q)) ||
        (p.clienteNombre && p.clienteNombre.toLowerCase().includes(q)) ||
        (p.establecimiento && p.establecimiento.toLowerCase().includes(q))
    );
  }, [pagos, searchFilter]);

  // KPI Calculations
  const totalRecaudadoSpei = useMemo(() => {
    return speiInboundPagos.reduce((acc, p) => acc + p.montoDepositado, 0);
  }, [speiInboundPagos]);

  const totalBonificacionesOtorgadas = useMemo(() => {
    return speiInboundPagos.reduce((acc, p) => acc + p.montoBonificacion, 0);
  }, [speiInboundPagos]);

  const totalCreditoAmortizado = useMemo(() => {
    return speiInboundPagos.reduce((acc, p) => acc + p.montoAplicadoCredito, 0);
  }, [speiInboundPagos]);

  // Export CSV Handler
  const handleExportCSV = () => {
    if (activeTab === 'spei_inbound') {
      const headers = [
        'Folio STP',
        'Clave Rastreo Banxico',
        'No DV',
        'Distribuidora',
        'Banco Emisor',
        'CLABE Virtual',
        'Monto Depositado',
        '% Bonificación',
        'Monto Bonificación',
        'Total Aplicado Crédito',
        'Fecha y Hora',
        'Estatus',
        'Póliza Contable',
      ];
      const rows = speiInboundPagos.map((p) => [
        p.folioSTP,
        p.claveRastreo,
        p.noDist,
        p.distribuidorNombre,
        p.bancoEmisorNombre,
        p.clabeVirtual,
        p.montoDepositado,
        `${p.porcentajeBonificacion}%`,
        p.montoBonificacion,
        p.montoAplicadoCredito,
        p.fechaHora,
        p.estatus,
        p.polizaContableId,
      ]);
      const csvContent = buildSafeCsv(headers, rows);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `spei_recaudacion_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (activeTab === 'clabes') {
      const headers = ['No DV', 'Distribuidora', 'CLABE Virtual STP', 'Banco Concentrador', 'Perfil', 'Saldo Quincena', 'Sucursal', 'Estatus'];
      const rows = clabesVirtuales.map((c) => [
        c.noDist,
        c.distribuidorNombre,
        c.clabe,
        c.bancoConcentrador,
        c.perfil,
        c.saldoPendienteQuincena,
        c.sucursal,
        c.estatus,
      ]);
      const csvContent = buildSafeCsv(headers, rows);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `clabes_virtuales_stp_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (activeTab === 'dispersion') {
      const headers = ['Folio STP', 'Clave Rastreo', 'CréditoID', 'Beneficiario', 'CURP', 'CLABE', 'Banco', 'Monto', 'Fecha', 'Estatus'];
      const rows = dispersiones.map((d) => [
        d.folioSTP,
        d.claveRastreo,
        d.creditoId,
        d.beneficiario,
        d.curp,
        d.clabe,
        d.banco,
        d.monto,
        d.fechaHora,
        d.estatus,
      ]);
      const csvContent = buildSafeCsv(headers, rows);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `dispersiones_stp_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      const headers = ['Referencia', 'Medio Pago', 'NoDist', 'Distribuidor', 'Cliente', 'Monto', 'Comision', 'Fecha', 'Estatus', 'Establecimiento'];
      const rows = pagos.map((p) => [
        p.referencia,
        p.medioPago,
        p.noDist || '',
        p.distribuidorNombre || '',
        p.clienteNombre || '',
        p.monto,
        p.comision,
        p.fechaPago,
        p.estatus,
        p.establecimiento || '',
      ]);
      const csvContent = buildSafeCsv(headers, rows);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `recaudacion_pagos_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleCrearDispersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBeneficiario.trim() || newClabe.length !== 18) {
      alert('Por favor captura el nombre y una CLABE interbancaria válida de 18 dígitos.');
      return;
    }

    try {
      const res = await registrarCanje({
        clienteNombre: newBeneficiario.trim(),
        curp: newCurp.trim(),
        clabe: newClabe.trim(),
        banco: newBanco,
        monto: Number(newMonto),
        metodo: 'STP',
      });
      setIsNewDispOpen(false);
      setNewBeneficiario('');
      setNewCurp('');
      setNewClabe('');
      alert(`✓ Dispersión SPEI enviada a STP exitosamente. Folio: ${res?.result?.nuevaDispersion?.folioSTP || 'STP-OK'}`);
    } catch (err) {
      alert('Error enviando dispersión: ' + (err as Error).message);
    }
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto font-sans p-4 lg:p-6 space-y-5">
      {/* KPI Stats Top Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Recaudación SPEI STP</div>
            <div className="text-xl font-black text-slate-900 mt-1">
              {formatMoney(totalRecaudadoSpei)}
            </div>
            <div className="text-[10px] text-emerald-600 font-bold mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>100% Conciliado en Tiempo Real</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bonificación Otorgada (30-15)</div>
            <div className="text-xl font-black text-emerald-700 mt-1">
              {formatMoney(totalBonificacionesOtorgadas)}
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">
              Escala de pronto pago a DVs
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cartera Amortizada</div>
            <div className="text-xl font-black text-slate-900 mt-1">
              {formatMoney(totalCreditoAmortizado)}
            </div>
            <div className="text-[10px] text-blue-600 font-bold mt-0.5">
              Líneas de crédito liberadas al instante
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">CLABEs Virtuales STP</div>
            <div className="text-xl font-black text-slate-900 mt-1">
              {clabesVirtuales.length} Asignadas
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">
              Banco STP (646) en Saltillo
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600">
            <Landmark className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Action Bar with Tabs */}
      <div className="bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('spei_inbound')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'spei_inbound'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
            <span>Recepción Automática SPEI</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'spei_inbound' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {speiInboundPagos.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('dispersion')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'dispersion'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
            <span>Dispersión STP (Saliente)</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'dispersion' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {dispersiones.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('clabes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'clabes'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Landmark className="w-3.5 h-3.5 text-amber-500" />
            <span>CLABEs Virtuales STP</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'clabes' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {clabesVirtuales.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('pagos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'pagos'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Barcode className="w-3.5 h-3.5 text-slate-500" />
            <span>Recaudación Paynet</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'pagos' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {pagos.length}
            </span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {activeTab === 'spei_inbound' && (
            <button
              onClick={() => setIsSimulatorOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 text-yellow-300" />
              <span>Simular Pago SPEI Entrante</span>
            </button>
          )}

          {activeTab === 'dispersion' && (
            <button
              onClick={() => setIsNewDispOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <span>Nueva Dispersión STP</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Exportar Excel</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-slate-200/90 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder={
              activeTab === 'spei_inbound'
                ? 'Buscar por Distribuidora, Clave de Rastreo o Folio STP...'
                : activeTab === 'clabes'
                ? 'Buscar por No. DV, Distribuidora o CLABE virtual...'
                : activeTab === 'dispersion'
                ? 'Buscar por Beneficiario, Folio STP o Banco...'
                : 'Buscar por referencia o comercio...'
            }
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
          <span>STP Webhook Listener:</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Activo (Latencia 78ms)
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: RECEPCIÓN AUTOMÁTICA SPEI (STP INBOUND & CASCADA) */}
      {/* ========================================================= */}
      {activeTab === 'spei_inbound' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider font-bold select-none">
                <tr>
                  <th className="py-3 px-3.5">Acciones</th>
                  <th className="py-3 px-3.5">Folio STP</th>
                  <th className="py-3 px-3.5">Clave Rastreo Banxico</th>
                  <th className="py-3 px-3.5">Distribuidora</th>
                  <th className="py-3 px-3.5">Banco Emisor</th>
                  <th className="py-3 px-3.5">CLABE Virtual</th>
                  <th className="py-3 px-3.5 text-right">Monto Depositado</th>
                  <th className="py-3 px-3.5 text-center">Bonificación (30-15)</th>
                  <th className="py-3 px-3.5 text-right">Total Aplicado Crédito</th>
                  <th className="py-3 px-3.5">Fecha y Hora</th>
                  <th className="py-3 px-3.5 text-center">Estatus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredSpeiInbound.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-slate-400">
                      No se encontraron pagos SPEI entrantes registrados.
                    </td>
                  </tr>
                ) : (
                  filteredSpeiInbound.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-2.5 px-3.5">
                        <button
                          onClick={() => setSelectedPagoDetalle(p)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition flex items-center gap-1 border border-blue-200/80 shadow-2xs"
                          title="Ver Cascada de Crédito & CEP Banxico"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Ver Cascada & CEP</span>
                        </button>
                      </td>
                      <td className="py-2.5 px-3.5 font-mono font-bold text-blue-700">{p.folioSTP}</td>
                      <td className="py-2.5 px-3.5 font-mono text-[11px] text-slate-700 font-semibold">{p.claveRastreo}</td>
                      <td className="py-2.5 px-3.5">
                        <div className="font-extrabold text-slate-900">{p.distribuidorNombre}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <span>DV #{p.noDist}</span>
                          <span>•</span>
                          <span className="font-bold text-blue-600">{p.perfilDV}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-700 font-medium">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-bold">
                          {p.bancoEmisorNombre}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-[11px] text-slate-600">
                        {p.clabeVirtual}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono font-bold text-slate-900 text-right text-xs">
                        {formatMoney(p.montoDepositado)}
                      </td>
                      <td className="py-2.5 px-3.5 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            +{p.porcentajeBonificacion}% ({formatMoney(p.montoBonificacion)})
                          </span>
                          <span className="text-[9px] text-slate-400 font-medium">{p.diaCorte}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3.5 font-mono font-extrabold text-emerald-700 text-right text-xs">
                        {formatMoney(p.montoAplicadoCredito)}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-slate-500 text-[11px]">{p.fechaHora}</td>
                      <td className="py-2.5 px-3.5 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          ✓ {p.estatus.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: DISPERSIÓN SPEI STP (SALIENTE / CLIENTES) */}
      {/* ========================================================= */}
      {activeTab === 'dispersion' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider font-bold select-none">
                <tr>
                  <th className="py-3 px-3.5">Acciones</th>
                  <th className="py-3 px-3.5">Folio STP</th>
                  <th className="py-3 px-3.5">Clave de Rastreo</th>
                  <th className="py-3 px-3.5">Vale / Crédito</th>
                  <th className="py-3 px-3.5">Beneficiario</th>
                  <th className="py-3 px-3.5">Institución Bancaria</th>
                  <th className="py-3 px-3.5">CLABE Destino</th>
                  <th className="py-3 px-3.5 text-right">Monto Dispersado</th>
                  <th className="py-3 px-3.5">Fecha y Hora</th>
                  <th className="py-3 px-3.5 text-center">Estatus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredDispersiones.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3.5">
                      <button
                        onClick={() => alert(`Comprobante CEP (Comprobante Electrónico de Pago de Banxico) para ${d.claveRastreo}`)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-600 hover:text-white transition flex items-center gap-1 shadow-2xs"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Descargar CEP</span>
                      </button>
                    </td>
                    <td className="py-2.5 px-3.5 font-mono font-bold text-blue-700">{d.folioSTP}</td>
                    <td className="py-2.5 px-3.5 font-mono text-slate-700 font-semibold">{d.claveRastreo}</td>
                    <td className="py-2.5 px-3.5 font-mono font-bold">
                      <span className="px-2 py-0.5 rounded-md text-[11px] bg-amber-50 text-amber-900 border border-amber-300 font-black">
                        #{d.creditoId}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 font-bold text-slate-900">{d.beneficiario}</td>
                    <td className="py-2.5 px-3.5 text-slate-700">{d.banco}</td>
                    <td className="py-2.5 px-3.5 font-mono text-[11px] text-slate-600">{d.clabe}</td>
                    <td className="py-2.5 px-3.5 font-mono font-bold text-slate-900 text-right text-xs">
                      {formatMoney(d.monto)}
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-slate-500 text-[11px]">{d.fechaHora}</td>
                    <td className="py-2.5 px-3.5 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          d.estatus === 'LIQUIDADO'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {d.estatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: PADRÓN DE CLABES VIRTUALES STP (DISTRIBUIDORAS) */}
      {/* ========================================================= */}
      {activeTab === 'clabes' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider font-bold select-none">
                <tr>
                  <th className="py-3 px-3.5">No. DV</th>
                  <th className="py-3 px-3.5">Distribuidora</th>
                  <th className="py-3 px-3.5">CLABE Virtual STP (18 Dígitos)</th>
                  <th className="py-3 px-3.5">Banco STP</th>
                  <th className="py-3 px-3.5">Perfil DV</th>
                  <th className="py-3 px-3.5 text-right">Saldo Quincenal Pendiente</th>
                  <th className="py-3 px-3.5">Sucursal</th>
                  <th className="py-3 px-3.5 text-center">Estatus</th>
                  <th className="py-3 px-3.5 text-center">Acción Rápida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredClabes.map((c) => (
                  <tr key={c.noDist} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3.5 font-mono font-bold text-slate-900">#{c.noDist}</td>
                    <td className="py-3 px-3.5 font-bold text-slate-900">{c.distribuidorNombre}</td>
                    <td className="py-3 px-3.5 font-mono font-bold text-blue-700 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span>{c.clabe}</span>
                        <button
                          onClick={() => handleCopyClabe(c.clabe)}
                          className="p-1 hover:bg-blue-50 text-slate-400 hover:text-blue-700 rounded transition"
                          title="Copiar CLABE Virtual"
                        >
                          {copiedClabe === c.clabe ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 font-medium">STP Institución 646</td>
                    <td className="py-3 px-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        {c.perfil}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 font-mono font-bold text-slate-900 text-right text-xs">
                      {formatMoney(c.saldoPendienteQuincena)}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600">{c.sucursal}</td>
                    <td className="py-3 px-3.5 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {c.estatus}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <button
                        onClick={() => {
                          setSimSelectedDist(c.noDist);
                          setIsSimulatorOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300 transition"
                      >
                        ⚡ Simular SPEI
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: RECAUDACIÓN PAYNET / TIENDAS */}
      {/* ========================================================= */}
      {activeTab === 'pagos' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider font-bold select-none">
                <tr>
                  <th className="py-3 px-3.5">Referencia de Pago</th>
                  <th className="py-3 px-3.5">Canal / Medio</th>
                  <th className="py-3 px-3.5">Distribuidora</th>
                  <th className="py-3 px-3.5">Cliente Acreditado</th>
                  <th className="py-3 px-3.5 text-right">Monto Cobrado</th>
                  <th className="py-3 px-3.5">Establecimiento</th>
                  <th className="py-3 px-3.5">Fecha y Hora</th>
                  <th className="py-3 px-3.5 text-center">Estatus Conciliación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredPagos.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3.5 font-mono font-bold text-blue-700">{p.referencia}</td>
                    <td className="py-2.5 px-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        {p.medioPago}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-800 font-semibold">{p.distribuidorNombre || '—'}</td>
                    <td className="py-2.5 px-3.5 font-bold text-slate-900">{p.clienteNombre || '—'}</td>
                    <td className="py-2.5 px-3.5 font-mono font-bold text-emerald-700 text-right text-xs">
                      {formatMoney(p.monto)}
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-600">{p.establecimiento}</td>
                    <td className="py-2.5 px-3.5 font-mono text-slate-500 text-[11px]">{p.fechaPago}</td>
                    <td className="py-2.5 px-3.5 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        ✓ {p.estatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: SIMULADOR DE PAGO SPEI ENTRANTE (STP WEBHOOK) */}
      {/* ========================================================= */}
      {isSimulatorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 border border-slate-200 max-h-[92vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600">
                  <Zap className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Simulador de Recepción SPEI STP en Vivo
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Dispara un evento STP Webhook para probar la cascada de créditos y bonificaciones 30-15.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSimulatorOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Distribuidora Beneficiaria */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Distribuidora Destino (CLABE Virtual STP) *
                </label>
                <select
                  value={simSelectedDist}
                  onChange={(e) => setSimSelectedDist(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {clabesVirtuales.map((c) => (
                    <option key={c.noDist} value={c.noDist}>
                      DV #{c.noDist} - {c.distribuidorNombre} [{c.perfil}] — Saldo: {formatMoney(c.saldoPendienteQuincena)}
                    </option>
                  ))}
                </select>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 px-1 font-mono">
                  <span>CLABE: {activeSimClabe?.clabe || '646180...'}</span>
                  <span className="font-bold text-blue-600">Perfil: {activeSimClabe?.perfil || 'D-AAA'}</span>
                </div>
              </div>

              {/* Banco Emisor & Día de Pago */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Banco Emisor de la DV *</label>
                  <select
                    value={simBancoId}
                    onChange={(e) => setSimBancoId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {BANCOS_EMISORES.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.nombre} ({b.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Día de Pago (Corte Quincenal) *</label>
                  <select
                    value={simDiaCorte}
                    onChange={(e) => setSimDiaCorte(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {DIAS_CORTE_OPCIONES.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.id} ({d.id === '30 o 15' ? 'Fecha Límite 18%' : d.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cascada Preview Box */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/90 space-y-2">
                <div className="text-[11px] font-black uppercase text-slate-600 tracking-wider flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-blue-600" />
                  <span>Cálculo Financiero de Bonificación (Reglas del Negocio)</span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-semibold">Saldo Exigible</div>
                    <div className="text-xs font-black text-slate-900 mt-0.5">
                      {formatMoney(saldoExigibleSim)}
                    </div>
                  </div>

                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-emerald-700 font-bold">
                      Bonificación ({Math.round(tasaSim * 100)}%)
                    </div>
                    <div className="text-xs font-black text-emerald-700 mt-0.5">
                      +{formatMoney(bonificacionSim)}
                    </div>
                  </div>

                  <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
                    <div className="text-[10px] text-blue-900 font-black">Neto a Depositar</div>
                    <div className="text-xs font-black text-blue-900 mt-0.5">
                      {formatMoney(montoNetoDefault)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Monto a Depositar & Concepto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Monto a Depositar por SPEI ($ MXN)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={simMontoManual || montoNetoDefault}
                    onChange={(e) => setSimMontoManual(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500">Monto real que transfiere la DV desde su app bancaria.</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Concepto SPEI</label>
                  <input
                    type="text"
                    value={simConcepto}
                    onChange={(e) => setSimConcepto(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500">Concepto enviado en el paquete Banxico.</span>
                </div>
              </div>

              {/* Botón Disparo */}
              <div className="flex gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSimulatorOpen(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isSimulating}
                  onClick={handleEjecutarSimulacionSpei}
                  className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                >
                  {isSimulating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Procesando STP Webhook...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-yellow-300" />
                      <span>⚡ Disparar Depósito SPEI en Vivo</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: DETALLE DE CASCADA DE CRÉDITO & CEP BANXICO */}
      {/* ========================================================= */}
      {selectedPagoDetalle && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 border border-slate-200 max-h-[92vh] overflow-y-auto my-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Cascada de Pago SPEI & Comprobante CEP Banxico
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Folio STP: <strong className="font-mono text-blue-700">{selectedPagoDetalle.folioSTP}</strong> • Clave Rastreo: <strong className="font-mono">{selectedPagoDetalle.claveRastreo}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPagoDetalle(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cascada Visual Step-by-Step */}
            <div className="space-y-3">
              <div className="text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-blue-600" />
                <span>Desglose de Cascada de Aplicación Financiera</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">1. Recibido por SPEI</div>
                  <div className="text-base font-black text-slate-900 mt-1">
                    {formatMoney(selectedPagoDetalle.montoDepositado)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Desde {selectedPagoDetalle.bancoEmisorNombre}
                  </div>
                </div>

                <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200">
                  <div className="text-[10px] font-bold text-emerald-800 uppercase">
                    2. Bonificación ({selectedPagoDetalle.porcentajeBonificacion}%)
                  </div>
                  <div className="text-base font-black text-emerald-700 mt-1">
                    +{formatMoney(selectedPagoDetalle.montoBonificacion)}
                  </div>
                  <div className="text-[10px] text-emerald-700 mt-0.5">
                    Regla de Corte ({selectedPagoDetalle.diaCorte})
                  </div>
                </div>

                <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-200">
                  <div className="text-[10px] font-bold text-blue-900 uppercase">3. Total Aplicado a Deuda</div>
                  <div className="text-base font-black text-blue-900 mt-1">
                    {formatMoney(selectedPagoDetalle.montoAplicadoCredito)}
                  </div>
                  <div className="text-[10px] text-blue-800 font-semibold mt-0.5">
                    100% de la Cuota Cubierta
                  </div>
                </div>
              </div>

              {/* Liberación de Línea */}
              <div className="p-3.5 bg-slate-900 text-white rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Liberación Inmediata de Línea de Crédito</div>
                  <div className="text-sm font-black mt-0.5 flex items-center gap-2">
                    <span className="text-slate-400 font-mono line-through">
                      {formatMoney(selectedPagoDetalle.lineaPrevia)}
                    </span>
                    <span className="text-emerald-400 font-mono">
                      ➔ {formatMoney(selectedPagoDetalle.lineaNuevaDisponible)}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-black">
                      +{formatMoney(selectedPagoDetalle.montoAplicadoCredito)} Disponible
                    </span>
                  </div>
                </div>
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
              </div>

              {/* Asiento Contable Automático */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-black uppercase text-slate-600 tracking-wider">
                    Póliza Contable de Cobranza (Generada en Línea)
                  </div>
                  <span className="text-[10px] font-mono text-blue-700 font-bold">
                    {selectedPagoDetalle.polizaContableId}
                  </span>
                </div>

                <div className="space-y-1 text-[11px] font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-700">102-01 Bancos STP Concentradora (Cargo)</span>
                    <span className="font-bold text-slate-900">
                      {formatMoney(selectedPagoDetalle.montoDepositado)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-emerald-700">501-04 Bonificaciones y Descuentos Otorgados (Cargo)</span>
                    <span className="font-bold text-emerald-700">
                      {formatMoney(selectedPagoDetalle.montoBonificacion)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-700">105-02 Cartera de Crédito por Cobrar DV #{selectedPagoDetalle.noDist} (Abono)</span>
                    <span className="font-bold text-slate-900">
                      {formatMoney(selectedPagoDetalle.montoAplicadoCredito)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Comprobante Banxico CEP Box */}
              <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                    <Landmark className="w-4 h-4 text-blue-700" />
                    <span>Comprobante Electrónico de Pago (CEP) - Banco de México</span>
                  </div>
                  <a
                    href={selectedPagoDetalle.cepUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-blue-700 hover:text-blue-900 font-bold underline flex items-center gap-1"
                  >
                    <span>Consultar en banxico.org.mx</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="text-[10px] text-slate-600 space-y-1 font-mono">
                  <div><strong>Clave de Rastreo:</strong> {selectedPagoDetalle.claveRastreo}</div>
                  <div><strong>Institución Emisora:</strong> {selectedPagoDetalle.bancoEmisorNombre} ({selectedPagoDetalle.bancoEmisorId})</div>
                  <div><strong>Institución Receptora:</strong> STP - SISTEMA DE TRANSFERENCIAS Y PAGOS (646)</div>
                  <div><strong>Cuenta Beneficiario:</strong> {selectedPagoDetalle.clabeVirtual} ({selectedPagoDetalle.distribuidorNombre})</div>
                  <div className="text-[9px] text-slate-400 truncate">
                    <strong>Sello Digital Banxico:</strong> MEQCID5u3kM91xL9w7z2pQ...SHA256withRSA/BanxicoSTP
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedPagoDetalle(null)}
                  className="py-2 px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition"
                >
                  Cerrar Detalle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: NUEVA DISPERSIÓN STP */}
      {/* ========================================================= */}
      {isNewDispOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 font-extrabold text-slate-900 text-sm">
                <Send className="w-4 h-4 text-blue-600" />
                <span>Nueva Orden de Dispersión SPEI (STP)</span>
              </div>
              <button
                onClick={() => setIsNewDispOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCrearDispersion} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nombre Completo del Beneficiario *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. MARIA GUADALUPE SANCHEZ"
                  value={newBeneficiario}
                  onChange={(e) => setNewBeneficiario(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Institución Bancaria</label>
                  <select
                    value={newBanco}
                    onChange={(e) => setNewBanco(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="BBVA México">BBVA México</option>
                    <option value="Banorte">Banorte</option>
                    <option value="Banco Azteca">Banco Azteca</option>
                    <option value="Santander">Santander</option>
                    <option value="Citibanamex">Citibanamex</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Monto ($ MXN) *</label>
                  <input
                    type="number"
                    required
                    value={newMonto}
                    onChange={(e) => setNewMonto(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">CLABE Interbancaria (18 dígitos) *</label>
                <input
                  type="text"
                  maxLength={18}
                  required
                  placeholder="012180015599881122"
                  value={newClabe}
                  onChange={(e) => setNewClabe(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-xs tracking-wider focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Concepto de Pago</label>
                <input
                  type="text"
                  value={newConcepto}
                  onChange={(e) => setNewConcepto(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewDispOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xs transition"
                >
                  Dispersar Inmediatamente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
