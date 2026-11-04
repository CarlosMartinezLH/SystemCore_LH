'use client';

import React, { useState } from 'react';
import { DistribuidorCore } from '@/types/core';
import { INITIAL_DISTRIBUIDORES } from '@/lib/data/coreData';
import {
  Search,
  FileSpreadsheet,
  Smartphone,
  Briefcase,
} from 'lucide-react';

export default function DistribuidoresView() {
  const [distribuidores, setDistribuidores] = useState<DistribuidorCore[]>(INITIAL_DISTRIBUIDORES);
  const [selectedNoDist, setSelectedNoDist] = useState<number | null>(1002);
  const [coordinatorFilter, setCoordinatorFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const selectedDist = distribuidores.find((d) => d.noDist === selectedNoDist);

  const coordinators = Array.from(
    new Set(distribuidores.map((d) => d.coordinador).filter(Boolean))
  );

  const filtered = distribuidores.filter((d) => {
    const matchesCoord = coordinatorFilter === 'ALL' || d.coordinador === coordinatorFilter;
    if (!matchesCoord) return false;
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      d.nombreDistribuidor.toLowerCase().includes(q) ||
      d.noDist.toString().includes(q) ||
      d.coordinador.toLowerCase().includes(q) ||
      d.sucursal.toLowerCase().includes(q)
    );
  });

  const handleActionClick = (actionName: string) => {
    if (!selectedDist) {
      alert('Selecciona primero una distribuidora en la tabla.');
      return;
    }
    alert(`Acción: "${actionName}" para Distribuidora #${selectedDist.noDist} (${selectedDist.nombreDistribuidor})`);
  };

  return (
    <div className="flex-1 bg-[#0c101c] text-slate-100 flex flex-col min-h-[calc(100vh-105px)] overflow-hidden font-sans p-4 space-y-4">
      {/* Top Action & Coordinator Bar */}
      <div className="bg-[#131a2b] border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Coordinator Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold text-xs">Coordinadores:</span>
            <select
              value={coordinatorFilter}
              onChange={(e) => setCoordinatorFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-[#0c101c] text-white text-xs focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="ALL">-- Todos los Coordinadores --</option>
              {coordinators.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="h-5 w-px bg-slate-800 mx-1 hidden sm:block" />

          {/* Action buttons */}
          <button
            onClick={() => handleActionClick('Relación')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            Relación
          </button>
          <button
            onClick={() => handleActionClick('Relación Recibos')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            Relación Recibos
          </button>
          <button
            onClick={() => handleActionClick('Estado de Cuenta')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            Estado de Cuenta
          </button>
          <button
            onClick={() => handleActionClick('Notas')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            Notas
          </button>
          <button
            onClick={() => handleActionClick('Mensajes masivos')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            Mensajes masivos
          </button>

          <button
            onClick={() => alert('Exportando reporte completo a XLS...')}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>XLS</span>
          </button>

          <button
            onClick={() => handleActionClick('Enviar notificación APP')}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/10 transition active:scale-95"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Notificación a LanaApp</span>
          </button>
        </div>
      </div>

      {/* Filter Search Input Bar */}
      <div className="bg-[#131a2b] p-3 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2 max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, No. de DV, Coordinador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-slate-700 rounded-lg focus:outline-none focus:border-amber-500 bg-[#0c101c] text-white placeholder:text-slate-500"
          />
        </div>

        <div className="text-xs text-slate-400">
          Mostrando <span className="font-bold text-amber-400 font-mono">{filtered.length}</span> de 7,171 distribuidoras
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#131a2b] rounded-xl border border-slate-800 overflow-x-auto shadow-xl flex-1">
        <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
          <thead className="bg-[#172138] text-slate-300 font-bold border-b border-slate-800 text-[11px] uppercase tracking-wider select-none">
            <tr>
              <th className="p-3 text-center">Detalle</th>
              <th className="p-3 text-center">Cartera</th>
              <th className="p-3">Sucursal</th>
              <th className="p-3">Zona</th>
              <th className="p-3">Coordinador</th>
              <th className="p-3">No Dist</th>
              <th className="p-3">Nombre de Distribuidor</th>
              <th className="p-3">Estatus</th>
              <th className="p-3">Nivel</th>
              <th className="p-3 text-right">Línea de Crédito</th>
              <th className="p-3 text-right">Saldo Actual</th>
              <th className="p-3 text-right">Disponible</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filtered.map((d) => {
              const isSelected = d.noDist === selectedNoDist;

              return (
                <tr
                  key={d.noDist}
                  onClick={() => setSelectedNoDist(d.noDist)}
                  className={`cursor-pointer transition ${
                    isSelected
                      ? 'bg-amber-500/15 font-semibold text-white'
                      : 'hover:bg-slate-800/50 text-slate-300'
                  }`}
                >
                  <td className="p-2.5 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNoDist(d.noDist);
                        alert(`Detalle de Distribuidora #${d.noDist}: ${d.nombreDistribuidor}`);
                      }}
                      className="px-2 py-0.5 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-[10px] font-bold border border-blue-500/30"
                    >
                      Detalle
                    </button>
                  </td>
                  <td className="p-2.5 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNoDist(d.noDist);
                        alert(`Módulo de cartera de Distribuidora #${d.noDist}`);
                      }}
                      className="px-2 py-0.5 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-[10px] font-bold border border-indigo-500/30"
                    >
                      Cartera
                    </button>
                  </td>
                  <td className="p-3 font-semibold text-white">{d.sucursal}</td>
                  <td className="p-3 text-slate-400">{d.zona}</td>
                  <td className="p-3 text-slate-300">{d.coordinador}</td>
                  <td className="p-3 font-mono font-bold text-amber-400">
                    #{d.noDist}
                  </td>
                  <td className="p-3 font-medium text-white">{d.nombreDistribuidor}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        d.estatus === 'ACTIVO'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : d.estatus === 'REESTRUCTURA'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {d.estatus}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        d.nivel === 'DIAMANTE'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          : d.nivel === 'ORO'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {d.nivel}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-right text-slate-200">
                    ${d.creditoLimite.toLocaleString('es-MX')}
                  </td>
                  <td className="p-3 font-mono text-right text-rose-400 font-bold">
                    ${d.saldoActual.toLocaleString('es-MX')}
                  </td>
                  <td className="p-3 font-mono text-right text-emerald-400 font-bold">
                    ${d.disponible.toLocaleString('es-MX')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <footer className="bg-[#131a2b] border border-slate-800 rounded-xl p-3 px-4 flex flex-wrap items-center justify-between text-xs text-slate-400 shadow-md">
        <div>
          Página 1 de 144 (<span className="font-bold text-amber-400 font-mono">7,171 distribuidoras</span>)
        </div>
        <div className="flex items-center gap-1 font-mono text-xs">
          <button className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-bold">1</button>
          <button className="px-2.5 py-1 rounded hover:bg-slate-800 text-slate-300">2</button>
          <button className="px-2.5 py-1 rounded hover:bg-slate-800 text-slate-300">3</button>
          <button className="px-2.5 py-1 rounded hover:bg-slate-800 text-slate-300">4</button>
          <span className="px-1 text-slate-500">...</span>
          <button className="px-2.5 py-1 rounded hover:bg-slate-800 text-slate-300">144</button>
        </div>
      </footer>
    </div>
  );
}
