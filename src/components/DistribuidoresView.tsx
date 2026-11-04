'use client';

import React, { useState } from 'react';
import { DistribuidorCore } from '@/types/core';
import { INITIAL_DISTRIBUIDORES } from '@/lib/data/coreData';
import {
  Search,
  FileSpreadsheet,
  Smartphone,
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
    <div className="flex-1 bg-[#f0f4fa] text-slate-800 flex flex-col min-h-[calc(100vh-105px)] overflow-hidden font-sans p-4 space-y-4">
      {/* Top Action & Coordinator Bar */}
      <div className="bg-white border border-blue-100 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Coordinator Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-bold text-xs">Coordinadores:</span>
            <select
              value={coordinatorFilter}
              onChange={(e) => setCoordinatorFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none focus:border-[#2563eb] font-semibold"
            >
              <option value="ALL">-- Todos los Coordinadores --</option>
              {coordinators.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* Action buttons */}
          <button
            onClick={() => handleActionClick('Relación')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
          >
            Relación
          </button>
          <button
            onClick={() => handleActionClick('Relación Recibos')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
          >
            Relación Recibos
          </button>
          <button
            onClick={() => handleActionClick('Estado de Cuenta')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
          >
            Estado de Cuenta
          </button>
          <button
            onClick={() => handleActionClick('Notas')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
          >
            Notas
          </button>
          <button
            onClick={() => handleActionClick('Mensajes masivos')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
          >
            Mensajes masivos
          </button>

          <button
            onClick={() => alert('Exportando reporte a XLS...')}
            className="px-3 py-1.5 rounded-xl bg-[#16a34a] hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>XLS</span>
          </button>

          <button
            onClick={() => handleActionClick('Enviar notificación APP')}
            className="px-3.5 py-1.5 rounded-xl bg-[#facc15] hover:bg-yellow-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow transition active:scale-95"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Notificación LanaApp</span>
          </button>
        </div>
      </div>

      {/* Filter Search Input Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-blue-100 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2 max-w-md w-full">
          <Search className="w-4 h-4 text-blue-500" />
          <input
            type="text"
            placeholder="Buscar por nombre, No. de DV, Coordinador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#2563eb] bg-white text-slate-900"
          />
        </div>

        <div className="text-xs text-slate-500">
          Mostrando <span className="font-black text-[#2563eb] font-mono">{filtered.length}</span> de 7,171 distribuidoras
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-blue-100 overflow-x-auto shadow-md flex-1">
        <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
          <thead className="bg-[#1d4ed8] text-white font-bold border-b border-blue-700 text-[11px] uppercase tracking-wider select-none">
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
          <tbody className="divide-y divide-slate-100">
            {filtered.map((d) => {
              const isSelected = d.noDist === selectedNoDist;

              return (
                <tr
                  key={d.noDist}
                  onClick={() => setSelectedNoDist(d.noDist)}
                  className={`cursor-pointer transition ${
                    isSelected
                      ? 'bg-blue-50 font-bold text-blue-950'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <td className="p-2.5 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNoDist(d.noDist);
                        alert(`Detalle de Distribuidora #${d.noDist}: ${d.nombreDistribuidor}`);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#2563eb] text-[10px] font-bold border border-blue-200"
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
                      className="px-2 py-0.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold border border-indigo-200"
                    >
                      Cartera
                    </button>
                  </td>
                  <td className="p-3 font-semibold text-slate-900">{d.sucursal}</td>
                  <td className="p-3 text-slate-500">{d.zona}</td>
                  <td className="p-3 text-slate-700">{d.coordinador}</td>
                  <td className="p-3 font-mono font-bold text-[#2563eb]">
                    #{d.noDist}
                  </td>
                  <td className="p-3 font-semibold text-slate-900">{d.nombreDistribuidor}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        d.estatus === 'ACTIVO'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : d.estatus === 'REESTRUCTURA'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {d.estatus}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        d.nivel === 'DIAMANTE'
                          ? 'bg-sky-100 text-sky-800 border border-sky-300'
                          : d.nivel === 'ORO'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {d.nivel}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-right text-slate-700 font-medium">
                    ${d.creditoLimite.toLocaleString('es-MX')}
                  </td>
                  <td className="p-3 font-mono text-right text-rose-600 font-bold">
                    ${d.saldoActual.toLocaleString('es-MX')}
                  </td>
                  <td className="p-3 font-mono text-right text-[#16a34a] font-bold">
                    ${d.disponible.toLocaleString('es-MX')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <footer className="bg-white border border-blue-100 rounded-2xl p-3 px-4 flex flex-wrap items-center justify-between text-xs text-slate-500 shadow-sm">
        <div>
          Página 1 de 144 (<span className="font-black text-[#2563eb] font-mono">7,171 distribuidoras</span>)
        </div>
        <div className="flex items-center gap-1 font-mono text-xs">
          <button className="px-3 py-1 rounded-lg bg-[#2563eb] text-white font-bold">1</button>
          <button className="px-3 py-1 rounded-lg hover:bg-slate-100 text-slate-700 font-bold">2</button>
          <button className="px-3 py-1 rounded-lg hover:bg-slate-100 text-slate-700 font-bold">3</button>
          <button className="px-3 py-1 rounded-lg hover:bg-slate-100 text-slate-700 font-bold">4</button>
          <span className="px-1 text-slate-400">...</span>
          <button className="px-3 py-1 rounded-lg hover:bg-slate-100 text-slate-700 font-bold">144</button>
        </div>
      </footer>
    </div>
  );
}
