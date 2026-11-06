'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { DispersionSTP, PagoCore } from '@/types/core';
import { useCoreSync } from '@/context/CoreSyncContext';

export default function DispersionView() {
  const [activeTab, setActiveTab] = useState<'dispersion' | 'pagos'>('dispersion');
  const { dispersiones, pagos, registrarCanje, registrarPago } = useCoreSync();
  const [searchFilter, setSearchFilter] = useState('');
  const [isNewDispOpen, setIsNewDispOpen] = useState(false);

  // New Dispersion Form
  const [newBeneficiario, setNewBeneficiario] = useState('');
  const [newCurp, setNewCurp] = useState('');
  const [newClabe, setNewClabe] = useState('');
  const [newBanco, setNewBanco] = useState('BBVA México');
  const [newMonto, setNewMonto] = useState('5000');
  const [newConcepto, setNewConcepto] = useState('Desembolso ValeLanAhora');

  const filteredDispersiones = dispersiones.filter((d) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      d.beneficiario.toLowerCase().includes(q) ||
      d.folioSTP.toLowerCase().includes(q) ||
      d.claveRastreo.toLowerCase().includes(q) ||
      d.creditoId.toLowerCase().includes(q) ||
      d.curp.toLowerCase().includes(q) ||
      d.banco.toLowerCase().includes(q) ||
      d.concepto.toLowerCase().includes(q)
    );
  });

  const filteredPagos = pagos.filter((p) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      p.referencia.toLowerCase().includes(q) ||
      (p.distribuidorNombre && p.distribuidorNombre.toLowerCase().includes(q)) ||
      (p.clienteNombre && p.clienteNombre.toLowerCase().includes(q)) ||
      (p.establecimiento && p.establecimiento.toLowerCase().includes(q))
    );
  });

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

  const handleExportCSV = () => {
    if (activeTab === 'dispersion') {
      const headers = ['Folio STP', 'Clave Rastreo', 'CréditoID', 'Beneficiario', 'CURP', 'CLABE', 'Banco', 'Monto', 'Fecha', 'Estatus'];
      const rows = dispersiones.map((d) => [
        d.folioSTP,
        d.claveRastreo,
        d.creditoId,
        `"${d.beneficiario}"`,
        d.curp,
        d.clabe,
        `"${d.banco}"`,
        d.monto,
        `"${d.fechaHora}"`,
        d.estatus,
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `dispersiones_stp_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = ['Referencia', 'Medio Pago', 'NoDist', 'Distribuidor', 'Cliente', 'Monto', 'Comision', 'Fecha', 'Estatus', 'Establecimiento'];
      const rows = pagos.map((p) => [
        p.referencia,
        p.medioPago,
        p.noDist || '',
        `"${p.distribuidorNombre || ''}"`,
        `"${p.clienteNombre || ''}"`,
        p.monto,
        p.comision,
        `"${p.fechaPago}"`,
        p.estatus,
        `"${p.establecimiento || ''}"`,
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `recaudacion_pagos_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 text-slate-800 flex flex-col min-h-0 overflow-y-auto font-sans p-4 lg:p-6 space-y-4">
      {/* Top Action Toolbar: Botones sobre la pantalla */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Left: Segmented Tabs & New Dispersion */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
            {[
              { id: 'dispersion', name: 'Dispersión SPEI (STP)', icon: Send, count: dispersiones.length },
              { id: 'pagos', name: 'Recaudación & Paynet', icon: Barcode, count: pagos.length },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setActiveTab(opt.id as any)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                  activeTab === opt.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <opt.icon className="w-3.5 h-3.5" />
                <span>{opt.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === opt.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {opt.count}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsNewDispOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#facc15] hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-xs transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-slate-950" />
            <span>+ Nueva Dispersión STP</span>
          </button>
        </div>

        {/* Right: STP Status & Export */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>STP SPEI 24/7 En Línea (88ms)</span>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-2 border border-emerald-200 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Exportar Excel</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-x-auto flex flex-col space-y-3">
        {/* Search & Stats Bar */}
        <div className="bg-white p-3 rounded-2xl border border-blue-100 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-blue-600 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={activeTab === 'dispersion' ? 'Buscar por Beneficiario, Folio STP o Banco...' : 'Buscar por Referencia Paynet, DV o Tienda...'}
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs w-80 text-slate-900 focus:outline-none focus:border-[#2563eb] focus:bg-white font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-medium">
              Mostrando{' '}
              <strong className="text-[#2563eb]">
                {activeTab === 'dispersion' ? filteredDispersiones.length : filteredPagos.length}
              </strong>{' '}
              movimientos en {activeTab === 'dispersion' ? 'Dispersión STP' : 'Recaudación Paynet'}
            </span>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl border border-blue-100 overflow-hidden shadow-xs flex-1">
          {activeTab === 'dispersion' ? (
            /* TAB DISPERSIONES STP */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                <thead className="bg-[#2563eb] text-white uppercase text-[10px] tracking-wider font-extrabold select-none">
                  <tr>
                    <th className="px-3.5 py-2.5">Acciones</th>
                    <th className="px-3.5 py-2.5">Folio STP</th>
                    <th className="px-3.5 py-2.5">Clave de Rastreo</th>
                    <th className="px-3.5 py-2.5">Vale / Crédito</th>
                    <th className="px-3.5 py-2.5">Beneficiario</th>
                    <th className="px-3.5 py-2.5">Institución Bancaria</th>
                    <th className="px-3.5 py-2.5">CLABE Destino</th>
                    <th className="px-3.5 py-2.5">Monto Dispersado</th>
                    <th className="px-3.5 py-2.5">Fecha y Hora</th>
                    <th className="px-3.5 py-2.5">Estatus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDispersiones.map((d) => (
                    <tr key={d.id} className="hover:bg-blue-50/40 transition">
                      <td className="px-3.5 py-2 font-medium">
                        <button
                          onClick={() => alert(`Comprobante CEP (Comprobante Electrónico de Pago de Banxico) para ${d.claveRastreo}`)}
                          className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-600 hover:text-white transition flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Descargar CEP</span>
                        </button>
                      </td>
                      <td className="px-3.5 py-2 font-mono font-bold text-[#2563eb]">{d.folioSTP}</td>
                      <td className="px-3.5 py-2 font-mono text-slate-700 font-semibold">{d.claveRastreo}</td>
                      <td className="px-3.5 py-2 font-mono font-bold">
                        <span className="px-2 py-0.5 rounded-md text-[11px] bg-amber-50 text-amber-900 border border-amber-300 font-black">
                          #{d.creditoId}
                        </span>
                      </td>
                      <td className="px-3.5 py-2 font-bold text-slate-900">{d.beneficiario}</td>
                      <td className="px-3.5 py-2 text-slate-700">{d.banco}</td>
                      <td className="px-3.5 py-2 font-mono text-[11px] text-slate-600">{d.clabe}</td>
                      <td className="px-3.5 py-2 font-mono font-bold text-slate-900 text-sm">
                        ${d.monto.toLocaleString('es-MX')}
                      </td>
                      <td className="px-3.5 py-2 font-mono text-slate-500">{d.fechaHora}</td>
                      <td className="px-3.5 py-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          d.estatus === 'LIQUIDADO'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {d.estatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* TAB RECAUDACIÓN Y PAYNET */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                <thead className="bg-[#2563eb] text-white uppercase text-[10px] tracking-wider font-extrabold select-none">
                  <tr>
                    <th className="px-3.5 py-2.5">Acciones</th>
                    <th className="px-3.5 py-2.5">Referencia de Pago</th>
                    <th className="px-3.5 py-2.5">Canal / Medio</th>
                    <th className="px-3.5 py-2.5">Distribuidora</th>
                    <th className="px-3.5 py-2.5">Cliente Acreditado</th>
                    <th className="px-3.5 py-2.5">Monto Cobrado</th>
                    <th className="px-3.5 py-2.5">Establecimiento</th>
                    <th className="px-3.5 py-2.5">Fecha y Hora</th>
                    <th className="px-3.5 py-2.5">Estatus Conciliación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPagos.map((p) => (
                    <tr key={p.id} className="hover:bg-blue-50/40 transition">
                      <td className="px-3.5 py-2 font-medium">
                        <button
                          onClick={() => alert(`Conciliando pago ${p.referencia} en Core Contabilidad`)}
                          className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-600 hover:text-white transition"
                        >
                          Conciliar
                        </button>
                      </td>
                      <td className="px-3.5 py-2 font-mono font-bold text-[#2563eb]">{p.referencia}</td>
                      <td className="px-3.5 py-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                          {p.medioPago}
                        </span>
                      </td>
                      <td className="px-3.5 py-2 text-slate-800 font-semibold">{p.distribuidorNombre || '—'}</td>
                      <td className="px-3.5 py-2 font-bold text-slate-900">{p.clienteNombre || '—'}</td>
                      <td className="px-3.5 py-2 font-mono font-bold text-emerald-700 text-sm">
                        ${p.monto.toLocaleString('es-MX')}
                      </td>
                      <td className="px-3.5 py-2 text-slate-600">{p.establecimiento}</td>
                      <td className="px-3.5 py-2 font-mono text-slate-500">{p.fechaPago}</td>
                      <td className="px-3.5 py-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          ✓ {p.estatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Nueva Dispersión STP */}
      {isNewDispOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Send className="w-4 h-4 text-yellow-300" />
                <span>Nueva Orden de Dispersión SPEI (STP)</span>
              </div>
              <button onClick={() => setIsNewDispOpen(false)} className="text-white/80 hover:text-white p-1">✕</button>
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
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Institución Bancaria</label>
                  <select
                    value={newBanco}
                    onChange={(e) => setNewBanco(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
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
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold"
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
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-sm tracking-wider"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Concepto de Pago</label>
                <input
                  type="text"
                  value={newConcepto}
                  onChange={(e) => setNewConcepto(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewDispOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black shadow"
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

