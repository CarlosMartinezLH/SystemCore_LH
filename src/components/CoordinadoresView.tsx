'use client';

import React, { useState, useMemo } from 'react';
import { CoordinadorCore, DistribuidorCore } from '@/types/core';
import { UserSession } from '@/types/auth';
import { useCoreSync } from '@/context/CoreSyncContext';
import { INITIAL_COORDINADORES } from '@/lib/data/coreData';
import {
  Search,
  FileSpreadsheet,
  UserCheck,
  Users,
  Plus,
  ArrowRightLeft,
  X,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Edit2,
  ExternalLink,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { formatMoney } from '@/lib/utils/formatters';

interface CoordinadoresViewProps {
  currentUser?: UserSession | null;
  onNavigateToDistribuidores?: (coordinadorNombre?: string) => void;
}

export default function CoordinadoresView({
  currentUser,
  onNavigateToDistribuidores,
}: CoordinadoresViewProps) {
  const { distribuidores, updateDistribuidor } = useCoreSync();
  const [coordinadores, setCoordinadores] = useState<CoordinadorCore[]>(INITIAL_COORDINADORES);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [sucursalFilter, setSucursalFilter] = useState('ALL');
  const [estatusFilter, setEstatusFilter] = useState('ALL');
  const [zonaFilter, setZonaFilter] = useState('ALL');

  // Modales
  const [selectedCoordForDvs, setSelectedCoordForDvs] = useState<CoordinadorCore | null>(null);
  const [selectedCoordForEdit, setSelectedCoordForEdit] = useState<CoordinadorCore | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isReasignarModalOpen, setIsReasignarModalOpen] = useState(false);

  // Enriquecer datos de coordinadores con distribuidoras reales
  const enrichedCoordinadores = useMemo(() => {
    return coordinadores.map((coord) => {
      const coordNameClean = coord.nombre.trim().toUpperCase();
      const dvs = distribuidores.filter(
        (d) => (d.coordinador || '').trim().toUpperCase() === coordNameClean
      );
      const totalDvs = dvs.length;
      const carteraActiva = dvs.reduce((acc, d) => acc + (d.saldoActual || 0), 0);
      const rec =
        coord.cobroEstimadoQuincena > 0
          ? Math.min(100, Math.round((coord.cobroRealizadoQuincena / coord.cobroEstimadoQuincena) * 1000) / 10)
          : 0;

      return {
        ...coord,
        totalDistribuidores: totalDvs > 0 ? totalDvs : coord.totalDistribuidores || 0,
        carteraActiva: carteraActiva > 0 ? carteraActiva : coord.carteraActiva || 0,
        porcentajeRecuperacion: rec > 0 ? rec : coord.porcentajeRecuperacion || 0,
      };
    });
  }, [coordinadores, distribuidores]);

  // Filtrado de la tabla
  const filtered = useMemo(() => {
    return enrichedCoordinadores.filter((c) => {
      // Alcance por sucursal de usuario
      if (currentUser && currentUser.branchScope === 'BRANCH') {
        const uB = currentUser.branch.toUpperCase();
        const cB = (c.sucursal || '').toUpperCase();
        if (!cB.includes(uB) && !uB.includes(cB)) return false;
      }

      if (sucursalFilter !== 'ALL' && c.sucursal !== sucursalFilter) return false;
      if (estatusFilter !== 'ALL' && c.estatus !== estatusFilter) return false;
      if (zonaFilter !== 'ALL' && c.zona !== zonaFilter) return false;

      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        c.nombre.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.sucursal.toLowerCase().includes(q) ||
        c.zona.toLowerCase().includes(q) ||
        (c.telefono && c.telefono.includes(q))
      );
    });
  }, [enrichedCoordinadores, sucursalFilter, estatusFilter, zonaFilter, searchTerm, currentUser]);

  // Métricas macro
  const metrics = useMemo(() => {
    const totalCoords = enrichedCoordinadores.filter((c) => c.estatus === 'ACTIVO').length;
    const totalDvs = enrichedCoordinadores.reduce((acc, c) => acc + (c.totalDistribuidores || 0), 0);
    const carteraTotal = enrichedCoordinadores.reduce((acc, c) => acc + (c.carteraActiva || 0), 0);
    const cobroEstimadoTotal = enrichedCoordinadores.reduce((acc, c) => acc + c.cobroEstimadoQuincena, 0);
    const cobroRealizadoTotal = enrichedCoordinadores.reduce((acc, c) => acc + c.cobroRealizadoQuincena, 0);
    const recGlobal =
      cobroEstimadoTotal > 0
        ? Math.min(100, Math.round((cobroRealizadoTotal / cobroEstimadoTotal) * 1000) / 10)
        : 0;

    return { totalCoords, totalDvs, carteraTotal, recGlobal, cobroRealizadoTotal };
  }, [enrichedCoordinadores]);

  // Exportar a Excel
  const handleExportXLS = () => {
    const exportData = filtered.map((c) => ({
      Clave: c.id,
      Nombre: c.nombre,
      Sucursal: c.sucursal,
      Zona: c.zona,
      Subzona: c.subzona || '-',
      'DVs Asignadas': c.totalDistribuidores || 0,
      'Cartera Activa ($)': c.carteraActiva || 0,
      'Cobro Estimado ($)': c.cobroEstimadoQuincena,
      'Cobro Realizado ($)': c.cobroRealizadoQuincena,
      '% Recuperación': `${c.porcentajeRecuperacion}%`,
      Teléfono: c.telefono,
      Email: c.email || '',
      Estatus: c.estatus,
      'Fecha Ingreso': c.fechaIngreso,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Coordinadores');
    XLSX.writeFile(workbook, `catalogo_coordinadores_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="flex-1 bg-slate-50 text-slate-800 flex flex-col min-h-0 overflow-y-auto font-sans p-4 lg:p-6 space-y-4">
      {/* 1. Tarjetas de Resumen Macro */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Coordinadores Activos
            </span>
            <span className="text-xl font-black text-slate-900 font-mono">
              {metrics.totalCoords}
            </span>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl border border-blue-200/80">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Distribuidoras Asignadas
            </span>
            <span className="text-xl font-black text-blue-600 font-mono">
              {metrics.totalDvs.toLocaleString('es-MX')} DVs
            </span>
          </div>
          <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-200/80">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Cartera Total Supervisada
            </span>
            <span className="text-xl font-black text-slate-900 font-mono">
              {formatMoney(metrics.carteraTotal)}
            </span>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200/80">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Recuperación Promedio
            </span>
            <span className="text-xl font-black text-emerald-600 font-mono">
              {metrics.recGlobal}%
            </span>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-200/80">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Barra de Control y Filtros */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-wrap items-center justify-between gap-3">
        {/* Buscador */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nombre, clave, sucursal, zona o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600 font-medium text-slate-900"
          />
        </div>

        {/* Filtros Dropdown */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={sucursalFilter}
            onChange={(e) => setSucursalFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white"
          >
            <option value="ALL">Todas las Sucursales</option>
            <option value="SALTILLO">Saltillo</option>
            <option value="TORREON">Torreón</option>
            <option value="MONCLOVA">Monclova</option>
          </select>

          <select
            value={zonaFilter}
            onChange={(e) => setZonaFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white"
          >
            <option value="ALL">Todas las Zonas</option>
            <option value="ZONA A">Zona A</option>
            <option value="ZONA B">Zona B</option>
            <option value="ZONA C">Zona C</option>
          </select>

          <select
            value={estatusFilter}
            onChange={(e) => setEstatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white"
          >
            <option value="ALL">Todos los Estatus</option>
            <option value="ACTIVO">Activos</option>
            <option value="INACTIVO">Inactivos</option>
          </select>

          {/* Botón Reasignar Cartera */}
          <button
            onClick={() => setIsReasignarModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs inline-flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
            <span>Reasignar Cartera</span>
          </button>

          {/* Botón Exportar XLS */}
          <button
            onClick={handleExportXLS}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs inline-flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Exportar XLS</span>
          </button>

          {/* Botón Nuevo Coordinador */}
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Coordinador</span>
          </button>
        </div>
      </div>

      {/* 3. Tabla Principal de Coordinadores */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
            <thead className="bg-slate-50/90 border-b border-slate-200/80 text-slate-500 uppercase text-[10px] tracking-wider font-extrabold select-none">
              <tr>
                <th className="p-3">Clave</th>
                <th className="p-3">Nombre del Coordinador</th>
                <th className="p-3">Sucursal</th>
                <th className="p-3">Zona</th>
                <th className="p-3 text-center">DVs Asignadas</th>
                <th className="p-3 text-right">Cartera Asignada</th>
                <th className="p-3 text-right">Cobro Quincenal</th>
                <th className="p-3 text-center">% Recuperación</th>
                <th className="p-3">Teléfono</th>
                <th className="p-3 text-center">Estatus</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => {
                const rec = c.porcentajeRecuperacion || 0;
                const recColor =
                  rec >= 95 ? 'text-emerald-700' : rec >= 85 ? 'text-blue-700' : 'text-amber-700';
                const recBarColor =
                  rec >= 95 ? 'bg-emerald-500' : rec >= 85 ? 'bg-blue-500' : 'bg-amber-500';

                return (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-mono font-bold text-blue-600">{c.id}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{c.nombre}</div>
                      {c.email && <div className="text-[11px] text-slate-400 font-normal">{c.email}</div>}
                    </td>
                    <td className="p-3 font-semibold text-slate-700">{c.sucursal}</td>
                    <td className="p-3 text-slate-600">
                      {c.zona} {c.subzona ? `· Sub ${c.subzona}` : ''}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setSelectedCoordForDvs(c)}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-mono font-bold text-xs border border-blue-200 transition cursor-pointer"
                        title="Ver Distribuidoras asignadas"
                      >
                        {c.totalDistribuidores || 0} DVs
                      </button>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">
                      {formatMoney(c.carteraActiva || 0)}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-700">
                      <span className="font-bold">{formatMoney(c.cobroRealizadoQuincena)}</span>
                      <span className="text-[10px] text-slate-400 block">
                        de {formatMoney(c.cobroEstimadoQuincena)}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="inline-flex flex-col items-center gap-1 min-w-[70px]">
                        <span className={`text-[11px] font-mono font-extrabold ${recColor}`}>
                          {rec}%
                        </span>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${recBarColor} rounded-full transition-all`}
                            style={{ width: `${Math.min(100, rec)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-slate-600">{c.telefono}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.estatus === 'ACTIVO'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-100 text-slate-600 border border-slate-300'
                        }`}
                      >
                        {c.estatus}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedCoordForDvs(c)}
                          className="px-2 py-1 rounded-md text-[11px] font-bold bg-slate-50 hover:bg-blue-50 text-blue-700 border border-slate-200 transition"
                          title="Ver cartera de distribuidoras"
                        >
                          Ver DVs
                        </button>
                        <button
                          onClick={() => setSelectedCoordForEdit(c)}
                          className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                          title="Editar Coordinador"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Info */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>
            Mostrando <strong>{filtered.length}</strong> coordinadores
          </span>
          <span className="font-mono text-[11px]">Sistema LanAhora · Catálogos</span>
        </div>
      </div>

      {/* 4. Modal: Ver Distribuidoras Asignadas */}
      {selectedCoordForDvs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm tracking-tight">
                  Distribuidoras Asignadas · {selectedCoordForDvs.nombre}
                </h3>
                <p className="text-blue-100 text-[11px]">
                  {selectedCoordForDvs.sucursal} · {selectedCoordForDvs.zona}
                </p>
              </div>
              <button
                onClick={() => setSelectedCoordForDvs(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-blue-500 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              {(() => {
                const coordNameClean = selectedCoordForDvs.nombre.trim().toUpperCase();
                const coordDvs = distribuidores.filter(
                  (d) => (d.coordinador || '').trim().toUpperCase() === coordNameClean
                );

                if (coordDvs.length === 0) {
                  return (
                    <div className="text-center py-12 text-slate-400">
                      <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      <p className="font-bold text-sm">No hay distribuidoras asociadas</p>
                    </div>
                  );
                }

                return (
                  <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-extrabold">
                      <tr>
                        <th className="p-2.5">No. Dist</th>
                        <th className="p-2.5">Nombre Distribuidor</th>
                        <th className="p-2.5">Nivel</th>
                        <th className="p-2.5">Estatus</th>
                        <th className="p-2.5 text-right">Línea Crédito</th>
                        <th className="p-2.5 text-right">Saldo Actual</th>
                        <th className="p-2.5 text-right">Disponible</th>
                        <th className="p-2.5 text-center">LanaApp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {coordDvs.map((d) => (
                        <tr key={d.noDist} className="hover:bg-slate-50/80">
                          <td className="p-2.5 font-mono font-bold text-blue-600">#{d.noDist}</td>
                          <td className="p-2.5 font-bold text-slate-900">{d.nombreDistribuidor}</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-yellow-100 text-yellow-900 border border-yellow-300">
                              {d.nivel}
                            </span>
                          </td>
                          <td className="p-2.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                d.estatus === 'ACTIVO'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {d.estatus}
                            </span>
                          </td>
                          <td className="p-2.5 text-right font-mono">
                            {formatMoney(d.creditoLimite)}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                            {formatMoney(d.saldoActual)}
                          </td>
                          <td className="p-2.5 text-right font-mono text-emerald-600 font-bold">
                            {formatMoney(d.disponible)}
                          </td>
                          <td className="p-2.5 text-center">
                            {d.tieneLanaApp ? (
                              <span className="text-emerald-600 font-bold text-[10px]">ACTIVA</span>
                            ) : (
                              <span className="text-slate-400 text-[10px]">NO</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                );
              })()}
            </div>

            <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
              <button
                onClick={() => setSelectedCoordForDvs(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal: Nuevo Coordinador */}
      {isNewModalOpen && (
        <NuevoCoordinadorModal
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          onSave={(newCoord) => {
            setCoordinadores((prev) => [newCoord, ...prev]);
            setIsNewModalOpen(false);
          }}
          nextId={`COORD-${String(coordinadores.length + 1).padStart(2, '0')}`}
        />
      )}

      {/* 6. Modal: Reasignar Cartera */}
      {isReasignarModalOpen && (
        <ReasignarCarteraModal
          isOpen={isReasignarModalOpen}
          onClose={() => setIsReasignarModalOpen(false)}
          coordinadores={coordinadores}
          distribuidores={distribuidores}
          onReassign={(noDist, nuevoCoordinador) => {
            const dv = distribuidores.find((d) => d.noDist === noDist);
            if (dv) {
              updateDistribuidor({
                ...dv,
                coordinador: nuevoCoordinador,
              });
            }
          }}
        />
      )}
    </div>
  );
}

// Subcomponente: Modal Nuevo Coordinador
function NuevoCoordinadorModal({
  isOpen,
  onClose,
  onSave,
  nextId,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (coord: CoordinadorCore) => void;
  nextId: string;
}) {
  const [nombre, setNombre] = useState('');
  const [sucursal, setSucursal] = useState('SALTILLO');
  const [zona, setZona] = useState('ZONA A');
  const [subzona, setSubzona] = useState('1');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [metaColocacion, setMetaColocacion] = useState(500000);
  const [cobroEstimado, setCobroEstimado] = useState(45000);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    onSave({
      id: nextId,
      nombre: nombre.trim().toUpperCase(),
      sucursal,
      zona,
      subzona,
      telefono: telefono.trim(),
      email: email.trim().toLowerCase(),
      estatus: 'ACTIVO',
      fechaIngreso: new Date().toLocaleDateString('es-MX'),
      cobroEstimadoQuincena: Number(cobroEstimado) || 0,
      cobroRealizadoQuincena: 0,
      metaColocacion: Number(metaColocacion) || 0,
      totalDistribuidores: 0,
      carteraActiva: 0,
      porcentajeRecuperacion: 100,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
          <h3 className="font-black text-sm tracking-tight">Nuevo Coordinador ({nextId})</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Nombre Completo</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. LAURA PATRICIA MORALES"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600 font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Sucursal</label>
              <select
                value={sucursal}
                onChange={(e) => setSucursal(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white font-semibold"
              >
                <option value="SALTILLO">Saltillo</option>
                <option value="TORREON">Torreón</option>
                <option value="MONCLOVA">Monclova</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Zona</label>
              <select
                value={zona}
                onChange={(e) => setZona(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white font-semibold"
              >
                <option value="ZONA A">Zona A</option>
                <option value="ZONA B">Zona B</option>
                <option value="ZONA C">Zona C</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Teléfono</label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej. 844 123 4567"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white font-mono"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Subzona</label>
              <input
                type="text"
                value={subzona}
                onChange={(e) => setSubzona(e.target.value)}
                placeholder="1"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@lanahora.com"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Meta Colocación ($)</label>
              <input
                type="number"
                value={metaColocacion}
                onChange={(e) => setMetaColocacion(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white font-mono"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Cobro Estimado ($)</label>
              <input
                type="number"
                value={cobroEstimado}
                onChange={(e) => setCobroEstimado(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-xs"
            >
              Guardar Coordinador
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Subcomponente: Modal Reasignar Cartera
function ReasignarCarteraModal({
  isOpen,
  onClose,
  coordinadores,
  distribuidores,
  onReassign,
}: {
  isOpen: boolean;
  onClose: () => void;
  coordinadores: CoordinadorCore[];
  distribuidores: DistribuidorCore[];
  onReassign: (noDist: number, nuevoCoordinador: string) => void;
}) {
  const [selectedDvNo, setSelectedDvNo] = useState<number>(distribuidores[0]?.noDist || 1001);
  const [nuevoCoordNombre, setNuevoCoordNombre] = useState<string>(
    coordinadores.find((c) => c.estatus === 'ACTIVO')?.nombre || ''
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const currentDv = distribuidores.find((d) => d.noDist === selectedDvNo);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDvNo || !nuevoCoordNombre) return;
    onReassign(selectedDvNo, nuevoCoordNombre);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-blue-400" />
            <h3 className="font-black text-sm tracking-tight">Reasignar Cartera de Distribuidora</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleApply} className="p-5 space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Seleccionar Distribuidora</label>
            <select
              value={selectedDvNo}
              onChange={(e) => setSelectedDvNo(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white font-semibold"
            >
              {distribuidores.map((d) => (
                <option key={d.noDist} value={d.noDist}>
                  DV #{d.noDist} · {d.nombreDistribuidor} (Actual: {d.coordinador})
                </option>
              ))}
            </select>
          </div>

          {currentDv && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Coordinador Actual:</span>
                <span className="font-bold text-slate-800">{currentDv.coordinador}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sucursal / Zona:</span>
                <span className="font-bold text-slate-800">
                  {currentDv.sucursal} · {currentDv.zona}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Saldo Cartera:</span>
                <span className="font-mono font-bold text-blue-600">
                  {formatMoney(currentDv.saldoActual)}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="font-bold text-slate-700 block mb-1">Nuevo Coordinador Asignado</label>
            <select
              value={nuevoCoordNombre}
              onChange={(e) => setNuevoCoordNombre(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white font-semibold"
            >
              {coordinadores
                .filter((c) => c.estatus === 'ACTIVO')
                .map((c) => (
                  <option key={c.id} value={c.nombre}>
                    {c.nombre} ({c.sucursal} · {c.zona})
                  </option>
                ))}
            </select>
          </div>

          {savedSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-center font-bold flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Distribuidora reasignada exitosamente</span>
            </div>
          )}

          <div className="pt-3 border-t flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={savedSuccess}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-xs disabled:opacity-50"
            >
              Confirmar Reasignación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
