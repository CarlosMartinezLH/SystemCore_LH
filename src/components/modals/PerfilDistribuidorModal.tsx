'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DistribuidorCore, CreditoHistorialPersona, NotaClienteCore } from '@/types/core';
import { useCoreSync } from '@/context/CoreSyncContext';
import {
  X,
  Search,
  Pencil,
  CheckCircle2,
  Printer,
  FileText,
  Clock,
  RefreshCw,
  CreditCard,
  ShoppingBag,
  DollarSign,
  UserCheck,
  Building,
  Phone,
  MapPin,
  AlertTriangle,
  FileCheck,
  Tag,
  ShieldCheck,
  Award,
  SlidersHorizontal,
  Briefcase,
  Layers,
  Send,
  Download,
  Receipt,
  ExternalLink,
  FileSpreadsheet,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import EstadoCuentaDistribuidorModal from './EstadoCuentaDistribuidorModal';

interface PerfilDistribuidorModalProps {
  isOpen: boolean;
  onClose: () => void;
  distribuidor: DistribuidorCore;
  initialTab?: 'detalle' | 'opciones' | 'cartera' | 'estado_cuenta' | 'notas';
  onSelectDv?: (noDist: number) => void;
  onOpenCartera?: (distribuidor: DistribuidorCore) => void;
  onOpenRelacion?: (distribuidor: DistribuidorCore) => void;
  onOpenEstadoCuenta?: (distribuidor: DistribuidorCore) => void;
  onOpenCastigo?: (distribuidor: DistribuidorCore) => void;
}

// Datos auténticos de cartera por defecto
const DEFAULT_CARTERA_DV: CreditoHistorialPersona[] = [
  {
    contratoId: 2605,
    coordinador: 'REYNA ELIZABETH GUTIERREZ ROSALES',
    creditoId: 429144,
    nombreDistribuidor: 'DIANA YANET PEREZ MARTINEZ',
    distribuidorId: 1035,
    personaId: 2606,
    nombreCompleto: 'DIANA YANET PEREZ MARTINEZ',
    plazos: 1,
    porcTasaMensual: 0.0,
    producto: 'VALE 0 QUINCENA(S)',
    capital: 0.0,
    interes: 0.0,
    seguro: 90.0,
    iva: 0.0,
    importeTotal: 90.0,
    abonos: 0.0,
    pagoModa: 0.0,
    saldoActual: 90.0,
    diasAtraso: 0,
    saldoAtrasado: 0,
    fechaHoraRegistro: '2026-05-15',
    fechaHoraDesembolso: '2026-05-15',
    fechaHoraUltimoPago: '2026-10-31',
    valeCanje: 0,
    capitalPagado: 0,
    capitalPendiente: 0,
    interesPendiente: 0,
    seguroPendiente: 90,
    ivaPendiente: 0,
    usuarioIdRegistro: 1,
    nomUsuarioRegistro: 'Sistema',
    pagosAtrasados: 0,
    tipoDesembolso: 'DIGITAL',
    estatus: 'ACTIVO',
    pagareEstatusDesc: 'FIRMADO',
    fechaPrimerPlazo: '2026-06-15',
    fechaUltimoPlazo: '2026-11-30',
    capitalAtrasado: 0,
    interesAtrasado: 0,
    comisionAtrasado: 0,
    seguroAtrasado: 0,
    cargoAtrasado: 0,
    ivaAtrasado: 0,
    observacion: 'Protección relación de cobranza',
    sucursal: 'SALTILLO',
    tipo: 'PROTECCION',
    clasificacionDesc: 'CREDITO PROTECCION RELACION',
  },
  {
    contratoId: 2605,
    coordinador: 'REYNA ELIZABETH GUTIERREZ ROSALES',
    creditoId: 398837,
    nombreDistribuidor: 'DIANA YANET PEREZ MARTINEZ',
    distribuidorId: 1035,
    personaId: 2606,
    nombreCompleto: 'DIANA YANET PEREZ MARTINEZ',
    plazos: 8,
    porcTasaMensual: 0.0,
    producto: 'VALE 8 QUINCENA(S) DISTRIBUIDOR',
    capital: 16500.0,
    interes: 3982.76,
    seguro: 480.0,
    iva: 637.24,
    importeTotal: 21600.0,
    abonos: 13500.0,
    pagoModa: 2700.0,
    saldoActual: 8100.0,
    diasAtraso: 0,
    saldoAtrasado: 0,
    fechaHoraRegistro: '2026-06-01',
    fechaHoraDesembolso: '2026-06-01',
    fechaHoraUltimoPago: '2026-10-31',
    valeCanje: 101,
    capitalPagado: 10312.5,
    capitalPendiente: 6187.5,
    interesPendiente: 1493.53,
    seguroPendiente: 180,
    ivaPendiente: 238.97,
    usuarioIdRegistro: 1,
    nomUsuarioRegistro: 'Sistema',
    pagosAtrasados: 0,
    tipoDesembolso: 'VALE',
    estatus: 'ACTIVO',
    pagareEstatusDesc: 'FIRMADO',
    fechaPrimerPlazo: '2026-06-15',
    fechaUltimoPlazo: '2026-09-30',
    capitalAtrasado: 0,
    interesAtrasado: 0,
    comisionAtrasado: 0,
    seguroAtrasado: 0,
    cargoAtrasado: 0,
    ivaAtrasado: 0,
    observacion: 'Préstamo personal a distribuidora',
    sucursal: 'SALTILLO',
    tipo: 'PERSONAL',
    clasificacionDesc: 'PRESTAMO PERSONAL DV',
  },
  {
    contratoId: 2605,
    coordinador: 'REYNA ELIZABETH GUTIERREZ ROSALES',
    creditoId: 420094,
    nombreDistribuidor: 'DIANA YANET PEREZ MARTINEZ',
    distribuidorId: 1035,
    personaId: 2606,
    nombreCompleto: 'DIANA YANET PEREZ MARTINEZ',
    plazos: 8,
    porcTasaMensual: 0.0,
    producto: 'VALE 8 QUINCENA(S) DISTRIBUIDOR',
    capital: 16500.0,
    interes: 3982.76,
    seguro: 480.0,
    iva: 637.24,
    importeTotal: 21600.0,
    abonos: 2700.0,
    pagoModa: 2700.0,
    saldoActual: 18900.0,
    diasAtraso: 0,
    saldoAtrasado: 0,
    fechaHoraRegistro: '2026-09-15',
    fechaHoraDesembolso: '2026-09-15',
    fechaHoraUltimoPago: '2026-10-31',
    valeCanje: 102,
    capitalPagado: 2062.5,
    capitalPendiente: 14437.5,
    interesPendiente: 3484.92,
    seguroPendiente: 420,
    ivaPendiente: 557.58,
    usuarioIdRegistro: 1,
    nomUsuarioRegistro: 'Sistema',
    pagosAtrasados: 0,
    tipoDesembolso: 'VALE',
    estatus: 'ACTIVO',
    pagareEstatusDesc: 'FIRMADO',
    fechaPrimerPlazo: '2026-09-30',
    fechaUltimoPlazo: '2027-01-15',
    capitalAtrasado: 0,
    interesAtrasado: 0,
    comisionAtrasado: 0,
    seguroAtrasado: 0,
    cargoAtrasado: 0,
    ivaAtrasado: 0,
    observacion: 'Préstamo personal de apoyo DV',
    sucursal: 'SALTILLO',
    tipo: 'PERSONAL',
    clasificacionDesc: 'PRESTAMO PERSONAL DV',
  },
  {
    contratoId: 2605,
    coordinador: 'REYNA ELIZABETH GUTIERREZ ROSALES',
    creditoId: 340521,
    nombreDistribuidor: 'DIANA YANET PEREZ MARTINEZ',
    distribuidorId: 1035,
    personaId: 39047,
    nombreCompleto: 'ADRIANA PATRICIA RODRIGUEZ SALAS',
    plazos: 16,
    porcTasaMensual: 0.0,
    producto: 'VALE 16 QUINCENA(S)',
    capital: 13000.0,
    interes: 8089.65,
    seguro: 960.0,
    iva: 1294.34,
    importeTotal: 23344.0,
    abonos: 21885.0,
    pagoModa: 1459.0,
    saldoActual: 1459.0,
    diasAtraso: 0,
    saldoAtrasado: 0,
    fechaHoraRegistro: '2026-03-01',
    fechaHoraDesembolso: '2026-03-01',
    fechaHoraUltimoPago: '2026-10-31',
    valeCanje: 340521,
    capitalPagado: 12187.5,
    capitalPendiente: 812.5,
    interesPendiente: 505.6,
    seguroPendiente: 60,
    ivaPendiente: 80.9,
    usuarioIdRegistro: 1,
    nomUsuarioRegistro: 'Sistema',
    pagosAtrasados: 0,
    tipoDesembolso: 'VALE',
    estatus: 'ACTIVO',
    pagareEstatusDesc: 'FIRMADO',
    fechaPrimerPlazo: '2026-03-15',
    fechaUltimoPlazo: '2026-10-31',
    capitalAtrasado: 0,
    interesAtrasado: 0,
    comisionAtrasado: 0,
    seguroAtrasado: 0,
    cargoAtrasado: 0,
    ivaAtrasado: 0,
    observacion: 'Vale de dinero cliente final',
    sucursal: 'SALTILLO',
    tipo: 'VALE_DINERO',
    clasificacionDesc: 'VALE DE DINERO',
  },
  {
    contratoId: 2605,
    coordinador: 'REYNA ELIZABETH GUTIERREZ ROSALES',
    creditoId: 344944,
    nombreDistribuidor: 'DIANA YANET PEREZ MARTINEZ',
    distribuidorId: 1035,
    personaId: 9010,
    nombreCompleto: 'LIDIA MAGDALENA RODRIGUEZ GARCIA',
    plazos: 16,
    porcTasaMensual: 0.0,
    producto: 'VALE 16 QUINCENA(S)',
    capital: 13000.0,
    interes: 8089.65,
    seguro: 960.0,
    iva: 1294.34,
    importeTotal: 23344.0,
    abonos: 20426.0,
    pagoModa: 1459.0,
    saldoActual: 2918.0,
    diasAtraso: 0,
    saldoAtrasado: 0,
    fechaHoraRegistro: '2026-03-15',
    fechaHoraDesembolso: '2026-03-15',
    fechaHoraUltimoPago: '2026-10-31',
    valeCanje: 344944,
    capitalPagado: 11375.0,
    capitalPendiente: 1625.0,
    interesPendiente: 1011.2,
    seguroPendiente: 120,
    ivaPendiente: 161.8,
    usuarioIdRegistro: 1,
    nomUsuarioRegistro: 'Sistema',
    pagosAtrasados: 0,
    tipoDesembolso: 'VALE',
    estatus: 'ACTIVO',
    pagareEstatusDesc: 'FIRMADO',
    fechaPrimerPlazo: '2026-04-01',
    fechaUltimoPlazo: '2026-11-15',
    capitalAtrasado: 0,
    interesAtrasado: 0,
    comisionAtrasado: 0,
    seguroAtrasado: 0,
    cargoAtrasado: 0,
    ivaAtrasado: 0,
    observacion: 'Vale de dinero cliente final',
    sucursal: 'SALTILLO',
    tipo: 'VALE_DINERO',
    clasificacionDesc: 'VALE DE DINERO',
  },
];

export default function PerfilDistribuidorModal({
  isOpen,
  onClose,
  distribuidor,
  initialTab = 'detalle',
  onSelectDv,
  onOpenCartera,
  onOpenRelacion,
  onOpenEstadoCuenta,
  onOpenCastigo,
}: PerfilDistribuidorModalProps) {
  const { distribuidores, updateDistribuidor } = useCoreSync();

  const [activeTab, setActiveTab] = useState<'detalle' | 'opciones' | 'cartera' | 'estado_cuenta' | 'notas'>(initialTab);
  const [currentDv, setCurrentDv] = useState<DistribuidorCore>(distribuidor);
  const [isEditing, setIsEditing] = useState(false);
  const [isEstadoCuentaModalOpen, setIsEstadoCuentaModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<DistribuidorCore>>({});
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // Filtro de búsqueda dentro del tab Cartera
  const [carteraSearch, setCarteraSearch] = useState('');

  // Notas internas de la distribuidora
  const [internalNotes, setInternalNotes] = useState<NotaClienteCore[]>([
    {
      id: 'note-dv-1',
      text: 'Distribuidora clasificada como AAA con excelente historial de cobranza y cumplimiento.',
      date: '12/11/2026 10:30',
      author: 'Lic. Sandra Morales',
      authorRole: 'Mesa de Control',
      modulo: 'Crédito y Cartera',
      avatarInitials: 'SM',
    },
    {
      id: 'note-dv-2',
      text: 'Línea de crédito incrementada a $195,000.00 autorizada por Gerencia de Operaciones.',
      date: '28/09/2026 16:45',
      author: 'Carlos Martínez Mayorga',
      authorRole: 'Dirección General',
      modulo: 'Mesa de Crédito',
      avatarInitials: 'CM',
    },
  ]);
  const [noteInput, setNoteInput] = useState('');

  // Control de apertura y distribuidor para evitar resetear activeTab en cada actualización o polling
  const prevOpenRef = useRef<boolean>(false);
  const prevDistNoRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      prevOpenRef.current = false;
      return;
    }

    const isNewOpen = !prevOpenRef.current;
    const isNewDist = prevDistNoRef.current !== distribuidor?.noDist;

    if (distribuidor && (isNewOpen || isNewDist)) {
      prevOpenRef.current = true;
      prevDistNoRef.current = distribuidor.noDist;

      setActiveTab(initialTab || 'detalle');
      setCurrentDv(distribuidor);
      setFormData(distribuidor);
    }
  }, [isOpen, distribuidor, initialTab]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(null), 3000);
  };

  const handleSaveData = () => {
    const updated: DistribuidorCore = {
      ...currentDv,
      ...formData,
    };
    setCurrentDv(updated);
    updateDistribuidor(updated);
    setIsEditing(false);
    showToast(`Datos de DV #${updated.noDist} guardados exitosamente.`);
  };

  const handleAddNote = () => {
    if (!noteInput.trim()) return;
    const newNote: NotaClienteCore = {
      id: `note-${Date.now()}`,
      text: noteInput.trim(),
      date: new Date().toLocaleString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      author: 'Usuario Sistema',
      authorRole: 'Mesa de Control',
      modulo: 'Distribuidores',
      avatarInitials: 'US',
    };
    setInternalNotes([newNote, ...internalNotes]);
    setNoteInput('');
    showToast('Nota registrada en la bitácora.');
  };

  const handleExportCarteraExcel = () => {
    const rows = DEFAULT_CARTERA_DV.map((c) => ({
      Contrato: c.contratoId,
      'Crédito ID': c.creditoId,
      'Cliente / DV': c.nombreCompleto,
      Plazos: c.plazos,
      Producto: c.producto,
      Capital: c.capital,
      Interés: c.interes,
      Seguro: c.seguro,
      IVA: c.iva,
      'Importe Total': c.importeTotal,
      Abonos: c.abonos,
      'Saldo Actual': c.saldoActual,
      Clasificación: c.clasificacionDesc,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Cartera DV');
    XLSX.writeFile(wb, `Cartera_DV_${currentDv.noDist}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const filteredCartera = DEFAULT_CARTERA_DV.filter((item) => {
    if (!carteraSearch.trim()) return true;
    const q = carteraSearch.toLowerCase();
    return (
      item.nombreCompleto.toLowerCase().includes(q) ||
      item.creditoId.toString().includes(q) ||
      item.producto.toLowerCase().includes(q) ||
      item.clasificacionDesc.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-6xl xl:max-w-7xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col font-sans animate-in zoom-in-95 duration-150">
        {/* Header Superior del Modal (IDÉNTICO a EditarClienteModal) */}
        <div className="px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <img
              src="/lanahora-logo-transparent.png"
              alt="LanAhora"
              className="h-7 w-auto object-contain"
            />
            <div className="h-6 w-px bg-slate-300" />
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                {currentDv.nombreDistribuidor}
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                DV #{currentDv.noDist}
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-md border flex items-center gap-1.5 shadow-2xs ${
                  currentDv.estatus === 'ACTIVO'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : currentDv.estatus === 'REESTRUCTURA'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                <span className="font-mono font-black">{currentDv.estatus}</span>
                <span className="font-semibold">· {currentDv.nivel}</span>
              </span>
            </div>
          </div>

          {/* Segmented Tabs Switcher (IDÉNTICO a EditarClienteModal) */}
          <div className="flex items-center gap-2">
            <div className="inline-flex p-1 bg-slate-200/70 rounded-xl border border-slate-300/60 text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setActiveTab('detalle')}
                className={`px-3 py-1.5 rounded-lg transition text-xs flex items-center gap-1.5 ${
                  activeTab === 'detalle'
                    ? 'bg-white text-blue-700 shadow-xs font-black'
                    : 'hover:text-slate-900'
                }`}
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Detalle & Datos</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('opciones')}
                className={`px-3 py-1.5 rounded-lg transition text-xs flex items-center gap-1.5 ${
                  activeTab === 'opciones'
                    ? 'bg-white text-blue-700 shadow-xs font-black'
                    : 'hover:text-slate-900'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Opciones & Operación</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('cartera')}
                className={`px-3 py-1.5 rounded-lg transition text-xs flex items-center gap-1.5 ${
                  activeTab === 'cartera'
                    ? 'bg-white text-blue-700 shadow-xs font-black'
                    : 'hover:text-slate-900'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Cartera de Clientes</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('estado_cuenta')}
                className={`px-3 py-1.5 rounded-lg transition text-xs flex items-center gap-1.5 ${
                  activeTab === 'estado_cuenta'
                    ? 'bg-white text-blue-700 shadow-xs font-black'
                    : 'hover:text-slate-900'
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Estado de Cuenta</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('notas')}
                className={`px-3 py-1.5 rounded-lg transition text-xs flex items-center gap-1.5 ${
                  activeTab === 'notas'
                    ? 'bg-white text-blue-700 shadow-xs font-black'
                    : 'hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Bitácora & Notas</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              title="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notificación Toast */}
        {noticeMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs font-bold text-emerald-800 flex items-center justify-between">
            <span>✓ {noticeMessage}</span>
            <button onClick={() => setNoticeMessage(null)} className="text-emerald-700 font-black cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* Contenido con scroll dinámico según pestaña activa */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs bg-[#f8fafc]">
          {/* TAB 1: DETALLE & DATOS */}
          {activeTab === 'detalle' && (
            <div className="space-y-4">
              {/* Tarjetas de Resumen Financiero Rápido */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">Línea de Crédito</span>
                  <span className="text-base font-extrabold text-slate-900 font-mono">
                    ${currentDv.creditoLimite.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">Saldo Actual</span>
                  <span className="text-base font-extrabold text-slate-900 font-mono">
                    ${(currentDv.saldoActual || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">Disponible</span>
                  <span className="text-base font-extrabold text-emerald-600 font-mono">
                    ${currentDv.disponible.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">Vales Activos</span>
                  <span className="text-base font-extrabold text-blue-700 font-mono">
                    {currentDv.valesActivos || 32}
                  </span>
                </div>
              </div>

              {/* Accesos Rápidos Principales: Cartera de Clientes y Estado de Cuenta */}
              <div className="flex flex-wrap items-center gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 px-1">
                  Módulos de Distribuidor:
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('cartera')}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs inline-flex items-center gap-1.5 border border-emerald-200 transition active:scale-95 shadow-2xs cursor-pointer"
                >
                  <Briefcase className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Ver Cartera de Clientes ({currentDv.valesActivos || 32} vales)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('estado_cuenta')}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs inline-flex items-center gap-1.5 border border-blue-200 transition active:scale-95 shadow-2xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-700" />
                  <span>Generar Estado de Cuenta</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('opciones')}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs inline-flex items-center gap-1.5 border border-slate-200 transition active:scale-95 shadow-2xs cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
                  <span>Opciones & Operación</span>
                </button>
              </div>

              {/* Formulario Estructurado en 3 Tarjetas Modernas */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Tarjeta 1: Información de Distribución */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Building className="w-3.5 h-3.5 text-blue-600" />
                    <span>Datos de Distribución</span>
                  </h3>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Nombre Distribuidor:</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={isEditing ? formData.nombreDistribuidor || '' : currentDv.nombreDistribuidor}
                      onChange={(e) => setFormData({ ...formData, nombreDistribuidor: e.target.value })}
                      className={`w-full px-2.5 py-1.5 border rounded-lg text-xs font-bold text-slate-900 ${
                        isEditing ? 'bg-white border-blue-500' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">No. Dist:</label>
                      <input
                        type="text"
                        disabled
                        value={currentDv.noDist}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-mono font-bold bg-slate-100 text-slate-700 text-center"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Contrato ID:</label>
                      <input
                        type="text"
                        disabled
                        value={currentDv.contratoId || 2606}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-mono bg-slate-100 text-slate-700 text-center"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Estatus:</label>
                      <select
                        disabled={!isEditing}
                        value={isEditing ? formData.estatus || currentDv.estatus : currentDv.estatus}
                        onChange={(e) => setFormData({ ...formData, estatus: e.target.value as any })}
                        className={`w-full px-2 py-1.5 border rounded-lg text-xs font-bold ${
                          isEditing ? 'bg-white border-blue-500' : 'bg-slate-50 border-slate-200'
                        } text-slate-800`}
                      >
                        <option value="ACTIVO">ACTIVO</option>
                        <option value="CANCELADO">CANCELADO</option>
                        <option value="REESTRUCTURA">REESTRUCTURA</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Nivel:</label>
                      <select
                        disabled={!isEditing}
                        value={isEditing ? formData.nivel || currentDv.nivel : currentDv.nivel}
                        onChange={(e) => setFormData({ ...formData, nivel: e.target.value as any })}
                        className={`w-full px-2 py-1.5 border rounded-lg text-xs font-bold ${
                          isEditing ? 'bg-white border-blue-500' : 'bg-slate-50 border-slate-200'
                        } text-slate-800`}
                      >
                        <option value="BRONCE">BRONCE</option>
                        <option value="PLATA">PLATA</option>
                        <option value="ORO">ORO</option>
                        <option value="DIAMANTE">DIAMANTE</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Perfil Operativo:</label>
                    <select
                      disabled={!isEditing}
                      value={isEditing ? formData.perfil || currentDv.perfil : currentDv.perfil || 'Distribuidor AAA'}
                      onChange={(e) => setFormData({ ...formData, perfil: e.target.value })}
                      className={`w-full px-2 py-1.5 border rounded-lg text-xs ${
                        isEditing ? 'bg-white border-blue-500' : 'bg-slate-50 border-slate-200'
                      } text-slate-800`}
                    >
                      <option value="Distribuidor AAA">Distribuidor AAA</option>
                      <option value="Distribuidor AA">Distribuidor AA</option>
                      <option value="Distribuidor A">Distribuidor A</option>
                    </select>
                  </div>
                </div>

                {/* Tarjeta 2: Red Territorial & Coordinación */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Red Territorial & Asignación</span>
                  </h3>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Coordinador:</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={isEditing ? formData.coordinador || '' : currentDv.coordinador}
                      onChange={(e) => setFormData({ ...formData, coordinador: e.target.value })}
                      className={`w-full px-2.5 py-1.5 border rounded-lg text-xs font-bold ${
                        isEditing ? 'bg-white border-blue-500' : 'bg-slate-50 border-slate-200'
                      } text-slate-800`}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Sucursal:</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={isEditing ? formData.sucursal || '' : currentDv.sucursal}
                      onChange={(e) => setFormData({ ...formData, sucursal: e.target.value })}
                      className={`w-full px-2.5 py-1.5 border rounded-lg text-xs ${
                        isEditing ? 'bg-white border-blue-500' : 'bg-slate-50 border-slate-200'
                      } text-slate-800`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Zona:</label>
                      <input
                        type="text"
                        disabled
                        value={currentDv.zona || currentDv.zonaId || '-'}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-100 text-slate-700 text-center font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Subzona:</label>
                      <input
                        type="text"
                        disabled
                        value={currentDv.subzona || currentDv.subzonaId || '-'}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-100 text-slate-700 text-center font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Gestor:</label>
                      <input
                        type="text"
                        disabled
                        value={currentDv.gestor || '0'}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-100 text-slate-700 text-center font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Promotor:</label>
                      <input
                        type="text"
                        disabled
                        value={currentDv.promotor || 'SIN PROMOTOR'}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-100 text-slate-700 text-center truncate"
                      />
                    </div>
                  </div>
                </div>

                {/* Tarjeta 3: Contacto & Domicilio */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Phone className="w-3.5 h-3.5 text-purple-600" />
                    <span>Contacto & Domicilio</span>
                  </h3>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Dirección:</label>
                    <textarea
                      rows={2}
                      disabled={!isEditing}
                      value={isEditing ? formData.direccion || '' : currentDv.direccion || 'PRIV FRANCISCO HERRERA GARZA 115 , CP. 25015, FUNDADORES, SALTILLO'}
                      onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                      className={`w-full px-2.5 py-1.5 border rounded-lg text-xs ${
                        isEditing ? 'bg-white border-blue-500' : 'bg-slate-50 border-slate-200'
                      } text-slate-800`}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Teléfono Móvil:</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={isEditing ? formData.telefono || '' : currentDv.telefono || '8444101285'}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      className={`w-full px-2.5 py-1.5 border rounded-lg text-xs font-mono ${
                        isEditing ? 'bg-white border-blue-500' : 'bg-slate-50 border-slate-200'
                      } text-slate-800`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">CURP:</label>
                      <input
                        type="text"
                        disabled
                        value={currentDv.curp || 'MACE750312MCO'}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-mono bg-slate-100 text-slate-700 truncate"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">LanaApp:</label>
                      <input
                        type="text"
                        disabled
                        value={currentDv.tieneLanaApp ? 'ACTIVA' : 'INACTIVA'}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-bold bg-slate-100 text-center text-emerald-700"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tarjeta de Validación Institucional & Acciones de Guardado */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-4 flex-wrap text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">Usuario Valida:</span>{' '}
                    <strong className="text-slate-900">{currentDv.usuarioValida || 'Sistema'}</strong>
                  </div>
                  <div className="h-4 w-px bg-slate-200 hidden sm:block" />
                  <div>
                    <span className="text-slate-500 font-medium">Fecha Validación:</span>{' '}
                    <strong className="text-slate-900 font-mono">{currentDv.fechaValidacion || '02/04/2023 16:41:26'}</strong>
                  </div>
                  <div className="h-4 w-px bg-slate-200 hidden sm:block" />
                  <div>
                    <span className="text-slate-500 font-medium">Consolidación:</span>{' '}
                    <span className="text-slate-600 font-medium">{currentDv.usuarioConsolida || 'NO VALIDADO AÚN'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Modificar Datos</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleSaveData}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Guardar Cambios</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OPCIONES & OPERACIÓN (Agrupadas en 4 tarjetas de alto nivel) */}
          {activeTab === 'opciones' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tarjeta 1: Cobranza & Documentos */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Printer className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">
                    Documentos Oficiales & Cobranza
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenRelacion) onOpenRelacion(currentDv);
                    }}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-800 hover:text-emerald-900 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <Printer className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-xs">Relación de Cobranza</span>
                    <span className="text-[10px] text-slate-500">Hoja quincenal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('estado_cuenta')}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-800 hover:text-emerald-900 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-xs">Estado de Cuenta</span>
                    <span className="text-[10px] text-slate-500">Reporte con descuentos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => showToast('Generando recibos de relación...')}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-800 hover:text-emerald-900 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-xs">Recibos de Relación</span>
                    <span className="text-[10px] text-slate-500">Talón de pago</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => showToast('Contrato de apertura generado.')}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-800 hover:text-emerald-900 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-xs">Contrato de Apertura</span>
                    <span className="text-[10px] text-slate-500">Expediente legal</span>
                  </button>
                </div>
              </div>

              {/* Tarjeta 2: Cartera & Créditos */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">
                    Cartera, Líneas & Créditos
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('cartera')}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-slate-800 hover:text-blue-900 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-xs">Cartera de Clientes</span>
                    <span className="text-[10px] text-slate-500">Detalle de vales emitidos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => showToast('Cargando historial completo de créditos...')}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-slate-800 hover:text-blue-900 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-xs">Historial Créditos</span>
                    <span className="text-[10px] text-slate-500">Amortizaciones y pagos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => showToast('Abriendo módulo de Crédito Personal DV...')}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-slate-800 hover:text-blue-900 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-xs">Crédito Personal DV</span>
                    <span className="text-[10px] text-slate-500">Préstamo directo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => showToast('Abriendo Tiendita LanAhora para DV...')}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-slate-800 hover:text-blue-900 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <ShoppingBag className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-xs">Tiendita LanAhora</span>
                    <span className="text-[10px] text-slate-500">Catálogo de canje</span>
                  </button>
                </div>
              </div>

              {/* Tarjeta 3: Supervisión & Auditoría */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">
                    Supervisión & Auditoría
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => showToast('Iniciando auditoría interna para distribuidora...')}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 text-slate-800 hover:text-purple-900 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-xs">Auditar Distribuidora</span>
                    <span className="text-[10px] text-slate-500">Verificación de cartera</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => showToast('Abriendo expediente y valeras digitales...')}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 text-slate-800 hover:text-purple-900 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <Tag className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-xs">Expediente & Valeras</span>
                    <span className="text-[10px] text-slate-500">Control de folios</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => showToast('Autorización de ingreso enviada a LanaApp.')}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 text-slate-800 hover:text-purple-900 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <UserCheck className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-xs">Aut. Ingreso APP</span>
                    <span className="text-[10px] text-slate-500">Acceso móvil seguro</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => showToast('Cuestionario de visita ocular cargado.')}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 text-slate-800 hover:text-purple-900 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <Building className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-xs">Encuesta Visita Ocular</span>
                    <span className="text-[10px] text-slate-500">Cotejo domiciliario</span>
                  </button>
                </div>
              </div>

              {/* Tarjeta 4: Canales & Gestión Operativa */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <SlidersHorizontal className="w-4 h-4 text-amber-600" />
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">
                    Convenios & Gestión Operativa
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenCastigo) onOpenCastigo(currentDv);
                    }}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 text-slate-800 hover:text-amber-900 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <RefreshCw className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-xs">Convenio / Castigo</span>
                    <span className="text-[10px] text-slate-500">Levantar penalización</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => showToast('Abriendo cálculo de crédito personalizado...')}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 text-slate-800 hover:text-amber-900 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <DollarSign className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-xs">Crédito Personalizado</span>
                    <span className="text-[10px] text-slate-500">Esquema especial</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const gestor = prompt('Ingrese nuevo gestor asignado:', currentDv.gestor || '0');
                      if (gestor !== null) {
                        const up = { ...currentDv, gestor };
                        setCurrentDv(up);
                        updateDistribuidor(up);
                        showToast(`Gestor actualizado a: ${gestor}`);
                      }
                    }}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <UserCheck className="w-4 h-4 text-slate-600" />
                    <span className="font-bold text-xs">Cambiar Gestor</span>
                    <span className="text-[10px] text-slate-500">Reasignar cobrador</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const coord = prompt('Ingrese nuevo coordinador asignado:', currentDv.coordinador);
                      if (coord !== null) {
                        const up = { ...currentDv, coordinador: coord };
                        setCurrentDv(up);
                        updateDistribuidor(up);
                        showToast(`Coordinador actualizado a: ${coord}`);
                      }
                    }}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <Award className="w-4 h-4 text-slate-600" />
                    <span className="font-bold text-xs">Cambiar Coordinador</span>
                    <span className="text-[10px] text-slate-500">Reasignar cartera</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CARTERA DE CLIENTES INTEGRADA */}
          {activeTab === 'cartera' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
              {/* Barra Superior de la Cartera */}
              <div className="p-3 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="relative min-w-[260px] flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Buscar cliente, vale, crédito o clasificación..."
                    value={carteraSearch}
                    onChange={(e) => setCarteraSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportCarteraExcel}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Exportar Cartera</span>
                  </button>
                </div>
              </div>

              {/* Tabla de Cartera */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap font-sans">
                  <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] tracking-wider font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2.5">Crédito ID</th>
                      <th className="px-3 py-2.5">Cliente Final / DV</th>
                      <th className="px-3 py-2.5">Clasificación</th>
                      <th className="px-3 py-2.5">Producto</th>
                      <th className="px-3 py-2.5 text-center">Plazos</th>
                      <th className="px-3 py-2.5 text-right">Capital</th>
                      <th className="px-3 py-2.5 text-right">Importe Total</th>
                      <th className="px-3 py-2.5 text-right">Abonos</th>
                      <th className="px-3 py-2.5 text-right">Saldo Actual</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredCartera.map((c) => (
                      <tr key={c.creditoId} className="hover:bg-slate-50 transition">
                        <td className="px-3 py-2 font-mono font-bold text-blue-600">
                          #{c.creditoId}
                        </td>
                        <td className="px-3 py-2 font-bold text-slate-900">
                          {c.nombreCompleto}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.clasificacionDesc === 'CREDITO PROTECCION RELACION'
                                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                : c.clasificacionDesc === 'PRESTAMO PERSONAL DV'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {c.clasificacionDesc}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          {c.producto}
                        </td>
                        <td className="px-3 py-2 text-center font-mono">
                          {c.plazos}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-slate-700">
                          ${c.capital.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-slate-700">
                          ${c.importeTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-emerald-600">
                          ${c.abonos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-slate-900">
                          ${c.saldoActual.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ESTADO DE CUENTA INTEGRADO */}
          {activeTab === 'estado_cuenta' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Estado de Cuenta Oficial
                  </h3>
                  <p className="text-slate-500 text-xs">
                    Reporte de amortizaciones, próximos pagos y bonificaciones por pronto pago.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEstadoCuentaModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Formato Oficial</span>
                </button>
              </div>

              {/* Vista preliminar del Estado de Cuenta */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 block">Línea de Crédito</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      ${currentDv.creditoLimite.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 block">Saldo Actual</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      ${(currentDv.saldoActual || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 block">Disponible</span>
                    <span className="font-mono font-bold text-emerald-600 text-sm">
                      ${currentDv.disponible.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 block">Días Atraso</span>
                    <span className="font-mono font-bold text-emerald-600 text-sm">
                      0 Días (Al corriente)
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">
                    Próximo Vencimiento Quincenal
                  </h4>
                  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] tracking-wider font-extrabold">
                        <tr>
                          <th className="px-3 py-2">Vencimiento</th>
                          <th className="px-3 py-2 text-right">Importe</th>
                          <th className="px-3 py-2 text-right">Saldo</th>
                          <th className="px-3 py-2 text-right">Pago Ant. 3 Días</th>
                          <th className="px-3 py-2 text-right">Pago Ant. 1 Día</th>
                          <th className="px-3 py-2 text-right">Pago Vencimiento</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        <tr>
                          <td className="px-3 py-2 font-bold text-slate-900">20/Nov/2026</td>
                          <td className="px-3 py-2 text-right">$40,409.00</td>
                          <td className="px-3 py-2 text-right text-blue-700 font-bold">$40,409.00</td>
                          <td className="px-3 py-2 text-right text-emerald-600 font-bold">$33,135.38</td>
                          <td className="px-3 py-2 text-right text-emerald-600 font-bold">$33,539.47</td>
                          <td className="px-3 py-2 text-right text-slate-900 font-bold">$33,943.56</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: BITÁCORA & NOTAS (IDÉNTICO a EditarClienteModal) */}
          {activeTab === 'notas' && (
            <div className="space-y-4">
              {/* Formulario de Agregar Nota */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Registrar Nueva Nota Interna</span>
                </h3>

                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    placeholder="Escriba comentarios sobre acuerdos, pagos, llamadas o incidencias de la distribuidora..."
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-900 transition font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleAddNote}
                    className="px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Guardar</span>
                  </button>
                </div>
              </div>

              {/* Lista de Notas Históricas */}
              <div className="space-y-2">
                {internalNotes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-black text-xs flex items-center justify-center shrink-0 border border-blue-200 font-mono">
                      {note.avatarInitials}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{note.author}</span>
                          <span className="text-[10px] text-slate-500 font-medium">({note.authorRole})</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {note.modulo}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{note.date}</span>
                      </div>
                      <p className="text-xs text-slate-700 font-normal leading-relaxed">{note.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Independiente de Estado de Cuenta Imprimible */}
      {isEstadoCuentaModalOpen && (
        <EstadoCuentaDistribuidorModal
          isOpen={isEstadoCuentaModalOpen}
          onClose={() => setIsEstadoCuentaModalOpen(false)}
          distribuidor={currentDv}
        />
      )}
    </div>
  );
}
