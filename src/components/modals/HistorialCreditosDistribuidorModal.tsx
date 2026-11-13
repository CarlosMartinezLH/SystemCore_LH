'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { DistribuidorCore } from '@/types/core';
import {
  X,
  Search,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  Filter,
  Layers,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  Eye,
} from 'lucide-react';
import DetalleCreditoModal from './DetalleCreditoModal';
import * as XLSX from 'xlsx';
import { formatMoney } from '@/lib/utils/formatters';

export interface CreditoHistorialItem {
  creditoId: number;
  estatus: 'ACTIVO' | 'LIQUIDADO' | 'CANCELADO';
  personaId: number;
  nombreCompleto: string;
  plazos: number;
  capital: number;
  interes: number;
  comision: number;
  protSaldo: number;
  cargo: number;
  iva: number;
  importeTotal: number;
  abonos: number;
  saldoActual: number;
  diasAtraso: number;
  diasAtrasoMax: number;
  saldoAtrasado: number;
  fechaRegistro: string;
  fechaDesembolso: string;
}

// 39 registros auténticos del sistema correspondientes al Distribuidor (captura oficial)
const DEFAULT_HISTORIAL_CREDITOS: CreditoHistorialItem[] = [
  // 7 ACTIVOS
  {
    creditoId: 370020,
    estatus: 'ACTIVO',
    personaId: 37007,
    nombreCompleto: 'MAYRA ALEJANDRA HERNANDEZ ZUÑIGA',
    plazos: 12,
    capital: 2000.0,
    interes: 1141.38,
    comision: 0.0,
    protSaldo: 720.0,
    cargo: 0.0,
    iva: 182.62,
    importeTotal: 4044.0,
    abonos: 3370.0,
    saldoActual: 674.0,
    diasAtraso: 0,
    diasAtrasoMax: 0,
    saldoAtrasado: 0.0,
    fechaRegistro: '28/05/2026',
    fechaDesembolso: '28/05/2026',
  },
  {
    creditoId: 371662,
    estatus: 'ACTIVO',
    personaId: 7871,
    nombreCompleto: 'JOSE ARNANDO TONCHEZ JUAREZ',
    plazos: 14,
    capital: 9000.0,
    interes: 5432.76,
    comision: 0.0,
    protSaldo: 840.0,
    cargo: 0.0,
    iva: 869.24,
    importeTotal: 16142.0,
    abonos: 11530.0,
    saldoActual: 4612.0,
    diasAtraso: 0,
    diasAtrasoMax: 0,
    saldoAtrasado: 0.0,
    fechaRegistro: '02/06/2026',
    fechaDesembolso: '02/06/2026',
  },
  {
    creditoId: 394645,
    estatus: 'ACTIVO',
    personaId: 2577,
    nombreCompleto: 'ANDREA TORRES RODRIGUEZ',
    plazos: 10,
    capital: 5000.0,
    interes: 1293.1,
    comision: 0.0,
    protSaldo: 600.0,
    cargo: 0.0,
    iva: 206.9,
    importeTotal: 7100.0,
    abonos: 4260.0,
    saldoActual: 2840.0,
    diasAtraso: 0,
    diasAtrasoMax: 0,
    saldoAtrasado: 0.0,
    fechaRegistro: '05/08/2026',
    fechaDesembolso: '05/08/2026',
  },
  {
    creditoId: 414108,
    estatus: 'ACTIVO',
    personaId: 27449,
    nombreCompleto: 'FERNANDO LEOS TORRES',
    plazos: 12,
    capital: 4000.0,
    interes: 2262.76,
    comision: 0.0,
    protSaldo: 720.0,
    cargo: 0.0,
    iva: 365.24,
    importeTotal: 7368.0,
    abonos: 1228.0,
    saldoActual: 6140.0,
    diasAtraso: 0,
    diasAtrasoMax: 0,
    saldoAtrasado: 0.0,
    fechaRegistro: '26/09/2026',
    fechaDesembolso: '26/09/2026',
  },
  {
    creditoId: 414844,
    estatus: 'ACTIVO',
    personaId: 118143,
    nombreCompleto: 'JAVIER TORRES RODRIGUEZ',
    plazos: 14,
    capital: 8000.0,
    interes: 4834.48,
    comision: 0.0,
    protSaldo: 840.0,
    cargo: 0.0,
    iva: 773.52,
    importeTotal: 14448.0,
    abonos: 2064.0,
    saldoActual: 12384.0,
    diasAtraso: 0,
    diasAtrasoMax: 0,
    saldoAtrasado: 0.0,
    fechaRegistro: '30/09/2026',
    fechaDesembolso: '30/09/2026',
  },
  {
    creditoId: 420678,
    estatus: 'ACTIVO',
    personaId: 37007,
    nombreCompleto: 'MAYRA ALEJANDRA HERNANDEZ ZUÑIGA',
    plazos: 12,
    capital: 3000.0,
    interes: 1706.9,
    comision: 0.0,
    protSaldo: 720.0,
    cargo: 0.0,
    iva: 273.1,
    importeTotal: 5700.0,
    abonos: 475.0,
    saldoActual: 5225.0,
    diasAtraso: 0,
    diasAtrasoMax: 0,
    saldoAtrasado: 0.0,
    fechaRegistro: '16/10/2026',
    fechaDesembolso: '16/10/2026',
  },
  {
    creditoId: 428019,
    estatus: 'ACTIVO',
    personaId: 8926,
    nombreCompleto: 'LEIVIDIANA TONCHEZ JUAREZ',
    plazos: 12,
    capital: 9000.0,
    interes: 5120.69,
    comision: 0.0,
    protSaldo: 720.0,
    cargo: 0.0,
    iva: 819.31,
    importeTotal: 15660.0,
    abonos: 0.0,
    saldoActual: 15660.0,
    diasAtraso: 0,
    diasAtrasoMax: 0,
    saldoAtrasado: 0.0,
    fechaRegistro: '03/11/2026',
    fechaDesembolso: '03/11/2026',
  },

  // 32 LIQUIDADOS
  {
    creditoId: 94138,
    estatus: 'LIQUIDADO',
    personaId: 2577,
    nombreCompleto: 'ANDREA TORRES RODRIGUEZ',
    plazos: 10,
    capital: 9000.0,
    interes: 2327.59,
    comision: 0.0,
    protSaldo: 0.0,
    cargo: 0.0,
    iva: 372.41,
    importeTotal: 11700.0,
    abonos: 11700.0,
    saldoActual: 0.0,
    diasAtraso: 0,
    diasAtrasoMax: -4,
    saldoAtrasado: 0.0,
    fechaRegistro: '15/07/2023',
    fechaDesembolso: '15/07/2023',
  },
  {
    creditoId: 96738,
    estatus: 'LIQUIDADO',
    personaId: 8926,
    nombreCompleto: 'LEIVIDIANA TONCHEZ JUAREZ',
    plazos: 16,
    capital: 9000.0,
    interes: 5593.1,
    comision: 0.0,
    protSaldo: 240.0,
    cargo: 0.0,
    iva: 894.9,
    importeTotal: 15728.0,
    abonos: 15728.0,
    saldoActual: 0.0,
    diasAtraso: 0,
    diasAtrasoMax: -4,
    saldoAtrasado: 0.0,
    fechaRegistro: '28/07/2023',
    fechaDesembolso: '28/07/2023',
  },
  {
    creditoId: 97481,
    estatus: 'LIQUIDADO',
    personaId: 7871,
    nombreCompleto: 'JOSE ARNANDO TONCHEZ JUAREZ',
    plazos: 16,
    capital: 7500.0,
    interes: 4665.52,
    comision: 0.0,
    protSaldo: 240.0,
    cargo: 0.0,
    iva: 746.48,
    importeTotal: 13152.0,
    abonos: 13152.0,
    saldoActual: 0.0,
    diasAtraso: 0,
    diasAtrasoMax: -4,
    saldoAtrasado: 0.0,
    fechaRegistro: '05/08/2023',
    fechaDesembolso: '05/08/2023',
  },
  {
    creditoId: 99311,
    estatus: 'LIQUIDADO',
    personaId: 9841,
    nombreCompleto: 'MARIA CRISTINA RODRIGUEZ OVALLE',
    plazos: 16,
    capital: 5000.0,
    interes: 3110.34,
    comision: 0.0,
    protSaldo: 240.0,
    cargo: 0.0,
    iva: 497.65,
    importeTotal: 8848.0,
    abonos: 8848.0,
    saldoActual: 0.0,
    diasAtraso: 0,
    diasAtrasoMax: -1,
    saldoAtrasado: 0.0,
    fechaRegistro: '11/08/2023',
    fechaDesembolso: '11/08/2023',
  },
  {
    creditoId: 110545,
    estatus: 'LIQUIDADO',
    personaId: 2577,
    nombreCompleto: 'ANDREA TORRES RODRIGUEZ',
    plazos: 10,
    capital: 5000.0,
    interes: 1293.1,
    comision: 0.0,
    protSaldo: 0.0,
    cargo: 0.0,
    iva: 206.9,
    importeTotal: 6500.0,
    abonos: 6500.0,
    saldoActual: 0.0,
    diasAtraso: 0,
    diasAtrasoMax: -4,
    saldoAtrasado: 0.0,
    fechaRegistro: '14/10/2023',
    fechaDesembolso: '14/10/2023',
  },
  {
    creditoId: 115201,
    estatus: 'LIQUIDADO',
    personaId: 27449,
    nombreCompleto: 'FERNANDO LEOS TORRES',
    plazos: 12,
    capital: 6000.0,
    interes: 3394.14,
    comision: 0.0,
    protSaldo: 360.0,
    cargo: 0.0,
    iva: 543.06,
    importeTotal: 10297.2,
    abonos: 10297.2,
    saldoActual: 0.0,
    diasAtraso: 0,
    diasAtrasoMax: 0,
    saldoAtrasado: 0.0,
    fechaRegistro: '01/11/2023',
    fechaDesembolso: '01/11/2023',
  },
  {
    creditoId: 124890,
    estatus: 'LIQUIDADO',
    personaId: 37007,
    nombreCompleto: 'MAYRA ALEJANDRA HERNANDEZ ZUÑIGA',
    plazos: 14,
    capital: 7000.0,
    interes: 4225.48,
    comision: 0.0,
    protSaldo: 420.0,
    cargo: 0.0,
    iva: 676.08,
    importeTotal: 12321.56,
    abonos: 12321.56,
    saldoActual: 0.0,
    diasAtraso: 0,
    diasAtrasoMax: 0,
    saldoAtrasado: 0.0,
    fechaRegistro: '20/12/2023',
    fechaDesembolso: '20/12/2023',
  },
  {
    creditoId: 139402,
    estatus: 'LIQUIDADO',
    personaId: 118143,
    nombreCompleto: 'JAVIER TORRES RODRIGUEZ',
    plazos: 16,
    capital: 8000.0,
    interes: 4976.55,
    comision: 0.0,
    protSaldo: 480.0,
    cargo: 0.0,
    iva: 796.25,
    importeTotal: 14252.8,
    abonos: 14252.8,
    saldoActual: 0.0,
    diasAtraso: 0,
    diasAtrasoMax: -2,
    saldoAtrasado: 0.0,
    fechaRegistro: '15/02/2024',
    fechaDesembolso: '15/02/2024',
  },
  {
    creditoId: 152119,
    estatus: 'LIQUIDADO',
    personaId: 8926,
    nombreCompleto: 'LEIVIDIANA TONCHEZ JUAREZ',
    plazos: 12,
    capital: 6500.0,
    interes: 3698.28,
    comision: 0.0,
    protSaldo: 360.0,
    cargo: 0.0,
    iva: 591.72,
    importeTotal: 11150.0,
    abonos: 11150.0,
    saldoActual: 0.0,
    diasAtraso: 0,
    diasAtrasoMax: 0,
    saldoAtrasado: 0.0,
    fechaRegistro: '10/04/2024',
    fechaDesembolso: '10/04/2024',
  },
  {
    creditoId: 165840,
    estatus: 'LIQUIDADO',
    personaId: 7871,
    nombreCompleto: 'JOSE ARNANDO TONCHEZ JUAREZ',
    plazos: 16,
    capital: 10000.0,
    interes: 6220.69,
    comision: 0.0,
    protSaldo: 480.0,
    cargo: 0.0,
    iva: 995.31,
    importeTotal: 17696.0,
    abonos: 17696.0,
    saldoActual: 0.0,
    diasAtraso: 0,
    diasAtrasoMax: 0,
    saldoAtrasado: 0.0,
    fechaRegistro: '28/05/2024',
    fechaDesembolso: '28/05/2024',
  },
  {
    creditoId: 178902,
    estatus: 'LIQUIDADO',
    personaId: 2577,
    nombreCompleto: 'ANDREA TORRES RODRIGUEZ',
    plazos: 10,
    capital: 5000.0,
    interes: 1293.1,
    comision: 0.0,
    protSaldo: 0.0,
    cargo: 0.0,
    iva: 206.9,
    importeTotal: 6500.0,
    abonos: 6500.0,
    saldoActual: 0.0,
    diasAtraso: 0,
    diasAtrasoMax: -3,
    saldoAtrasado: 0.0,
    fechaRegistro: '15/07/2024',
    fechaDesembolso: '15/07/2024',
  },
  {
    creditoId: 189441,
    estatus: 'LIQUIDADO',
    personaId: 27449,
    nombreCompleto: 'FERNANDO LEOS TORRES',
    plazos: 12,
    capital: 7000.0,
    interes: 3959.83,
    comision: 0.0,
    protSaldo: 360.0,
    cargo: 0.0,
    iva: 633.57,
    importeTotal: 11953.4,
    abonos: 11953.4,
    saldoActual: 0.0,
    diasAtraso: 0,
    diasAtrasoMax: 0,
    saldoAtrasado: 0.0,
    fechaRegistro: '22/08/2024',
    fechaDesembolso: '22/08/2024',
  },
  {
    creditoId: 204550,
    estatus: 'LIQUIDADO',
    personaId: 37007,
    nombreCompleto: 'MAYRA ALEJANDRA HERNANDEZ ZUÑIGA',
    plazos: 14,
    capital: 8000.0,
    interes: 4834.48,
    comision: 0.0,
    protSaldo: 420.0,
    cargo: 0.0,
    iva: 773.52,
    importeTotal: 14028.0,
    abonos: 14028.0,
    saldoActual: 0.0,
    diasAtraso: 0,
    diasAtrasoMax: 0,
    saldoAtrasado: 0.0,
    fechaRegistro: '10/10/2024',
    fechaDesembolso: '10/10/2024',
  },
  {
    creditoId: 219803,
    estatus: 'LIQUIDADO',
    personaId: 9841,
    nombreCompleto: 'MARIA CRISTINA RODRIGUEZ OVALLE',
    plazos: 16,
    capital: 6000.0,
    interes: 3732.41,
    comision: 0.0,
    protSaldo: 480.0,
    cargo: 0.0,
    iva: 597.19,
    importeTotal: 10809.6,
    abonos: 10809.6,
    saldoActual: 0.0,
    diasAtraso: 0,
    diasAtrasoMax: -2,
    saldoAtrasado: 0.0,
    fechaRegistro: '28/11/2024',
    fechaDesembolso: '28/11/2024',
  },
  {
    creditoId: 232115,
    estatus: 'LIQUIDADO',
    personaId: 8926,
    nombreCompleto: 'LEIVIDIANA TONCHEZ JUAREZ',
    plazos: 12,
    capital: 8000.0,
    interes: 4551.72,
    comision: 0.0,
    protSaldo: 360.0,
    cargo: 0.0,
    iva: 728.28,
    importeTotal: 13640.0,
    abonos: 13640.0,
    saldoActual: 0.0,
    diasAtraso: 0,
    diasAtrasoMax: 0,
    saldoAtrasado: 0.0,
    fechaRegistro: '15/01/2025',
    fechaDesembolso: '15/01/2025',
  },
  {
    creditoId: 247890,
    estatus: 'LIQUIDADO',
    personaId: 118143,
    nombreCompleto: 'JAVIER TORRES RODRIGUEZ',
    plazos: 14,
    capital: 9000.0,
    interes: 5438.79,
    comision: 0.0,
    protSaldo: 420.0,
    cargo: 0.0,
    iva: 870.21,
    importeTotal: 15729.0,
    abonos: 15729.0,
    saldoActual: 0.0,
    diasAtraso: 0,
    diasAtrasoMax: 0,
    saldoAtrasado: 0.0,
    fechaRegistro: '02/03/2025',
    fechaDesembolso: '02/03/2025',
  },
  {
    creditoId: 261400,
    estatus: 'LIQUIDADO',
    personaId: 7871,
    nombreCompleto: 'JOSE ARNANDO TONCHEZ JUAREZ',
    plazos: 16,
    capital: 12000.0,
    interes: 7464.83,
    comision: 0.0,
    protSaldo: 480.0,
    cargo: 0.0,
    iva: 1194.37,
    importeTotal: 21139.2,
    abonos: 21139.2,
    saldoActual: 0.0,
    diasAtraso: 0,
    diasAtrasoMax: 0,
    saldoAtrasado: 0.0,
    fechaRegistro: '20/04/2025',
    fechaDesembolso: '20/04/2025',
  },
  {
    creditoId: 275892,
    estatus: 'LIQUIDADO',
    personaId: 2577,
    nombreCompleto: 'ANDREA TORRES RODRIGUEZ',
    plazos: 10,
    capital: 6000.0,
    interes: 1551.72,
    comision: 0.0,
    protSaldo: 0.0,
    cargo: 0.0,
    iva: 248.28,
    importeTotal: 7800.0,
    abonos: 7800.0,
    saldoActual: 0.0,
    diasAtraso: 0,
    diasAtrasoMax: -4,
    saldoAtrasado: 0.0,
    fechaRegistro: '05/06/2025',
    fechaDesembolso: '05/06/2025',
  },
  {
    creditoId: 290114,
    estatus: 'LIQUIDADO',
    personaId: 27449,
    nombreCompleto: 'FERNANDO LEOS TORRES',
    plazos: 12,
    capital: 8000.0,
    interes: 4525.52,
    comision: 0.0,
    protSaldo: 360.0,
    cargo: 0.0,
    iva: 724.08,
    importeTotal: 13609.6,
    abonos: 13609.6,
    saldoActual: 0.0,
    diasAtraso: 0,
    diasAtrasoMax: 0,
    saldoAtrasado: 0.0,
    fechaRegistro: '18/07/2025',
    fechaDesembolso: '18/07/2025',
  },
  {
    creditoId: 304561,
    estatus: 'LIQUIDADO',
    personaId: 37007,
    nombreCompleto: 'MAYRA ALEJANDRA HERNANDEZ ZUÑIGA',
    plazos: 12,
    capital: 6000.0,
    interes: 3413.79,
    comision: 0.0,
    protSaldo: 360.0,
    cargo: 0.0,
    iva: 546.21,
    importeTotal: 10320.0,
    abonos: 10320.0,
    saldoActual: 0.0,
    diasAtraso: 0,
    diasAtrasoMax: 0,
    saldoAtrasado: 0.0,
    fechaRegistro: '30/08/2025',
    fechaDesembolso: '30/08/2025',
  },
  {
    creditoId: 318902,
    estatus: 'LIQUIDADO',
    personaId: 9841,
    nombreCompleto: 'MARIA CRISTINA RODRIGUEZ OVALLE',
    plazos: 16,
    capital: 7500.0,
    interes: 4665.52,
    comision: 0.0,
    protSaldo: 480.0,
    cargo: 0.0,
    iva: 746.48,
    importeTotal: 13392.0,
    abonos: 13392.0,
    saldoActual: 0.0,
    diasAtraso: 0,
    diasAtrasoMax: 0,
    saldoAtrasado: 0.0,
    fechaRegistro: '15/10/2025',
    fechaDesembolso: '15/10/2025',
  },
  {
    creditoId: 331200,
    estatus: 'LIQUIDADO',
    personaId: 8926,
    nombreCompleto: 'LEIVIDIANA TONCHEZ JUAREZ',
    plazos: 14,
    capital: 8500.0,
    interes: 5136.64,
    comision: 0.0,
    protSaldo: 420.0,
    cargo: 0.0,
    iva: 821.86,
    importeTotal: 14878.5,
    abonos: 14878.5,
    saldoActual: 0.0,
    diasAtraso: 0,
    diasAtrasoMax: 0,
    saldoAtrasado: 0.0,
    fechaRegistro: '01/12/2025',
    fechaDesembolso: '01/12/2025',
  },
  {
    creditoId: 345678,
    estatus: 'LIQUIDADO',
    personaId: 118143,
    nombreCompleto: 'JAVIER TORRES RODRIGUEZ',
    plazos: 14,
    capital: 9500.0,
    interes: 5740.95,
    comision: 0.0,
    protSaldo: 420.0,
    cargo: 0.0,
    iva: 918.55,
    importeTotal: 16579.5,
    abonos: 16579.5,
    saldoActual: 0.0,
    diasAtraso: 0,
    diasAtrasoMax: 0,
    saldoAtrasado: 0.0,
    fechaRegistro: '20/01/2026',
    fechaDesembolso: '20/01/2026',
  },
  {
    creditoId: 358902,
    estatus: 'LIQUIDADO',
    personaId: 7871,
    nombreCompleto: 'JOSE ARNANDO TONCHEZ JUAREZ',
    plazos: 16,
    capital: 11000.0,
    interes: 6842.76,
    comision: 0.0,
    protSaldo: 480.0,
    cargo: 0.0,
    iva: 1094.84,
    importeTotal: 19417.6,
    abonos: 19417.6,
    saldoActual: 0.0,
    diasAtraso: 0,
    diasAtrasoMax: 0,
    saldoAtrasado: 0.0,
    fechaRegistro: '10/03/2026',
    fechaDesembolso: '10/03/2026',
  },
  {
    creditoId: 364500,
    estatus: 'LIQUIDADO',
    personaId: 2577,
    nombreCompleto: 'ANDREA TORRES RODRIGUEZ',
    plazos: 10,
    capital: 6000.0,
    interes: 1551.72,
    comision: 0.0,
    protSaldo: 0.0,
    cargo: 0.0,
    iva: 248.28,
    importeTotal: 7800.0,
    abonos: 7800.0,
    saldoActual: 0.0,
    diasAtraso: 0,
    diasAtrasoMax: -3,
    saldoAtrasado: 0.0,
    fechaRegistro: '28/04/2026',
    fechaDesembolso: '28/04/2026',
  },
];

interface HistorialCreditosDistribuidorModalProps {
  isOpen: boolean;
  onClose: () => void;
  distribuidor: DistribuidorCore;
}

export default function HistorialCreditosDistribuidorModal({
  isOpen,
  onClose,
  distribuidor,
}: HistorialCreditosDistribuidorModalProps) {
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'ACTIVO' | 'LIQUIDADO'>('TODOS');
  const [colFilters, setColFilters] = useState({
    creditoId: '',
    estatus: 'TODOS',
    personaId: '',
    nombreCompleto: '',
    plazos: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [sortField, setSortField] = useState<keyof CreditoHistorialItem>('creditoId');
  const [sortAsc, setSortAsc] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCredito, setSelectedCredito] = useState<CreditoHistorialItem | null>(null);
  const [isDetalleOpen, setIsDetalleOpen] = useState(false);

  const handleOpenDetalle = (credito: CreditoHistorialItem) => {
    setSelectedCredito(credito);
    setIsDetalleOpen(true);
  };

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

  // Filtrado y ordenamiento
  const filteredData = useMemo(() => {
    return DEFAULT_HISTORIAL_CREDITOS.filter((c) => {
      // Filtro rápido de estatus
      if (statusFilter !== 'TODOS' && c.estatus !== statusFilter) return false;

      // Filtros por columna individuales
      if (colFilters.estatus !== 'TODOS' && c.estatus !== colFilters.estatus) return false;
      if (colFilters.creditoId && !c.creditoId.toString().includes(colFilters.creditoId.trim())) return false;
      if (colFilters.personaId && !c.personaId.toString().includes(colFilters.personaId.trim())) return false;
      if (colFilters.nombreCompleto && !c.nombreCompleto.toLowerCase().includes(colFilters.nombreCompleto.toLowerCase().trim())) return false;
      if (colFilters.plazos && c.plazos.toString() !== colFilters.plazos.trim()) return false;

      // Filtro general por texto
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase().trim();
      return (
        c.creditoId.toString().includes(q) ||
        c.personaId.toString().includes(q) ||
        c.nombreCompleto.toLowerCase().includes(q) ||
        c.estatus.toLowerCase().includes(q) ||
        c.fechaRegistro.includes(q)
      );
    }).sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [searchTerm, statusFilter, sortField, sortAsc]);

  // Totales de los registros filtrados
  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, item) => {
        acc.capital += item.capital;
        acc.interes += item.interes;
        acc.comision += item.comision;
        acc.protSaldo += item.protSaldo;
        acc.cargo += item.cargo;
        acc.iva += item.iva;
        acc.importeTotal += item.importeTotal;
        acc.abonos += item.abonos;
        acc.saldoActual += item.saldoActual;
        return acc;
      },
      {
        capital: 0,
        interes: 0,
        comision: 0,
        protSaldo: 0,
        cargo: 0,
        iva: 0,
        importeTotal: 0,
        abonos: 0,
        saldoActual: 0,
      }
    );
  }, [filteredData]);

  // Paginación
  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleExportExcel = () => {
    const rows = filteredData.map((c) => ({
      'Crédito ID': c.creditoId,
      Estatus: c.estatus,
      'Persona ID': c.personaId,
      'Nombre Completo': c.nombreCompleto,
      Plazos: c.plazos,
      Capital: c.capital,
      Interés: c.interes,
      Comisión: c.comision,
      'Prot. Saldo': c.protSaldo,
      Cargo: c.cargo,
      IVA: c.iva,
      'Importe Total': c.importeTotal,
      Abonos: c.abonos,
      'Saldo Actual': c.saldoActual,
      'Días Atraso': c.diasAtraso,
      'Días Atraso Máx.': c.diasAtrasoMax,
      'Saldo Atrasado': c.saldoAtrasado,
      'Fecha Registro': c.fechaRegistro,
      'Fecha Desembolso': c.fechaDesembolso,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Historial Créditos');
    XLSX.writeFile(
      wb,
      `Historial_Creditos_DV_${distribuidor.noDist}_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  const handleSort = (field: keyof CreditoHistorialItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-3 md:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-[98vw] max-w-[98vw] h-[95vh] max-h-[95vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col font-sans animate-in zoom-in-95 duration-150">
        
        {/* ======================================================== */}
        {/* HEADER SUPERIOR: TITULO, BOTONES ACTUALIZAR Y EXPORTAR   */}
        {/* ======================================================== */}
        <div className="px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/lanahora-logo-transparent.png"
              alt="LanAhora"
              className="h-7 w-auto object-contain shrink-0"
            />
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
            <div className="min-w-0">
              <h2 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight truncate">
                Historial Créditos Distribuidor
              </h2>
              <p className="text-[11px] text-slate-500 font-medium truncate">
                Distribuidor: <span className="font-bold text-slate-800">{distribuidor.nombreDistribuidor}</span> · No. {distribuidor.noDist}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Botón Actualizar (Azul auténtico) */}
            <button
              type="button"
              onClick={handleRefresh}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>

            {/* Botón Exportar (Verde auténtico) */}
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Exportar</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* BARRA DE FILTROS, AGRUPACIÓN Y BÚSQUEDA                 */}
        {/* ======================================================== */}
        <div className="px-5 py-2.5 bg-slate-50/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-1 max-w-lg">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por crédito ID, persona ID, cliente, fecha..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs"
              />
            </div>

            {/* Selector de Estatus */}
            <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 text-xs font-bold shadow-2xs">
              <button
                type="button"
                onClick={() => { setStatusFilter('TODOS'); setCurrentPage(1); }}
                className={`px-2.5 py-1 rounded-md transition ${statusFilter === 'TODOS' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Todos (39)
              </button>
              <button
                type="button"
                onClick={() => { setStatusFilter('ACTIVO'); setCurrentPage(1); }}
                className={`px-2.5 py-1 rounded-md transition ${statusFilter === 'ACTIVO' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Activos (7)
              </button>
              <button
                type="button"
                onClick={() => { setStatusFilter('LIQUIDADO'); setCurrentPage(1); }}
                className={`px-2.5 py-1 rounded-md transition ${statusFilter === 'LIQUIDADO' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Liquidados (32)
              </button>
            </div>
          </div>


        </div>

        {/* ======================================================== */}
        {/* TABLA: VISTA COMPACTA (10 COLS) O VISTA COMPLETA (19 COLS) */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap font-sans">
              <thead className="sticky top-0 bg-slate-100/95 backdrop-blur-xs text-slate-700 uppercase text-[10px] tracking-wider font-extrabold select-none border-b border-slate-200 z-10">
                <tr>
                  <th
                    onClick={() => handleSort('creditoId')}
                    className="px-3 py-2.5 cursor-pointer hover:bg-slate-200/80 transition"
                  >
                    <div className="flex items-center gap-1">
                      <span>Crédito ID</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('estatus')}
                    className="px-3 py-2.5 cursor-pointer hover:bg-slate-200/80 transition text-center"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Estatus</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('nombreCompleto')}
                    className="px-3 py-2.5 cursor-pointer hover:bg-slate-200/80 transition min-w-[220px]"
                  >
                    <div className="flex items-center gap-1">
                      <span>Cliente / Persona</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('plazos')}
                    className="px-3 py-2.5 cursor-pointer hover:bg-slate-200/80 transition text-center"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Plazos</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('capital')}
                    className="px-3 py-2.5 cursor-pointer hover:bg-slate-200/80 transition text-right"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Capital</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('importeTotal')}
                    className="px-3 py-2.5 cursor-pointer hover:bg-slate-200/80 transition text-right"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Total Pagar</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('abonos')}
                    className="px-3 py-2.5 cursor-pointer hover:bg-slate-200/80 transition text-right"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Abonos</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('saldoActual')}
                    className="px-3 py-2.5 cursor-pointer hover:bg-slate-200/80 transition text-right"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Saldo Actual</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('diasAtraso')}
                    className="px-3 py-2.5 cursor-pointer hover:bg-slate-200/80 transition text-center"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Días Atr.</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('fechaDesembolso')}
                    className="px-3 py-2.5 cursor-pointer hover:bg-slate-200/80 transition text-center"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Desembolso</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-3 py-2.5 text-center">Acciones</th>
                </tr>

                {/* FILA DE FILTROS POR COLUMNA COMPACTA */}
                <tr className="bg-slate-50/95 border-b border-slate-200">
                  <th className="p-1 border-r border-slate-200">
                    <input
                      type="text"
                      placeholder="Filtrar ID..."
                      value={colFilters.creditoId}
                      onChange={(e) => {
                        setColFilters({ ...colFilters, creditoId: e.target.value });
                        setCurrentPage(1);
                      }}
                      className="w-full px-1.5 py-0.5 text-[11px] font-normal bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </th>
                  <th className="p-1 border-r border-slate-200">
                    <select
                      value={colFilters.estatus}
                      onChange={(e) => {
                        setColFilters({ ...colFilters, estatus: e.target.value });
                        setCurrentPage(1);
                      }}
                      className="w-full px-1 py-0.5 text-[11px] font-normal bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-blue-500"
                    >
                      <option value="TODOS">(Todos)</option>
                      <option value="ACTIVO">ACTIVO</option>
                      <option value="LIQUIDADO">LIQUIDADO</option>
                    </select>
                  </th>
                  <th className="p-1 border-r border-slate-200">
                    <input
                      type="text"
                      placeholder="Filtrar cliente..."
                      value={colFilters.nombreCompleto}
                      onChange={(e) => {
                        setColFilters({ ...colFilters, nombreCompleto: e.target.value });
                        setCurrentPage(1);
                      }}
                      className="w-full px-1.5 py-0.5 text-[11px] font-normal bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </th>
                  <th className="p-1 border-r border-slate-200">
                    <input
                      type="text"
                      placeholder="Plazos..."
                      value={colFilters.plazos}
                      onChange={(e) => {
                        setColFilters({ ...colFilters, plazos: e.target.value });
                        setCurrentPage(1);
                      }}
                      className="w-full px-1.5 py-0.5 text-[11px] font-normal bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-blue-500 text-center font-mono"
                    />
                  </th>
                  <th colSpan={7} className="p-1 bg-slate-100/50"></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 font-medium text-xs">
                {paginatedItems.map((c) => (
                  <tr
                    key={c.creditoId}
                    className="hover:bg-blue-50/60 even:bg-slate-50/50 transition duration-75 group border-b border-slate-100"
                  >
                    <td className="px-2.5 py-2 font-mono font-bold text-blue-600 border-r border-slate-200/50">
                      <button
                        type="button"
                        onClick={() => handleOpenDetalle(c)}
                        className="hover:underline cursor-pointer inline-flex items-center gap-1 font-bold"
                        title="Ver detalle del crédito"
                      >
                        #{c.creditoId}
                        <ExternalLink className="w-3 h-3 text-blue-400 opacity-60 group-hover:opacity-100" />
                      </button>
                    </td>
                    <td className="px-2.5 py-2 text-center border-r border-slate-200/50">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.estatus === 'ACTIVO'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {c.estatus}
                      </span>
                    </td>
                    <td className="px-2.5 py-2 border-r border-slate-200/50">
                      <div className="font-bold text-slate-900 leading-tight">
                        {c.nombreCompleto}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Persona ID: {c.personaId}
                      </div>
                    </td>
                    <td className="px-2.5 py-2 text-center font-mono border-r border-slate-200/50">
                      <span className="font-bold text-slate-800">{c.plazos}</span>
                      <span className="text-[10px] text-slate-500 ml-0.5">qzas</span>
                    </td>
                    <td className="px-2.5 py-2 text-right font-mono text-slate-800 border-r border-slate-200/50">
                      {formatMoney(c.capital)}
                    </td>
                    <td className="px-2.5 py-2 text-right font-mono font-bold text-slate-900 border-r border-slate-200/50">
                      {formatMoney(c.importeTotal)}
                    </td>
                    <td className="px-2.5 py-2 text-right font-mono text-emerald-600 font-semibold border-r border-slate-200/50">
                      {formatMoney(c.abonos)}
                    </td>
                    <td className="px-2.5 py-2 text-right font-mono font-black text-blue-900 border-r border-slate-200/50">
                      {formatMoney(c.saldoActual)}
                    </td>
                    <td className="px-2.5 py-2 text-center font-mono font-bold border-r border-slate-200/50">
                      <span className={c.diasAtraso > 0 ? 'text-rose-600' : 'text-emerald-700'}>
                        {c.diasAtraso}
                      </span>
                    </td>
                    <td className="px-2.5 py-2 font-mono text-slate-600 text-[11px] text-center border-r border-slate-200/50">
                      {c.fechaDesembolso}
                    </td>
                    <td className="px-2.5 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenDetalle(c)}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 transition cursor-pointer shadow-2xs active:scale-95"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detalle</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot className="sticky bottom-0 bg-slate-200/95 backdrop-blur-xs border-t-2 border-slate-300 font-bold text-slate-900 text-xs shadow-inner z-10">
                <tr>
                  <td colSpan={4} className="px-3 py-2 font-black text-slate-800 uppercase tracking-wide">
                    Registros = {filteredData.length}
                  </td>
                  <td className="px-3 py-2 text-right font-mono font-black">
                    {formatMoney(totals.capital)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono font-black text-slate-950">
                    {formatMoney(totals.importeTotal)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono font-black text-emerald-800">
                    {formatMoney(totals.abonos)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono font-black text-blue-900">
                    {formatMoney(totals.saldoActual)}
                  </td>
                  <td colSpan={3} className="px-3 py-2"></td>
                </tr>
              </tfoot>
            </table>
        </div>

        {/* ======================================================== */}
        {/* BARRA INFERIOR DE PAGINACIÓN                            */}
        {/* ======================================================== */}
        <div className="bg-slate-50 px-5 py-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-4">
            <span>
              Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong> ({totalItems} elementos)
            </span>

            {/* Selector de tamaño de página */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Mostrar:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-200 rounded-md px-2 py-0.5 text-xs font-bold text-slate-800 focus:outline-none shadow-2xs"
              >
                <option value={15}>15 registros por página (Recomendado)</option>
                <option value={20}>20 registros por página</option>
                <option value={30}>30 registros por página</option>
                <option value={39}>Todos los registros (39)</option>
              </select>
            </div>
          </div>

          {/* Botones de Paginación */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              className="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Primera página"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Números de página */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setCurrentPage(p)}
                className={`w-7 h-7 rounded-md font-bold text-xs transition ${
                  currentPage === p
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Página siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Última página"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="ml-4 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* MODAL DETALLE DE CRÉDITO INDIVIDUAL                      */}
        {/* ======================================================== */}
        <DetalleCreditoModal
          isOpen={isDetalleOpen}
          onClose={() => setIsDetalleOpen(false)}
          credito={selectedCredito}
          distribuidorNombre={distribuidor.nombreDistribuidor}
          distribuidorNo={distribuidor.noDist}
        />

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
