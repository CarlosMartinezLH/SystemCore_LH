'use client';

import React, { useState } from 'react';
import { DistribuidorCore } from '@/types/core';
import { INITIAL_DISTRIBUIDORES } from '@/lib/data/coreData';
import {
  Search,
  FileSpreadsheet,
  FileText,
  Bell,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export default function DistribuidoresView() {
  const [distribuidores, setDistribuidores] = useState<DistribuidorCore[]>(INITIAL_DISTRIBUIDORES);
  const [selectedNoDist, setSelectedNoDist] = useState<number | null>(1002);
  const [coordinatorFilter, setCoordinatorFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const selectedDist = distribuidores.find((d) => d.noDist === selectedNoDist);

  // Extract unique coordinators for dropdown
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
    <div className="flex-1 bg-[#eceef2] text-slate-800 flex flex-col min-h-[calc(100vh-105px)] overflow-hidden font-sans">
      {/* TOP ACTION BAR (Exacto a la barra de herramientas de Financialsoft) */}
      <div className="bg-[#f7f8fa] border-b border-slate-300 p-2.5 flex flex-wrap items-center justify-between gap-2 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {/* Coordinadores selector */}
          <div className="flex items-center gap-1">
            <span className="text-slate-600 font-semibold text-[11px]">Coordinadores:</span>
            <select
              value={coordinatorFilter}
              onChange={(e) => setCoordinatorFilter(e.target.value)}
              className="px-2 py-1 rounded border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">-- Todos los Coordinadores --</option>
              {coordinators.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="h-4 w-px bg-slate-300 mx-1 hidden sm:block" />

          {/* Action buttons */}
          <button
            onClick={() => handleActionClick('Relación')}
            className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-medium shadow-xs"
          >
            Relacion
          </button>
          <button
            onClick={() => handleActionClick('Relación Recibos')}
            className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-medium shadow-xs"
          >
            Relacion Recibos
          </button>
          <button
            onClick={() => handleActionClick('Estado de Cuenta')}
            className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-medium shadow-xs"
          >
            Estado de Cuenta
          </button>
          <button
            onClick={() => handleActionClick('Notas')}
            className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-medium shadow-xs"
          >
            Notas
          </button>
          <button
            onClick={() => handleActionClick('Mensajes masivos')}
            className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-medium shadow-xs"
          >
            Mensajes masivos
          </button>
          <button
            onClick={() => handleActionClick('Historial de relaciones')}
            className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-medium shadow-xs"
          >
            Historial de relaciones
          </button>

          <button
            onClick={() => alert('Exportando reporte completo a XLS...')}
            className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> XLS
          </button>

          <button
            onClick={() => handleActionClick('Quitar fecha castigo')}
            className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-medium shadow-xs"
          >
            Quitar fecha castigo
          </button>

          <button
            onClick={() => handleActionClick('Enviar notificación APP')}
            className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
          >
            <Smartphone className="w-3.5 h-3.5" /> Enviar notificación APP
          </button>
        </div>
      </div>

      {/* FILTER SEARCH INPUT */}
      <div className="bg-white p-2.5 border-b border-slate-300 flex items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-2 max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Introduzca el texto a buscar (Nombre distribuidor, No. Dist, Coordinador)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:border-blue-500 bg-slate-50"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Arrastre una columna aquí para agrupar por dicha columna
        </div>
      </div>

      {/* TABLE */}
      <div className="flex-1 bg-white overflow-x-auto shadow-inner">
        <table className="w-full text-left text-[11px] border-collapse whitespace-nowrap">
          <thead className="bg-[#e4e7ed] text-slate-700 font-semibold border-b border-slate-300 select-none">
            <tr>
              <th className="p-2 border-r border-slate-300 text-center">Detalle</th>
              <th className="p-2 border-r border-slate-300 text-center">Cartera</th>
              <th className="p-2 border-r border-slate-300">Sucursal</th>
              <th className="p-2 border-r border-slate-300">Zona</th>
              <th className="p-2 border-r border-slate-300">Subzona</th>
              <th className="p-2 border-r border-slate-300">Coordinador</th>
              <th className="p-2 border-r border-slate-300">No Dist</th>
              <th className="p-2 border-r border-slate-300">Nombre de Distribuidor</th>
              <th className="p-2 border-r border-slate-300">Genero</th>
              <th className="p-2 border-r border-slate-300">Estatus</th>
              <th className="p-2 border-r border-slate-300">Nivel</th>
              <th className="p-2 border-r border-slate-300 text-right">Línea Crédito</th>
              <th className="p-2 border-r border-slate-300 text-right">Saldo Actual</th>
              <th className="p-2 text-right">Disponible</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filtered.map((d) => {
              const isSelected = d.noDist === selectedNoDist;

              return (
                <tr
                  key={d.noDist}
                  onClick={() => setSelectedNoDist(d.noDist)}
                  className={`cursor-pointer transition ${
                    isSelected
                      ? 'bg-blue-100 font-medium text-slate-900'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <td className="p-1 border-r border-slate-200 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNoDist(d.noDist);
                        alert(`Detalle de Distribuidora #${d.noDist}: ${d.nombreDistribuidor}`);
                      }}
                      className="text-blue-600 hover:underline font-semibold text-[10px]"
                    >
                      Detalle
                    </button>
                  </td>
                  <td className="p-1 border-r border-slate-200 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNoDist(d.noDist);
                        alert(`Ver módulo de cartera de Distribuidora #${d.noDist}`);
                      }}
                      className="text-indigo-600 hover:underline font-semibold text-[10px]"
                    >
                      Cartera
                    </button>
                  </td>
                  <td className="p-2 border-r border-slate-200 font-semibold">{d.sucursal}</td>
                  <td className="p-2 border-r border-slate-200">{d.zona}</td>
                  <td className="p-2 border-r border-slate-200">{d.subzona}</td>
                  <td className="p-2 border-r border-slate-200">{d.coordinador}</td>
                  <td className="p-2 border-r border-slate-200 font-mono font-bold text-blue-700">
                    {d.noDist}
                  </td>
                  <td className="p-2 border-r border-slate-200">{d.nombreDistribuidor}</td>
                  <td className="p-2 border-r border-slate-200">{d.genero}</td>
                  <td className="p-2 border-r border-slate-200">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        d.estatus === 'ACTIVO'
                          ? 'bg-emerald-100 text-emerald-800'
                          : d.estatus === 'REESTRUCTURA'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {d.estatus}
                    </span>
                  </td>
                  <td className="p-2 border-r border-slate-200">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
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
                  <td className="p-2 border-r border-slate-200 font-mono text-right">
                    ${d.creditoLimite.toLocaleString('es-MX')}
                  </td>
                  <td className="p-2 border-r border-slate-200 font-mono text-right text-rose-600 font-bold">
                    ${d.saldoActual.toLocaleString('es-MX')}
                  </td>
                  <td className="p-2 font-mono text-right text-emerald-600 font-bold">
                    ${d.disponible.toLocaleString('es-MX')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PAGINATION (Idéntico a Financialsoft) */}
      <footer className="bg-[#f7f8fa] border-t border-slate-300 p-2.5 px-4 flex flex-wrap items-center justify-between text-xs text-slate-600">
        <div>
          Página 1 de 144 (<span className="font-bold text-slate-800">7171 elementos</span>)
        </div>
        <div className="flex items-center gap-1 font-mono text-xs">
          <button className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold">1</button>
          <button className="px-2 py-0.5 rounded hover:bg-slate-200 text-slate-700">2</button>
          <button className="px-2 py-0.5 rounded hover:bg-slate-200 text-slate-700">3</button>
          <button className="px-2 py-0.5 rounded hover:bg-slate-200 text-slate-700">4</button>
          <span className="px-1 text-slate-400">...</span>
          <button className="px-2 py-0.5 rounded hover:bg-slate-200 text-slate-700">143</button>
          <button className="px-2 py-0.5 rounded hover:bg-slate-200 text-slate-700">144</button>
          <button className="px-2 py-0.5 rounded border border-slate-300 text-slate-700 font-sans ml-1 hover:bg-slate-200">
            [All]
          </button>
        </div>
      </footer>
    </div>
  );
}
