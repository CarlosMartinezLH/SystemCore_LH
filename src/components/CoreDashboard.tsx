'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  Building,
  RefreshCw,
  PieChart,
  BarChart3,
  Activity,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  Wallet,
  Users,
} from 'lucide-react';
import { UserSession } from '@/types/auth';
import { useCoreSync } from '@/context/CoreSyncContext';

interface CoreDashboardProps {
  onNavigateToPersonas?: () => void;
  onNavigateToDistribuidores?: () => void;
  onNavigateToDispersion?: () => void;
  onNavigateToGestoria?: () => void;
  onNavigateToPLD?: () => void;
  currentUser?: UserSession | null;
}

// Datos de tendencia mensual (Colocación vs Cobranza)
const HISTORICAL_MONTHS = [
  { mes: 'Ene', colocacion: 980000, cobranza: 940000 },
  { mes: 'Feb', colocacion: 1050000, cobranza: 1010000 },
  { mes: 'Mar', colocacion: 1120000, cobranza: 1075000 },
  { mes: 'Abr', colocacion: 1180000, cobranza: 1130000 },
  { mes: 'May', colocacion: 1220000, cobranza: 1170000 },
  { mes: 'Jun', colocacion: 1260000, cobranza: 1210000 },
  { mes: 'Jul', colocacion: 1310000, cobranza: 1255000 },
  { mes: 'Ago', colocacion: 1350000, cobranza: 1290000 },
  { mes: 'Sep', colocacion: 1380000, cobranza: 1320000 },
  { mes: 'Oct', colocacion: 1400000, cobranza: 1340000 },
  { mes: 'Nov', colocacion: 1425800, cobranza: 1360213 },
];

export default function CoreDashboard({
  currentUser,
}: CoreDashboardProps) {
  const { creditos, distribuidores, personas } = useCoreSync();
  const [selectedPeriod, setSelectedPeriod] = useState<'12M' | '6M' | '3M'>('12M');
  const [selectedZone, setSelectedZone] = useState<'ALL' | 'ZONA A' | 'ZONA B' | 'ZONA C'>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  // Métricas agregadas de Cartera
  const totalColocacion = creditos.reduce((acc, c) => acc + (c.monto || 0), 0) || 1425800;
  const totalSaldoVigente = creditos.reduce((acc, c) => acc + (c.saldo || 0), 0) || 1360213;
  const totalLineasAutorizadas = distribuidores.reduce((acc, d) => acc + (d.creditoLimite || 0), 0) || 2850000;
  const totalDisponibleLineas = distribuidores.reduce((acc, d) => acc + (d.disponible || 0), 0) || 1424200;

  const capitalVencidoMora = 65587; // 4.6% de morosidad
  const recuperacionPorcentaje = 95.4;

  // Conteo de personas por categoría
  const countCF = personas.filter((p) => p.categoria === 'CF' || (!p.categoria && !p.isDistribuidor)).length || 18;
  const countDV = distribuidores.length || 4;
  const countAV = personas.filter((p) => p.categoria === 'AV').length || 3;
  const countCO = personas.filter((p) => p.categoria === 'CO').length || 2;
  const totalPadrón = countCF + countDV + countAV + countCO;

  // Filtrado de datos históricos según periodo
  const monthsData =
    selectedPeriod === '3M'
      ? HISTORICAL_MONTHS.slice(-3)
      : selectedPeriod === '6M'
      ? HISTORICAL_MONTHS.slice(-6)
      : HISTORICAL_MONTHS;

  // Cálculos SVG para Gráfica de Área / Líneas
  const chartWidth = 680;
  const chartHeight = 220;
  const paddingX = 45;
  const paddingY = 30;
  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;
  const maxVal = 1600000;
  const minVal = 800000;

  const getY = (val: number) => {
    const ratio = (val - minVal) / (maxVal - minVal);
    return chartHeight - paddingY - ratio * innerHeight;
  };

  const getX = (index: number) => {
    return paddingX + (index / (monthsData.length - 1)) * innerWidth;
  };

  // Construcción de curvas suaves SVG (Cubic Bézier)
  const buildSmoothPath = (key: 'colocacion' | 'cobranza') => {
    if (monthsData.length === 0) return '';
    const points = monthsData.map((d, i) => ({ x: getX(i), y: getY(d[key]) }));
    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const linePathColocacion = buildSmoothPath('colocacion');
  const linePathCobranza = buildSmoothPath('cobranza');
  const areaPathColocacion = `${linePathColocacion} L ${getX(monthsData.length - 1)} ${
    chartHeight - paddingY
  } L ${getX(0)} ${chartHeight - paddingY} Z`;
  const areaPathCobranza = `${linePathCobranza} L ${getX(monthsData.length - 1)} ${
    chartHeight - paddingY
  } L ${getX(0)} ${chartHeight - paddingY} Z`;

  // Cálculos para Gráfica Donut (Salud de Cartera)
  const donutCircumference = 2 * Math.PI * 72; // ~452.38
  const offsetVigente = 0;
  const strokeVigente = donutCircumference * 0.954;
  const strokeVenc1 = donutCircumference * 0.028;
  const offsetVenc1 = -strokeVigente;
  const strokeVenc2 = donutCircumference * 0.012;
  const offsetVenc2 = -(strokeVigente + strokeVenc1);
  const strokeMora = donutCircumference * 0.006;
  const offsetMora = -(strokeVigente + strokeVenc1 + strokeVenc2);

  return (
    <div className="flex-1 bg-[#f8fafc] text-slate-800 flex flex-col min-h-0 overflow-y-auto font-sans p-4 lg:p-6 space-y-5">
      {/* 1. Header Ejecutivo del Dashboard (Solo visualización de datos macro) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-200/80">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Panel Ejecutivo de Cartera & Métricas
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Consolidado macro de colocación, cobranza y distribución en tiempo real.
              </p>
            </div>
          </div>
        </div>

        {/* Controles de Vista de Datos (No elegible de personas o dv) */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Selector de Periodo */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs font-bold text-slate-600">
            <button
              onClick={() => setSelectedPeriod('12M')}
              className={`px-3 py-1 rounded-lg transition ${
                selectedPeriod === '12M' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'hover:text-slate-900'
              }`}
            >
              12 Meses
            </button>
            <button
              onClick={() => setSelectedPeriod('6M')}
              className={`px-3 py-1 rounded-lg transition ${
                selectedPeriod === '6M' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'hover:text-slate-900'
              }`}
            >
              6 Meses
            </button>
            <button
              onClick={() => setSelectedPeriod('3M')}
              className={`px-3 py-1 rounded-lg transition ${
                selectedPeriod === '3M' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'hover:text-slate-900'
              }`}
            >
              3 Meses
            </button>
          </div>

          {/* Selector de Zona */}
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:bg-white transition cursor-pointer"
          >
            <option value="ALL">Todas las Zonas</option>
            <option value="ZONA A">Zona A · Saltillo</option>
            <option value="ZONA B">Zona B · Torreón</option>
            <option value="ZONA C">Zona C · Monclova</option>
          </select>

          {/* Botón Refrescar Datos */}
          <button
            onClick={handleRefresh}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition flex items-center justify-center active:scale-95"
            title="Actualizar datos consolidados"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Tarjetas KPI de Estado Financiero y Cartera */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Colocación Total */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Colocación en Cartera
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900 font-mono tracking-tight block">
              ${totalColocacion.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-emerald-600 text-xs font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+12.4% vs mes anterior</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Vales y créditos activos:</span>
            <strong className="text-slate-800 font-bold">{creditos.length || 48}</strong>
          </div>
        </div>

        {/* KPI 2: Índice de Recuperación */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Índice de Recuperación
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-emerald-600 font-mono tracking-tight block">
              {recuperacionPorcentaje}%
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-slate-500 text-xs font-semibold">
              <span>Recuperado: </span>
              <strong className="text-slate-800 font-mono font-bold">
                ${totalSaldoVigente.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </strong>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Estatus global:</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
              Al corriente
            </span>
          </div>
        </div>

        {/* KPI 3: Cartera Vencida (Mora) */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Capital en Mora / Riesgo
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-rose-600 font-mono tracking-tight block">
              ${capitalVencidoMora.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-slate-500 text-xs font-semibold">
              <span>Morosidad controlada: </span>
              <strong className="text-rose-600 font-bold">4.6%</strong>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>En gestión cobranza:</span>
            <strong className="text-slate-800 font-bold">2 cuentas</strong>
          </div>
        </div>

        {/* KPI 4: Líneas de Crédito */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Líneas Autorizadas
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900 font-mono tracking-tight block">
              ${totalLineasAutorizadas.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-slate-500 text-xs font-semibold">
              <span>Disponible en red: </span>
              <strong className="text-slate-800 font-mono font-bold">
                ${totalDisponibleLineas.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </strong>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Uso de línea:</span>
            <strong className="text-blue-700 font-bold">50.0%</strong>
          </div>
        </div>
      </div>

      {/* 3. Fila 1 de Gráficas: Tendencia Mensual y Donut de Calidad de Cartera */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Gráfica 1: Área y Líneas de Colocación vs Cobranza (8 Cols) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>Evolución Histórica: Colocación vs Cobranza</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Comportamiento de dispersión crediticia frente a retorno recuperado por quincena.
              </p>
            </div>

            {/* Leyenda de la gráfica */}
            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-600 shadow-2xs" />
                <span className="text-slate-700">Colocación ($ MXN)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-2xs" />
                <span className="text-slate-700">Recuperación ($ MXN)</span>
              </div>
            </div>
          </div>

          {/* Canvas SVG de la gráfica */}
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto min-w-[540px] select-none"
            >
              <defs>
                {/* Gradiente Colocación (Azul) */}
                <linearGradient id="gradientColocacion" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                </linearGradient>

                {/* Gradiente Cobranza (Verde) */}
                <linearGradient id="gradientCobranza" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Líneas de cuadrícula horizontales */}
              {[800000, 1000000, 1200000, 1400000, 1600000].map((val) => {
                const y = getY(val);
                return (
                  <g key={val}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={chartWidth - paddingX}
                      y2={y}
                      stroke="#e2e8f0"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingX - 8}
                      y={y + 3}
                      fill="#94a3b8"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="end"
                    >
                      ${val / 1000}k
                    </text>
                  </g>
                );
              })}

              {/* Áreas rellenas con gradiente */}
              <path d={areaPathColocacion} fill="url(#gradientColocacion)" />
              <path d={areaPathCobranza} fill="url(#gradientCobranza)" />

              {/* Trazos de línea */}
              <path
                d={linePathColocacion}
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d={linePathCobranza}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Puntos y etiquetas de Mes */}
              {monthsData.map((d, i) => {
                const x = getX(i);
                const yCol = getY(d.colocacion);
                const yCob = getY(d.cobranza);
                const isLast = i === monthsData.length - 1;

                return (
                  <g key={d.mes}>
                    {/* Línea vertical guía en hover/activo */}
                    <line
                      x1={x}
                      y1={paddingY}
                      x2={x}
                      y2={chartHeight - paddingY}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                    />

                    {/* Punto Colocación */}
                    <circle
                      cx={x}
                      cy={yCol}
                      r={isLast ? '4.5' : '3'}
                      fill="#2563eb"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />

                    {/* Punto Cobranza */}
                    <circle
                      cx={x}
                      cy={yCob}
                      r={isLast ? '4.5' : '3'}
                      fill="#10b981"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />

                    {/* Etiqueta de Mes */}
                    <text
                      x={x}
                      y={chartHeight - 10}
                      fill={isLast ? '#0f172a' : '#64748b'}
                      fontSize="10"
                      fontWeight={isLast ? 'bold' : 'normal'}
                      textAnchor="middle"
                    >
                      {d.mes}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
            <span>Ritmo promedio quincenal: <strong className="text-slate-800 font-bold">$712,900.00 MXN</strong></span>
            <span>Tasa de efectividad de retorno: <strong className="text-emerald-600 font-bold">95.4%</strong></span>
          </div>
        </div>

        {/* Gráfica 2: Calidad y Salud de Cartera (Donut Chart) (4 Cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-600" />
              <span>Calidad y Salud de Cartera</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Estatus de cobro y distribución del capital en circulación.
            </p>
          </div>

          {/* Gráfico Donut SVG */}
          <div className="relative flex items-center justify-center my-4">
            <svg width="180" height="180" viewBox="0 0 180 180" className="transform -rotate-90">
              {/* Fondo del anillo */}
              <circle
                cx="90"
                cy="90"
                r="72"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="18"
              />

              {/* Segmento 1: Al Corriente (95.4%) */}
              <circle
                cx="90"
                cy="90"
                r="72"
                fill="none"
                stroke="#10b981"
                strokeWidth="18"
                strokeDasharray={`${strokeVigente} ${donutCircumference}`}
                strokeDashoffset={offsetVigente}
                strokeLinecap="round"
              />

              {/* Segmento 2: Vencido 1 a 15 días (2.8%) */}
              <circle
                cx="90"
                cy="90"
                r="72"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="18"
                strokeDasharray={`${strokeVenc1} ${donutCircumference}`}
                strokeDashoffset={offsetVenc1}
              />

              {/* Segmento 3: Vencido 16 a 30 días (1.2%) */}
              <circle
                cx="90"
                cy="90"
                r="72"
                fill="none"
                stroke="#f97316"
                strokeWidth="18"
                strokeDasharray={`${strokeVenc2} ${donutCircumference}`}
                strokeDashoffset={offsetVenc2}
              />

              {/* Segmento 4: Mora > 30 días (0.6%) */}
              <circle
                cx="90"
                cy="90"
                r="72"
                fill="none"
                stroke="#ef4444"
                strokeWidth="18"
                strokeDasharray={`${strokeMora} ${donutCircumference}`}
                strokeDashoffset={offsetMora}
              />
            </svg>

            {/* Texto Central */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                95.4%
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Al Corriente
              </span>
            </div>
          </div>

          {/* Desglose de Estatus en Lista */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-bold text-slate-700">Al Corriente</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-black text-slate-900">$1,360,213</span>
                <span className="text-slate-400 ml-1.5 text-[11px]">95.4%</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="font-bold text-slate-700">Mora 1 a 15 días</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-black text-amber-700">$39,922</span>
                <span className="text-slate-400 ml-1.5 text-[11px]">2.8%</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="font-bold text-slate-700">Mora &gt; 15 días</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-black text-rose-600">$25,665</span>
                <span className="text-slate-400 ml-1.5 text-[11px]">1.8%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Fila 2 de Gráficas: Distribución por Zonas y Composición del Padrón */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Gráfica 3: Cartera por Zonas Operativas (Barras Dobles) (6 Cols) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-600" />
                <span>Desempeño y Cartera por Zona</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Comparativa de Colocación vs Cobranza por zona operativa.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="flex items-center gap-1 text-blue-700">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-600" /> Colocación
              </span>
              <span className="flex items-center gap-1 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Cobranza
              </span>
            </div>
          </div>

          {/* Gráfico de Barras Dobles SVG */}
          <div className="space-y-4 my-2">
            {/* Zona A · Saltillo */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-800">Zona A · Saltillo / Coahuila</span>
                <span className="text-emerald-700 font-mono font-extrabold">96.1% Eficiencia</span>
              </div>
              <div className="space-y-1">
                <div className="h-4 w-full bg-slate-100 rounded-lg overflow-hidden flex">
                  <div
                    className="bg-blue-600 h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2 text-[10px] text-white font-bold"
                    style={{ width: '88%' }}
                  >
                    $640,000
                  </div>
                </div>
                <div className="h-4 w-full bg-slate-100 rounded-lg overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2 text-[10px] text-white font-bold"
                    style={{ width: '84.5%' }}
                  >
                    $615,040
                  </div>
                </div>
              </div>
            </div>

            {/* Zona B · Torreón */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-800">Zona B · Torreón / Laguna</span>
                <span className="text-emerald-700 font-mono font-extrabold">94.6% Eficiencia</span>
              </div>
              <div className="space-y-1">
                <div className="h-4 w-full bg-slate-100 rounded-lg overflow-hidden flex">
                  <div
                    className="bg-blue-600 h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2 text-[10px] text-white font-bold"
                    style={{ width: '72%' }}
                  >
                    $520,000
                  </div>
                </div>
                <div className="h-4 w-full bg-slate-100 rounded-lg overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2 text-[10px] text-white font-bold"
                    style={{ width: '68%' }}
                  >
                    $492,000
                  </div>
                </div>
              </div>
            </div>

            {/* Zona C · Monclova */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-800">Zona C · Monclova / Centro</span>
                <span className="text-emerald-700 font-mono font-extrabold">95.5% Eficiencia</span>
              </div>
              <div className="space-y-1">
                <div className="h-4 w-full bg-slate-100 rounded-lg overflow-hidden flex">
                  <div
                    className="bg-blue-600 h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2 text-[10px] text-white font-bold"
                    style={{ width: '38%' }}
                  >
                    $265,800
                  </div>
                </div>
                <div className="h-4 w-full bg-slate-100 rounded-lg overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2 text-[10px] text-white font-bold"
                    style={{ width: '36.2%' }}
                  >
                    $253,173
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span>Zona con mayor colocación: <strong className="text-slate-800">Zona A (44.9%)</strong></span>
            <span>Promedio mora: <strong className="text-slate-800">4.6%</strong></span>
          </div>
        </div>

        {/* Gráfica 4: Composición del Padrón y Canales de Dispersión (6 Cols) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              <span>Composición del Padrón & Canales de Canje</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Desglose de roles registrados y vías operativas de dispersión.
            </p>
          </div>

          {/* Desglose de Categorías en Barra Segmentada */}
          <div className="my-3">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-800">Distribución de Padrón ({totalPadrón} personas)</span>
              <span className="text-blue-700 font-bold">100% Cotejado</span>
            </div>
            <div className="h-3.5 w-full bg-slate-100 rounded-xl overflow-hidden flex gap-0.5 p-0.5 border border-slate-200">
              <div
                className="bg-blue-600 h-full rounded-md"
                style={{ width: `${(countCF / totalPadrón) * 100}%` }}
                title={`CF: ${countCF}`}
              />
              <div
                className="bg-emerald-500 h-full rounded-md"
                style={{ width: `${(countDV / totalPadrón) * 100}%` }}
                title={`DV: ${countDV}`}
              />
              <div
                className="bg-amber-500 h-full rounded-md"
                style={{ width: `${(countAV / totalPadrón) * 100}%` }}
                title={`AV: ${countAV}`}
              />
              <div
                className="bg-purple-500 h-full rounded-md"
                style={{ width: `${(countCO / totalPadrón) * 100}%` }}
                title={`CO: ${countCO}`}
              />
            </div>

            {/* Badges de Categoría */}
            <div className="grid grid-cols-4 gap-2 mt-3 text-center">
              <div className="p-2 rounded-xl bg-blue-50/70 border border-blue-200/60">
                <span className="block text-xs font-mono font-black text-blue-800">{countCF}</span>
                <span className="text-[10px] text-blue-600 font-bold">CF · Clientes</span>
              </div>
              <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-200/60">
                <span className="block text-xs font-mono font-black text-emerald-800">{countDV}</span>
                <span className="text-[10px] text-emerald-600 font-bold">DV · Distr.</span>
              </div>
              <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-200/60">
                <span className="block text-xs font-mono font-black text-amber-800">{countAV}</span>
                <span className="text-[10px] text-amber-600 font-bold">AV · Avales</span>
              </div>
              <div className="p-2 rounded-xl bg-purple-50/70 border border-purple-200/60">
                <span className="block text-xs font-mono font-black text-purple-800">{countCO}</span>
                <span className="text-[10px] text-purple-600 font-bold">CO · Cónyuges</span>
              </div>
            </div>
          </div>

          {/* Canales de Dispersión y Desembolso */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-xs font-bold text-slate-800 block">Canales de Desembolso Activos</span>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-700 block">STP SPEI Inmediato</span>
                  <span className="text-xs font-mono font-black text-blue-700">$1,026,576</span>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  72%
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-700 block">Retiro Paynet Tiendas</span>
                  <span className="text-xs font-mono font-black text-slate-800">$399,224</span>
                </div>
                <span className="text-xs font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-md">
                  28%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Tabla de Datos Puros de Cartera por Zonas (No interactiva, solo lectura de datos) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
              Matriz Consolidada de Cartera por Zona
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Datos analíticos de balance, capital colocado y efectividad quincenal.
            </p>
          </div>
          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
            Corte: 15 y 30 del Mes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="bg-slate-50/90 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <th className="py-2.5 px-4">Zona Operativa</th>
                <th className="py-2.5 px-4 text-center">Vales Emitidos</th>
                <th className="py-2.5 px-4 text-right">Colocación Bruta</th>
                <th className="py-2.5 px-4 text-right">Cobranza Efectiva</th>
                <th className="py-2.5 px-4 text-right">Capital en Mora</th>
                <th className="py-2.5 px-4 text-center">% Morosidad</th>
                <th className="py-2.5 px-4 text-right">Tasa Recuperación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              <tr className="hover:bg-slate-50/60 transition">
                <td className="py-2.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span>Zona A · Saltillo / Coahuila</span>
                </td>
                <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-700">22</td>
                <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">$640,000.00</td>
                <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-600">$615,040.00</td>
                <td className="py-2.5 px-4 text-right font-mono font-bold text-rose-600">$24,960.00</td>
                <td className="py-2.5 px-4 text-center">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    3.9%
                  </span>
                </td>
                <td className="py-2.5 px-4 text-right font-mono font-extrabold text-emerald-600">96.1%</td>
              </tr>
              <tr className="hover:bg-slate-50/60 transition">
                <td className="py-2.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Zona B · Torreón / Laguna</span>
                </td>
                <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-700">17</td>
                <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">$520,000.00</td>
                <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-600">$492,000.00</td>
                <td className="py-2.5 px-4 text-right font-mono font-bold text-rose-600">$28,000.00</td>
                <td className="py-2.5 px-4 text-center">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    5.4%
                  </span>
                </td>
                <td className="py-2.5 px-4 text-right font-mono font-extrabold text-emerald-600">94.6%</td>
              </tr>
              <tr className="hover:bg-slate-50/60 transition">
                <td className="py-2.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Zona C · Monclova / Centro</span>
                </td>
                <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-700">9</td>
                <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">$265,800.00</td>
                <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-600">$253,173.00</td>
                <td className="py-2.5 px-4 text-right font-mono font-bold text-rose-600">$12,627.00</td>
                <td className="py-2.5 px-4 text-center">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    4.7%
                  </span>
                </td>
                <td className="py-2.5 px-4 text-right font-mono font-extrabold text-emerald-600">95.5%</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="bg-slate-100/90 font-extrabold text-slate-900 border-t-2 border-slate-300">
                <td className="py-3 px-4">TOTAL CONSOLIDADO</td>
                <td className="py-3 px-4 text-center font-mono">{creditos.length || 48}</td>
                <td className="py-3 px-4 text-right font-mono">${totalColocacion.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                <td className="py-3 px-4 text-right font-mono text-emerald-700">${totalSaldoVigente.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                <td className="py-3 px-4 text-right font-mono text-rose-700">${capitalVencidoMora.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                    4.6%
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-mono text-emerald-700 text-sm">{recuperacionPorcentaje}%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
