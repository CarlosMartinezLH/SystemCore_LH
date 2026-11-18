'use client';

import React, { useState } from 'react';
import {
  Layers,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Barcode,
  MessageSquare,
  Sparkles,
  Terminal,
  Activity,
  Server,
  FileSpreadsheet,
  Smartphone,
  Store,
  Database,
  Users,
  Wallet,
  Building2,
  DollarSign,
  Receipt,
  Network,
  ArrowLeftRight,
  Briefcase,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { INITIAL_INTEGRATIONS } from '@/lib/data/coreData';
import { ExternalServiceStatus } from '@/types/core';

export default function IntegracionesView() {
  const [services, setServices] = useState<ExternalServiceStatus[]>(INITIAL_INTEGRATIONS);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('srv-buro');
  const [testingService, setTestingService] = useState<string | null>(null);
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [showMapa, setShowMapa] = useState(true);

  const selectedService = services.find((s) => s.id === selectedServiceId) || services[0];

  const handleTestService = (srv: ExternalServiceStatus) => {
    setTestingService(srv.id);
    setTestResponse(null);

    setTimeout(() => {
      const mockResponses: Record<string, any> = {
        'srv-buro': {
          status: 'SUCCESS',
          code: 200,
          gateway: 'BURO_CREDITO_PROD_ESB',
          folioConsulta: `BC-${Date.now()}`,
          scoreFico: 712,
          mopGeneral: 'MOP-01',
          cuentasAuditadas: 4,
          timestamp: new Date().toISOString(),
        },
        'srv-stp': {
          status: 'LIQUIDADO',
          code: 200,
          gateway: 'SPEI_STP_CORE',
          folioSTP: `STP-${Math.floor(Math.random() * 9000000 + 1000000)}`,
          claveRastreo: `LAN${Date.now()}`,
          comisionSpei: 0.0,
          tiempoEjecucionMs: 78,
          timestamp: new Date().toISOString(),
        },
        'srv-nubarium': {
          status: 'VERIFICADO',
          code: 200,
          servicio: 'RENAPO_CURP_VALIDATION',
          curpConsultada: 'SITM890918MCLLRR02',
          nombreOficial: 'MARYLYN SILVA TORRES',
          listaNegraSat69B: 'NO_LISTADO (LIMPIO)',
          livenessScore: 0.98,
          timestamp: new Date().toISOString(),
        },
        'srv-paynet': {
          status: 'GENERADO',
          code: 201,
          pasarela: 'PAYNET_OPENPAY_RECAUDACION',
          referencia: '9281002948109921',
          redAfiliada: ['7-Eleven', 'Farmacias del Ahorro', 'Circle K', 'Walmart'],
          vigenciaHoras: 72,
          timestamp: new Date().toISOString(),
        },
        'srv-crm': {
          status: 'SYNCED',
          code: 200,
          protocol: 'REST_MTLS_V1',
          prospectoId: 131,
          etapaSincronizada: 'CONSULTA_MESA',
          documentosAnexo1Subidos: 25,
          timestamp: new Date().toISOString(),
        },
        'srv-botmaker': {
          status: 'DELIVERED',
          code: 200,
          proveedor: 'BOTMAKER_META_CLOUD_API',
          whatsappId: `wamid.${Math.random().toString(36).substring(2)}`,
          destinatario: '+528711203344',
          plantilla: 'lanahora_recordatorio_corte_v1',
          timestamp: new Date().toISOString(),
        },
        'srv-banorte': {
          status: 'CONCILIADO',
          code: 200,
          proveedor: 'BANORTE_HOST_TO_HOST',
          folioBanorte: 'BNTE-9821034',
          distribuidorId: 9832,
          montoAbono: 4682.00,
          canal: 'VENTANILLA_SUCURSAL',
          timestamp: new Date().toISOString(),
        },
        'srv-clubpago': {
          status: 'APLICADO',
          code: 200,
          pasarela: 'CLUB_PAGO_CORRESPONSALES',
          transaccionId: 'CP-449120',
          comisionCorresponsal: 11.00,
          montoEfectivo: 1500.00,
          timestamp: new Date().toISOString(),
        },
        'srv-buk': {
          status: 'SYNCED',
          code: 200,
          sistema: 'BUK_CAPITAL_HUMANO_API',
          colaboradoresActivos: 142,
          departamento: 'OPERACIONES_SUCURSALES',
          timestamp: new Date().toISOString(),
        },
      };

      setTestingService(null);
      setTestResponse(JSON.stringify(mockResponses[srv.id] || { status: 'OK', code: 200 }, null, 2));
    }, 1000);
  };

  return (
    <div className="flex-1 bg-slate-50 text-slate-800 flex flex-col min-h-0 overflow-y-auto font-sans p-4 lg:p-6 space-y-4">
      {/* Top Action Toolbar: Selector de Servicios y Filtros sobre la pantalla */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Left: Services as Segmented Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          {services.map((srv) => {
            const isSelected = selectedServiceId === srv.id;
            return (
              <button
                key={srv.id}
                onClick={() => {
                  setSelectedServiceId(srv.id);
                  setTestResponse(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {srv.type === 'BURO_CREDITO' ? (
                  <ShieldCheck className="w-3.5 h-3.5" />
                ) : srv.type === 'STP_SPEI' ? (
                  <CreditCard className="w-3.5 h-3.5" />
                ) : srv.type === 'PAYNET_RECIBOS' ? (
                  <Barcode className="w-3.5 h-3.5" />
                ) : (
                  <Layers className="w-3.5 h-3.5" />
                )}
                <span>{srv.name.split(' (')[0]}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {srv.status}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: ESB Status Indicator */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>6/6 Servicios ESB Activos (99.8%)</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MAPA DE SISTEMAS E INTEGRACIONES (ARQUITECTURA OFICIAL)  */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden font-sans">
        {/* Banner Superior Estilo Oficial */}
        <div className="bg-[#2c3848] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Network className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm sm:text-base font-black tracking-wider uppercase">
              1. Mapa de Sistemas e Integraciones
            </h2>
          </div>
          <button
            onClick={() => setShowMapa(!showMapa)}
            className="text-xs text-slate-300 hover:text-white flex items-center gap-1 font-bold cursor-pointer"
          >
            <span>{showMapa ? 'Ocultar Diagrama' : 'Mostrar Diagrama'}</span>
            {showMapa ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showMapa && (
          <div className="p-4 sm:p-6 bg-slate-50/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 relative">
              {/* Columna 1: CANALES / FRONTEND */}
              <div className="bg-white rounded-2xl border-2 border-blue-200 p-4 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="text-center pb-2 border-b-2 border-blue-100">
                  <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 block">
                    CANALES / FRONTEND
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-blue-600 shrink-0" />
                    <div>
                      <strong className="text-xs text-slate-900 block font-black">APP DV</strong>
                      <span className="text-[10px] text-slate-500 font-bold">(Android / iOS)</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-indigo-600 shrink-0" />
                    <div>
                      <strong className="text-xs text-slate-900 block font-black">APP MI OFICINA VIRTUAL</strong>
                      <span className="text-[10px] text-slate-500 font-bold">(Android / Web)</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <strong className="text-xs text-slate-900 block font-black">APP CLIENTE FINAL</strong>
                      <span className="text-[10px] text-slate-500 font-bold">(Android / iOS)</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center gap-3">
                    <Store className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <strong className="text-xs text-slate-900 block font-black">Lanatienda</strong>
                      <span className="text-[10px] text-slate-500 font-bold">Catálogo Departamental</span>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-medium">Capas de Interacción de Usuario</span>
                </div>
              </div>

              {/* Columna 2: CORE FINANCIAL */}
              <div className="bg-white rounded-2xl border-2 border-emerald-300 p-4 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="text-center pb-2 border-b-2 border-emerald-100">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full inline-block">
                    CORE FINANCIAL
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200/80 space-y-3">
                  <div className="flex items-center justify-center gap-2 text-emerald-800 pb-2 border-b border-emerald-100">
                    <Database className="w-5 h-5 text-emerald-600" />
                    <span className="font-mono font-black text-xs">MOTOR FINANCIERO CENTRAL</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-800">
                    <span className="flex items-center gap-1.5 p-1.5 bg-white rounded-lg border border-emerald-100 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" /> Prospectos
                    </span>
                    <span className="flex items-center gap-1.5 p-1.5 bg-white rounded-lg border border-emerald-100 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" /> Clientes finales
                    </span>
                    <span className="flex items-center gap-1.5 p-1.5 bg-white rounded-lg border border-emerald-100 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" /> Distribuidores
                    </span>
                    <span className="flex items-center gap-1.5 p-1.5 bg-white rounded-lg border border-emerald-100 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" /> Créditos
                    </span>
                    <span className="flex items-center gap-1.5 p-1.5 bg-white rounded-lg border border-emerald-100 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" /> Dispersión
                    </span>
                    <span className="flex items-center gap-1.5 p-1.5 bg-white rounded-lg border border-emerald-100 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" /> Pagos
                    </span>
                    <span className="flex items-center gap-1.5 p-1.5 bg-white rounded-lg border border-emerald-100 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" /> Cobranza
                    </span>
                    <span className="flex items-center gap-1.5 p-1.5 bg-white rounded-lg border border-emerald-100 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" /> Contabilidad
                    </span>
                    <span className="flex items-center gap-1.5 p-1.5 bg-white rounded-lg border border-emerald-100 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" /> Reportes
                    </span>
                    <span className="flex items-center gap-1.5 p-1.5 bg-white rounded-lg border border-emerald-100 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" /> Cartera
                    </span>
                  </div>
                </div>

                <div className="text-center pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-medium">Bases de Datos & Reglas de Negocio</span>
                </div>
              </div>

              {/* Columna 3: INTEGRACIONES EXTERNAS */}
              <div className="bg-white rounded-2xl border-2 border-indigo-200 p-4 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="text-center pb-2 border-b-2 border-indigo-100">
                  <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700 block">
                    INTEGRACIONES EXTERNAS
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <strong className="text-[11px] text-slate-900 block">Buró de crédito</strong>
                      <span className="text-[9px] text-slate-400">Score & Consultas</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <strong className="text-[11px] text-slate-900 block">STP</strong>
                      <span className="text-[9px] text-slate-400">SPEI & CLABE</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <strong className="text-[11px] text-slate-900 block">Banorte</strong>
                      <span className="text-[9px] text-slate-400">Pagos / Fichas</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-purple-600 shrink-0" />
                    <div>
                      <strong className="text-[11px] text-slate-900 block">Club pago</strong>
                      <span className="text-[9px] text-slate-400">Corresponsales</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                    <Barcode className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <strong className="text-[11px] text-slate-900 block">Paynet</strong>
                      <span className="text-[9px] text-slate-400">Tiendas / Oxxo</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-600 shrink-0" />
                    <div>
                      <strong className="text-[11px] text-slate-900 block">Nubarium</strong>
                      <span className="text-[9px] text-slate-400">KYC & RENAPO</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                    <Users className="w-4 h-4 text-rose-600 shrink-0" />
                    <div>
                      <strong className="text-[11px] text-slate-900 block">CRM</strong>
                      <span className="text-[9px] text-slate-400">Originación</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-teal-600 shrink-0" />
                    <div>
                      <strong className="text-[11px] text-slate-900 block">Buk</strong>
                      <span className="text-[9px] text-slate-400">Recursos Humanos</span>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-medium">Webhooks, REST APIs y Pasarelas</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MAIN CONTENT AREA: Console & Service Details */}
      <div className="flex-1 overflow-x-auto flex flex-col space-y-3">
        {/* Top Service Title Card */}
        <div className="bg-white p-4 rounded-2xl border border-blue-100 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900">{selectedService.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                {selectedService.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{selectedService.description}</p>
          </div>

          <button
            onClick={() => handleTestService(selectedService)}
            disabled={testingService === selectedService.id}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow flex items-center gap-2 transition active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingService === selectedService.id ? 'animate-spin' : ''}`} />
            <span>{testingService === selectedService.id ? 'Enviando Petición API...' : 'Probar Conexión (Ping API)'}</span>
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3 rounded-2xl border border-blue-100">
            <span className="text-slate-500 text-[10px] font-bold uppercase block">Latencia Media</span>
            <span className="font-mono font-black text-lg text-blue-700">{selectedService.latencyMs} ms</span>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-blue-100">
            <span className="text-slate-500 text-[10px] font-bold uppercase block">Peticiones Hoy</span>
            <span className="font-mono font-black text-lg text-slate-900">{selectedService.dailyRequests.toLocaleString('es-MX')}</span>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-blue-100">
            <span className="text-slate-500 text-[10px] font-bold uppercase block">Tasa de Éxito</span>
            <span className="font-mono font-black text-lg text-emerald-700">{selectedService.successRate}%</span>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-blue-100">
            <span className="text-slate-500 text-[10px] font-bold uppercase block">Último Heartbeat</span>
            <span className="font-bold text-xs text-slate-700">{selectedService.lastPing}</span>
          </div>
        </div>

        {/* Technical Specs Card */}
        <div className="bg-white rounded-2xl border border-blue-100 p-4 space-y-2 text-xs shadow-xs">
          <h4 className="font-bold text-slate-900 border-b pb-2">Especificaciones de Integración</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div>
              <span className="text-slate-400 block text-[10px]">Endpoint Oficial / Base URL:</span>
              <span className="font-mono font-bold text-blue-700 text-xs break-all">{selectedService.endpoint}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Esquema de Autenticación:</span>
              <span className="font-semibold text-slate-800 text-xs">{selectedService.authMethod}</span>
            </div>
          </div>
        </div>

        {/* Interactive Response Console */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 flex-1 flex flex-col shadow-inner">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
            <div className="flex items-center gap-2 text-white font-mono text-xs">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Consola de Respuesta JSON (API Gateway ESB)</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">HTTP 200 OK</span>
          </div>

          <pre className="flex-1 font-mono text-xs text-emerald-400 overflow-x-auto p-2 leading-relaxed">
            {testResponse || `// Pulsa "Probar Conexión (Ping API)" para enviar una petición real simulada a ${selectedService.name}.\n{\n  "service": "${selectedService.id}",\n  "status": "READY_FOR_DISPATCH",\n  "endpoint": "${selectedService.endpoint}"\n}`}
          </pre>
        </div>
      </div>
    </div>
  );
}

