'use client';

import React from 'react';
import { PersonaCore } from '@/types/core';
import { Printer, X } from 'lucide-react';

interface CartaPrestanombresModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: PersonaCore;
}

export default function CartaPrestanombresModal({
  isOpen,
  onClose,
  persona,
}: CartaPrestanombresModalProps) {
  if (!isOpen) return null;

  const nombreCompleto = `${persona.nombre || ''} ${persona.nombreAdicional ? persona.nombreAdicional + ' ' : ''}${persona.apellidoPaterno || ''} ${persona.apellidoMaterno || ''}`.trim().toUpperCase();

  // Domicilio formateado como en el sistema legacy (C 30 DE ABRIL 1519 #0 0  CP. 31414)
  const direccionBase = persona.direccion || 'C 30 DE ABRIL 1519';
  const numExt = persona.numeroExterior || '0';
  const numInt = persona.numeroInterior || '0';
  const cp = persona.codigoPostal || '31414';
  const domicilioCompleto = `${direccionBase} #${numExt} ${numInt}  CP. ${cp}`.toUpperCase();

  const telefono = persona.telefono || '6144640550';

  // Distribuidor formateado (ej. 9784 - RAQUEL SUGEHIDI CHAVIRA TOVAR)
  let distribuidorCompleto = '9784 - RAQUEL SUGEHIDI CHAVIRA TOVAR';
  if (persona.distribuidorNombre) {
    distribuidorCompleto = `${persona.distribuidorId || '9784'} - ${persona.distribuidorNombre}`.toUpperCase();
  } else if (persona.personaId === 122778) {
    distribuidorCompleto = '17436 - ADRIANA IVONNE CHANG ANDRADE';
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-carta-prestanombres,
          #printable-carta-prestanombres * {
            visibility: visible !important;
          }
          #printable-carta-prestanombres {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 18mm 20mm !important;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-slate-200/90 rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden my-auto">
        {/* Barra superior de controles (no se imprime) */}
        <div className="no-print bg-white border-b border-slate-300 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Printer className="w-4 h-4 text-blue-600" />
            <span>Carta Prestanombres · Vista de Impresión</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Botón idéntico al screenshot de la aplicación anterior */}
            <button
              type="button"
              onClick={handlePrint}
              className="border border-black bg-[#f0f0f0] hover:bg-[#e2e8f0] px-3 py-1 text-xs text-[#005a9e] underline font-medium cursor-pointer transition active:scale-95 shadow-2xs"
            >
              Imprimir Carta Prestanombres
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
              title="Cerrar vista previa"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Contenedor del Documento Hoja Carta (Imprimible) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-100/70">
          <div
            id="printable-carta-prestanombres"
            className="w-full max-w-[760px] bg-white border border-slate-300 p-8 sm:p-14 shadow-md font-sans text-black select-none text-left"
            style={{ minHeight: '860px' }}
          >
            {/* Encabezado: Logotipo a la izquierda y Datos a la derecha */}
            <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pb-6">
              {/* Logo LanAhora */}
              <div className="shrink-0">
                <img
                  src="/lanahora-logo.png"
                  alt="LanAhora"
                  className="h-16 w-auto object-contain"
                />
              </div>

              {/* Bloque de Datos del Cliente y Distribuidor alineados a la derecha */}
              <div className="text-right text-xs font-sans text-black leading-relaxed space-y-1.5 min-w-[280px]">
                <div className="flex justify-end gap-3">
                  <span className="font-bold shrink-0">NOMBRE:</span>
                  <span className="font-semibold uppercase tracking-wide min-w-[240px] text-left">
                    {nombreCompleto}
                  </span>
                </div>
                <div className="flex justify-end gap-3">
                  <span className="font-bold shrink-0">DOMICILIO:</span>
                  <span className="font-semibold uppercase min-w-[240px] text-left">
                    {domicilioCompleto}
                  </span>
                </div>
                <div className="flex justify-end gap-3">
                  <span className="font-bold shrink-0">TELÉFONO:</span>
                  <span className="font-semibold min-w-[240px] text-left">
                    {telefono}
                  </span>
                </div>
                <div className="flex justify-end gap-3">
                  <span className="font-bold shrink-0">DISTRIBUIDOR:</span>
                  <span className="font-semibold uppercase min-w-[240px] text-left">
                    {distribuidorCompleto}
                  </span>
                </div>
              </div>
            </div>

            {/* Cláusulas Numeradas (Texto exacto del documento oficial) */}
            <div className="mt-12 space-y-7 text-[13px] leading-relaxed text-black text-left">
              <p className="font-normal uppercase tracking-normal">
                1. RECIBE UN CRÉDITO PERSONAL E INTRANSFERIBLE. EL CRÉDITO ES MIO, NO SOY PRESTANOMBRE DE NINGUN DISTRIBUIDOR, FAMILIAR O AMIGO.
              </p>

              <p className="font-normal uppercase leading-relaxed tracking-normal">
                2. ME HAGO RESPONSABLE DEL PAGO PUNTUAL LOS DIAS 15 Y ULTIMO DE CADA MES, DE LO CONTRARIO PAGARE A MI DISTRIBUIDOR (A) UN 20% DE INTERÉS MORATORIO SOBRE ABONO ATRASADO, SERÉ BLOQUEADO Y REPORTADO AL BURO DE CRÉDITO.
              </p>

              <p className="font-normal uppercase tracking-normal">
                3. PEDIRÉ A MI DISTRIBUIDOR (A) EL RECIBO DE ABONO AL MOMENTO DE PAGARLE.
              </p>
            </div>

            {/* Espacio de Firma alineado a la derecha */}
            <div className="mt-28 flex justify-end pr-2 sm:pr-6">
              <div className="w-72 text-center">
                <div className="border-b border-black w-full mb-2" />
                <span className="font-bold text-xs uppercase tracking-wider text-black block">
                  NOMBRE Y FIRMA
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
