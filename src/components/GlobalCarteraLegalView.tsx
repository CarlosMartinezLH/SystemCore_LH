'use client';

import React, { useState, useMemo } from 'react';
import { UserSession } from '@/types/auth';
import {
  CarteraLegalItem,
  INITIAL_CARTERA_LEGAL,
  TOTALES_OFICIALES_CARTERA_LEGAL,
} from '@/lib/data/carteraLegalData';
import {
  ShieldAlert,
  Search,
  RefreshCw,
  FileSpreadsheet,
  Calendar,
  Eye,
  FileText,
  Printer,
  Send,
  DollarSign,
  Gavel,
  UserCheck,
  Building2,
  X,
  AlertTriangle,
  Scale,
  CheckCircle2,
  Clock,
  ChevronDown,
  Receipt,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { formatMoney } from '@/lib/utils/formatters';
import RelacionCobranzaModal from './modals/RelacionCobranzaModal';
import EstadoCuentaDistribuidorModal from './modals/EstadoCuentaDistribuidorModal';
import NotasCarteraModal from './modals/NotasCarteraModal';
import DetallesCarteraModal from './modals/DetallesCarteraModal';

interface GlobalCarteraLegalViewProps {
  currentUser?: UserSession | null;
}

export default function GlobalCarteraLegalView({
  currentUser,
}: GlobalCarteraLegalViewProps) {
  const [legalData, setLegalData] = useState<CarteraLegalItem[]>(INITIAL_CARTERA_LEGAL);
  const [selectedFecha, setSelectedFecha] = useState('2026-11-18');
  const [searchGlobal, setSearchGlobal] = useState('');
  const [selectedRowId, setSelectedRowId] = useState<string>('leg-1');
  const [estatusFiltro, setEstatusFiltro] = useState<string>('TODOS');

  // Modales operacionales
  const [isDetallesOpen, setIsDetallesOpen] = useState(false);
  const [isRelacionOpen, setIsRelacionOpen] = useState(false);
  const [isEstadoCuentaOpen, setIsEstadoCuentaOpen] = useState(false);
  const [isNotasOpen, setIsNotasOpen] = useState(false);
  const [isAplicarAbonoOpen, setIsAplicarAbonoOpen] = useState(false);
  const [isAsignarAbogadoOpen, setIsAsignarAbogadoOpen] = useState(false);

  // Formulario Asignar Abogado
  const [abogadoSeleccionado, setAbogadoSeleccionado] = useState('Lic. Antonio Aguirre López (Jurídico Core)');
  const [nuevoEstatusJuicio, setNuevoEstatusJuicio] = useState<CarteraLegalItem['estatusJuicio']>('DEMANDA_RADICADA');
  const [notasJuridicas, setNotasJuridicas] = useState('');

  // Formulario Abono
  const [montoAbono, setMontoAbono] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Contrato seleccionado
  const selectedItem = useMemo(() => {
    return legalData.find((item) => item.id === selectedRowId) || legalData[0] || null;
  }, [legalData, selectedRowId]);

  // Filtrado reactivo
  const filteredData = useMemo(() => {
    return legalData.filter((item) => {
      if (estatusFiltro !== 'TODOS' && item.estatusJuicio !== estatusFiltro) {
        return false;
      }
      if (!searchGlobal.trim()) return true;
      const q = searchGlobal.toLowerCase().trim();
      return (
        item.nombreCompleto.toLowerCase().includes(q) ||
        item.contratoId.toString().includes(q) ||
        item.distribuidorId.toString().includes(q) ||
        item.personaId.toString().includes(q) ||
        (item.abogadoAsignado && item.abogadoAsignado.toLowerCase().includes(q))
      );
    });
  }, [legalData, estatusFiltro, searchGlobal]);

  // Totales oficiales y calculados
  const totales = useMemo(() => {
    // Si no hay filtro de búsqueda y están todos los estatus, mostramos los totales oficiales auténticos
    if (!searchGlobal.trim() && estatusFiltro === 'TODOS') {
      return TOTALES_OFICIALES_CARTERA_LEGAL;
    }
    return filteredData.reduce(
      (acc, item) => ({
        importeTotal: acc.importeTotal + item.importeTotal,
        saldoActual: acc.saldoActual + item.saldoActual,
        saldoAtrasado: acc.saldoAtrasado + item.saldoAtrasado,
        capital: acc.capital + item.capital,
        interes: acc.interes + item.interes,
        seguro: acc.seguro + item.seguro,
        iva: acc.iva + item.iva,
        abonos: acc.abonos + item.abonos,
        totalElementos: acc.totalElementos + 1,
      }),
      {
        importeTotal: 0,
        saldoActual: 0,
        saldoAtrasado: 0,
        capital: 0,
        interes: 0,
        seguro: 0,
        iva: 0,
        abonos: 0,
        totalElementos: 0,
      }
    );
  }, [filteredData, searchGlobal, estatusFiltro]);

  // Agrupación por Sucursal y Coordinador
  const groupedData = useMemo(() => {
    const groups: {
      sucursal: string;
      coordinadores: {
        coordinador: string;
        items: CarteraLegalItem[];
      }[];
    }[] = [];

    filteredData.forEach((item) => {
      let sucGroup = groups.find((g) => g.sucursal === item.sucursal);
      if (!sucGroup) {
        sucGroup = { sucursal: item.sucursal, coordinadores: [] };
        groups.push(sucGroup);
      }
      let coordGroup = sucGroup.coordinadores.find((c) => c.coordinador === item.coordinador);
      if (!coordGroup) {
        coordGroup = { coordinador: item.coordinador, items: [] };
        sucGroup.coordinadores.push(coordGroup);
      }
      coordGroup.items.push(item);
    });

    return groups;
  }, [filteredData]);

  // Exportar Excel
  const handleExportExcel = () => {
    const exportRows = filteredData.map((c) => ({
      'Fecha Legal': c.fechaLegal,
      'Contrato ID': c.contratoId,
      'Distribuidor ID': c.distribuidorId,
      'No. Dist': c.numeroDist,
      'Persona ID': c.personaId,
      'Nombre Completo': c.nombreCompleto,
      Nivel: c.distribuidorNivel,
      'Importe Total': c.importeTotal,
      'Saldo Actual': c.saldoActual,
      'Saldo Atrasado': c.saldoAtrasado,
      'Línea Adic': c.lineaCreditoAdic,
      Capital: c.capital,
      Interés: c.interes,
      Seguro: c.seguro,
      IVA: c.iva,
      Abonos: c.abonos,
      'Días Atraso': c.diasAtraso,
      'Días Atraso Máx': c.diasAtrasoMax,
      'Fecha Demanda': c.fechaDemanda,
      'Abogado Asignado': c.abogadoAsignado || 'Sin Asignar',
      'Estatus Juicio': c.estatusJuicio,
      Sucursal: c.sucursal,
      Coordinador: c.coordinador,
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Cartera_Legal');
    XLSX.writeFile(wb, `cartera_legal_${selectedFecha}.xlsx`);
    showToast('✓ Cartera legal exportada a Excel.');
  };

  // Guardar Asignación de Abogado
  const handleGuardarAsignacion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setLegalData((prev) =>
      prev.map((it) => {
        if (it.id === selectedItem.id) {
          return {
            ...it,
            abogadoAsignado: abogadoSeleccionado,
            estatusJuicio: nuevoEstatusJuicio,
          };
        }
        return it;
      })
    );

    setIsAsignarAbogadoOpen(false);
    showToast(`✓ Abogado asignado exitosamente a Contrato #${selectedItem.contratoId}.`);
  };

  // Aplicar Abono en Cartera Legal
  const handleGuardarAbono = (e: React.FormEvent) => {
    e.preventDefault();
    const monto = parseFloat(montoAbono);
    if (isNaN(monto) || monto <= 0 || !selectedItem) {
      showToast('Por favor introduce un monto de abono judicial válido.');
      return;
    }

    setLegalData((prev) =>
      prev.map((it) => {
        if (it.id === selectedItem.id) {
          const nuevoSaldo = Math.max(0, it.saldoActual - monto);
          const nuevoAtraso = Math.max(0, it.saldoAtrasado - monto);
          return {
            ...it,
            saldoActual: nuevoSaldo,
            saldoAtrasado: nuevoAtraso,
            abonos: it.abonos + monto,
          };
        }
        return it;
      })
    );

    setIsAplicarAbonoOpen(false);
    setMontoAbono('');
    showToast(`✓ Abono judicial de ${formatMoney(monto)} aplicado al Contrato #${selectedItem.contratoId}.`);
  };

  return (
    <div className="flex-1 bg-[#f8fafc] text-slate-800 flex flex-col min-h-0 overflow-y-auto font-sans p-3 sm:p-5 lg:p-6 space-y-4">
      {/* ======================================================== */}
      {/* 1. ENCABEZADO Y BARRA SUPERIOR DE ACCIONES               */}
      {/* ======================================================== */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/80 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  Cartera Jurídica
                </span>
                <span className="text-[11px] text-slate-400">
                  En litigio / Demanda:{' '}
                  <strong className="text-slate-700 font-bold">{filteredData.length} contratos</strong>
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-0.5">
                Global Cartera Legal
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Selector de Fecha */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-500 font-bold">Fecha:</span>
              <input
                type="date"
                value={selectedFecha}
                onChange={(e) => setSelectedFecha(e.target.value)}
                className="bg-transparent font-mono font-bold text-slate-800 focus:outline-none cursor-pointer"
              />
            </div>

            {/* Filtrar Por Estatus Procesal */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 font-medium">
              <Scale className="w-3.5 h-3.5 text-rose-600" />
              <span className="text-slate-500 font-bold">Juicio:</span>
              <select
                value={estatusFiltro}
                onChange={(e) => setEstatusFiltro(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer text-xs uppercase"
              >
                <option value="TODOS">TODOS LOS JUICIOS</option>
                <option value="DEMANDA_RADICADA">DEMANDA RADICADA</option>
                <option value="EN_NOTIFICACION">EN NOTIFICACIÓN</option>
                <option value="EMBARGO_PRECAUTORIO">EMBARGO PRECAUTORIO</option>
                <option value="EN_CONVENIO_JUDICIAL">CONVENIO JUDICIAL</option>
                <option value="DICTAMEN_SENTENCIA">DICTAMEN / SENTENCIA</option>
              </select>
            </div>
          </div>
        </div>

        {/* Fila 2: Botones de Acción Operacionales */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs select-none">
          <button
            type="button"
            onClick={() => showToast('Cartera legal actualizada.')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
            <span>Actualizar</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer active:scale-95"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Exportar a excel</span>
          </button>

          <div className="h-4 w-px bg-slate-200 shrink-0" />

          {/* Detalles */}
          <button
            type="button"
            onClick={() => setIsDetallesOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-600" />
            <span>Detalles</span>
          </button>

          {/* Relación */}
          <button
            type="button"
            onClick={() => setIsRelacionOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 shadow-2xs"
          >
            <Receipt className="w-3.5 h-3.5 text-blue-600" />
            <span>Relación</span>
          </button>

          {/* Estado de Cuenta */}
          <button
            type="button"
            onClick={() => setIsEstadoCuentaOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-purple-600" />
            <span>Estado de Cuenta</span>
          </button>

          {/* Aplicar Abono */}
          <button
            type="button"
            onClick={() => setIsAplicarAbonoOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 shadow-2xs"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>Aplicar Abono</span>
          </button>

          {/* Notas */}
          <button
            type="button"
            onClick={() => setIsNotasOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 shadow-2xs"
          >
            <Send className="w-3.5 h-3.5 text-amber-600" />
            <span>Notas</span>
          </button>

          <div className="h-4 w-px bg-slate-200 shrink-0" />

          {/* Asignar Abogado (Botón Nuevo Destacado) */}
          <button
            type="button"
            onClick={() => setIsAsignarAbogadoOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer active:scale-95"
          >
            <Gavel className="w-3.5 h-3.5" />
            <span>Asignar abogado</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. TARJETAS DE KPIS MACRO DE CARTERA LEGAL               */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Cartera Demandada
            </span>
            <div className="text-lg sm:text-xl font-black text-slate-900 font-mono mt-0.5">
              {formatMoney(totales.importeTotal)}
            </div>
            <span className="text-[10px] text-slate-500 font-medium">
              {filteredData.length} contratos en litigio activo
            </span>
          </div>
          <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl border border-rose-200/80">
            <Scale className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Saldo Actual en Juicio
            </span>
            <div className="text-lg sm:text-xl font-black text-rose-700 font-mono mt-0.5">
              {formatMoney(totales.saldoActual)}
            </div>
            <span className="text-[10px] text-rose-600 font-bold">
              Capital: {formatMoney(totales.capital)}
            </span>
          </div>
          <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl border border-rose-200/80">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Saldo Atrasado / Mora
            </span>
            <div className="text-lg sm:text-xl font-black text-rose-800 font-mono mt-0.5">
              {formatMoney(totales.saldoAtrasado)}
            </div>
            <span className="text-[10px] text-slate-500 font-medium">
              Interés: {formatMoney(totales.interes)}
            </span>
          </div>
          <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl border border-rose-200/80">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Recuperado en Juicio
            </span>
            <div className="text-lg sm:text-xl font-black text-emerald-700 font-mono mt-0.5">
              {formatMoney(totales.abonos)}
            </div>
            <span className="text-[10px] text-emerald-600 font-bold">
              Abonos judiciales aplicados
            </span>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200/80">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. BUSCADOR GENERAL                                      */}
      {/* ======================================================== */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por Contrato, Distribuidora, Persona ID o Abogado asignado..."
            value={searchGlobal}
            onChange={(e) => setSearchGlobal(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
          {searchGlobal && (
            <button
              onClick={() => setSearchGlobal('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-bold">Contrato seleccionado:</span>
          <span className="font-mono font-black text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
            #{selectedItem?.contratoId} • {selectedItem?.nombreCompleto}
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. TABLA PRINCIPAL DE CARTERA LEGAL                      */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col min-h-0">
        <div tabIndex={0} role="region" aria-label="Tabla de Global Cartera Legal" className="overflow-x-auto scrollbar-thin focus:outline-none focus:ring-1 focus:ring-rose-500">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap font-sans">
            <thead className="sticky top-0 bg-slate-100/95 backdrop-blur-xs text-slate-700 uppercase text-[10px] tracking-wider font-extrabold select-none border-b border-slate-200 z-10">
              <tr>
                <th className="px-2.5 py-2.5 text-center w-10">Sel</th>
                <th className="px-3 py-2.5">Fecha Legal ▲</th>
                <th className="px-3 py-2.5 text-center">Contrato</th>
                <th className="px-3 py-2.5 text-center">Distribuidor ID</th>
                <th className="px-3 py-2.5 text-center">No. Dist</th>
                <th className="px-3 py-2.5 text-center">Persona ID</th>
                <th className="px-3 py-2.5">Nombre Completo</th>
                <th className="px-3 py-2.5 text-center">Nivel</th>
                <th className="px-3 py-2.5 text-right">Importe Total</th>
                <th className="px-3 py-2.5 text-right">Saldo Actual</th>
                <th className="px-3 py-2.5 text-right">Saldo Atrasado</th>
                <th className="px-3 py-2.5 text-right">Línea Crédito Adic</th>
                <th className="px-3 py-2.5 text-right">Capital</th>
                <th className="px-3 py-2.5 text-right">Interés</th>
                <th className="px-3 py-2.5 text-right">Seguro</th>
                <th className="px-3 py-2.5 text-right">IVA</th>
                <th className="px-3 py-2.5 text-right">Abonos</th>
                <th className="px-3 py-2.5 text-center">Días Atraso</th>
                <th className="px-3 py-2.5 text-center">Días Máx</th>
                <th className="px-3 py-2.5">Abogado Asignado</th>
                <th className="px-3 py-2.5 text-center">Estatus Juicio</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-mono">
              {groupedData.length === 0 ? (
                <tr>
                  <td colSpan={21} className="py-12 text-center text-slate-400 font-sans">
                    No se encontraron contratos en cartera legal con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                groupedData.map((sucGroup) => (
                  <React.Fragment key={sucGroup.sucursal}>
                    {/* Encabezado Grupo 1: Sucursal */}
                    <tr className="bg-slate-100/90 text-slate-800 font-extrabold text-xs border-y border-slate-200">
                      <td colSpan={21} className="px-3 py-2 font-sans">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>Sucursal: {sucGroup.sucursal}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-white rounded-full border border-slate-200 text-slate-600">
                            {sucGroup.coordinadores.reduce((acc, c) => acc + c.items.length, 0)} contratos en demanda
                          </span>
                        </div>
                      </td>
                    </tr>

                    {sucGroup.coordinadores.map((coordGroup) => (
                      <React.Fragment key={`${sucGroup.sucursal}-${coordGroup.coordinador}`}>
                        {/* Encabezado Grupo 2: Coordinador */}
                        <tr className="bg-slate-50/90 text-slate-800 font-bold text-xs border-y border-slate-200">
                          <td colSpan={21} className="px-3 py-2 pl-6 font-sans">
                            <div className="flex items-center gap-2">
                              <Gavel className="w-3.5 h-3.5 text-rose-600" />
                              <span>Coordinador Jurídico: {coordGroup.coordinador}</span>
                              <span className="text-[10px] font-mono px-2 py-0.5 bg-white rounded-full border border-slate-200 text-slate-600 font-bold">
                                {coordGroup.items.length} contratos
                              </span>
                            </div>
                          </td>
                        </tr>

                        {/* Filas de Contratos Legales */}
                        {coordGroup.items.map((c) => {
                          const isSelected = selectedRowId === c.id;
                          return (
                            <tr
                              key={c.id}
                              onClick={() => setSelectedRowId(c.id)}
                              onDoubleClick={() => setIsDetallesOpen(true)}
                              className={`transition-colors cursor-pointer select-none ${
                                isSelected
                                  ? 'bg-rose-100/80 font-bold text-slate-900'
                                  : 'hover:bg-rose-50/50 bg-rose-50/20 text-slate-800'
                              }`}
                            >
                              {/* Radio selector */}
                              <td className="px-2.5 py-2 text-center">
                                <input
                                  type="radio"
                                  name="selectedLegalContract"
                                  checked={isSelected}
                                  onChange={() => setSelectedRowId(c.id)}
                                  className="w-3.5 h-3.5 text-rose-600 cursor-pointer"
                                />
                              </td>

                              {/* Fecha Legal */}
                              <td className="px-3 py-2 text-[11px] text-slate-600">{c.fechaLegal}</td>

                              {/* Contrato ID */}
                              <td className="px-3 py-2 text-center font-bold text-rose-700">#{c.contratoId}</td>

                              {/* Distribuidor ID */}
                              <td className="px-3 py-2 text-center font-bold text-slate-900">{c.distribuidorId}</td>

                              {/* Numero Dist */}
                              <td className="px-3 py-2 text-center font-bold text-slate-900">{c.numeroDist}</td>

                              {/* Persona ID */}
                              <td className="px-3 py-2 text-center text-slate-500 font-mono">#{c.personaId}</td>

                              {/* Nombre Completo */}
                              <td className="px-3 py-2 font-sans font-bold text-slate-950 whitespace-nowrap">
                                {c.nombreCompleto}
                              </td>

                              {/* Nivel */}
                              <td className="px-3 py-2 text-center">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-2xs ${
                                    c.distribuidorNivel === 'ORO'
                                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                                      : c.distribuidorNivel === 'PLATA'
                                      ? 'bg-slate-100 text-slate-700 border-slate-200'
                                      : 'bg-orange-50 text-orange-800 border-orange-200'
                                  }`}
                                >
                                  {c.distribuidorNivel}
                                </span>
                              </td>

                              {/* Importe Total */}
                              <td className="px-3 py-2 text-right font-bold text-slate-900">{formatMoney(c.importeTotal)}</td>

                              {/* Saldo Actual */}
                              <td className="px-3 py-2 text-right font-bold text-rose-700">{formatMoney(c.saldoActual)}</td>

                              {/* Saldo Atrasado */}
                              <td className="px-3 py-2 text-right font-bold text-rose-800 bg-rose-50/60">
                                {formatMoney(c.saldoAtrasado)}
                              </td>

                              {/* Línea Crédito Adic */}
                              <td className="px-3 py-2 text-right text-slate-600">{formatMoney(c.lineaCreditoAdic)}</td>

                              {/* Capital */}
                              <td className="px-3 py-2 text-right text-slate-700">{formatMoney(c.capital)}</td>

                              {/* Interes */}
                              <td className="px-3 py-2 text-right text-slate-600">{formatMoney(c.interes)}</td>

                              {/* Seguro */}
                              <td className="px-3 py-2 text-right text-slate-600">{formatMoney(c.seguro)}</td>

                              {/* IVA */}
                              <td className="px-3 py-2 text-right text-slate-600">{formatMoney(c.iva)}</td>

                              {/* Abonos */}
                              <td className="px-3 py-2 text-right font-bold text-emerald-700">{formatMoney(c.abonos)}</td>

                              {/* Días Atraso */}
                              <td className="px-3 py-2 text-center">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                  {c.diasAtraso} d
                                </span>
                              </td>

                              {/* Días Atraso Max */}
                              <td className="px-3 py-2 text-center text-slate-600">{c.diasAtrasoMax} d</td>

                              {/* Abogado Asignado */}
                              <td className="px-3 py-2 font-sans text-xs text-slate-800 font-medium">
                                <div className="flex items-center gap-1.5">
                                  <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                  <span className="truncate max-w-[180px]">{c.abogadoAsignado}</span>
                                </div>
                              </td>

                              {/* Estatus Juicio */}
                              <td className="px-3 py-2 text-center font-sans">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                    c.estatusJuicio === 'DEMANDA_RADICADA'
                                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                      : c.estatusJuicio === 'EMBARGO_PRECAUTORIO'
                                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                      : c.estatusJuicio === 'EN_CONVENIO_JUDICIAL'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                                  }`}
                                >
                                  {c.estatusJuicio.replace(/_/g, ' ')}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </React.Fragment>
                ))
              )}
            </tbody>

            {/* Fila de Totales Generales */}
            <tfoot className="bg-slate-100 font-extrabold font-mono text-xs border-t-2 border-slate-300 text-slate-950">
              <tr>
                <td colSpan={8} className="px-4 py-2.5 font-sans text-right uppercase tracking-wider text-slate-700">
                  Total Cartera Legal Demandada:
                </td>
                <td className="px-3 py-2.5 text-right text-slate-950">{formatMoney(totales.importeTotal)}</td>
                <td className="px-3 py-2.5 text-right text-rose-700">{formatMoney(totales.saldoActual)}</td>
                <td className="px-3 py-2.5 text-right text-rose-800 bg-rose-50/80">{formatMoney(totales.saldoAtrasado)}</td>
                <td className="px-3 py-2.5 text-right text-slate-600">-</td>
                <td className="px-3 py-2.5 text-right">{formatMoney(totales.capital)}</td>
                <td className="px-3 py-2.5 text-right">{formatMoney(totales.interes)}</td>
                <td className="px-3 py-2.5 text-right">{formatMoney(totales.seguro)}</td>
                <td className="px-3 py-2.5 text-right">{formatMoney(totales.iva)}</td>
                <td className="px-3 py-2.5 text-right text-emerald-700">{formatMoney(totales.abonos)}</td>
                <td colSpan={4} className="px-3 py-2.5"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Barra de Paginación auténtica estilo legacy */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 font-sans">
          <div className="flex items-center gap-2">
            <span>
              Página <strong>1</strong> de <strong>56</strong> ({totales.totalElementos} elementos)
            </span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <button className="px-2 py-1 rounded bg-white border border-slate-200 text-slate-400 hover:text-slate-600">
              |&lt;
            </button>
            <button className="px-2.5 py-1 rounded bg-rose-600 text-white font-bold shadow-2xs">
              1
            </button>
            <button className="px-2 py-1 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700">
              2
            </button>
            <button className="px-2 py-1 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700">
              3
            </button>
            <button className="px-2 py-1 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700">
              4
            </button>
            <span className="px-1 text-slate-400">...</span>
            <button className="px-2 py-1 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700">
              55
            </button>
            <button className="px-2 py-1 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700">
              56
            </button>
            <button className="px-2 py-1 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700">
              &gt;|
            </button>
            <button className="px-2 py-1 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 ml-1">
              All
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL: ASIGNAR ABOGADO                                   */}
      {/* ======================================================== */}
      {isAsignarAbogadoOpen && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150 font-sans">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Gavel className="w-4 h-4 text-rose-600" />
                <span>Asignar Abogado • Contrato #{selectedItem.contratoId}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAsignarAbogadoOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGuardarAsignacion} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-rose-700 block">Distribuidor Demandado:</span>
                <strong className="text-slate-900 text-xs block">{selectedItem.nombreCompleto}</strong>
                <div className="flex justify-between text-[11px] font-mono text-slate-600 pt-1">
                  <span>Saldo Atrasado: <strong>{formatMoney(selectedItem.saldoAtrasado)}</strong></span>
                  <span>Días de Mora: <strong className="text-rose-700">{selectedItem.diasAtraso} días</strong></span>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Abogado / Despacho Responsable:</label>
                <select
                  value={abogadoSeleccionado}
                  onChange={(e) => setAbogadoSeleccionado(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
                >
                  <option value="Lic. Antonio Aguirre López (Jurídico Core)">Lic. Antonio Aguirre López (Jurídico Core)</option>
                  <option value="Lic. Fernando Valenzuela Ramos">Lic. Fernando Valenzuela Ramos (Litigio Mercantil)</option>
                  <option value="Lic. Claudia Rosales Mendoza">Lic. Claudia Rosales Mendoza (Ejecución y Embargos)</option>
                  <option value="Lic. Roberto Cárdenas Morales">Lic. Roberto Cárdenas Morales (Convenios Judiciales)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Estatus del Juicio:</label>
                <select
                  value={nuevoEstatusJuicio}
                  onChange={(e) => setNuevoEstatusJuicio(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
                >
                  <option value="DEMANDA_RADICADA">Demanda Radicada</option>
                  <option value="EN_NOTIFICACION">En Notificación</option>
                  <option value="EMBARGO_PRECAUTORIO">Embargo Precautorio</option>
                  <option value="EN_CONVENIO_JUDICIAL">En Convenio Judicial</option>
                  <option value="DICTAMEN_SENTENCIA">Dictamen / Sentencia</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Observaciones o Acuerdo Procesal:</label>
                <textarea
                  rows={3}
                  placeholder="Detalles sobre radicación del juzgado, auto admisorio, fecha de diligencia..."
                  value={notasJuridicas}
                  onChange={(e) => setNotasJuridicas(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500 font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAsignarAbogadoOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-2xs cursor-pointer active:scale-95"
                >
                  Guardar Asignación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: APLICAR ABONO JUDICIAL                            */}
      {/* ======================================================== */}
      {isAplicarAbonoOpen && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150 font-sans">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Aplicar Abono Judicial • Contrato #{selectedItem.contratoId}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAplicarAbonoOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGuardarAbono} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-blue-700 block">Distribuidora:</span>
                <strong className="text-slate-900 text-xs block">{selectedItem.nombreCompleto}</strong>
                <span className="text-[11px] font-mono text-slate-600">Saldo Demandado: {formatMoney(selectedItem.saldoActual)}</span>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Monto del Abono Judicial ($):</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={montoAbono}
                  onChange={(e) => setMontoAbono(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAplicarAbonoOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-2xs cursor-pointer active:scale-95"
                >
                  Aplicar Abono
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. MODALES OPERACIONALES CONECTADOS                      */}
      {/* ======================================================== */}

      {/* MODAL DETALLES */}
      {isDetallesOpen && selectedItem && (
        <DetallesCarteraModal
          isOpen={isDetallesOpen}
          onClose={() => setIsDetallesOpen(false)}
          distribuidor={selectedItem}
          currentUser={currentUser}
        />
      )}

      {/* MODAL RELACION */}
      {isRelacionOpen && selectedItem && (
        <RelacionCobranzaModal
          isOpen={isRelacionOpen}
          onClose={() => setIsRelacionOpen(false)}
          distribuidor={selectedItem}
        />
      )}

      {/* MODAL ESTADO DE CUENTA */}
      {isEstadoCuentaOpen && selectedItem && (
        <EstadoCuentaDistribuidorModal
          isOpen={isEstadoCuentaOpen}
          onClose={() => setIsEstadoCuentaOpen(false)}
          distribuidor={selectedItem}
          currentUser={currentUser}
        />
      )}

      {/* MODAL NOTAS */}
      {isNotasOpen && selectedItem && (
        <NotasCarteraModal
          isOpen={isNotasOpen}
          onClose={() => setIsNotasOpen(false)}
          distribuidor={selectedItem}
          currentUser={currentUser}
        />
      )}

      {/* Floating feedback toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[120] bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
