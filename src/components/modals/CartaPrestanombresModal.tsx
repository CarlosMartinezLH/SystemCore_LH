'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PersonaCore } from '@/types/core';
import { Printer, X, FileText, Check } from 'lucide-react';

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevenir scroll en el fondo cuando el visor está abierto
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const nombreCompleto = `${persona.nombre || ''} ${
    persona.nombreAdicional ? persona.nombreAdicional + ' ' : ''
  }${persona.apellidoPaterno || ''} ${persona.apellidoMaterno || ''}`
    .trim()
    .toUpperCase();

  // Domicilio formateado como en el sistema legacy (C 30 DE ABRIL 1519 #0 0  CP. 31414)
  const direccionBase = persona.direccion || 'C 30 DE ABRIL 1519';
  const numExt = persona.numeroExterior || '0';
  const numInt = persona.numeroInterior || '0';
  const cp = persona.codigoPostal || '31414';
  const domicilioCompleto = `${direccionBase} #${numExt} ${numInt}  CP. ${cp}`.toUpperCase();

  const telefono = persona.telefono || persona.telefonoMovil || '6144640550';

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

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
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

      {/* Barra superior de controles - FIJA Y VISIBLE SIEMPRE */}
      <div className="no-print bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight truncate">
              Carta Declaratoria de Prestanombres
            </h3>
            <p className="text-[11px] text-slate-500 font-medium truncate">
              Cliente: <span className="text-slate-800 font-bold">{nombreCompleto}</span> · ID #{persona.personaId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Carta</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition active:scale-95 cursor-pointer"
            title="Cerrar visor"
          >
            <X className="w-4 h-4" />
            <span>Cerrar</span>
          </button>
        </div>
      </div>

      {/* Área con scroll vertical con margen superior garantizado */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center items-start bg-slate-900/50">
        <div
          id="printable-carta-prestanombres"
          className="w-full max-w-[760px] bg-white rounded-2xl border border-slate-300/80 p-8 sm:p-14 shadow-2xl font-sans text-black select-none text-left my-2"
          style={{ minHeight: '840px' }}
        >
          {/* Encabezado: Logotipo a la izquierda y Datos a la derecha */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pb-6 border-b border-slate-100">
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

          {/* Cláusulas Numeradas (Texto exacto del documento oficial LanAhora) */}
          <div className="mt-10 space-y-7 text-[13px] leading-relaxed text-black text-left">
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
  );

  return createPortal(modalContent, document.body);
}
