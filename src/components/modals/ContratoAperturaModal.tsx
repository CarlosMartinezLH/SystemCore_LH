'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DistribuidorCore } from '@/types/core';
import { Printer, X, FileText, Download, CheckCircle2 } from 'lucide-react';
import { formatMoney } from '@/lib/utils/formatters';

interface ContratoAperturaModalProps {
  isOpen: boolean;
  onClose: () => void;
  distribuidor: DistribuidorCore;
}

// Convertidor de números a letras en español para moneda mexicana
function numeroALetrasMX(monto: number): string {
  const entero = Math.floor(Math.abs(monto));
  const centavos = Math.round((Math.abs(monto) - entero) * 100);
  const centavosStr = centavos.toString().padStart(2, '0');

  if (entero === 0) return `CERO PESOS ${centavosStr}/100 M.N.`;

  const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const decenas10 = [
    'DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE',
    'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'
  ];
  const decenas = [
    '', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA',
    'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'
  ];
  const centenas = [
    '', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS',
    'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'
  ];

  function seccionCentenas(n: number): string {
    if (n === 0) return '';
    if (n === 100) return 'CIEN';
    let str = '';
    const c = Math.floor(n / 100);
    const d = Math.floor((n % 100) / 10);
    const u = n % 10;

    if (c > 0) str += centenas[c] + ' ';

    if (d === 1) {
      str += decenas10[u];
    } else if (d === 2) {
      if (u === 0) str += 'VEINTE';
      else str += 'VEINTI' + unidades[u];
    } else if (d > 2) {
      str += decenas[d];
      if (u > 0) str += ' Y ' + unidades[u];
    } else if (u > 0) {
      str += unidades[u];
    }
    return str.trim();
  }

  function seccionMiles(n: number): string {
    if (n === 0) return '';
    let str = '';
    const millones = Math.floor(n / 1000000);
    const miles = Math.floor((n % 1000000) / 1000);
    const resto = n % 1000;

    if (millones > 0) {
      if (millones === 1) str += 'UN MILLÓN ';
      else str += seccionCentenas(millones) + ' MILLONES ';
    }

    if (miles > 0) {
      if (miles === 1) str += 'MIL ';
      else str += seccionCentenas(miles) + ' MIL ';
    }

    if (resto > 0) {
      str += seccionCentenas(resto);
    }
    return str.trim();
  }

  const texto = seccionMiles(entero);
  return `${texto} PESOS ${centavosStr}/100 M.N.`;
}

// Formateador de fechas jurídicas mexicanas
function formatearFechaJuridica(fechaStr?: string) {
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

  let d = new Date();
  if (fechaStr && !isNaN(Date.parse(fechaStr))) {
    d = new Date(fechaStr);
  }

  const diaNum = d.getDate().toString().padStart(2, '0');
  const diaSemana = diasSemana[d.getDay()];
  const mesNom = meses[d.getMonth()];
  const anio = d.getFullYear();

  return {
    fechaCorta: `${diaNum}/${mesNom.substring(0, 3)}/${anio}`,
    fechaCompleta: `${diaSemana}, ${diaNum} de ${mesNom} de ${anio}`,
    fechaProemio: `A LOS ${diaNum} DÍAS DEL MES DE ${mesNom.toUpperCase()} DEL AÑO ${anio}`,
    diaNum,
    mesNom: mesNom.toUpperCase(),
    anio: anio.toString(),
  };
}

export default function ContratoAperturaModal({
  isOpen,
  onClose,
  distribuidor,
}: ContratoAperturaModalProps) {
  const [mounted, setMounted] = useState(false);
  const [viewFilter, setViewFilter] = useState<'todo' | 'caratula' | 'pagare' | 'articulos' | 'contrato' | 'firmas' | 'autorizacion'>('todo');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handlePrint = () => {
    window.print();
  };

  const nombreDistribuidor = (distribuidor.nombreDistribuidor || 'MARIA AGUSTINA MARTINEZ MARES').toUpperCase();
  const contratoId = distribuidor.contratoId || distribuidor.noDist || 1009;
  const lineaCredito = distribuidor.creditoLimite || 0;
  const lineaCreditoTexto = numeroALetrasMX(lineaCredito);
  const lineaCreditoFormato = `${formatMoney(lineaCredito)} (${lineaCreditoTexto})`;

  const direccionDistribuidor = (
    distribuidor.direccion ||
    'I ARRIAGA 150 , CP. 25017, MORELOS, SALTILLO, COAHUILA DE ZARAGOZA'
  ).toUpperCase();

  const fechas = formatearFechaJuridica(distribuidor.fechaAlta || '2023-04-02');
  const recaNumero = '6165-440-036136/05-01629-0726';

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-contrato-apertura,
          #printable-contrato-apertura * {
            visibility: visible !important;
          }
          #printable-contrato-apertura {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
          }
          .contrato-hoja {
            page-break-after: always !important;
            page-break-inside: avoid !important;
            padding: 15mm 20mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            min-height: 100vh !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* BARRA SUPERIOR DE HERRAMIENTAS - FIJA */}
      <div className="no-print bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight truncate">
              Contrato de Apertura de Crédito en Cuenta Corriente
            </h3>
            <p className="text-[11px] text-slate-500 font-medium truncate">
              Distribuidor: <span className="text-slate-800 font-bold">{nombreDistribuidor}</span> · No. {distribuidor.noDist} · Contrato #{contratoId}
            </p>
          </div>
        </div>

        {/* Selector de navegación rápida */}
        <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600 border border-slate-200">
          <button
            type="button"
            onClick={() => setViewFilter('todo')}
            className={`px-3 py-1 rounded-lg transition ${viewFilter === 'todo' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'hover:text-slate-900'}`}
          >
            Todo (14 Págs)
          </button>
          <button
            type="button"
            onClick={() => setViewFilter('caratula')}
            className={`px-3 py-1 rounded-lg transition ${viewFilter === 'caratula' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'hover:text-slate-900'}`}
          >
            Carátula
          </button>
          <button
            type="button"
            onClick={() => setViewFilter('pagare')}
            className={`px-3 py-1 rounded-lg transition ${viewFilter === 'pagare' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'hover:text-slate-900'}`}
          >
            Pagaré
          </button>
          <button
            type="button"
            onClick={() => setViewFilter('articulos')}
            className={`px-3 py-1 rounded-lg transition ${viewFilter === 'articulos' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'hover:text-slate-900'}`}
          >
            Artículos de Ley
          </button>
          <button
            type="button"
            onClick={() => setViewFilter('contrato')}
            className={`px-3 py-1 rounded-lg transition ${viewFilter === 'contrato' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'hover:text-slate-900'}`}
          >
            Cláusulas (1-7)
          </button>
          <button
            type="button"
            onClick={() => setViewFilter('firmas')}
            className={`px-3 py-1 rounded-lg transition ${viewFilter === 'firmas' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'hover:text-slate-900'}`}
          >
            Firmas (8)
          </button>
          <button
            type="button"
            onClick={() => setViewFilter('autorizacion')}
            className={`px-3 py-1 rounded-lg transition ${viewFilter === 'autorizacion' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'hover:text-slate-900'}`}
          >
            Autorización (9)
          </button>
        </div>

        {/* Acciones principales */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Expediente Completo</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition active:scale-95 cursor-pointer"
            title="Cerrar visor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ÁREA DE VISUALIZACIÓN DE DOCUMENTOS (PAGINADA) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-900/60">
        <div id="printable-contrato-apertura" className="max-w-4xl mx-auto space-y-8 font-sans">

          {/* ======================================================== */}
          {/* PÁGINA 1: CARÁTULA DE CRÉDITO (CONDUSEF / RECA)         */}
          {/* ======================================================== */}
          {(viewFilter === 'todo' || viewFilter === 'caratula') && (
            <div className="contrato-hoja bg-white p-8 sm:p-12 rounded-xl shadow-2xl border border-slate-200 text-slate-900 text-[11px] leading-snug">
              <h2 className="text-center font-bold text-base mb-4 tracking-wide text-slate-900 uppercase">
                Carátula de Crédito
              </h2>

              <div className="border border-slate-800 rounded-none overflow-hidden">
                {/* Nombre y Tipo */}
                <div className="grid grid-cols-1 border-b border-slate-800 divide-y divide-slate-800">
                  <div className="p-2 bg-slate-50 font-bold">
                    Nombre comercial del producto: <span className="font-extrabold uppercase">CREDITO EN CUENTA CORRIENTE</span>
                  </div>
                  <div className="p-2 font-bold">
                    Tipo de Crédito: <span className="font-extrabold uppercase">CREDITO EN CUENTA CORRIENTE</span>
                  </div>
                </div>

                {/* 4 Celdas: CAT, TASA, MONTO LINEA, MONTO TOTAL A PAGAR */}
                <div className="grid grid-cols-4 border-b border-slate-800 divide-x divide-slate-800 text-center">
                  <div className="p-2 flex flex-col justify-between">
                    <span className="font-extrabold text-[10px] block mb-1">CAT<br />(Costo Anual Total)</span>
                    <span className="font-extrabold text-xs text-slate-900">
                      138 % Sin IVA para fines informativos y de comparación
                    </span>
                  </div>
                  <div className="p-2 flex flex-col justify-between">
                    <span className="font-extrabold text-[10px] block mb-1">
                      TASA DE INTERÉS ANUAL Y ORDINARIA Y MORATORIA
                    </span>
                    <span className="text-[10px] font-bold">
                      Tasa Ordinaria<br />118 % anual fija<br />
                      Tasa Moratoria<br />18 % anual fija
                    </span>
                  </div>
                  <div className="p-2 flex flex-col justify-between">
                    <span className="font-extrabold text-[10px] block mb-1">
                      MONTO<br />LINEA DE CRÉDITO
                    </span>
                    <span className="font-extrabold text-[11px] text-slate-900">
                      {formatMoney(lineaCredito)}<br />
                      ({lineaCreditoTexto})
                    </span>
                  </div>
                  <div className="p-2 flex flex-col justify-between">
                    <span className="font-extrabold text-[10px] block mb-1">
                      MONTO TOTAL A<br />PAGAR
                    </span>
                    <span className="font-extrabold text-[11px] text-slate-900">
                      $0.00<br />(CERO PESOS 00/100 M.N.)
                    </span>
                  </div>
                </div>

                {/* Fecha límite de pago */}
                <div className="p-2 border-b border-slate-800 font-bold">
                  Fecha límite de pago: <span className="font-normal">Los días 15 Y 30 de cada mes.</span>
                </div>

                {/* Fecha de corte */}
                <div className="p-2 border-b border-slate-800 font-bold">
                  Fecha de corte: <span className="font-normal">Los días 8 y 23 de cada mes.</span>
                </div>

                {/* Comisiones relevantes */}
                <div className="p-2 border-b border-slate-800 font-bold bg-slate-50">
                  COMISIONES RELEVANTES:<br />
                  <span className="font-normal">NO APLICA</span>
                </div>

                {/* Advertencias */}
                <div className="p-2 border-b border-slate-800 space-y-1">
                  <span className="font-bold block">ADVERTENCIAS</span>
                  <p className="italic">“Incumplir tus obligaciones te puede generar comisiones e intereses moratorios”.</p>
                  <p className="italic">“Contratar créditos que excedan tu capacidad de pago afecta tu historial crediticio”.</p>
                  <p className="italic">“El avalista, obligado solidario o coacreditado responderá como obligado principal por el total del pago frente a la Entidad Financiera”</p>
                </div>

                {/* Seguros */}
                <div className="border-b border-slate-800">
                  <div className="p-1 bg-slate-100 text-center font-bold text-[10px] tracking-wider border-b border-slate-800">
                    SEGUROS
                  </div>
                  <div className="grid grid-cols-3 divide-x divide-slate-800 p-2 text-center text-[10px]">
                    <div>Seguro: <span className="font-bold">No aplica</span></div>
                    <div>Aseguradora: <span className="font-bold">No aplica</span></div>
                    <div>Cláusula: <span className="font-bold">No aplica</span></div>
                  </div>
                </div>

                {/* Estado de cuenta */}
                <div className="border-b border-slate-800">
                  <div className="p-1 bg-slate-100 text-center font-bold text-[10px] tracking-wider border-b border-slate-800">
                    ESTADO DE CUENTA
                  </div>
                  <div className="grid grid-cols-3 divide-x divide-slate-800 p-2 text-center text-[10px]">
                    <div>Enviar a: domicilio:</div>
                    <div>Consulta: vía Internet:</div>
                    <div>Envío por correo electrónico: <span className="font-bold">X</span></div>
                  </div>
                </div>

                {/* Aclaraciones y Reclamaciones */}
                <div className="p-2.5 border-b border-slate-800 space-y-1">
                  <span className="font-bold block">Aclaraciones y Reclamaciones</span>
                  <p className="text-[10px]">
                    Unidad Especializada de Atención a Usuarios:<br />
                    Domicilio: Miguel Hidalgo #382, Colonia Centro, en Saltillo, Coahuila, C.P. 25000<br />
                    Teléfono: 8110227811 &nbsp;&nbsp;&nbsp;&nbsp; Correo electrónico: <span className="font-bold">francisco_lopez@lanahora.com</span><br />
                    Página de Internet: <span className="font-bold">lanahora.com</span>
                  </p>
                </div>

                {/* RECA y CONDUSEF */}
                <div className="p-2.5 bg-slate-50 text-[10px] space-y-1">
                  <p className="font-bold">
                    Registro de Contratos de Adhesión Número RECA: {recaNumero}
                  </p>
                  <p>
                    Comisión Nacional para la Protección y Defensa de los Usuarios de Servicios Financieros (CONDUSEF).<br />
                    Teléfono: 01 800 999 8080 y 53400999. Página de Internet: www.condusef.gob.mx
                  </p>
                </div>
              </div>

              {/* Firmas Carátula */}
              <div className="mt-16 text-center space-y-8">
                <div>
                  <div className="w-80 mx-auto border-b border-slate-900 pb-1 font-bold text-xs">
                    SOLUREGIO, S.A.P.I. DE C.V., SOFOM, ENR
                  </div>
                  <span className="text-[10px] text-slate-600 block mt-1">Representada por:</span>
                  <span className="font-bold text-xs uppercase block">EL ACREDITADO</span>
                </div>

                <div className="pt-8">
                  <div className="w-80 mx-auto border-b border-slate-900 pb-1 font-extrabold text-xs">
                    {nombreDistribuidor}
                  </div>
                  <span className="font-bold text-xs uppercase block mt-1">EL OBLIGADO SOLIDARIO Y AVAL</span>
                </div>

                <div className="pt-6">
                  <div className="w-80 mx-auto border-b border-slate-900 pb-1 font-bold text-xs">
                    NO APLICA
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PÁGINA 2: PAGARÉ                                         */}
          {/* ======================================================== */}
          {(viewFilter === 'todo' || viewFilter === 'pagare') && (
            <div className="contrato-hoja bg-white p-8 sm:p-14 rounded-xl shadow-2xl border border-slate-200 text-slate-900 text-xs sm:text-[13px] leading-relaxed text-justify space-y-6">
              <div className="text-right text-[11px] font-bold text-slate-700">
                Número de RECA: {recaNumero}
              </div>

              <h2 className="text-center font-extrabold text-base tracking-widest text-slate-900 uppercase">
                PAGARE
              </h2>

              <p>
                Debo y pagaré incondicionalmente a la orden de <span className="font-bold">SOLUREGIO, S.A.P.I. DE C.V., SOFOM, ENR</span>, (El Acreedor) la suma principal de <span className="font-bold">{lineaCreditoFormato}</span>, más los intereses ordinarios, mediante pagos quincenales, por los montos y en las fechas señalados en la relación de cobranza que la “ENTIDAD FINANCIERA” proporcionará a “EL ACREDITADO, derivado del Contrato de Crédito en cuenta corriente número <span className="font-bold">{contratoId}</span> celebrado en fecha <span className="font-bold">{fechas.fechaCompleta}</span> entre el suscriptor y El Acreedor, (&quot;El Contrato&quot;). en <span className="font-bold">SALTILLO, COAHUILA</span> o en cualquier domicilio que el Acreedor indique por escrito.
              </p>

              <p>
                El presente PAGARÉ generará intereses ordinarios a razón de una <span className="font-bold">tasa anual fija del 138 % (CIENTO TREINTA Y OCHO PORCIENTO)</span> sobre saldos globales, de conformidad con &quot;El Contrato&quot;.
              </p>

              <p>
                Para el caso de que el suscriptor no efectúe puntualmente el pago de capital e intereses en sus respectivas fechas de vencimiento, deberá pagar intereses moratorios, a razón de <span className="font-bold">una tasa anual fija del 18% (DIECIOCHO PORCIENTO)</span> sobre las cantidades vencidas, de conformidad con lo pactado en &quot;El contrato&quot;.
              </p>

              <p>
                Este pagaré podrá darse por vencido anticipadamente y exigirse el pago total del mismo si el suscriptor deja de pagar puntualmente uno o más pagos parciales o incurre en cualquiera de las causas de vencimiento anticipado establecidas en &quot;El contrato&quot;.
              </p>

              <p>
                El presente Pagaré se suscribe en la ciudad de <span className="font-bold">SALTILLO, COAHUILA, el día {fechas.fechaCompleta}</span>.
              </p>

              <div className="pt-10 text-center space-y-8">
                <span className="font-extrabold text-xs tracking-wider block">DEBO Y PAGARÉ</span>

                <div className="pt-6">
                  <div className="w-96 mx-auto border-b border-slate-900 pb-1"></div>
                  <span className="font-bold text-xs uppercase block mt-1">SUSCRIPTOR</span>
                  <span className="font-extrabold text-xs block text-slate-900">{nombreDistribuidor}</span>
                </div>

                <div className="pt-4">
                  <span className="font-bold text-xs uppercase block mb-6">EL OBLIGADO SOLIDARIO Y AVAL</span>
                  <div className="w-96 mx-auto border-b border-slate-900 pb-1 font-bold text-xs">
                    NO APLICA
                  </div>
                </div>
              </div>

              <div className="pt-8 text-left text-xs space-y-1">
                <span className="font-bold block">Domicilios:</span>
                <p><span className="font-bold">EL SUSCRIPTOR:</span> {direccionDistribuidor}.</p>
                <p><span className="font-bold">EL OBLIGADO SOLIDARIO Y AVAL:</span> NO APLICA.</p>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PÁGINAS 3, 4, 5: TRANSCRIPCIÓN DE ARTÍCULOS DE LEY        */}
          {/* ======================================================== */}
          {(viewFilter === 'todo' || viewFilter === 'articulos') && (
            <>
              {/* Página 3 de 14 */}
              <div className="contrato-hoja bg-white p-8 sm:p-14 rounded-xl shadow-2xl border border-slate-200 text-slate-900 text-xs sm:text-[12px] leading-relaxed text-justify space-y-4">
                <div className="text-right text-[11px] font-bold text-slate-700">
                  Número de RECA: {recaNumero}
                </div>

                <h3 className="text-center font-bold text-sm tracking-wide text-slate-900 uppercase">
                  Transcripción de Artículos de Ley contenidos en el<br />
                  Contrato de Crédito en cuenta corriente
                </h3>

                <div>
                  <h4 className="font-bold underline mb-2">1. De la Ley General de Organizaciones y Actividades Auxiliares del Crédito:</h4>
                  <p>
                    <span className="font-bold">Artículo 56.-</span> La inspección y vigilancia de las organizaciones auxiliares del crédito, casas de cambio y sociedades financieras de objeto múltiple reguladas queda confiada a la Comisión Nacional Bancaria y de Valores, la que tendrá, en lo que no se oponga a esta Ley, respecto de dichas organizaciones auxiliares del crédito, casas de cambio y sociedades financieras de objeto múltiple reguladas, todas las facultades que en materia de inspección y vigilancia le confiere la Ley de Instituciones de Crédito para instituciones de banca múltiple, quien la llevará a cabo sujetándose a lo previsto en su ley, en el Reglamento respectivo y en las demás disposiciones que resulten aplicables.
                  </p>
                  <p className="mt-2">
                    En lo que respecta a las sociedades financieras de objeto múltiple no reguladas, los centros cambiarios y los transmisores de dinero, la inspección y vigilancia de estas sociedades, se llevará a cabo por la mencionada Comisión, exclusivamente para verificar el cumplimiento de los preceptos a que se refiere el artículo 95 Bis de esta Ley y las disposiciones de carácter general que de éste deriven.
                  </p>
                  <p className="mt-2">
                    Las organizaciones auxiliares del crédito y casas de cambio deberán rendir a la Secretaría de Hacienda y Crédito Público y a la Comisión Nacional Bancaria y de Valores, en la forma y términos que al efecto establezcan, los informes, documentos y pruebas que sobre su organización, operaciones, contabilidad, inversiones o patrimonio les soliciten para fines de regulación, supervisión, control, inspección, vigilancia, estadística y demás funciones que, conforme a esta Ley u otras disposiciones legales y administrativas, les corresponda ejercer.
                  </p>
                </div>

                <div className="pt-2">
                  <h4 className="font-bold underline mb-2">2. De la ley para regular las sociedades de información crediticia</h4>
                  <p>
                    <span className="font-bold">Artículo 20.-</span> La base de datos de las Sociedades se integrará con la información sobre operaciones crediticias y otras de naturaleza análoga que le sea proporcionada por los Usuarios. Los Usuarios que entreguen dicha información a las Sociedades deberán hacerlo de manera completa y veraz; asimismo, estarán obligados a señalar expresamente la fecha de origen de los créditos que inscriban y la fecha del primer incumplimiento. Las Sociedades no deberán inscribir por ningún motivo, créditos cuya fecha de origen no sea especificado por los Usuarios, o cuando éste tenga una antigüedad en cartera vencida mayor a 72 meses.
                  </p>
                  <p className="mt-2">
                    Lo anterior, de conformidad con lo establecido en los artículos 23 y 24 de esta Ley.
                  </p>
                  <p className="mt-2">
                    En caso de que la información proporcionada por el Usuario sea relativa a una persona moral, el Usuario deberá incluir a los accionistas o titulares de las partes sociales, según corresponda, que sean propietarios del 10% o más del capital social.
                  </p>
                  <p className="mt-2">
                    Las Entidades Financieras deberán proporcionar, de conformidad con las disposiciones de carácter general que, al efecto, emita el Banco de México, la información relativa a sus operaciones crediticias, al menos, a una de las Sociedades organizadas conforme a esta Ley.
                  </p>
                  <p className="mt-2">
                    Cuando el cliente realice el cumplimiento de una obligación, el Usuario deberá proporcionar a la Sociedad la información del pago correspondiente y la eliminación de la clave de prevención u observación correspondiente. El Usuario deberá enviar dicha información dentro de los cinco días hábiles posteriores al pago. En el caso a que se refiere el párrafo quinto del artículo 27 bis, los Usuarios contarán con un plazo de hasta diez días hábiles para enviar la información actualizada a la Sociedad.
                  </p>
                  <p className="mt-2">
                    En el supuesto al que se refiere el párrafo anterior, las Sociedades tendrán un plazo de hasta tres días hábiles contados a partir de la fecha en que hayan recibido la información de los Usuarios, para actualizar dicha información en sus bases de datos.
                  </p>
                  <p className="mt-2">
                    Cuando los clientes se acojan a programas de recuperación de créditos de Entidades Financieras, Empresas Comerciales o Sofomes E.N.R. los Usuarios deberán reportar a las sociedades de Información Crediticia dichos créditos como saldados, en caso de que hayan sido finiquitados.
                  </p>
                </div>
              </div>

              {/* Página 4 de 14 */}
              <div className="contrato-hoja bg-white p-8 sm:p-14 rounded-xl shadow-2xl border border-slate-200 text-slate-900 text-xs sm:text-[12px] leading-relaxed text-justify space-y-4">
                <div className="text-right text-[11px] font-bold text-slate-700">
                  Número de RECA: {recaNumero}
                </div>

                <p>
                  <span className="font-bold">Artículo 28.-</span> Las Sociedades solo podrán proporcionar información a un Usuario, cuando este cuente con la autorización expresa del Cliente, mediante su firma, en donde conste de manera fehaciente que tiene pleno conocimiento de la naturaleza y alcance de la información que la Sociedad proporcionará al Usuario que así la solicite, del uso que dicho Usuario hará de tal información y del hecho de que este podrá realizar consultas periódicas de su historial crediticio, durante el tiempo que mantenga relación jurídica con el Cliente. La firma a que se refiere este párrafo podrá ser recabada de manera autógrafa o por medios electrónicos, en este último caso, siempre que cumpla con los términos y condiciones establecidos por el Banco de México.
                </p>
                <p>
                  Las Sociedades podrán proporcionar información a los Usuarios que adquieran o administren cartera de crédito, utilizando para ello la autorización que el Cliente haya dado conforme al presente artículo al Usuario que otorgó el crédito respectivo originalmente.
                </p>
                <p>
                  Asimismo, el Banco de México podrá autorizar a las Sociedades los términos y condiciones bajo los cuales podrán pactar con los Usuarios la sustitución de la firma autógrafa del Cliente, con alguna de las formas de manifestación de la voluntad señaladas en el artículo 1803 del Código Civil Federal.
                </p>

                <div className="pt-2">
                  <h4 className="font-bold underline mb-2">3. Del Código de Comercio</h4>
                  <p>
                    <span className="font-bold">Artículo 89.-</span> Las disposiciones de este Título regirán en toda la República Mexicana en asuntos del orden comercial, sin perjuicio de lo dispuesto en los tratados internacionales de los que México sea parte.
                  </p>
                  <p className="mt-2">
                    Las actividades reguladas por este Título se someterán en su interpretación y aplicación a los principios de neutralidad tecnológica, autonomía de la voluntad, compatibilidad internacional y equivalencia funcional del Mensaje de Datos en relación con la información documentada en medios no electrónicos y de la Firma Electrónica en relación con la firma autógrafa.
                  </p>
                  <p className="mt-2">
                    En los actos de comercio y en la formación de los mismos podrán emplearse los medios electrónicos, ópticos o cualquier otra tecnología. Para efecto del presente Código, se deberán tomar en cuenta las siguientes definiciones:
                  </p>
                  <div className="mt-2 space-y-1.5 pl-2">
                    <p><span className="font-bold">Certificado:</span> Todo Mensaje de Datos u otro registro que confirme el vínculo entre un Firmante y los datos de creación de Firma Electrónica.</p>
                    <p><span className="font-bold">Datos de Creación de Firma Electrónica:</span> Son los datos únicos, como códigos o claves criptográficas privadas, que el Firmante genera de manera secreta y utiliza para crear su Firma Electrónica, a fin de lograr el vínculo entre dicha Firma Electrónica y el Firmante.</p>
                    <p><span className="font-bold">Destinatario:</span> La persona designada por el Emisor para recibir el Mensaje de Datos, pero que no esté actuando a título de Intermediario con respecto a dicho Mensaje.</p>
                    <p><span className="font-bold">Digitalización:</span> Migración de documentos impresos a mensaje de datos, de acuerdo con lo dispuesto en la norma oficial mexicana sobre digitalización y conservación de mensajes de datos que para tal efecto emita la Secretaría.</p>
                    <p><span className="font-bold">Emisor:</span> Toda persona que, al tenor del Mensaje de Datos, haya actuado a nombre propio o en cuyo nombre se haya enviado o generado ese mensaje antes de ser archivado, si éste es el caso, pero que no haya actuado a título de Intermediario.</p>
                    <p><span className="font-bold">Firma Electrónica:</span> Los datos en forma electrónica consignados en un Mensaje de Datos, o adjuntados o lógicamente asociados al mismo por cualquier tecnología, que son utilizados para identificar al Firmante en relación con el Mensaje de Datos e indicar que el Firmante aprueba la información contenida en el Mensaje de Datos, y que produce los mismos efectos jurídicos que la firma autógrafa, siendo admisible como prueba en juicio.</p>
                    <p><span className="font-bold">Firma Electrónica Avanzada o Fiable:</span> Aquella Firma Electrónica que cumpla con los requisitos contemplados en las fracciones I a IV del artículo 97.</p>
                    <p>En aquellas disposiciones que se refieran a Firma Digital, se considerará a ésta como una especie de la Firma Electrónica.</p>
                    <p><span className="font-bold">Firmante:</span> La persona que posee los datos de la creación de la firma y que actúa en nombre propio o de la persona a la que representa.</p>
                    <p><span className="font-bold">Intermediario:</span> En relación con un determinado Mensaje de Datos, se entenderá toda persona que, actuando por cuenta de otra, envíe, reciba o archive dicho Mensaje o preste algún otro servicio con respecto a él.</p>
                  </div>
                </div>
              </div>

              {/* Página 5 de 14 */}
              <div className="contrato-hoja bg-white p-8 sm:p-14 rounded-xl shadow-2xl border border-slate-200 text-slate-900 text-xs sm:text-[12px] leading-relaxed text-justify space-y-3">
                <div className="text-right text-[11px] font-bold text-slate-700">
                  Número de RECA: {recaNumero}
                </div>

                <div className="space-y-2">
                  <p><span className="font-bold">Mensaje de Datos:</span> La información generada, enviada, recibida o archivada por medios electrónicos, ópticos o cualquier otra tecnología.</p>
                  <p><span className="font-bold">Parte que Confía:</span> La persona que, siendo o no el Destinatario, actúa sobre la base de un Certificado o de una Firma Electrónica.</p>
                  <p><span className="font-bold">Prestador de Servicios de Certificación:</span> La persona o institución pública que preste servicios relacionados con firmas electrónicas, expide los certificados o presta servicios relacionados como la conservación de mensajes de datos, el sellado digital de tiempo y la digitalización de documentos impresos, en los términos que se establezca en la norma oficial mexicana sobre digitalización y conservación de mensajes de datos que para tal efecto emita la Secretaría.</p>
                  <p><span className="font-bold">Secretaría:</span> Se entenderá la Secretaría de Economía.</p>
                  <p><span className="font-bold">Sello Digital de Tiempo:</span> El registro que prueba que un dato existía antes de la fecha y hora de emisión del citado Sello, en los términos que se establezca en la norma oficial mexicana sobre digitalización y conservación de mensajes de datos que para tal efecto emita la Secretaría.</p>
                  <p><span className="font-bold">Sistema de Información:</span> Se entenderá todo sistema utilizado para generar, enviar, recibir, archivar o procesar de alguna otra forma Mensajes de Datos.</p>
                  <p><span className="font-bold">Titular del Certificado:</span> Se entenderá a la persona a cuyo favor fue expedido el Certificado.</p>
                </div>

                <div className="pt-4">
                  <p>
                    <span className="font-bold">Artículo 89 bis.-</span> No se negarán efectos jurídicos, validez o fuerza obligatoria a cualquier tipo de información por la sola razón de que esté contenida en un Mensaje de Datos. Por tanto, dichos mensajes podrán ser utilizados como medio probatorio en cualquier diligencia ante autoridad legalmente reconocida, y surtirán los mismos efectos jurídicos que la documentación impresa, siempre y cuando los mensajes de datos se ajusten a las disposiciones de este Código y a los lineamientos normativos correspondientes.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* ======================================================== */}
          {/* PÁGINAS 6 A 12: CONTRATO (PÁGINAS 1 DE 9 A 7 DE 9)       */}
          {/* ======================================================== */}
          {(viewFilter === 'todo' || viewFilter === 'contrato') && (
            <>
              {/* Hoja 1 de 9 (Página 6) */}
              <div className="contrato-hoja bg-white p-8 sm:p-14 rounded-xl shadow-2xl border border-slate-200 text-slate-900 text-xs sm:text-[12px] leading-relaxed text-justify space-y-4">
                <div className="text-right text-[11px] font-bold text-slate-700">
                  Número de RECA: {recaNumero}
                </div>

                <p className="font-bold">
                  CONTRATO DE APERTURA DE CRÉDITO EN CUENTA CORRIENTE QUE CELEBRAN POR UNA PARTE SOLUREGIO, S.A.P.I. DE C.V., SOFOM, ENR REPRESENTADA POR LUIS EDUARDO REDONDO BATIZ, EN LO SUCESIVO LA &quot;ENTIDAD FINANCIERA&quot;; POR OTRA PARTE EL(LA) SEÑOR(A) {nombreDistribuidor}, EN CARACTER DE EL &quot;ACREDITADO&quot;, Y POR ÚLTIMO EL(LA) CIUDADANO(A) NO APLICA, EN CARÁCTER DE OBLIGADO SOLIDARIO LAS CUALES EN SU CONJUNTO SE LES DENOMINARÁ LAS “PARTES”, AL TENOR DE LAS SIGUIENTES DECLARACIONES Y CLÁUSULAS.
                </p>

                <h3 className="text-center font-extrabold text-xs tracking-wider uppercase">DECLARACIONES</h3>

                <p className="font-bold">I. DECLARA LA &quot;ENTIDAD FINANCIERA&quot; A TRAVÉS DE SU REPRESENTANTE LEGAL, QUE:</p>
                <div className="space-y-1.5 pl-3">
                  <p>A. Es una Sociedad Anónima Promotora de Inversión de Capital Variable, Sociedad Financiera de Objeto Múltiple, Entidad no Regulada, debidamente constituida de conformidad con las leyes de los Estados Unidos Mexicanos, según se acredita con la escritura pública número 21,122, de fecha 16 de febrero de 2012, otorgada ante la fe del Licenciado Luciano Gerardo Galindo Ruiz, Notario Público número 115, de la Ciudad de San Pedro Garza García, del Estado de Nuevo León, inscrita en el Registro Público de la Propiedad y del Comercio de Monterrey, Nuevo León, bajo el folio mercantil electrónico número 131609*1, de fecha 07 de marzo de 2012.</p>
                  <p>B. Su representante cuenta con facultades suficientes y necesarias para celebrar el presente Contrato y obligar a “LA ENTIDAD FINANCIERA” en los términos del mismo según consta en escritura pública número (52319), de la fecha (25/04/16), otorgada ante la fe del Licenciado (Everardo Alanis Guerra), Notario Público número (96) de la Ciudad de Saltillo, Coahuila, mismas que bajo protesta de decir verdad no le han sido revocadas, modificadas o en forma algunas limitadas.</p>
                  <p>C. Su Registro Federal de Contribuyentes es: SOL120216UD8</p>
                  <p>D. Tiene su domicilio ubicado en: Calle Miguel Hidalgo #382, Col. Centro, Saltillo, Coahuila de Zaragoza</p>
                  <p>E. Para su constitución y operación con carácter de sociedad financiera de objeto múltiple, entidad no regulada, no requiere autorización de la Secretaría de Hacienda y Crédito Público, y únicamente está sujeta a la supervisión de la Comisión Nacional Bancaria y de Valores, para los efectos del artículo 56 de la Ley de Organizaciones y Actividades Auxiliares de Crédito (LGOAAC).</p>
                  <p>F. Es su intención otorgar el Crédito al “ACREDITADO”, conforme a las estipulaciones del Contrato.</p>
                  <p>G. El presente Contrato y sus anexos se encuentran inscritos en el portal RECA (Registro de Contratos de Adhesión) de la Comisión Nacional para la Protección y Defensa de los usuarios de servicios financieros (CONDUSEF), bajo el número señalado al margen superior.</p>
                  <p>H. La dirección de su página de internet es lanahora.com</p>
                </div>

                <p className="font-bold pt-2">II. DECLARA EL &quot;ACREDITADO&quot; BAJO PROTESTA DE DECIR VERDAD QUE:</p>
                <div className="space-y-1 pl-3">
                  <p>A. Es una persona física con capacidad jurídica para celebrar el presente Contrato.</p>
                  <p>B. Se encuentra debidamente inscrito en el Registro Federal de Contribuyentes.</p>
                  <p>C. Solicitó a “LA ENTIDAD FINANCIERA”, el otorgamiento de un crédito en cuenta corriente, en moneda nacional (en lo sucesivo el “CRÉDITO”) en los términos que se precisan en el presente contrato y sus anexos, que será destinado a dar liquidez al “ACREDITADO”.</p>
                  <p>D. Está en aptitud legal para celebrar este contrato y cumplirlo en sus términos, así como para suscribir los pagarés a favor del “ACREDITANTE” de acuerdo con lo pactado en este contrato.</p>
                  <p>G. A la fecha del presente Contrato no enfrenta procedimiento o demanda referente a la prevención y detección de operaciones con recursos de procedencia ilícita ante alguna autoridad judicial.</p>
                  <p>H. No comparece por instrucciones de tercera persona, ni usará recursos de terceros para hacer el pago de las obligaciones contratadas.</p>
                </div>

                <p className="font-bold pt-2">II. DECLARA EL &quot;OBLIGADO SOLIDARIO&quot; BAJO PROTESTA DE DECIR VERDAD QUE:</p>
                <div className="space-y-1 pl-3">
                  <p>A. Se encuentra legalmente apto y con facultades suficientes para obligarse en los términos y bajo las condiciones aquí pactadas.</p>
                  <p>B. Es su voluntad constituirse como OBLIGADO SOLIDARIO del ACREDITADO, para garantizar todas y cada una de las obligaciones que éste contraiga a favor de LA ENTIDAD FINANCIERA en los términos del presente contrato.</p>
                </div>

                <h3 className="text-center font-extrabold text-xs tracking-wider uppercase pt-2">CLÁUSULAS</h3>
                <p>
                  <span className="font-bold">PRIMERA. DEFINICIONES.</span> Las “PARTES” están de acuerdo en que los siguientes términos tendrán los significados que a continuación se establecen y que serán igualmente aplicados a las formas singular o plural de dichos términos:
                </p>

                <div className="text-center text-[10px] text-slate-500 pt-2">1 de 9</div>
              </div>

              {/* Hoja 2 de 9 (Página 7) */}
              <div className="contrato-hoja bg-white p-8 sm:p-14 rounded-xl shadow-2xl border border-slate-200 text-slate-900 text-xs sm:text-[12px] leading-relaxed text-justify space-y-3">
                <div className="text-right text-[11px] font-bold text-slate-700">
                  Número de RECA: {recaNumero}
                </div>

                <div className="space-y-1.5 pl-3">
                  <p><span className="font-bold">a) CARÁTULA DE CRÉDITO.</span> El documento que forma parte integral del presente Contrato, en el cual se precisan las características generales del Crédito.</p>
                  <p><span className="font-bold">b) CAT.</span> El costo anual total de financiamiento expresado en términos porcentuales anuales que, para fines informativos y de comparación, incorpora la totalidad de los costos y gastos inherentes a los créditos, el cual a la fecha de firma del presente instrumento asciende al porcentaje indicado en la Carátula del contrato.</p>
                  <p><span className="font-bold">c) FECHA DE CORTE.</span> La fecha de corte para efecto del cálculo de intereses podrá ser consultada en la Carátula del contrato.</p>
                  <p><span className="font-bold">d) IVA.</span> El impuesto al valor agregado.</p>
                  <p><span className="font-bold">e) UNE..</span> Es la Unidad Especializada de Atención a Usuarios que tiene por objeto atender consultas y reclamaciones de los clientes/usuarios.</p>
                  <p><span className="font-bold">f) PAGO ADELANTADO.</span> Al pago parcial o total, que aún no es exigible, aplicado a cubrir pagos periódicos del CRÉDITO respectivo, inmediatos siguientes.</p>
                  <p><span className="font-bold">g) PAGO ANTICIPADO.</span> Al pago parcial o total del Saldo Insoluto de un CRÉDITO, antes de la fecha en que sea exigible.</p>
                </div>

                <p className="pt-2">
                  <span className="font-bold">SEGUNDA. OBJETO.</span> “LA ENTIDAD FINANCIERA” otorga a favor de “EL ACREDITADO”, un CRÉDITO en cuenta corriente en moneda nacional hasta por el monto indicado en la CARÁTULA DE CRÉDITO. El importe del CRÉDITO otorgado podrá ser utilizado por el “ACREDITADO” para la adquisición de préstamo en efectivo por medio de vales.
                </p>
                <p>
                  “LA ENTIDAD FINANCIERA” podrá modificar el importe del CRÉDITO otorgado de acuerdo con la experiencia crediticia de “EL ACREDITADO” previa notificación mediante el estado de cuenta. En caso de aumento en la línea de crédito, deberá contar con el consentimiento del “ACREDITADO”.
                </p>

                <p className="pt-2">
                  <span className="font-bold">TERCERA. DISPOSICIÓN DEL CRÉDITO.</span> “EL ACREDITADO” podrá disponer del CRÉDITO mediante entrega de cheque nominativo o depósito a la cuenta de las personas a quienes “EL ACREDITADO” designe (el “BENEFICIARIO”), por medio de Vales a favor de los mismos.
                </p>
                <p>
                  El “ACREDITADO” podrá hacer remesas en reembolso parcial o total de las disposiciones que previamente hubiere hecho, quedando facultado, mientras el plazo del contrato no concluya, para disponer del saldo que resulte a su favor, siempre y cuando se encuentre al corriente en el cumplimiento de sus obligaciones, sujeta a la disponibilidad de fondos de la “ENTIDAD FINANCIERA”, en el entendido de que ninguna disposición podrá exceder el límite del CRÉDITO otorgado.
                </p>
                <p>
                  Por cada disposición, el “ACREDITADO” se obliga a suscribir a la orden de la “ENTIDAD FINANCIERA”, pagarés que se suscribirán como comprobante del adeudo y su entrega no se considerará como pago.
                </p>

                <p className="pt-2">
                  <span className="font-bold">CUARTA. DE LOS VALES.</span> Los Vales serán intransferibles, y deberán contener el nombre completo del BENEFICIARIO, el monto de la disposición, con número y letra, y la firma de “EL ACREDITADO”, la que deberá ser idéntica a la que utiliza en el contrato y en su identificación oficial, y actuarán como constancia de la disposición de CRÉDITO realizada por “EL ACREDITADO”.
                </p>
                <p>
                  Para hacer efectivos los Vales, “EL BENEFICIARIO” deberá presentarlos en el domicilio de la “ENTIDAD FINANCIERA” e identificarse a satisfacción de la misma.
                </p>
                <p>
                  Una vez canjeado el vale no se aceptan devoluciones de este y “EL ACREDITADO” tendrá que hacer los pagos de la forma convenida.
                </p>
                <p>
                  Los Vales son propiedad de “LA ENTIDAD FINANCIERA” por lo que el acreditado se obliga a devolverlos en caso de terminación o rescisión del contrato o a la fecha de expiración de los mismos.
                </p>
                <p>
                  En caso de pérdida, robo o extravío de los Vales, “EL ACREDITADO” deberá de notificar de inmediato dicha circunstancia a “LA ENTIDAD FINANCIERA”, vía telefónica, y ratificar por escrito dicho reporte, dentro de las 48 horas siguiente al mismo, a fin de que se realice la cancelación definitiva de los vales. La falta de reporte telefónico o de su ratificación escrita dentro del plazo señalado, ocasionará sin restricción y condición alguna, que las disposiciones que cualquier tercero realice del CRÉDITO otorgado mediante el uso de los vales perdidos, robados o extraviados, sea responsabilidad de “EL ACREDITADO”.
                </p>

                <div className="text-center text-[10px] text-slate-500 pt-2">2 de 9</div>
              </div>

              {/* Hoja 3 de 9 (Página 8) */}
              <div className="contrato-hoja bg-white p-8 sm:p-14 rounded-xl shadow-2xl border border-slate-200 text-slate-900 text-xs sm:text-[12px] leading-relaxed text-justify space-y-3">
                <div className="text-right text-[11px] font-bold text-slate-700">
                  Número de RECA: {recaNumero}
                </div>

                <p>
                  <span className="font-bold">QUINTA. FORMA DE PAGO DEL CAPITAL.</span> El “ACREDITADO” se obliga a pagar a “LA ENTIDAD FINANCIERA”, en la dirección que se indica en su estado de cuenta, el importe del CRÉDITO del que se dispuso, mediante pagos quincenales, que deberán ser de cuando menos el importe señalado como mínimo para pagar en la relación de cobranza que la “ENTIDAD FINANCIERA” proporcionará a “EL ACREDITADO o en su caso, o a través del PROCEDIMIENTO DE CONSULTA DE SALDOS, TRANSACCIONES Y MOVIMIENTOS,”
                </p>
                <p>
                  Los referidos pagos deberán efectuarse en la Fecha Límite de pago que podrá ser consultada en la Carátula del contrato o a través del PROCEDIMIENTO DE CONSULTA DE SALDOS, TRANSACCIONES Y MOVIMIENTOS.
                </p>
                <p>
                  El incumplimiento de uno o más de los pagos dará derecho a “LA ENTIDAD FINANCIERA” a dar por terminado el presente contrato, así como a exigir el pago inmediato de la totalidad del saldo del CRÉDITO otorgado, así como de los intereses generados hasta la fecha en que el pago se efectúe, excepto en el caso del que el CRÉDITO se suspende o cancele.
                </p>

                <p className="pt-2">
                  <span className="font-bold">SEXTA. DE LOS INTERESES ORDINARIOS.</span> El ACREDITADO se obliga a pagar a “LA ENTIDAD FINANCIERA” intereses ordinarios sobre saldos globales, a razón de <span className="font-bold">118 % (CIENTO DIECIOCHO)</span>.
                </p>
                <p>
                  Los intereses ordinarios se calcularán dividiendo la tasa porcentual anual de interés ordinaria entre 360 (trescientos sesenta), con lo que se determinará la tasa porcentual diaria, y multiplicando la misma por el monto total del crédito, se obtendrá el interés diario a pagar, y multiplicando el resultado obtenido por el número de días del período, se obtendrá la cantidad a pagar por concepto de intereses en el período.
                </p>
                <p>
                  Al resultado obtenido se le adicionará el impuesto al Valor Agregado (IVA), excepto cuando el destino del crédito sea para el desarrollo de proyectos productivos relacionados con la actividad del ACREDITADO.
                </p>
                <p>
                  El interés Ordinario se devengará a partir del día siguiente natural, de la disposición del crédito, y se pagará en las fechas señaladas para el pago del crédito. En ningún caso se podrá exigir el pago de intereses por adelantado, sino únicamente por periodos vencidos.
                </p>

                <p className="pt-2">
                  <span className="font-bold">SÉPTIMA. DE LOS INTERESES MORATORIOS.</span> En caso de incumplimiento en el pago oportuno de las cantidades que correspondan a la suerte principal del Crédito, el “ACREDITADO” pagará a “LA ENTIDAD FINANCIERA” intereses sobre el capital vencido y no pagado a la tasa de interés moratoria anual fija de <span className="font-bold">18% (DIEZ Y OCHO POR CIENTO)</span>, desde la fecha en que incurra en mora hasta el día en que sea totalmente pagado el importe del saldo insoluto vencido del crédito.
                </p>
                <p>
                  Los intereses moratorios se calcularán dividiendo la tasa porcentual anual de interés ordinaria entre 360 (trescientos sesenta), con lo que se determinará la tasa porcentual diaria, y multiplicando la misma por el monto total del crédito, se obtendrá el interés diario a pagar, y multiplicando el resultado obtenido por el número de días del período, se obtendrá la cantidad a pagar por concepto de intereses en el período.
                </p>

                <p className="pt-2">
                  <span className="font-bold">OCTAVA. PAGOS ANTICIPADOS Y PAGOS ADELANTADOS.</span> El ACREDITADO podrá pagar total o parcialmente, de manera anticipada, los créditos menores al equivalente a 900,000 UDIS y de créditos hipotecarios por cualquier monto. Lo anterior, siempre que El ACREDITADO lo solicite y esté al corriente en los pagos exigibles de conformidad con el contrato respectivo.
                </p>
                <p>
                  Los pagos que se realicen antes de la fecha en que sean exigibles respecto de dichos créditos, deberán considerarse pagos anticipados y no pagos adelantados.
                </p>
                <p>
                  Cuando EL ACREDITADO solicite efectuar pagos anticipados, LA ENTIDAD FINANCIERA deberá informarle el Saldo Insoluto. Dicha información deberá darse por escrito si el pago anticipado se efectúa en alguna de sus sucursales o a través del PROCEDIMIENTO DE CONSULTA DE SALDOS, TRANSACCIONES Y MOVIMIENTOS, cuando el pago se realice fuera de sucursal.
                </p>
                <p>
                  LA ENTIDAD FINANCIERA deberá aplicar los pagos anticipados en forma exclusiva al Saldo Insoluto del capital. Cuando el importe de los pagos anticipados no fuere suficiente para amortizar el Saldo Insoluto en su totalidad, LA ENTIDAD FINANCIERA deberá reducir el monto de los pagos periódicos pendientes, salvo cuando pacte con EL ACREDITADO que se disminuya el número de pagos a realizar. En ambos supuestos LA ENTIDAD FINANCIERA deberá calcular el importe de los intereses por devengar, con base en el nuevo Saldo Insoluto.
                </p>

                <div className="text-center text-[10px] text-slate-500 pt-2">3 de 9</div>
              </div>

              {/* Hoja 4 de 9 (Página 9) */}
              <div className="contrato-hoja bg-white p-8 sm:p-14 rounded-xl shadow-2xl border border-slate-200 text-slate-900 text-xs sm:text-[12px] leading-relaxed text-justify space-y-3">
                <div className="text-right text-[11px] font-bold text-slate-700">
                  Número de RECA: {recaNumero}
                </div>

                <p>
                  Cada vez que EL ACREDITADO efectúe un pago anticipado, LA ENTIDAD FINANCIERA deberá entregarle un comprobante de dicho pago.
                </p>
                <p>
                  Tratándose de pagos anticipados por un importe igual al Saldo Insoluto, LA ENTIDAD FINANCIERA, además del comprobante del pago, deberán entregar o mantener a disposición de EL ACREDITADO, el estado de cuenta o documento en el que conste el fin de la relación contractual y la inexistencia de adeudos derivados exclusivamente de dicha relación, dentro de diez días hábiles a partir de que se hubiera realizado el pago de los adeudos o en la siguiente fecha de corte.
                </p>
                <p>
                  Cuando EL ACREDITADO lo solicite, LA ENTIDAD FINANCIERA podrán recibir pagos adelantados, es decir, pagos que aún no sean exigibles, con el fin de aplicarlos a cubrir pagos periódicos inmediatos siguientes.
                </p>
                <p>
                  Cuando el importe del pago sea superior al que deba cubrirse en un Periodo, LA ENTIDAD FINANCIERA deberá obtener de EL ACREDITADO un escrito con firma autógrafa que incluya la leyenda siguiente: “El Usuario autoriza que los recursos que se entregan en exceso a sus obligaciones exigibles, no se apliquen para el pago anticipado del principal, sino que se utilicen para cubrir por adelantado los pagos periódicos del Crédito inmediatos siguientes”.
                </p>
                <p>
                  Cuando LA ENTIDAD FINANCIERA reciban el pago aun no exigible del Periodo o importes inferiores, no será necesario el escrito mencionado en el párrafo anterior.
                </p>
                <p>
                  Cada vez que EL ACREDITADO efectúe un pago adelantado, LA ENTIDAD FINANCIERA deberán entregarle un comprobante de dicho pago.
                </p>
                <p>
                  En virtud de tratarse de un crédito en cuenta corriente, no se expedirá tabla de amortización, sin embargo, los saldos podrán ser consultados en el estado de cuenta y mediante el PROCEDIMIENTO DE CONSULTA DE SALDOS, TRANSACCIONES Y MOVIMIENTOS.
                </p>

                <p className="pt-2">
                  <span className="font-bold">NOVENA. COMISIONES.</span> El presente contrato no genera comisiones. En el caso de que hubiere nuevas comisiones, se estará a lo previsto en la cláusula “MODIFICACIONES AL CONTRATO”.
                </p>

                <p className="pt-2">
                  <span className="font-bold">DÉCIMA. VIGENCIA DEL CONTRATO.</span> El presente contrato estará vigente por tiempo indefinido pudiendo cualesquiera de las partes darlo por terminado en cualquier momento, sin expresión de causa y sin responsabilidad alguna de su parte, mediante simple aviso que por escrito efectúe a su contraparte, con 30 días naturales de anticipación. En caso de que sea el “ACREDITADO” quien pretenda dicha terminación, deberá previamente liquidar la totalidad de su saldo en el CRÉDITO y entregar los talonarios de vales que no haya utilizado.
                </p>

                <p className="pt-2">
                  <span className="font-bold">DÉCIMA PRIMERA. OBLIGADO SOLIDARIO.</span> Quien firma como deudor solidario al calce del presente CONTRATO se obliga solidariamente con el “ACREDITADO” a pagar a “LA ENTIDAD FINANCIERA” cualquier cantidad o salgo a cargo del “ACREDITADO” y la responsabilidad solidaria subsistirá hasta en tanto el “ACREDITADO” haya hecho el pago total del importe de las disposiciones ejercidas conforme el presente contrato.
                </p>

                <p className="pt-2">
                  <span className="font-bold">DÉCIMA SEGUNDA. CESIÓN DE DERECHOS.</span> Los derechos y obligaciones que a cargo de “LA ENTIDAD FINANCIERA” se generen en virtud del presente contrato podrán ser cedidos libremente tanto por lo que se refiere al manejo y administración de las líneas de CRÉDITO que del mismo emanen, como en su caso a los derechos de cobro y ejecución que del mismo se generen en su favor y a cargo de “EL ACREDITADO”.
                </p>

                <p className="pt-2">
                  <span className="font-bold">DÉCIMA TERCERA. RESERVA, RESTRICCIÓN Y DENUNCIA DEL CONTRATO.</span> “LA ENTIDAD FINANCIERA” se reserva expresamente la facultad de restringir el importe del CRÉDITO o el plazo en que puede hacer uso de él la parte ACREDITADA, o ambos a la vez, o a denunciar el presente contrato, en cualquier tiempo, mediante simple aviso por escrito dirigido a la parte ACREDITADA.
                </p>

                <p className="pt-2">
                  <span className="font-bold">DÉCIMA CUARTA. MODIFICACIONES AL CONTRATO.</span> Para la modificación del presente contrato, “LA ENTIDAD FINANCIERA” dará aviso a el “ACREDITADO” con treinta días naturales de anticipación, a través del estado de cuenta.
                </p>
                <p>
                  En el caso de que el “ACREDITADO” no esté de acuerdo con las modificaciones propuestas por “LA ENTIDAD FINANCIERA”, podrá dar por terminado el contrato, dentro de los 30 días posteriores al aviso, sin responsabilidad alguna a su cargo y bajo las condiciones pactadas originalmente, debiendo cubrir en su caso, los adeudos que se generen hasta el término de la operación, sin que la “ENTIDAD FINANCIERA” pueda cobrarle penalización alguna por dicha causa.
                </p>

                <div className="text-center text-[10px] text-slate-500 pt-2">4 de 9</div>
              </div>

              {/* Hoja 5 de 9 (Página 10) */}
              <div className="contrato-hoja bg-white p-8 sm:p-14 rounded-xl shadow-2xl border border-slate-200 text-slate-900 text-xs sm:text-[12px] leading-relaxed text-justify space-y-3">
                <div className="text-right text-[11px] font-bold text-slate-700">
                  Número de RECA: {recaNumero}
                </div>

                <p>
                  <span className="font-bold">DÉCIMA QUINTA. PROCEDIMIENTO DE CONSULTA DE SALDOS, TRANSACCIONES Y MOVIMIENTOS.</span> El ACREDITADO podrá realizar en cualquier momento, consulta de saldos, transacciones y movimientos, así como presentar quejas y solicitudes de todo tipo relacionadas con la operación del presente contrato, mediante escrito en el cual precise su nombre completo, asunto o solicitud específica y número de crédito, así como acompañar copia de su identificación, estado de cuenta y documentación que acredite su personalidad, ante la UNIDAD ESPECIALIZADA DE ATENCION A USUARIOS DE LA ENTIDAD FINANCIERA, mediante escrito presentado en el domicilio sito en Miguel Hidalgo # 382, Colonia Centro, en Saltillo, Coahuila, C.P. 25000 o mediante correo electrónico a la dirección francisco_lopez@lanahora.com o vía telefónica al 8110227811, o ante las Unidades de Atención regionales mas cercanas al domicilio del ACREDITADO.
                </p>
                <p>
                  Las operaciones cuyo monto reclamado no exceda de cincuenta mil UDI, se sujetarán a lo siguiente:
                </p>
                <p>
                  Cuando el “ACREDITADO” no esté de acuerdo con alguno de los movimientos que aparezcan en el estado de cuenta respectivo o en los medios electrónicos, ópticos o de cualquier otra tecnología que se hubieren pactado, podrá presentar una solicitud de aclaración dentro del plazo de noventa días naturales contados a partir de la fecha de corte o, en su caso, de la realización de la operación o del servicio.
                </p>
                <p>
                  La solicitud respectiva podrá presentarse ante la Oficina en la que radica el CRÉDITO, o bien, en la UNE de la “ENTIDAD FINANCIERA”, mediante escrito o correo electrónico por el que se pueda comprobar fehacientemente su recepción. En todos los casos, la “ENTIDAD FINANCIERA” estará obligada a acusar recibo de dicha solicitud.
                </p>
                <p>
                  Tratándose de cantidades a cargo del ACREDITADO dispuestas mediante cualquier mecanismo determinado al efecto por la CONDUSEF en disposiciones de carácter general, el ACREDITADO tendrá el derecho de no realizar el pago cuya aclaración solicita, así como el de cualquier otra cantidad relacionada con dicho pago, hasta en tanto se resuelva la aclaración conforme al procedimiento a que se refiere éste apartado.
                </p>
                <p>
                  Una vez recibida la solicitud de aclaración, la “ENTIDAD FINANCIERA” tendrá un plazo máximo de 45 (cuarenta y cinco) días para entregar al “ACREDITADO” el dictamen correspondiente, anexando copia simple del documento o evidencia considerada para la emisión de dicho dictamen, con base en la información que, conforme a las disposiciones aplicables, deba obrar en su poder, así como un informe detallado en el que se respondan todos los hechos contenidos en la solicitud presentada por la “ENTIDAD FINANCIERA”. En el caso de reclamaciones relativas a operaciones realizadas en el extranjero, el plazo previsto en este párrafo será hasta de ciento ochenta días naturales.
                </p>
                <p>
                  El dictamen e informe antes citados deberán formularse por escrito y suscribirse por personal de la “ENTIDAD FINANCIERA” facultado para ello. En el evento de que, conforme al dictamen que emita la “ENTIDAD FINANCIERA”, resulte procedente el cobro del monto respectivo, el “ACREDITADO” deberá hacer el pago de la cantidad a su cargo, incluyendo los intereses ordinarios conforme a lo pactado, sin que proceda el cobro de intereses moratorios y otros accesorios generados por la suspensión del pago realizado.
                </p>
                <p>
                  Dentro del plazo de los 45 (cuarenta y cinco) días naturales contado a partir de la entrega del dictamen, la “ENTIDAD FINANCIERA” estará obligada a poner a disposición del “ACREDITADO” en la Oficina en la que radica el CRÉDITO, o bien, en la UNE, el expediente generado con motivo de la solicitud, así como a integrar en éste, bajo su más estricta responsabilidad, toda la documentación e información que, conforme a las disposiciones aplicables, deba obrar en su poder y que se relacione directamente con la solicitud de aclaración que corresponda y sin incluir datos correspondientes a operaciones relacionadas con terceras personas.
                </p>
                <p>
                  En caso de que la “ENTIDAD FINANCIERA” no diere respuesta oportuna a la solicitud del “ACREDITADO” o no le entregare el dictamen e informe detallado, así como la documentación o evidencia antes referidos, la CONDUSEF, impondrá multa en los términos de la Ley para la Transparencia y Ordenamiento de los Servicios Financieros.
                </p>
                <p>
                  Hasta en tanto la solicitud de aclaración de que se trate no quede resuelta de conformidad con el procedimiento señalado, la “ENTIDAD FINANCIERA” no podrá reportar como vencidas las cantidades sujetas a dicha aclaración a las Sociedades de Información Crediticia.
                </p>
                <p>
                  Lo antes señalado es sin perjuicio del derecho del “ACREDITADO” de acudir ante la CONDUSEF, mediante su Centro de Atención Telefónica, al teléfono 55 53 400 999 o al 800-999-80-80, o acceder a la página oficial de dicha dependencia, en la dirección de internet http://www.condusef.gob.mx/, o enviar su mensaje a la dirección de correo electrónico asesoria@condusef.gob.mx, o ante la autoridad jurisdiccional correspondiente conforme a las disposiciones legales aplicables, así como de las sanciones que deban imponerse a la “ENTIDAD FINANCIERA”
                </p>

                <div className="text-center text-[10px] text-slate-500 pt-2">5 de 9</div>
              </div>

              {/* Hoja 6 de 9 (Página 11) */}
              <div className="contrato-hoja bg-white p-8 sm:p-14 rounded-xl shadow-2xl border border-slate-200 text-slate-900 text-xs sm:text-[12px] leading-relaxed text-justify space-y-3">
                <div className="text-right text-[11px] font-bold text-slate-700">
                  Número de RECA: {recaNumero}
                </div>

                <p>
                  por incumplimiento en la presente Cláusula. No obstante, el procedimiento citado líneas arriba quedará sin efectos a partir de que el “ACREDITADO” presente demanda ante autoridad jurisdiccional o conduzca su reclamación en términos de la Ley de Protección y Defensa al Usuario de Servicios Financieros.
                </p>

                <p className="pt-2">
                  <span className="font-bold">DÉCIMA SEXTA. CANCELACIÓN Y TERMINACIÓN DEL CONTRATO.</span> El presente contrato podrá ser terminado y/o cancelado bajo las siguientes hipótesis:
                </p>
                <p>
                  <span className="font-bold">Primera:</span> Cuando el ACREDITADO solicite su cancelación dentro de los diez días hábiles posteriores a la firma del contrato, con excepción de los créditos con garantía hipotecaria, en cuyo caso, la ENTIDAD FINANCIERA no podrá cobrar Comisión alguna, regresando las cosas al estado en el que se encontraban antes de su firma, sin responsabilidad alguna para el ACREDITADO. Lo anterior, siempre y cuando el ACREDITADO no haya utilizado u operado los productos o servicios financieros contratados, o dispuesto del crédito otorgado, de forma total o parcial;
                </p>
                <p>
                  <span className="font-bold">Segunda:</span> Que el crédito se haya pagado de manera total y cubierto todas y cada una de las obligaciones por parte del ACREDITADO y/o por el vencimiento anticipado del mismo, en caso de incumplimiento.
                </p>
                <p>
                  <span className="font-bold">Tercero:</span> EL ACREDITADO podrá solicitar por escrito con firma autógrafa, en cualquier sucursal u oficina de la ENTIDAD FINANCIERA, o mediante correo electrónico enviado a la dirección señalada en el procedimiento para solicitar aclaraciones y reclamaciones, la terminación anticipada del Contrato, así mismo la ENTIDAD FINANCIERA podrá utilizar un mecanismo de verificación de identidad. La ENTIDAD FINANCIERA deberá proporcionar al ACREDITADO acuse de recibo y clave de confirmación o número de folio, así como cerciorarse de la autenticidad y veracidad de la identidad del ACREDITADO, confirmando sus datos personalmente, o por vía telefónica.
                </p>
                <p>
                  Una vez realizado lo anterior, la ENTIDAD FINANCIERA deberá Cancelar los Medios de Disposición vinculados al Contrato en la fecha de presentación de la solicitud y rechazar cualquier disposición que pretenda efectuarse con posterioridad a la cancelación de los Medios de Disposición, y cancelar, sin su responsabilidad, el cobro de algún producto o servicio asociado, así como de los servicios de domiciliación en la fecha de la solicitud de terminación.
                </p>
                <p>
                  LA ENTIDAD FINANCIERA deberá abstenerse de condicionar la terminación del Contrato a cualquier otro acto no previsto en el contrato respectivo y abstenerse de cobrar a EL ACREDITADO Comisión o penalización por la terminación del mismo.
                </p>
                <p>
                  Tratándose de la contratación de un producto o servicio adicional y necesariamente vinculado al principal, es decir, que no pueda subsistir sin éste, en el momento en que se dé por terminado el contrato principal, deberán también de darse por terminados los productos o servicios adicionales. En el caso de que exista más de un producto o servicio ofertado en conjunto en beneficio del ACREDITADO, relacionado entre sí, en caso de que puedan subsistir de forma independiente, al momento de cancelar alguno se podrán modificar las condiciones de los que subsistan, informando de esta situación al ACREDITADO.
                </p>
                <p>
                  LA ENTIDAD FINANCIERA deberá dar por terminado el Contrato a más tardar el día hábil siguiente a aquél en que reciba la solicitud si no existen adeudos. De lo contrario, la ENTIDAD FINANCIERA, comunicará a EL ACREDITADO, a más tardar el día hábil siguiente al de la recepción de la solicitud, el importe de los adeudos y dentro de los cinco días hábiles siguientes al de la recepción de la solicitud pondrá a su disposición dicho dato a determinada fecha, en la sucursal elegida por EL ACREDITADO, y una vez liquidados los adeudos se dará por terminado el Contrato.
                </p>
                <p>
                  LA ENTIDAD FINANCIERA deberá entregar a EL ACREDITADO el saldo a favor, en su caso, en la fecha en que se dé por terminada la operación o al no haber acudido EL ACREDITADO a la sucursal u oficina de LA ENTIDAD FINANCIERA, informarle que se encuentra a su disposición y determinarle la forma cómo le puede ser devuelto;
                </p>
                <p>
                  LA ENTIDAD FINANCIERA deberá entregar o mantener a disposición de EL ACREDITADO, el estado de cuenta o documento en el que conste el fin de la relación contractual y la inexistencia de adeudos derivados exclusivamente de dicha relación, dentro de diez días hábiles a partir de que se hubiera realizado el pago de los adeudos o en la siguiente fecha de corte, y reportar a las sociedades de información crediticia que la cuenta está cerrada sin adeudo alguno dentro del plazo que para tales efectos señala la Ley para Regular las Sociedades de Información Crediticia, dentro de los siguientes 5-cinco días hábiles de efectuado el pago.
                </p>

                <div className="text-center text-[10px] text-slate-500 pt-2">6 de 9</div>
              </div>

              {/* Hoja 7 de 9 (Página 12) */}
              <div className="contrato-hoja bg-white p-8 sm:p-14 rounded-xl shadow-2xl border border-slate-200 text-slate-900 text-xs sm:text-[12px] leading-relaxed text-justify space-y-3">
                <div className="text-right text-[11px] font-bold text-slate-700">
                  Número de RECA: {recaNumero}
                </div>

                <p>
                  LA ENTIDAD FINANCIERA deberá entregar o mantener a disposición de EL ACREDITADO, el estado de cuenta o documento en el que conste el fin de la relación contractual y la inexistencia de adeudos derivados exclusivamente de dicha relación, dentro de diez días hábiles a partir de que se hubiera realizado el pago de los adeudos o en la siguiente fecha de corte, y reportar a las sociedades de información crediticia que la cuenta está cerrada sin adeudo alguno dentro del plazo que para tales efectos señala la Ley para Regular las Sociedades de Información Crediticia, dentro de los siguientes 5-cinco días hábiles de efectuado el pago.
                </p>
                <p>
                  En caso de que EL ACREDITADO no solicite a LA ENTIDAD FINANCIERA la terminación anticipada del contrato y realice el pago de la totalidad del crédito otorgado, y no existan adeudos, la Entidad Financiera deberá entregar o mantener a disposición de EL ACREDITADO, el estado de cuenta o documento en el que conste el fin de la relación contractual y la inexistencia de adeudos derivados exclusivamente de dicha relación, dentro de los diez días hábiles a partir de que se hubiera realizado el pago de los adeudos o en la siguiente fecha de corte.
                </p>
                <p>
                  EL ACREDITADO tendrá la facultad de dar por terminado el contrato, por conducto de otra Entidad Financiera, la cual liquidará el adeudo de EL ACREDITADO, convirtiéndose en acreedora de la misma, y llevará a cabo los trámites respectivos, bajo su responsabilidad y sin cobro de Comisión alguna por tales gestiones.
                </p>

                <p className="pt-2">
                  <span className="font-bold">DÉCIMA SÉPTIMA. DISPOSICIONES LEGALES.</span> EL ACREDITADO se da por enterado de que puede consultar el anexo que contiene las transcripciones de los preceptos legales a que se ha hecho referencia en el presente contrato, en el Registro de Contratos de Adhesión en el sitio oficial de CONDUSEF, en la dirección https://phpapps.condusef.gob.mx/reca/_index.php, lo anterior con independencia de que tal anexo se encuentra a su disposición, en el domicilio de las oficinas de la “ENTIDAD FINANCIERA”.
                </p>

                <p className="pt-2">
                  <span className="font-bold">DÉCIMA OCTAVA. MERCADEO.</span> Mediante la firma del formato de autorización respectivo, en su caso, el ACREDITADO otorga el consentimiento a La “ENTIDAD FINANCIERA” para que utilice sus datos con fines mercadotécnicos y publicitarios.
                </p>

                <p className="pt-2">
                  <span className="font-bold">DÉCIMA NOVENA. ESTADOS DE CUENTA.</span> “LA ENTIDAD FINANCIERA” enviará mensualmente al ACREDITADO, al domicilio que designe, su Estado de Cuenta dentro de los primeros 10 (diez) días naturales siguientes a la FECHA DE CORTE, EL ACREDITADO podrá solicitar que en sustitución de la obligación anterior, se le envíe el Estado de cuenta de manera electrónica, a la cuenta de correo que para estos efectos indique, debiendo contar con el consentimiento expreso del ACREDITADO, sin perjuicio del derecho del ACREDITADO de que en cualquier momento podrá solicitar que se envíe a su domicilio, y “LA ENTIDAD FINANCIERA” tendrá la obligación de hacerlo. Así mismo, EL “ACREDITADO” podrá obtener de manera gratuita una vez al mes el Estado de Cuenta en el domicilio de “LA ENTIDAD FINANCIERA”.
                </p>

                <p className="pt-2">
                  <span className="font-bold">VIGÉSIMA. AVISO DE PRIVACIDAD.</span> En cumplimiento a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, “LA ENTIDAD FINANCIERA” protege los datos personales de sus “ACREDITADOS”, proveedores, empleados y cualquier otra persona física o moral que entregue sus datos, los cuales los salvaguarda con la finalidad de evitar el daño, pérdida, destrucción, robo, extravío, alteración o el tratamiento no autorizado de los mismos. Aviso de Privacidad que podrá consultar directamente en el tablero informativo que se encuentra en la Oficina de la “ENTIDAD FINANCIERA”.
                </p>

                <p className="pt-2">
                  <span className="font-bold">VIGÉSIMA PRIMERA. ENTREGA CONTRATO Y ANEXOS.</span> La “ENTIDAD FINANCIERA” entrega en este acto al “ACREDITADO”, un ejemplar del contrato y de sus anexos que forman parte del mismo, así como de la CARÁTULA del contrato, la cual forma parte integrante del contrato.
                </p>

                <p className="font-bold pt-4">
                  ENTERADOS DEL CONTENIDO Y ALCANCE DEL PRESENTE CONTRATO, LAS “PARTES” LO FIRMAN AL CALCE PARA CONSTANCIA EN LA CIUDAD SALTILLO, COAHUILA {fechas.fechaProemio}.
                </p>

                <div className="text-center text-[10px] text-slate-500 pt-2">7 de 9</div>
              </div>
            </>
          )}

          {/* ======================================================== */}
          {/* PÁGINA 13: HOJA DE FIRMAS (8 DE 9)                       */}
          {/* ======================================================== */}
          {(viewFilter === 'todo' || viewFilter === 'firmas') && (
            <div className="contrato-hoja bg-white p-8 sm:p-14 rounded-xl shadow-2xl border border-slate-200 text-slate-900 text-xs sm:text-[13px] leading-relaxed text-center space-y-12">
              <div className="text-right text-[11px] font-bold text-slate-700">
                Número de RECA: {recaNumero}
              </div>

              <div className="grid grid-cols-2 gap-8 pt-12">
                <div>
                  <span className="font-bold block text-xs mb-16">LA &quot;ENTIDAD FINANCIERA&quot;</span>
                  <div className="w-64 mx-auto border-b border-slate-900 pb-1 font-bold text-xs">
                    SOLUREGIO, S.A.P.I. DE C.V., SOFOM, ENR
                  </div>
                  <span className="text-[11px] text-slate-600 block mt-1">Por su apoderado legal</span>
                </div>

                <div>
                  <span className="font-bold block text-xs mb-16">El &quot;Acreditado&quot;</span>
                  <div className="w-64 mx-auto border-b border-slate-900 pb-1 font-extrabold text-xs">
                    {nombreDistribuidor}
                  </div>
                  <span className="text-[11px] text-slate-600 block mt-1">Por su propio derecho</span>
                </div>
              </div>

              <div className="pt-16">
                <span className="font-bold block text-xs mb-16">El &quot;OBLIGADO SOLIDARIO&quot;</span>
                <div className="w-64 mx-auto border-b border-slate-900 pb-1 font-bold text-xs">
                  NO APLICA
                </div>
                <span className="text-[11px] text-slate-600 block mt-1">Por su propio derecho</span>
              </div>

              <div className="pt-8 text-center text-[11px] text-slate-600 max-w-lg mx-auto italic">
                * En caso de incumplimiento por parte del obligado principal, el obligado solidario y Aval responderá como obligado principal por el total del pago frente a la Entidad Financiera.
              </div>

              <div className="text-center text-[10px] text-slate-500 pt-12">8 de 9</div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PÁGINA 14: SECCIÓN ESPECIAL (9 DE 9) - AUTORIZACIÓN BURÓ */}
          {/* ======================================================== */}
          {(viewFilter === 'todo' || viewFilter === 'autorizacion') && (
            <div className="contrato-hoja bg-white p-8 sm:p-14 rounded-xl shadow-2xl border border-slate-200 text-slate-900 text-xs sm:text-[13px] leading-relaxed text-justify space-y-6">
              <div className="text-right text-[11px] font-bold text-slate-700">
                Número de RECA: {recaNumero}
              </div>

              <div className="text-center space-y-1">
                <h3 className="font-extrabold text-sm tracking-wider uppercase">SECCIÓN ESPECIAL</h3>
                <h4 className="font-bold text-xs text-slate-700 tracking-wide uppercase">
                  AUTORIZACIÓN DE EL ACREDITADO PARA INTERCAMBIO DE INFORMACIÓN
                </h4>
              </div>

              <p className="pt-4">
                EL ACREDITADO <span className="font-bold underline">____ SI AUTORIZA</span> o <span className="font-bold underline">____ NO AUTORIZA</span> para que su información pueda ser utilizada por LA ENTIDAD FINANCIERA con fines mercadotécnicos y/o publicitarios, por lo que podrá recibir en su domicilio particular y/o laboral, correo electrónico personal y/o laboral, teléfono fijo particular y/o laboral, teléfono móvil particular y/o laboral o, por cualquier otro medio, publicidad de los bienes, productos y/o servicios financieros que ofrezca LA ENTIDAD FINANCIERA. El ofrecimiento de los bienes, productos y/o servicios financieros será realizado por el “Acreedor” a través de publicidad, promoción o telemarketing;
              </p>

              <p>
                No obstante lo anterior, EL ACREDITADO podrá en cualquier momento solicitar su inscripción en el registro de usuarios que no deseen que su información sea utilizada para dichos fines, excepto el de las Sociedades de Información Crediticia donde se aprecien los créditos adicionales de EL ACREDITADO.
              </p>

              <div className="text-center pt-16 font-bold text-xs uppercase tracking-wide">
                SALTILLO, COAHUILA, A {fechas.diaNum} DE {fechas.mesNom} DE {fechas.anio}
              </div>

              <div className="text-center pt-12">
                <span className="font-extrabold text-xs uppercase tracking-wider block mb-16">
                  AUTORIZO:
                </span>
                <div className="w-80 mx-auto border-b border-slate-900 pb-1 font-extrabold text-xs">
                  {nombreDistribuidor}
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-500 pt-20">9 de 9</div>
            </div>
          )}

        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
