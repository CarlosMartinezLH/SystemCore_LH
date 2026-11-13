'use client';

import React, { useState } from 'react';
import {
  CATEGORIAS_CONFIG,
  COMISIONES_POR_PERFIL,
  TASAS_POR_PLAZO,
  COSTOS_SEGURO,
  FACTORES_LANATIENDA,
  INCREMENTOS_VALE_LANA,
  BC_SCORE_RANGOS,
  DistribuidorCategoria,
  DistribuidorPerfil,
} from '@/types/businessRules';
import {
  calcularAmortizacionVale,
  calcularComisionDistribuidora,
  evaluarIncrementoLineaValeLana,
  calcularPrecioVentaLanaTienda,
  evaluarScoreBuro,
  validarCreditoGeneraCanje,
} from '@/lib/rules/businessRulesEngine';
import { useCoreSync } from '@/context/CoreSyncContext';
import { formatMoney } from '@/lib/utils/formatters';
import {
  FileText,
  Percent,
  Award,
  Calculator,
  Shield,
  ShoppingBag,
  TrendingUp,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export default function BusinessRulesView() {
  const { distribuidores, personas, creditos } = useCoreSync();
  const [activeTab, setActiveTab] = useState<
    'comisiones' | 'categorias' | 'amortizaciones' | 'lanatienda' | 'seguros' | 'incrementos' | 'buro' | 'validador'
  >('comisiones');

  // Simulador de comisiones
  const [simPerfil, setSimPerfil] = useState<DistribuidorPerfil>('D-AAA');
  const [simDiaPago, setSimDiaPago] = useState<number>(15);
  const [simSaldoRelacion, setSimSaldoRelacion] = useState<number>(10460);

  // Simulador de amortización
  const [simCapital, setSimCapital] = useState<number>(1000);
  const [simPlazo, setSimPlazo] = useState<number>(6);
  const [simPerfilSeguro, setSimPerfilSeguro] = useState<string>('DISTRIBUIDORA_AAA');

  // Simulador LanaTienda
  const [simCostoBase, setSimCostoBase] = useState<number>(1550);

  // Simulador Buró
  const [simScore, setSimScore] = useState<number>(675);
  const [simIsNoHit, setSimIsNoHit] = useState<boolean>(false);

  // Simulador Validador dbo.CreditoGeneraCanje
  const [valSelectedDist, setValSelectedDist] = useState<number>(distribuidores[0]?.noDist || 1002);
  const [valSelectedPersona, setValSelectedPersona] = useState<number>(personas[0]?.personaId || 1001);
  const [valMonto, setValMonto] = useState<number>(2500);
  const [valPlazo, setValPlazo] = useState<number>(6);
  const [valTipoCredito, setValTipoCredito] = useState<'VALE' | 'DISTRIBUIDOR'>('VALE');

  const comisionResult = calcularComisionDistribuidora(simPerfil, simDiaPago);
  const comisionPesos = (simSaldoRelacion * comisionResult.porcentaje);

  const amortResult = calcularAmortizacionVale(simCapital, simPlazo, simPerfilSeguro);
  const tiendaResult = calcularPrecioVentaLanaTienda(simCostoBase);
  const buroResult = evaluarScoreBuro(simScore, simIsNoHit);

  const currentDist = distribuidores.find((d) => d.noDist === valSelectedDist) || distribuidores[0];
  const currentPersona = personas.find((p) => p.personaId === valSelectedPersona) || personas[0];

  const validationResult = validarCreditoGeneraCanje({
    importe: valMonto,
    plazos: valPlazo,
    requiereDistribuidor: valTipoCredito === 'DISTRIBUIDOR',
    distribuidor: currentDist,
    cliente: currentPersona,
    todosLosCreditos: creditos,
    todasLasPersonas: personas,
  });

  return (
    <div className="w-full p-4 lg:p-6 space-y-5">
      {/* Encabezado Ejecutivo Limpio con Frosted Glass y Difuminado */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            Reglas del Negocio & Políticas Operativas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Motor central de políticas de crédito, tablas de comisiones por día de corte, amortizaciones oficiales, esquema de seguros, incrementos de línea y matriz dbo.CreditoGeneraCanje.
          </p>
        </div>

        {/* Barra de pestañas segmentada */}
        <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80 overflow-x-auto no-scrollbar text-xs font-bold">
          <button
            onClick={() => setActiveTab('comisiones')}
            className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'comisiones'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            Comisiones por Día
          </button>
          <button
            onClick={() => setActiveTab('categorias')}
            className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'categorias'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Categorías & Líneas
          </button>
          <button
            onClick={() => setActiveTab('amortizaciones')}
            className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'amortizaciones'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            Amortizaciones Vale Lana
          </button>
          <button
            onClick={() => setActiveTab('validador')}
            className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'validador'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Matriz CreditoGeneraCanje
          </button>
          <button
            onClick={() => setActiveTab('lanatienda')}
            className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'lanatienda'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            LanaTienda Factores
          </button>
          <button
            onClick={() => setActiveTab('seguros')}
            className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'seguros'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Costos de Seguros
          </button>
          <button
            onClick={() => setActiveTab('incrementos')}
            className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'incrementos'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Incrementos de Línea
          </button>
          <button
            onClick={() => setActiveTab('buro')}
            className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'buro'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            BC Score & Buró
          </button>
        </div>
      </div>

      {/* CONTENIDO SEGÚN PESTAÑA */}

      {/* TAB 1: COMISIONES POR DÍA DE PAGO */}
      {activeTab === 'comisiones' && (
        <div className="space-y-6">
          {/* Simulador dinámico */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-600" />
              Simulador de Bonificación por Fecha de Pago Quincenal
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Perfil de Distribuidora</label>
                <select
                  value={simPerfil}
                  onChange={(e) => setSimPerfil(e.target.value as DistribuidorPerfil)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-slate-50 focus:bg-white"
                >
                  <option value="D-AAA">D-AAA (Distribuidora Élite)</option>
                  <option value="D-AA">D-AA (Distribuidora Avanzada)</option>
                  <option value="E-AAA">E-AAA (Emprendedora Élite)</option>
                  <option value="D-A">D-A (Distribuidora Básica)</option>
                  <option value="E-AA">E-AA (Emprendedora Avanzada)</option>
                  <option value="E-A">E-A (Emprendedora Básica)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Día de Pago (Corte)</label>
                <select
                  value={simDiaPago}
                  onChange={(e) => setSimDiaPago(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-slate-50 focus:bg-white"
                >
                  <option value={15}>Día 30 o 15 (Fecha Límite Oficial)</option>
                  <option value={16}>Día 01 o 16 (+1 día)</option>
                  <option value={17}>Día 02 o 17 (+2 días)</option>
                  <option value={18}>Día 03 o 18 (+3 días)</option>
                  <option value={19}>Día 04 o 19 (+4 días - Configuración)</option>
                  <option value={20}>Día 05 o 20 (+5 días)</option>
                  <option value={21}>Día 06 o 21 (+6 días)</option>
                  <option value={22}>Día 07 o 22 (+7 días)</option>
                  <option value={23}>Día 08 o 23 (+8 días límite)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Saldo a Liquidar ($ MXN)</label>
                <input
                  type="number"
                  value={simSaldoRelacion}
                  onChange={(e) => setSimSaldoRelacion(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Resultado del simulador */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 bg-slate-50 p-4 rounded-2xl">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Rango de Días</span>
                <p className="text-lg font-black text-slate-900 mt-0.5">{comisionResult.diaRango}</p>
                <span className={`text-[10px] font-bold ${comisionResult.seMuestraEnRelacion ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {comisionResult.seMuestraEnRelacion ? '● Se muestra en relación' : '● Configuración interna'}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Tasa de Comisión</span>
                <p className="text-2xl font-black text-indigo-600 mt-0.5">{comisionResult.bonificacionPorcentaje}%</p>
                <span className="text-[10px] text-slate-500">Sobre saldo relación</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Bonificación Estimada</span>
                <p className="text-2xl font-black text-emerald-600 mt-0.5">
                  {formatMoney(comisionPesos)}
                </p>
                <span className="text-[10px] text-slate-500">Ganancia Distribuidora</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Neto a Pagar por DV</span>
                <p className="text-2xl font-black text-slate-900 mt-0.5">
                  {formatMoney(simSaldoRelacion - comisionPesos)}
                </p>
                <span className="text-[10px] text-slate-500">Monto final liquidado</span>
              </div>
            </div>
          </div>

          {/* Tabla de matrices de comisiones */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(COMISIONES_POR_PERFIL).map(([perfilKey, items]) => {
              const nombreLabel =
                perfilKey === 'D-AAA'
                  ? 'Distribuidora D-AAA'
                  : perfilKey === 'D-AA_E-AAA'
                  ? 'D-AA & E-AAA'
                  : perfilKey === 'D-A_E-AA'
                  ? 'D-A & E-AA'
                  : 'Emprendedora E-A';

              return (
                <div key={perfilKey} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="bg-slate-100 border-b border-slate-200 p-3.5">
                    <h4 className="text-xs font-black tracking-tight text-slate-900">{nombreLabel}</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Escala de 30-15 a 08-23</p>
                  </div>
                  <div className="divide-y divide-slate-100 text-xs">
                    {items.map((it, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 flex items-center justify-between ${
                          it.seMuestraEnRelacion ? 'bg-white' : 'bg-slate-50/60'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-700">{it.diaRango}</span>
                          {it.seMuestraEnRelacion && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Visible en relación" />
                          )}
                        </div>
                        <span className="font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                          {(it.porcentaje * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORÍAS & LÍNEAS DE CRÉDITO */}
      {activeTab === 'categorias' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-base font-black text-slate-900 mb-2 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Matriz de Categorías, Líneas de Crédito y Préstamos Máximos
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Los cortes para cambio de categoría se realizan los <strong>días 22 y 7 de cada mes</strong> según el saldo
              acumulado en la cuenta del Distribuidor. El cambio de perfil se otorga con <strong>6 pagos puntuales consecutivos</strong>.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-black">
                    <th className="p-3.5 rounded-l-xl">Categoría</th>
                    <th className="p-3.5">Saldo de Cuenta al Cierre</th>
                    <th className="p-3.5">Línea de Crédito Personal</th>
                    <th className="p-3.5">Préstamo Máx. Cliente Final</th>
                    <th className="p-3.5 rounded-r-xl">Corte Evaluación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {Object.values(CATEGORIAS_CONFIG).map((cat) => (
                    <tr key={cat.categoria} className="hover:bg-slate-50/70 transition">
                      <td className="p-3.5 font-black text-slate-900 flex items-center gap-2">
                        <span
                          className={`w-3 h-3 rounded-full ${
                            cat.categoria === 'DIAMANTE'
                              ? 'bg-blue-500'
                              : cat.categoria === 'PLATINO'
                              ? 'bg-slate-400'
                              : cat.categoria === 'ORO'
                              ? 'bg-amber-400'
                              : cat.categoria === 'PLATA'
                              ? 'bg-slate-300'
                              : 'bg-amber-700'
                          }`}
                        />
                        {cat.categoria}
                      </td>
                      <td className="p-3.5 text-slate-600">{cat.descripcion}</td>
                      <td className="p-3.5 font-bold text-indigo-700">
                        {formatMoney(cat.lineaCreditoPersonal)} MXN
                      </td>
                      <td className="p-3.5 font-bold text-emerald-700">
                        {formatMoney(cat.prestamoMaxClienteFinal)} MXN
                      </td>
                      <td className="p-3.5 text-slate-500">22 y 7 de cada mes</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Ascenso de Perfiles */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">
                Escalera de Ascenso de Perfiles (Al tener 6 pagos puntuales)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-500 block text-[10px]">LÍNEA EMPRENDEDORAS</span>
                    <span className="font-black text-slate-800 text-sm">E-A ➔ E-AA ➔ E-AAA ➔ D-AAA</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                    6 Pagos Puntuales
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-500 block text-[10px]">LÍNEA DISTRIBUIDORAS</span>
                    <span className="font-black text-slate-800 text-sm">D-A ➔ D-AA ➔ D-AAA</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                    6 Pagos Puntuales
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AMORTIZACIONES VALE LANA */}
      {activeTab === 'amortizaciones' && (
        <div className="space-y-6">
          {/* Simulador */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-600" />
              Calculadora Oficial de Amortización Quincenal
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Capital Prestado ($ MXN)</label>
                <input
                  type="number"
                  step={500}
                  min={1000}
                  max={15000}
                  value={simCapital}
                  onChange={(e) => setSimCapital(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-slate-50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Plazo (Quincenas)</label>
                <select
                  value={simPlazo}
                  onChange={(e) => setSimPlazo(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-slate-50"
                >
                  <option value={4}>4 Quincenas (Tasa 15% mensual)</option>
                  <option value={6}>6 Quincenas (Tasa 14% mensual)</option>
                  <option value={8}>8 Quincenas (Tasa 13% mensual)</option>
                  <option value={10}>10 Quincenas (Tasa 12% mensual)</option>
                  <option value={12}>12 Quincenas (Tasa 11% mensual)</option>
                  <option value={14}>14 Quincenas (Tasa 10% mensual)</option>
                  <option value={16}>16 Quincenas (Tasa 9% mensual)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Perfil Seguro</label>
                <select
                  value={simPerfilSeguro}
                  onChange={(e) => setSimPerfilSeguro(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-slate-50"
                >
                  <option value="DISTRIBUIDORA_AAA">Distribuidora AAA ($60 seguro CF)</option>
                  <option value="DISTRIBUIDORA_AA">Distribuidora AA ($65 seguro CF)</option>
                  <option value="DISTRIBUIDORA_A">Distribuidora A ($75 seguro CF)</option>
                </select>
              </div>
            </div>

            {/* Ficha técnica de amortización */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t border-slate-100 bg-slate-50 p-4 rounded-2xl">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Tasa Mensual</span>
                <p className="text-xl font-black text-indigo-700 mt-0.5">{(amortResult.tasaMensual * 100).toFixed(0)}%</p>
                <span className="text-[10px] text-slate-500">Tasa por plazo</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Interés Total</span>
                <p className="text-xl font-black text-slate-900 mt-0.5">{formatMoney(amortResult.interesTotal)} MXN</p>
                <span className="text-[10px] text-slate-500">(Capital × Tasa × Plazo) / 2</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Seguro de Vida</span>
                <p className="text-xl font-black text-slate-900 mt-0.5">{formatMoney(amortResult.seguroCliente)} MXN</p>
                <span className="text-[10px] text-slate-500">Adicional al pago</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Total a Pagar</span>
                <p className="text-xl font-black text-slate-900 mt-0.5">{formatMoney(amortResult.totalPagar)} MXN</p>
                <span className="text-[10px] text-slate-500">Capital + Interés + Seguro</span>
              </div>
              <div className="col-span-2 md:col-span-1 bg-amber-400 p-2.5 rounded-xl text-slate-950 flex flex-col justify-center">
                <span className="text-[10px] font-black uppercase tracking-wider">Pago Quincenal</span>
                <p className="text-2xl font-black">{formatMoney(amortResult.pagoQuincenalSinSeguro)}</p>
                <span className="text-[9px] font-bold">Por {simPlazo} quincenas</span>
              </div>
            </div>
          </div>

          {/* Tabla de amortizaciones comunes del documento */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-4">
              Tabla de Pagos Quincenales Oficiales (Ejemplos de $1,000 a $6,000)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                    <th className="p-3 text-left rounded-l-xl">Capital ($)</th>
                    <th className="p-3">4Q (15%)</th>
                    <th className="p-3">6Q (14%)</th>
                    <th className="p-3">8Q (13%)</th>
                    <th className="p-3">10Q (12%)</th>
                    <th className="p-3">12Q (11%)</th>
                    <th className="p-3">14Q (10%)</th>
                    <th className="p-3 rounded-r-xl">16Q (9%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {[1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 6000].map((monto) => (
                    <tr key={monto} className="hover:bg-slate-50">
                      <td className="p-2.5 text-left font-black text-slate-900">{formatMoney(monto)}</td>
                      {[4, 6, 8, 10, 12, 14, 16].map((plz) => {
                        const am = calcularAmortizacionVale(monto, plz);
                        return (
                          <td key={plz} className="p-2.5">
                            {formatMoney(am.pagoQuincenalSinSeguro)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MATRIZ DE VALIDACIÓN dbo.CreditoGeneraCanje */}
      {activeTab === 'validador' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-base font-black text-slate-900 mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              Simulador Interactivo de dbo.CreditoGeneraCanje
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Ejecuta en tiempo real la lógica de las 51 reglas (C1-C29 comunes, D1-D3 distribuidor y V1-V19 vales de cliente final)
              contra la base de datos de Distribuidoras y Personas activas.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Distribuidor</label>
                <select
                  value={valSelectedDist}
                  onChange={(e) => setValSelectedDist(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-slate-50"
                >
                  {distribuidores.map((d) => (
                    <option key={d.noDist} value={d.noDist}>
                      #{d.noDist} - {d.nombreDistribuidor} ({d.nivel})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Cliente Destinatario</label>
                <select
                  value={valSelectedPersona}
                  onChange={(e) => setValSelectedPersona(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-slate-50"
                >
                  {personas.map((p) => (
                    <option key={p.personaId} value={p.personaId}>
                      #{p.personaId} - {p.nombre} {p.apellidoPaterno} ({p.buroInternoEstatus})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Monto a Prestar ($ MXN)</label>
                <input
                  type="number"
                  value={valMonto}
                  onChange={(e) => setValMonto(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-slate-50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Tipo de Crédito</label>
                <select
                  value={valTipoCredito}
                  onChange={(e) => setValTipoCredito(e.target.value as 'VALE' | 'DISTRIBUIDOR')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-slate-50"
                >
                  <option value="VALE">Vale Cliente Final (V y C)</option>
                  <option value="DISTRIBUIDOR">Préstamo Distribuidor (D y C)</option>
                </select>
              </div>
            </div>

            {/* Resultado de la validación */}
            <div
              className={`p-4 rounded-2xl border ${
                validationResult.valido
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}
            >
              <div className="flex items-start gap-3">
                {validationResult.valido ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-sm font-black">
                    {validationResult.valido
                      ? '✓ CRÉDITO AUTORIZADO — Cumple todas las reglas de dbo.CreditoGeneraCanje'
                      : `✗ CRÉDITO RECHAZADO — Error ${validationResult.codigoError}`}
                  </h4>
                  <p className="text-xs font-medium mt-1">
                    {validationResult.valido
                      ? `Línea disponible de DV: ${formatMoney(currentDist.disponible)} MXN. El crédito de ${formatMoney(valMonto)} se puede dispersar por STP SPEI.`
                      : validationResult.mensajeError}
                  </p>

                  {validationResult.errores.length > 1 && (
                    <div className="mt-3 space-y-1">
                      <span className="text-[11px] font-bold text-rose-800">Errores adicionales detectados:</span>
                      {validationResult.errores.slice(1).map((err, i) => (
                        <div key={i} className="text-[11px] text-rose-700 flex items-center gap-1.5">
                          <span className="font-mono font-bold bg-rose-200 px-1 py-0.5 rounded text-[9px]">{err.codigo}</span>
                          <span>{err.mensaje}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: LANATIENDA FACTORES */}
      {activeTab === 'lanatienda' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-600" />
              Factores Multiplicadores de LanaTienda y Líneas de Compra
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Costo Base del Proveedor ($ MXN)</label>
                <input
                  type="number"
                  value={simCostoBase}
                  onChange={(e) => setSimCostoBase(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-slate-50"
                />

                <div className="mt-4 p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                  <span className="text-[11px] font-bold text-indigo-700 block uppercase">Precio de Venta Sugerido</span>
                  <p className="text-3xl font-black text-indigo-950 mt-1">
                    {formatMoney(tiendaResult.precioVentaFinal)} MXN
                  </p>
                  <p className="text-xs text-indigo-700 mt-1">
                    Factor aplicado: <strong>{tiendaResult.factor}x</strong>
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 font-black text-slate-700 border-b border-slate-200">
                      <th className="p-2.5">Rango Costo Base</th>
                      <th className="p-2.5">Factor Multiplicador</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold">
                    {FACTORES_LANATIENDA.map((f, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-2.5 text-slate-700">
                          {formatMoney(f.min)} - {formatMoney(f.max)}
                        </td>
                        <td className="p-2.5 font-bold text-indigo-700">{f.factor}x</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: COSTOS DE SEGUROS */}
      {activeTab === 'seguros' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            Matriz de Costos de Seguros de Vida Oficiales
          </h3>
          <p className="text-xs text-slate-500">
            El costo del seguro es adicional al pago quincenal calculado. Protege tanto a la Distribuidora como al Cliente Final.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.values(COSTOS_SEGURO).map((seg, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-black text-sm text-slate-900">{seg.perfil}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Seguro Distribuidora: <strong>{formatMoney(seg.seguroDistribuidora)}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Seguro Cliente Final</span>
                  <p className="text-lg font-black text-emerald-600">{formatMoney(seg.seguroClienteFinal)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: INCREMENTOS DE LÍNEA */}
      {activeTab === 'incrementos' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Reglas de Incremento de Línea Vale Lana (Tope $350,000)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="font-black text-slate-800 uppercase text-[11px]">Validaciones Obligatorias</h4>
              <ul className="space-y-1.5 text-slate-600">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>1. Validar <strong>6 pagos puntuales consecutivos</strong>; si se incumple se reinicia.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>2. Tener al menos el <strong>80% de colocación</strong> de la línea actual.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>3. Cuenta en estatus <strong>ACTIVO</strong> permanente.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>4. Botón de pausado desactivado en opciones de Distribuidora.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>5. Fechas de corte para cálculo: <strong>días 8 y 23 de cada mes</strong>.</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5">
              {Object.values(INCREMENTOS_VALE_LANA).map((inc) => (
                <div key={inc.categoria} className="p-3 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="font-black text-slate-900">{inc.categoria}</span>
                    <span className="text-[10px] text-slate-500 block">Hasta {inc.maxEtapas} incrementos de etapa</span>
                  </div>
                  <span className="font-black text-emerald-600 text-sm">
                    +{formatMoney(inc.incrementoPorEtapa)} / etapa
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: BURÓ Y BC SCORE */}
      {activeTab === 'buro' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-600" />
              Matriz de Decisión BC Score y Buró No Hit
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Score de Buró (Puntaje)</label>
                <input
                  type="number"
                  value={simScore}
                  min={300}
                  max={850}
                  onChange={(e) => setSimScore(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-slate-50"
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="noHitCheck"
                  checked={simIsNoHit}
                  onChange={(e) => setSimIsNoHit(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                <label htmlFor="noHitCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Marcar como "Buró No Hit" (Sin historial previo)
                </label>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Dictamen Oficial</span>
                <h4 className="text-base font-black text-slate-900 mt-0.5">{buroResult.perfilOdictamen}</h4>
                <p className="text-xs text-slate-500">Bad Rate estimado: {(buroResult.badRate * 100).toFixed(1)}%</p>
              </div>

              <span
                className={`px-3 py-1.5 rounded-xl text-xs font-black ${
                  buroResult.decision === 'RECHAZO'
                    ? 'bg-rose-100 text-rose-800'
                    : buroResult.decision === 'BANDEJA_BURO'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {buroResult.decision}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
