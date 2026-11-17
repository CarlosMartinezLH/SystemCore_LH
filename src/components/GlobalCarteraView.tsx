'use client';

import React, { useState, useMemo } from 'react';
import { UserSession } from '@/types/auth';
import {
  CarteraItem,
  INITIAL_CARTERA_DATA,
} from '@/lib/data/carteraData';
import {
  Wallet,
  Search,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  CreditCard,
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  X,
  ChevronDown,
  ChevronRight,
  Filter,
  Eye,
  Layers,
  ArrowUpDown,
  UserCheck,
  Building2,
  ShieldAlert,
  Send,
  Printer,
  Plus,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { formatMoney } from '@/lib/utils/formatters';

interface GlobalCarteraViewProps {
  currentUser?: UserSession | null;
  initialFilter?: 'TODA' | 'VIGENTE' | 'ATRASO' | 'LEGAL' | 'LIQUIDADA';
}

export default function GlobalCarteraView({
  currentUser,
  initialFilter = 'TODA',
}: GlobalCarteraViewProps) {
  const [carteraData, setCarteraData] = useState<CarteraItem[]>(INITIAL_CARTERA_DATA);
  const [selectedFecha, setSelectedFecha] = useState('2026-11-17');
  const [tipoFiltro, setTipoFiltro] = useState<'TODA' | 'VIGENTE' | 'ATRASO' | 'LEGAL' | 'LIQUIDADA'>(initialFilter);
  const [searchGlobal, setSearchGlobal] = useState('');
  const [selectedSucursal, setSelectedSucursal] = useState('ALL');
  const [selectedCoordinador, setSelectedCoordinador] = useState('ALL');

  // Filtros por Columna individual
  const [colFilterZona, setColFilterZona] = useState('');
  const [colFilterSubzona, setColFilterSubzona] = useState('');
  const [colFilterContrato, setColFilterContrato] = useState('');
  const [colFilterDistribuidor, setColFilterDistribuidor] = useState('');
  const [colFilterPersonaId, setColFilterPersonaId] = useState('');
  const [colFilterNombre, setColFilterNombre] = useState('');
  const [colFilterNivel, setColFilterNivel] = useState('ALL');

  // Fila seleccionada para acciones
  const [selectedRowId, setSelectedRowId] = useState<string | null>(carteraData[0]?.id || null);

  // Modales
  const [isDetallesOpen, setIsDetallesOpen] = useState(false);
  const [isEstadoCuentaOpen, setIsEstadoCuentaOpen] = useState(false);
  const [isAplicarAbonoOpen, setIsAplicarAbonoOpen] = useState(false);
  const [isNotasOpen, setIsNotasOpen] = useState(false);
  const [isRelacionOpen, setIsRelacionOpen] = useState(false);

  // Formulario Aplicar Abono
  const [abonoMonto, setAbonoMonto] = useState('');
  const [abonoMetodo, setAbonoMetodo] = useState<'TRANSFERENCIA_STP' | 'EFECTIVO_SUCURSAL' | 'DEPOSITO_BANCARIO'>('TRANSFERENCIA_STP');
  const [abonoReferencia, setAbonoReferencia] = useState('');

  // Formulario Nueva Nota
  const [nuevaNotaTexto, setNuevaNotaTexto] = useState('');

  // Toast feedback
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Selected item object
  const selectedItem = useMemo(() => {
    return carteraData.find((c) => c.id === selectedRowId) || carteraData[0] || null;
  }, [carteraData, selectedRowId]);

  // Lista de sucursales únicas
  const sucursalesList = useMemo(() => {
    const set = new Set<string>();
    carteraData.forEach((c) => set.add(c.sucursal));
    return Array.from(set).sort();
  }, [carteraData]);

  // Lista de coordinadores únicos
  const coordinadoresList = useMemo(() => {
    const set = new Set<string>();
    carteraData.forEach((c) => set.add(c.coordinador));
    return Array.from(set).sort();
  }, [carteraData]);

  // Filtrado reactivo completo
  const filteredData = useMemo(() => {
    return carteraData.filter((item) => {
      // Filtro tipo cartera
      if (tipoFiltro === 'VIGENTE' && item.tipoCartera !== 'VIGENTE') return false;
      if (tipoFiltro === 'ATRASO' && item.tipoCartera !== 'ATRASO') return false;
      if (tipoFiltro === 'LEGAL' && item.tipoCartera !== 'LEGAL') return false;
      if (tipoFiltro === 'LIQUIDADA' && item.tipoCartera !== 'LIQUIDADA') return false;

      // Filtro Sucursal
      if (selectedSucursal !== 'ALL' && item.sucursal !== selectedSucursal) return false;

      // Filtro Coordinador
      if (selectedCoordinador !== 'ALL' && item.coordinador !== selectedCoordinador) return false;

      // Filtro Global
      if (searchGlobal.trim()) {
        const q = searchGlobal.toLowerCase().trim();
        const matchesGlobal =
          item.nombreCompleto.toLowerCase().includes(q) ||
          String(item.contratoId).includes(q) ||
          String(item.distribuidorId).includes(q) ||
          String(item.numeroDist).includes(q) ||
          String(item.personaId).includes(q) ||
          item.sucursal.toLowerCase().includes(q) ||
          item.coordinador.toLowerCase().includes(q) ||
          item.subzona.toLowerCase().includes(q);
        if (!matchesGlobal) return false;
      }

      // Filtros individuales de columna
      if (colFilterZona.trim() && !item.zona.toLowerCase().includes(colFilterZona.toLowerCase().trim())) {
        return false;
      }
      if (colFilterSubzona.trim() && !item.subzona.toLowerCase().includes(colFilterSubzona.toLowerCase().trim())) {
        return false;
      }
      if (colFilterContrato.trim() && !String(item.contratoId).includes(colFilterContrato.trim())) {
        return false;
      }
      if (colFilterDistribuidor.trim() && !String(item.distribuidorId).includes(colFilterDistribuidor.trim())) {
        return false;
      }
      if (colFilterPersonaId.trim() && !String(item.personaId).includes(colFilterPersonaId.trim())) {
        return false;
      }
      if (colFilterNombre.trim() && !item.nombreCompleto.toLowerCase().includes(colFilterNombre.toLowerCase().trim())) {
        return false;
      }
      if (colFilterNivel !== 'ALL' && item.distribuidorNivel !== colFilterNivel) {
        return false;
      }

      return true;
    });
  }, [
    carteraData,
    tipoFiltro,
    selectedSucursal,
    selectedCoordinador,
    searchGlobal,
    colFilterZona,
    colFilterSubzona,
    colFilterContrato,
    colFilterDistribuidor,
    colFilterPersonaId,
    colFilterNombre,
    colFilterNivel,
  ]);

  // Agrupamiento por Sucursal y Coordinador
  const groupedData = useMemo(() => {
    const groups: {
      sucursal: string;
      coordinadores: {
        coordinador: string;
        items: CarteraItem[];
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

  // Totales
  const totales = useMemo(() => {
    return filteredData.reduce(
      (acc, item) => ({
        importeTotal: acc.importeTotal + item.importeTotal,
        saldoActual: acc.saldoActual + item.saldoActual,
        saldoAtrasado: acc.saldoAtrasado + item.saldoAtrasado,
        lineaCreditoAdic: acc.lineaCreditoAdic + item.lineaCreditoAdic,
        capital: acc.capital + item.capital,
        interes: acc.interes + item.interes,
        seguro: acc.seguro + item.seguro,
        iva: acc.iva + item.iva,
      }),
      {
        importeTotal: 0,
        saldoActual: 0,
        saldoAtrasado: 0,
        lineaCreditoAdic: 0,
        capital: 0,
        interes: 0,
        seguro: 0,
        iva: 0,
      }
    );
  }, [filteredData]);

  // Paginación real
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // Exportar a Excel (SheetJS XLSX)
  const handleExportExcel = () => {
    const exportRows = filteredData.map((c) => ({
      'Zona ID': c.zonaId,
      Zona: c.zona,
      'Subzona ID': c.subzonaId,
      Subzona: c.subzona,
      'Contrato ID': c.contratoId,
      'Distribuidor ID': c.distribuidorId,
      'Numero Dist': c.numeroDist,
      'Persona ID': c.personaId,
      'Nombre Completo': c.nombreCompleto,
      'Distribuidor Nivel': c.distribuidorNivel,
      'Importe Total': c.importeTotal,
      'Saldo Actual': c.saldoActual,
      'Saldo Atrasado': c.saldoAtrasado,
      'Línea Crédito Adic': c.lineaCreditoAdic,
      Capital: c.capital,
      Interes: c.interes,
      Seguro: c.seguro,
      IVA: c.iva,
      Sucursal: c.sucursal,
      Coordinador: c.coordinador,
      Estatus: c.tipoCartera,
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Global_Cartera');
    XLSX.writeFile(wb, `global_cartera_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showToast('Archivo Excel descargado exitosamente.');
  };

  // Aplicar Abono Handler
  const handleGuardarAbono = (e: React.FormEvent) => {
    e.preventDefault();
    const montoNum = parseFloat(abonoMonto);
    if (isNaN(montoNum) || montoNum <= 0) {
      showToast('Por favor introduce un monto de abono válido.', 'error');
      return;
    }
    if (!selectedItem) return;

    setCarteraData((prev) =>
      prev.map((item) => {
        if (item.id === selectedItem.id) {
          const nuevoSaldoActual = Math.max(0, item.saldoActual - montoNum);
          const nuevoSaldoAtrasado = Math.max(0, item.saldoAtrasado - montoNum);
          return {
            ...item,
            saldoActual: nuevoSaldoActual,
            saldoAtrasado: nuevoSaldoAtrasado,
            ultimoPagoFecha: new Date().toLocaleDateString('es-MX'),
            ultimoPagoMonto: montoNum,
            tipoCartera: nuevoSaldoAtrasado === 0 ? 'VIGENTE' : item.tipoCartera,
          };
        }
        return item;
      })
    );

    showToast(`✓ Abono de ${formatMoney(montoNum)} aplicado exitosamente a Contrato #${selectedItem.contratoId}.`);
    setIsAplicarAbonoOpen(false);
    setAbonoMonto('');
    setAbonoReferencia('');
  };

  // Guardar Nota de Cobranza
  const handleGuardarNota = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaNotaTexto.trim() || !selectedItem) return;

    const nuevaNota = {
      id: `nota-${Date.now()}`,
      fecha: new Date().toLocaleString('es-MX'),
      autor: currentUser?.name || 'Gestor de Cartera',
      texto: nuevaNotaTexto.trim(),
    };

    setCarteraData((prev) =>
      prev.map((item) => {
        if (item.id === selectedItem.id) {
          return {
            ...item,
            notasCobranza: [nuevaNota, ...(item.notasCobranza || [])],
          };
        }
        return item;
      })
    );

    showToast('Nota de cobranza agregada exitosamente.');
    setNuevaNotaTexto('');
  };

  return (
    <div className="flex-1 bg-slate-50 text-slate-800 flex flex-col min-h-0 overflow-y-auto font-sans p-3 sm:p-5 lg:p-6 space-y-4">
      {/* ======================================================== */}
      {/* 1. ENCABEZADO Y BARRA SUPERIOR DE ACCIONES               */}
      {/* ======================================================== */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
        {/* Fila 1: Título, Fecha y Selector de Tipo de Cartera */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/80 shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  Cartera Central
                </span>
                <span className="text-[11px] text-slate-400">
                  Total Registros: <strong className="text-slate-700 font-bold">{filteredData.length}</strong>
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-0.5">
                Global Cartera
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Selector de Fecha */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-500 font-bold">Fecha:</span>
              <input
                type="date"
                value={selectedFecha}
                onChange={(e) => setSelectedFecha(e.target.value)}
                className="bg-transparent font-mono font-bold text-slate-800 focus:outline-none cursor-pointer"
              />
            </div>

            {/* Selector de Filtro de Cartera (Legacy dropdown replica) */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 font-medium">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-slate-500 font-bold">Filtro:</span>
              <select
                value={tipoFiltro}
                onChange={(e) => setTipoFiltro(e.target.value as any)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer text-xs uppercase"
              >
                <option value="TODA">TODA LA CARTERA</option>
                <option value="VIGENTE">AL CORRIENTE (VIGENTE)</option>
                <option value="ATRASO">CON ATRASO (EN MORA)</option>
                <option value="LEGAL">CARTERA LEGAL</option>
                <option value="LIQUIDADA">LIQUIDADA</option>
              </select>
            </div>
          </div>
        </div>

        {/* Fila 2: Botones de Acción (Idénticos al Sistema Legado) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs select-none">
          {/* Actualizar */}
          <button
            type="button"
            onClick={() => showToast('Cartera actualizada con los últimos registros de Core.')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
            title="Refrescar catálogo"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
            <span>Actualizar</span>
          </button>

          {/* Exportar a excel */}
          <button
            type="button"
            onClick={handleExportExcel}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
            title="Exportar a Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Exportar a excel</span>
          </button>

          <div className="h-4 w-px bg-slate-200 shrink-0" />

          {/* Detalles */}
          <button
            type="button"
            onClick={() => {
              if (!selectedItem) {
                showToast('Selecciona un registro de la tabla para ver sus detalles.', 'error');
                return;
              }
              setIsDetallesOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-600" />
            <span>Detalles</span>
          </button>

          {/* Relación */}
          <button
            type="button"
            onClick={() => {
              if (!selectedItem) {
                showToast('Selecciona un registro para ver la relación de vales.', 'error');
                return;
              }
              setIsRelacionOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Relación</span>
          </button>

          {/* Estado de Cuenta */}
          <button
            type="button"
            onClick={() => {
              if (!selectedItem) {
                showToast('Selecciona un registro para consultar su estado de cuenta.', 'error');
                return;
              }
              setIsEstadoCuentaOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
          >
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            <span>Estado de Cuenta</span>
          </button>

          {/* Aplicar Abono */}
          <button
            type="button"
            onClick={() => {
              if (!selectedItem) {
                showToast('Selecciona un registro para aplicar un abono.', 'error');
                return;
              }
              setIsAplicarAbonoOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer active:scale-95"
          >
            <DollarSign className="w-3.5 h-3.5 text-white" />
            <span>Aplicar Abono</span>
          </button>

          {/* Notas */}
          <button
            type="button"
            onClick={() => {
              if (!selectedItem) {
                showToast('Selecciona un registro para revisar las notas.', 'error');
                return;
              }
              setIsNotasOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
          >
            <Send className="w-3.5 h-3.5 text-amber-600" />
            <span>Notas ({selectedItem?.notasCobranza?.length || 0})</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. TARJETAS DE KPIS MACRO DE CARTERA                    */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Importe Total Cartera
            </span>
            <div className="text-lg sm:text-xl font-black text-slate-900 font-mono mt-0.5">
              {formatMoney(totales.importeTotal)}
            </div>
            <span className="text-[10px] text-slate-500 font-medium">
              {filteredData.length} contratos activos
            </span>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl border border-blue-200/80">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Saldo Actual Vigente
            </span>
            <div className="text-lg sm:text-xl font-black text-emerald-700 font-mono mt-0.5">
              {formatMoney(totales.saldoActual)}
            </div>
            <span className="text-[10px] text-emerald-600 font-bold">
              Capital: {formatMoney(totales.capital)}
            </span>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200/80">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Saldo Atrasado / Mora
            </span>
            <div className="text-lg sm:text-xl font-black text-rose-700 font-mono mt-0.5">
              {formatMoney(totales.saldoAtrasado)}
            </div>
            <span className="text-[10px] text-rose-600 font-bold">
              {filteredData.filter((i) => i.saldoAtrasado > 0).length} contratos con mora
            </span>
          </div>
          <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl border border-rose-200/80">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Línea Adicional Disponible
            </span>
            <div className="text-lg sm:text-xl font-black text-indigo-700 font-mono mt-0.5">
              {formatMoney(totales.lineaCreditoAdic)}
            </div>
            <span className="text-[10px] text-slate-500 font-medium">
              Cupo operativo disponible
            </span>
          </div>
          <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-200/80">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. BUSCADOR GENERAL Y AGRUPADORES                        */}
      {/* ======================================================== */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Buscador General */}
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Introduzca el texto a buscar (Contrato, Distribuidor, Nombre, Persona ID)..."
            value={searchGlobal}
            onChange={(e) => setSearchGlobal(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
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

        {/* Selectores de Agrupamiento Rápido */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sucursal */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-600">Sucursal:</span>
            <select
              value={selectedSucursal}
              onChange={(e) => {
                setSelectedSucursal(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Todas las Sucursales</option>
              {sucursalesList.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Coordinador */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-600">Coordinador:</span>
            <select
              value={selectedCoordinador}
              onChange={(e) => {
                setSelectedCoordinador(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Todos los Coordinadores</option>
              {coordinadoresList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. TABLA PRINCIPAL DE CARTERA CON AGRUPACIONES           */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col min-h-0">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
            {/* Encabezado Superior con Columnas Legadas */}
            <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] tracking-wider font-extrabold select-none border-b border-slate-200">
              <tr>
                <th className="px-2.5 py-2 text-center w-10">Sel</th>
                <th className="px-2.5 py-2">zonaId</th>
                <th className="px-2.5 py-2">zona</th>
                <th className="px-2.5 py-2">subzonaId</th>
                <th className="px-2.5 py-2">subzona</th>
                <th className="px-2.5 py-2 text-center">Contrato ID</th>
                <th className="px-2.5 py-2 text-center">Distribuidor ID</th>
                <th className="px-2.5 py-2 text-center">Numero Dist</th>
                <th className="px-2.5 py-2 text-center">Persona ID</th>
                <th className="px-2.5 py-2">Nombre Completo</th>
                <th className="px-2.5 py-2 text-center">Distribuidor Nivel</th>
                <th className="px-2.5 py-2 text-right">Importe Total</th>
                <th className="px-2.5 py-2 text-right">Saldo Actual</th>
                <th className="px-2.5 py-2 text-right">saldo Atrasado</th>
                <th className="px-2.5 py-2 text-right">Linea Credito Adic</th>
                <th className="px-2.5 py-2 text-right">Capital</th>
                <th className="px-2.5 py-2 text-right">Interes</th>
                <th className="px-2.5 py-2 text-right">Seguro</th>
                <th className="px-2.5 py-2 text-right">IVA</th>
              </tr>

              {/* Fila de Filtros individuales por columna (Idéntico a imagen legada) */}
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-normal">
                <th className="p-1 text-center"></th>
                <th className="p-1">
                  <input
                    type="text"
                    placeholder="Filtrar..."
                    value={colFilterZona}
                    onChange={(e) => setColFilterZona(e.target.value)}
                    className="w-16 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[11px]"
                  />
                </th>
                <th className="p-1">
                  <input
                    type="text"
                    placeholder="Filtrar..."
                    value={colFilterZona}
                    onChange={(e) => setColFilterZona(e.target.value)}
                    className="w-20 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[11px]"
                  />
                </th>
                <th className="p-1">
                  <input
                    type="text"
                    placeholder="Filtrar..."
                    value={colFilterSubzona}
                    onChange={(e) => setColFilterSubzona(e.target.value)}
                    className="w-16 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[11px]"
                  />
                </th>
                <th className="p-1">
                  <input
                    type="text"
                    placeholder="Filtrar..."
                    value={colFilterSubzona}
                    onChange={(e) => setColFilterSubzona(e.target.value)}
                    className="w-24 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[11px]"
                  />
                </th>
                <th className="p-1 text-center">
                  <input
                    type="text"
                    placeholder="ID..."
                    value={colFilterContrato}
                    onChange={(e) => setColFilterContrato(e.target.value)}
                    className="w-16 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[11px] text-center font-mono"
                  />
                </th>
                <th className="p-1 text-center">
                  <input
                    type="text"
                    placeholder="Dist..."
                    value={colFilterDistribuidor}
                    onChange={(e) => setColFilterDistribuidor(e.target.value)}
                    className="w-16 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[11px] text-center font-mono"
                  />
                </th>
                <th className="p-1 text-center">
                  <input
                    type="text"
                    placeholder="No..."
                    value={colFilterDistribuidor}
                    onChange={(e) => setColFilterDistribuidor(e.target.value)}
                    className="w-16 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[11px] text-center font-mono"
                  />
                </th>
                <th className="p-1 text-center">
                  <input
                    type="text"
                    placeholder="Per ID..."
                    value={colFilterPersonaId}
                    onChange={(e) => setColFilterPersonaId(e.target.value)}
                    className="w-16 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[11px] text-center font-mono"
                  />
                </th>
                <th className="p-1">
                  <input
                    type="text"
                    placeholder="Nombre completo..."
                    value={colFilterNombre}
                    onChange={(e) => setColFilterNombre(e.target.value)}
                    className="w-36 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[11px]"
                  />
                </th>
                <th className="p-1 text-center">
                  <select
                    value={colFilterNivel}
                    onChange={(e) => setColFilterNivel(e.target.value)}
                    className="w-20 px-1 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-bold"
                  >
                    <option value="ALL">TODOS</option>
                    <option value="BRONCE">BRONCE</option>
                    <option value="PLATA">PLATA</option>
                    <option value="ORO">ORO</option>
                    <option value="PLATINO">PLATINO</option>
                    <option value="DIAMANTE">DIAMANTE</option>
                  </select>
                </th>
                <th className="p-1" colSpan={8}></th>
              </tr>
            </thead>

            {/* Cuerpo con Agrupaciones Jerárquicas */}
            <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
              {groupedData.length === 0 ? (
                <tr>
                  <td colSpan={19} className="p-8 text-center text-slate-400">
                    No se encontraron contratos que coincidan con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                groupedData.map((sucGroup) => (
                  <React.Fragment key={sucGroup.sucursal}>
                    {/* Encabezado Grupo 1: Sucursal (Idéntico a imagen legada) */}
                    <tr className="bg-slate-200/90 text-slate-800 font-black text-xs border-y border-slate-300">
                      <td colSpan={19} className="px-3 py-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-500 font-normal">-</span>
                          <span>Sucursal: {sucGroup.sucursal}</span>
                          <span className="text-[11px] font-normal text-slate-600">
                            (Total sucursal:{' '}
                            {sucGroup.coordinadores.reduce((acc, c) => acc + c.items.length, 0)} contratos)
                          </span>
                        </div>
                      </td>
                    </tr>

                    {sucGroup.coordinadores.map((coordGroup) => (
                      <React.Fragment key={`${sucGroup.sucursal}-${coordGroup.coordinador}`}>
                        {/* Encabezado Grupo 2: Coordinador (Idéntico a imagen legada) */}
                        <tr className="bg-slate-100/90 text-slate-800 font-bold text-xs border-y border-slate-200">
                          <td colSpan={19} className="px-3 py-1.5 pl-6">
                            <div className="flex items-center gap-2">
                              <input type="checkbox" className="w-3.5 h-3.5 rounded text-blue-600" />
                              <span>Coordinador: {coordGroup.coordinador}</span>
                              <span className="text-[10px] font-mono px-2 py-0.2 bg-white rounded-full border border-slate-300 text-slate-600">
                                {coordGroup.items.length} contratos
                              </span>
                            </div>
                          </td>
                        </tr>

                        {/* Filas de Contratos de este Coordinador */}
                        {coordGroup.items.map((c) => {
                          const isSelected = selectedRowId === c.id;
                          return (
                            <tr
                              key={c.id}
                              onClick={() => setSelectedRowId(c.id)}
                              className={`transition cursor-pointer select-none ${
                                isSelected
                                  ? 'bg-blue-100/70 font-semibold text-slate-900'
                                  : 'hover:bg-blue-50/40 text-slate-700'
                              }`}
                            >
                              {/* Checkbox / Indicador selección */}
                              <td className="px-2.5 py-2 text-center">
                                <input
                                  type="radio"
                                  name="selectedContract"
                                  checked={isSelected}
                                  onChange={() => setSelectedRowId(c.id)}
                                  className="w-3.5 h-3.5 text-blue-600 cursor-pointer"
                                />
                              </td>

                              {/* zonaId */}
                              <td className="px-2.5 py-2 font-mono text-[11px] text-slate-500">
                                {c.zonaId}
                              </td>

                              {/* zona */}
                              <td className="px-2.5 py-2 font-medium">{c.zona}</td>

                              {/* subzonaId */}
                              <td className="px-2.5 py-2 font-mono text-[11px] text-slate-500">
                                {c.subzonaId}
                              </td>

                              {/* subzona */}
                              <td className="px-2.5 py-2 font-medium">{c.subzona}</td>

                              {/* Contrato ID */}
                              <td className="px-2.5 py-2 text-center font-mono font-bold text-blue-700">
                                {c.contratoId}
                              </td>

                              {/* Distribuidor ID */}
                              <td className="px-2.5 py-2 text-center font-mono font-bold text-slate-900">
                                {c.distribuidorId}
                              </td>

                              {/* Numero Dist */}
                              <td className="px-2.5 py-2 text-center font-mono font-bold text-slate-900">
                                {c.numeroDist}
                              </td>

                              {/* Persona ID */}
                              <td className="px-2.5 py-2 text-center font-mono text-slate-600">
                                {c.personaId}
                              </td>

                              {/* Nombre Completo */}
                              <td className="px-2.5 py-2 font-bold text-slate-900 whitespace-nowrap">
                                {c.nombreCompleto}
                              </td>

                              {/* Distribuidor Nivel */}
                              <td className="px-2.5 py-2 text-center">
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                    c.distribuidorNivel === 'PLATINO' || c.distribuidorNivel === 'DIAMANTE'
                                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                      : c.distribuidorNivel === 'ORO'
                                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                      : c.distribuidorNivel === 'PLATA'
                                      ? 'bg-slate-200 text-slate-700 border border-slate-300'
                                      : 'bg-orange-50 text-orange-700 border border-orange-200'
                                  }`}
                                >
                                  {c.distribuidorNivel}
                                </span>
                              </td>

                              {/* Importe Total */}
                              <td className="px-2.5 py-2 text-right font-mono font-bold text-slate-900">
                                {formatMoney(c.importeTotal)}
                              </td>

                              {/* Saldo Actual */}
                              <td className="px-2.5 py-2 text-right font-mono font-bold text-slate-900">
                                {formatMoney(c.saldoActual)}
                              </td>

                              {/* saldo Atrasado */}
                              <td
                                className={`px-2.5 py-2 text-right font-mono font-bold ${
                                  c.saldoAtrasado > 0 ? 'text-rose-600 bg-rose-50/60' : 'text-slate-500'
                                }`}
                              >
                                {formatMoney(c.saldoAtrasado)}
                              </td>

                              {/* Linea Credito Adic */}
                              <td className="px-2.5 py-2 text-right font-mono text-slate-700">
                                {formatMoney(c.lineaCreditoAdic)}
                              </td>

                              {/* Capital */}
                              <td className="px-2.5 py-2 text-right font-mono text-slate-800">
                                {formatMoney(c.capital)}
                              </td>

                              {/* Interes */}
                              <td className="px-2.5 py-2 text-right font-mono text-slate-600">
                                {formatMoney(c.interes)}
                              </td>

                              {/* Seguro */}
                              <td className="px-2.5 py-2 text-right font-mono text-slate-600">
                                {formatMoney(c.seguro)}
                              </td>

                              {/* IVA */}
                              <td className="px-2.5 py-2 text-right font-mono text-slate-500">
                                {formatMoney(c.iva)}
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

            {/* Fila Fija de Totales (Idéntica al pie de la imagen legada) */}
            <tfoot className="sticky bottom-0 bg-slate-200/95 backdrop-blur-xs font-mono font-black text-xs text-slate-900 border-t-2 border-slate-300 z-10 select-none">
              <tr>
                <td colSpan={11} className="px-3 py-2.5 text-right font-sans uppercase font-bold text-slate-700">
                  Totales de Cartera ({filteredData.length} registros):
                </td>
                <td className="px-2.5 py-2.5 text-right">{formatMoney(totales.importeTotal)}</td>
                <td className="px-2.5 py-2.5 text-right">{formatMoney(totales.saldoActual)}</td>
                <td className="px-2.5 py-2.5 text-right text-rose-700">{formatMoney(totales.saldoAtrasado)}</td>
                <td className="px-2.5 py-2.5 text-right">{formatMoney(totales.lineaCreditoAdic)}</td>
                <td className="px-2.5 py-2.5 text-right">{formatMoney(totales.capital)}</td>
                <td className="px-2.5 py-2.5 text-right">{formatMoney(totales.interes)}</td>
                <td className="px-2.5 py-2.5 text-right">{formatMoney(totales.seguro)}</td>
                <td className="px-2.5 py-2.5 text-right">{formatMoney(totales.iva)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Paginación estilo sistema anterior */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
          <div>
            <span>
              Página {currentPage} de {totalPages} ({filteredData.length} elementos)
            </span>
          </div>
          <div className="flex items-center gap-1 font-semibold">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className={`px-2 py-1 rounded border text-[11px] ${
                currentPage <= 1
                  ? 'border-slate-200 bg-white text-slate-400 cursor-not-allowed'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 cursor-pointer'
              }`}
            >
              &lt; Anterior
            </button>
            <span className="px-2.5 py-1 bg-blue-600 text-white rounded font-bold text-[11px]">
              {currentPage}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className={`px-2 py-1 rounded border text-[11px] ${
                currentPage >= totalPages
                  ? 'border-slate-200 bg-white text-slate-400 cursor-not-allowed'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 cursor-pointer'
              }`}
            >
              Siguiente &gt;
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. MODALES OPERACIONALES                                 */}
      {/* ======================================================== */}

      {/* MODAL 1: DETALLES DE CARTERA */}
      {isDetallesOpen && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-600" />
                <span>Detalle de Cartera • Contrato #{selectedItem.contratoId}</span>
              </h3>
              <button onClick={() => setIsDetallesOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold uppercase text-blue-600 block">Distribuidor</span>
                  <span className="text-sm font-black text-slate-900">{selectedItem.nombreCompleto}</span>
                  <div className="text-[11px] text-slate-500 font-mono">
                    No. Dist: #{selectedItem.numeroDist} • Persona ID: #{selectedItem.personaId}
                  </div>
                </div>
                <span className="px-3 py-1 rounded-lg text-xs font-black bg-blue-600 text-white">
                  NIVEL {selectedItem.distribuidorNivel}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block">Importe Total</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">{formatMoney(selectedItem.importeTotal)}</span>
                </div>
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-emerald-600 font-bold block">Saldo Actual</span>
                  <span className="font-mono font-black text-emerald-800 text-sm">{formatMoney(selectedItem.saldoActual)}</span>
                </div>
                <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200">
                  <span className="text-[10px] text-rose-600 font-bold block">Saldo Atrasado</span>
                  <span className="font-mono font-black text-rose-800 text-sm">{formatMoney(selectedItem.saldoAtrasado)}</span>
                </div>
                <div className="p-2.5 bg-indigo-50 rounded-xl border border-indigo-200">
                  <span className="text-[10px] text-indigo-600 font-bold block">Línea Adicional</span>
                  <span className="font-mono font-bold text-indigo-800 text-sm">{formatMoney(selectedItem.lineaCreditoAdic)}</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block text-xs">Desglose Financiero del Contrato:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Capital:</span>
                    <strong className="font-mono text-slate-700">{formatMoney(selectedItem.capital)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Interés Ordinario:</span>
                    <strong className="font-mono text-slate-700">{formatMoney(selectedItem.interes)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Seguro:</span>
                    <strong className="font-mono text-slate-700">{formatMoney(selectedItem.seguro)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">IVA:</span>
                    <strong className="font-mono text-slate-700">{formatMoney(selectedItem.iva)}</strong>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Sucursal:</span>
                  <strong className="text-slate-800">{selectedItem.sucursal}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Coordinador Asignado:</span>
                  <strong className="text-slate-800">{selectedItem.coordinador}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Fecha de Contrato:</span>
                  <strong className="font-mono text-slate-800">{selectedItem.fechaContrato || '10/01/2025'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Último Abono Registrado:</span>
                  <strong className="font-mono text-emerald-700">{selectedItem.ultimoPagoFecha ? `${selectedItem.ultimoPagoFecha} (${formatMoney(selectedItem.ultimoPagoMonto || 0)})` : 'Sin abonos'}</strong>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t flex justify-end">
              <button
                onClick={() => setIsDetallesOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ESTADO DE CUENTA */}
      {isEstadoCuentaOpen && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Estado de Cuenta Oficial • Contrato #{selectedItem.contratoId}</span>
              </h3>
              <button onClick={() => setIsEstadoCuentaOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs font-sans">
              <div className="flex justify-between items-start border-b pb-3">
                <div>
                  <img src="/lanahora-logo.png" alt="LanAhora" className="h-6 object-contain mb-1" />
                  <span className="text-[10px] text-slate-400">FINANCIERA LANAHORA S.A. DE C.V.</span>
                </div>
                <div className="text-right text-[11px] font-mono text-slate-500">
                  <div>Fecha de Emisión: {new Date().toLocaleDateString('es-MX')}</div>
                  <div>Corte: 15/11/2026</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Distribuidora</span>
                  <strong className="text-slate-900 text-sm block">{selectedItem.nombreCompleto}</strong>
                  <span className="font-mono text-slate-500">No. Dist: #{selectedItem.numeroDist}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Resumen de Cuenta</span>
                  <div className="flex justify-between font-mono mt-1">
                    <span>Saldo Actual:</span>
                    <strong className="text-slate-900">{formatMoney(selectedItem.saldoActual)}</strong>
                  </div>
                  <div className="flex justify-between font-mono text-rose-600">
                    <span>Atraso:</span>
                    <strong>{formatMoney(selectedItem.saldoAtrasado)}</strong>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 font-bold border-b text-slate-600">
                    <tr>
                      <th className="p-2">Concepto</th>
                      <th className="p-2 text-right">Cargo</th>
                      <th className="p-2 text-right">Abono</th>
                      <th className="p-2 text-right">Saldo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    <tr>
                      <td className="p-2">Dispersión de Crédito / Vale</td>
                      <td className="p-2 text-right">{formatMoney(selectedItem.capital)}</td>
                      <td className="p-2 text-right">$0.00</td>
                      <td className="p-2 text-right">{formatMoney(selectedItem.capital)}</td>
                    </tr>
                    <tr>
                      <td className="p-2">Interés Ordinario y Seguro</td>
                      <td className="p-2 text-right">{formatMoney(selectedItem.interes + selectedItem.seguro)}</td>
                      <td className="p-2 text-right">$0.00</td>
                      <td className="p-2 text-right">{formatMoney(selectedItem.importeTotal)}</td>
                    </tr>
                    {selectedItem.ultimoPagoMonto && (
                      <tr className="bg-emerald-50/50">
                        <td className="p-2 font-bold text-emerald-800">Abono Pago Quincenal ({selectedItem.ultimoPagoFecha})</td>
                        <td className="p-2 text-right">$0.00</td>
                        <td className="p-2 text-right text-emerald-700">-{formatMoney(selectedItem.ultimoPagoMonto)}</td>
                        <td className="p-2 text-right font-bold text-slate-900">{formatMoney(selectedItem.saldoActual)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t flex justify-between items-center">
              <button
                onClick={() => {
                  window.print();
                  showToast('Preparando impresión del estado de cuenta...');
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Estado</span>
              </button>
              <button
                onClick={() => setIsEstadoCuentaOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl cursor-pointer"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: APLICAR ABONO */}
      {isAplicarAbonoOpen && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Aplicar Abono a Cartera</span>
              </h3>
              <button onClick={() => setIsAplicarAbonoOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGuardarAbono} className="p-5 space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border">
                <span className="text-[10px] text-slate-400 block font-bold">Distribuidora y Contrato</span>
                <strong className="text-slate-900 text-sm block">{selectedItem.nombreCompleto}</strong>
                <div className="flex justify-between font-mono text-[11px] text-slate-500 mt-1">
                  <span>Saldo Actual: {formatMoney(selectedItem.saldoActual)}</span>
                  <span className="text-rose-600 font-bold">Atraso: {formatMoney(selectedItem.saldoAtrasado)}</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Monto del Abono ($ MXN) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="ej. 3500.00"
                  value={abonoMonto}
                  onChange={(e) => setAbonoMonto(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Método de Pago</label>
                <select
                  value={abonoMetodo}
                  onChange={(e) => setAbonoMetodo(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  <option value="TRANSFERENCIA_STP">Transferencia SPEI / STP</option>
                  <option value="EFECTIVO_SUCURSAL">Efectivo en Ventanilla Sucursal</option>
                  <option value="DEPOSITO_BANCARIO">Depósito en Ventanilla Bancaria</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Folio / Referencia de Pago</label>
                <input
                  type="text"
                  placeholder="ej. REF-98402931"
                  value={abonoReferencia}
                  onChange={(e) => setAbonoReferencia(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAplicarAbonoOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs cursor-pointer active:scale-95"
                >
                  Confirmar Abono
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: NOTAS DE COBRANZA */}
      {isNotasOpen && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Send className="w-4 h-4 text-amber-600" />
                <span>Bitácora de Notas • Contrato #{selectedItem.contratoId}</span>
              </h3>
              <button onClick={() => setIsNotasOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Formulario Agregar Nota */}
              <form onSubmit={handleGuardarNota} className="space-y-2">
                <label className="font-bold text-slate-700 block">Agregar Nueva Nota de Gestión / Cobranza:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detalla acuerdos, promesas de pago o gestiones de campo realizadas..."
                  value={nuevaNotaTexto}
                  onChange={(e) => setNuevaNotaTexto(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-xs font-medium"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs cursor-pointer active:scale-95"
                  >
                    Guardar Nota
                  </button>
                </div>
              </form>

              {/* Historial de Notas */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <span className="font-bold text-slate-700 block">Historial Registrado:</span>
                {(!selectedItem.notasCobranza || selectedItem.notasCobranza.length === 0) ? (
                  <p className="text-slate-400 italic">No hay notas previas para este contrato.</p>
                ) : (
                  selectedItem.notasCobranza.map((n) => (
                    <div key={n.id} className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-amber-800 font-bold">
                        <span>{n.autor}</span>
                        <span className="font-mono text-slate-500 font-normal">{n.fecha}</span>
                      </div>
                      <p className="text-slate-800 font-medium">{n.texto}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t flex justify-end">
              <button
                onClick={() => setIsNotasOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: RELACIÓN DE VALES */}
      {isRelacionOpen && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Relación de Vales Colocados • DV #{selectedItem.numeroDist}</span>
              </h3>
              <button onClick={() => setIsRelacionOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border flex justify-between items-center">
                <div>
                  <strong className="text-slate-900 block">{selectedItem.nombreCompleto}</strong>
                  <span className="text-slate-500 text-[11px]">Sucursal: {selectedItem.sucursal}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-bold">Cupo Total Colocado</span>
                  <span className="font-mono font-black text-slate-800">{formatMoney(selectedItem.importeTotal)}</span>
                </div>
              </div>

              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 font-bold border-b text-slate-700">
                    <tr>
                      <th className="p-2">No. Vale</th>
                      <th className="p-2">Beneficiario Final</th>
                      <th className="p-2 text-right">Monto</th>
                      <th className="p-2 text-center">Quincenas</th>
                      <th className="p-2 text-center">Estatus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-medium text-slate-700">
                    <tr>
                      <td className="p-2 font-mono font-bold text-blue-600">VL-88201</td>
                      <td className="p-2">Brenda Morales Gomez</td>
                      <td className="p-2 text-right font-mono">$12,000.00</td>
                      <td className="p-2 text-center font-mono">16 Qnas</td>
                      <td className="p-2 text-center"><span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 font-bold">AL DÍA</span></td>
                    </tr>
                    <tr>
                      <td className="p-2 font-mono font-bold text-blue-600">VL-88202</td>
                      <td className="p-2">Ricardo Soto Hernandez</td>
                      <td className="p-2 text-right font-mono">$8,500.00</td>
                      <td className="p-2 text-center font-mono">12 Qnas</td>
                      <td className="p-2 text-center"><span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 font-bold">AL DÍA</span></td>
                    </tr>
                    <tr>
                      <td className="p-2 font-mono font-bold text-blue-600">VL-88203</td>
                      <td className="p-2">Lorena Patricia Delgado</td>
                      <td className="p-2 text-right font-mono">$15,000.00</td>
                      <td className="p-2 text-center font-mono">20 Qnas</td>
                      <td className="p-2 text-center"><span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-50 text-amber-700 font-bold">PARCIAL</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t flex justify-end">
              <button
                onClick={() => setIsRelacionOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Feedback */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold border animate-in slide-in-from-bottom-3 duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500'
              : 'bg-rose-600 text-white border-rose-500'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-100" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-100" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
