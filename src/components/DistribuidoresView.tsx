'use client';

import React, { useState } from 'react';
import { DistribuidorCore } from '@/types/core';
import { useCoreSync } from '@/context/CoreSyncContext';
import {
  Search,
  FileSpreadsheet,
  Smartphone,
  FileText,
  MessageSquare,
  Unlock,
  CheckCircle2,
  Users,
  Briefcase,
  ExternalLink,
} from 'lucide-react';
import {
  EstadoCuentaModal,
  MensajesMasivosModal,
  QuitarCastigoModal,
  NotificacionAppModal,
} from './modals/DistribuidorModals';

export default function DistribuidoresView() {
  const { distribuidores, updateDistribuidor } = useCoreSync();
  const [selectedNoDist, setSelectedNoDist] = useState<number | null>(1002);
  const [coordinatorFilter, setCoordinatorFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [activeModal, setActiveModal] = useState<'estadoCuenta' | 'mensajes' | 'castigo' | 'push' | 'relacion' | 'cartera' | null>(null);

  const selectedDist = distribuidores.find((d) => d.noDist === selectedNoDist) || distribuidores[0];

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

    if (actionName === 'Estado de Cuenta') {
      setActiveModal('estadoCuenta');
    } else if (actionName === 'Cartera de Clientes' || actionName === 'Cartera') {
      setActiveModal('cartera');
    } else if (actionName === 'Relación de Cobro' || actionName === 'Relación' || actionName === 'Relación Recibos') {
      setActiveModal('relacion');
    } else if (actionName === 'Recibos Emitidos') {
      setActiveModal('relacion');
    } else if (actionName === 'Mensajes Masivos WhatsApp' || actionName === 'Mensajes masivos') {
      setActiveModal('mensajes');
    } else if (actionName === 'Quitar Castigo / Reactivar' || actionName === 'Quitar fecha castigo') {
      setActiveModal('castigo');
    } else if (actionName === 'Notificación LanaApp' || actionName === 'Enviar notificación APP') {
      setActiveModal('push');
    } else {
      alert(`Módulo: "${actionName}" ejecutado para DV #${selectedDist.noDist} (${selectedDist.nombreDistribuidor})`);
    }
  };

  const handleExportXLS = () => {
    const headers = ['NoDist', 'Distribuidor', 'Sucursal', 'Zona', 'Coordinador', 'Nivel', 'Estatus', 'Línea Crédito', 'Saldo', 'Disponible', 'LanaApp'];
    const rows = distribuidores.map((d) => [
      d.noDist,
      `"${d.nombreDistribuidor}"`,
      d.sucursal,
      d.zona,
      `"${d.coordinador}"`,
      d.nivel,
      d.estatus,
      d.creditoLimite,
      d.saldoActual,
      d.disponible,
      d.tieneLanaApp ? 'ACTIVA' : 'NO',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `distribuidores_lanahora_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 bg-slate-50 text-slate-800 flex flex-col min-h-0 overflow-y-auto font-sans p-4 lg:p-6 space-y-4">
      {/* Top Action Toolbar: Botones de Acción sobre la pantalla */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Left: Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleActionClick('Estado de Cuenta')}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Estado de Cuenta</span>
          </button>

          <button
            onClick={() => handleActionClick('Cartera de Clientes')}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition"
          >
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>Cartera Clientes</span>
          </button>

          <button
            onClick={() => handleActionClick('Relación de Cobro')}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
            <span>Relación de Cobro</span>
          </button>

          <button
            onClick={() => handleActionClick('Recibos Emitidos')}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Recibos Emitidos</span>
          </button>

          <button
            onClick={() => handleActionClick('Notificación LanaApp')}
            className="px-3.5 py-2 rounded-xl bg-[#facc15] hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition"
          >
            <Smartphone className="w-3.5 h-3.5 text-slate-950" />
            <span>Notificación LanaApp</span>
          </button>

          <button
            onClick={() => handleActionClick('Mensajes Masivos WhatsApp')}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp Masivo</span>
          </button>

          <button
            onClick={() => handleActionClick('Quitar Castigo / Reactivar')}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition"
          >
            <Unlock className="w-3.5 h-3.5 text-amber-600" />
            <span>Reactivar DV</span>
          </button>
        </div>

        {/* Right: Export Button */}
        <div>
          <button
            onClick={handleExportXLS}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-2 border border-emerald-200 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Exportar Excel</span>
          </button>
        </div>
      </div>

      {/* Selected Distribuidor Banner */}
      {selectedDist && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="font-extrabold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-lg">
              DV #{selectedDist.noDist}
            </span>
            <span className="font-bold text-slate-900 text-sm">
              {selectedDist.nombreDistribuidor}
            </span>
            <span className="text-slate-500">
              Coord: {selectedDist.coordinador} • {selectedDist.sucursal}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
              {selectedDist.nivel}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              selectedDist.estatus === 'ACTIVO' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {selectedDist.estatus}
            </span>
            <span className="text-emerald-700 font-bold">
              Disp: ${selectedDist.disponible.toLocaleString('es-MX')}
            </span>
          </div>

          <button
            onClick={() => setSelectedNoDist(null)}
            className="text-slate-400 hover:text-slate-700 text-xs font-bold px-2 py-1 rounded-lg hover:bg-white transition"
          >
            ✕ Cerrar selección
          </button>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col space-y-4 overflow-y-auto min-w-0">
        {/* Filter Search Input Bar */}
        <div className="bg-white p-3.5 rounded-2xl border border-blue-100 flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3 flex-1 max-w-2xl">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-4 h-4 text-blue-500 shrink-0" />
              <input
                type="text"
                placeholder="Buscar por nombre, No. de DV, Coordinador, Sucursal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#2563eb] bg-white text-slate-900"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-slate-600 font-bold text-xs whitespace-nowrap">Coordinador:</span>
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
          </div>

          <div className="text-xs text-slate-500 whitespace-nowrap">
            Mostrando <span className="font-black text-[#2563eb] font-mono">{filtered.length}</span> de 7,171 distribuidoras
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-blue-100 overflow-x-auto shadow-md flex-1">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
            <thead className="bg-[#2563eb] text-white uppercase text-[10px] tracking-wider font-extrabold select-none">
              <tr>
              <th className="p-3">Detalle</th>
              <th className="p-3">Cartera</th>
              <th className="p-3">Sucursal</th>
              <th className="p-3">Zona</th>
              <th className="p-3">Subzona</th>
              <th className="p-3">Coordinador</th>
              <th className="p-3">No. Dist</th>
              <th className="p-3">Nombre Distribuidor</th>
              <th className="p-3">Género</th>
              <th className="p-3">Estatus</th>
              <th className="p-3">Nivel</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((d) => {
              const isSelected = selectedNoDist === d.noDist;
              return (
                <tr
                  key={d.noDist}
                  onClick={() => setSelectedNoDist(d.noDist)}
                  className={`cursor-pointer transition ${
                    isSelected ? 'bg-blue-50/90 font-medium' : 'hover:bg-blue-50/40'
                  }`}
                >
                  <td className="p-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNoDist(d.noDist);
                        setActiveModal('estadoCuenta');
                      }}
                      className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-600 hover:text-white transition"
                    >
                      Detalle
                    </button>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNoDist(d.noDist);
                        setActiveModal('cartera');
                      }}
                      className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-600 hover:text-white transition"
                    >
                      Cartera
                    </button>
                  </td>
                  <td className="p-3 text-slate-800 font-semibold">{d.sucursal}</td>
                  <td className="p-3 text-slate-600">{d.zona}</td>
                  <td className="p-3 text-slate-600">{d.subzona}</td>
                  <td className="p-3 text-slate-800 font-medium">{d.coordinador}</td>
                  <td className="p-3 font-mono font-bold text-[#2563eb]">#{d.noDist}</td>
                  <td className="p-3 font-bold text-slate-900">{d.nombreDistribuidor}</td>
                  <td className="p-3 text-slate-600">{d.genero}</td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        d.estatus === 'ACTIVO'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : d.estatus === 'REESTRUCTURA'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {d.estatus}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-yellow-100 text-yellow-900 border border-yellow-300">
                      {d.nivel}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      </div>

      {/* MODALS */}
      <EstadoCuentaModal
        isOpen={activeModal === 'estadoCuenta'}
        onClose={() => setActiveModal(null)}
        distribuidor={selectedDist}
      />

      <MensajesMasivosModal
        isOpen={activeModal === 'mensajes'}
        onClose={() => setActiveModal(null)}
        distribuidor={selectedDist}
      />

      <QuitarCastigoModal
        isOpen={activeModal === 'castigo'}
        onClose={() => setActiveModal(null)}
        distribuidor={selectedDist}
        onUpdateDistribuidor={(up) => {
          updateDistribuidor(up);
        }}
      />

      <NotificacionAppModal
        isOpen={activeModal === 'push'}
        onClose={() => setActiveModal(null)}
        distribuidor={selectedDist}
      />

      {/* Relación de Cobro Modal */}
      {activeModal === 'relacion' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 w-full max-w-xl overflow-hidden animate-in fade-in">
            <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <FileText className="w-4 h-4 text-yellow-300" />
                <span>Relación de Cobranza Quincenal — DV #{selectedDist.noDist}</span>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-white/80 hover:text-white p-1">✕</button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900 block">{selectedDist.nombreDistribuidor}</span>
                  <span className="text-[11px] text-slate-500">Coordinador: {selectedDist.coordinador} • {selectedDist.sucursal}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase">Cobro Estimado</span>
                  <span className="font-mono font-black text-blue-700 text-base">${selectedDist.saldoActual.toLocaleString('es-MX')}</span>
                </div>
              </div>

              <div className="space-y-2 border border-slate-200 rounded-xl p-3">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-slate-600">Total Vales Colocados Activos:</span>
                  <span className="font-bold font-mono">14 vales</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-slate-600">Comisión Distribuidora (10%):</span>
                  <span className="font-bold font-mono text-emerald-700">${(selectedDist.saldoActual * 0.10).toLocaleString('es-MX')}</span>
                </div>
                <div className="flex justify-between py-1 font-bold text-slate-900">
                  <span>Neto a Entregar a Sucursal:</span>
                  <span className="font-mono text-blue-700">${(selectedDist.saldoActual * 0.90).toLocaleString('es-MX')}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                <button onClick={() => window.print()} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Imprimir Relación de Cobro</span>
                </button>
                <button onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cartera de Clientes Modal */}
      {activeModal === 'cartera' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 w-full max-w-2xl overflow-hidden animate-in fade-in">
            <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Users className="w-4 h-4 text-yellow-300" />
                <span>Cartera de Clientes & Vales — DV #{selectedDist.noDist} {selectedDist.nombreDistribuidor}</span>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-white/80 hover:text-white p-1">✕</button>
            </div>

            <div className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <table className="w-full text-left text-xs border rounded-xl overflow-hidden">
                <thead className="bg-[#2563eb] text-white font-bold text-[10px] uppercase">
                  <tr>
                    <th className="p-2.5">Folio Vale</th>
                    <th className="p-2.5">Cliente</th>
                    <th className="p-2.5">Monto</th>
                    <th className="p-2.5">Saldo</th>
                    <th className="p-2.5">Plazo</th>
                    <th className="p-2.5">Estatus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono font-bold text-blue-700">V-50491</td>
                    <td className="p-2.5 font-bold text-slate-900">MARIA GUADALUPE SANCHEZ</td>
                    <td className="p-2.5 font-mono">$6,000.00</td>
                    <td className="p-2.5 font-mono text-rose-600 font-bold">$2,400.00</td>
                    <td className="p-2.5 font-mono">8 qnas</td>
                    <td className="p-2.5"><span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">Al Corriente</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono font-bold text-blue-700">V-50495</td>
                    <td className="p-2.5 font-bold text-slate-900">JUAN CARLOS NAVARRO</td>
                    <td className="p-2.5 font-mono">$8,000.00</td>
                    <td className="p-2.5 font-mono text-rose-600 font-bold">$5,000.00</td>
                    <td className="p-2.5 font-mono">10 qnas</td>
                    <td className="p-2.5"><span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">Al Corriente</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono font-bold text-blue-700">V-48102</td>
                    <td className="p-2.5 font-bold text-slate-900">YAZMIN MENDOZA CHAVEZ</td>
                    <td className="p-2.5 font-mono">$3,500.00</td>
                    <td className="p-2.5 font-mono text-emerald-700 font-bold">$0.00</td>
                    <td className="p-2.5 font-mono">6 qnas</td>
                    <td className="p-2.5"><span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600">Liquidado</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-white border-t border-slate-200 flex justify-end">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
