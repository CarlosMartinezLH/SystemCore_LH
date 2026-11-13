'use client';

import React, { useState } from 'react';
import { formatMoney } from '@/lib/utils/formatters';
import {
  EmployeeRH,
  AttendanceRecord,
  Requisition,
  TrainingCourse,
  VacationBalance,
  VacationRequest,
  PayrollRecord,
  PerformanceGoal,
  BukKudo,
} from '@/types/rh';
import { UserSession } from '@/types/auth';
import {
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE,
  INITIAL_REQUISITIONS,
  INITIAL_TRAINING_COURSES,
  INITIAL_VACATION_BALANCES,
  INITIAL_VACATION_REQUESTS,
  INITIAL_PAYROLL,
  INITIAL_PERFORMANCE_GOALS,
  INITIAL_BUK_KUDOS,
} from '@/lib/data/rhData';
import {
  MapPin,
  Clock,
  UserCheck,
  Shirt,
  CheckCircle2,
  XCircle,
  Building,
  GraduationCap,
  Plus,
  Search,
  FileSpreadsheet,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Heart,
  Award,
  Sparkles,
  FileText,
  CreditCard,
  Briefcase,
  AlertTriangle,
  Send,
  Eye,
  Check,
  ThumbsUp,
  Download,
} from 'lucide-react';

interface RHViewProps {
  currentUser?: UserSession | null;
}

export default function RHView({ currentUser }: RHViewProps = {}) {
  // Navigation Tabs estilo Buk
  const [activeTab, setActiveTab] = useState<
    'colaboradores' | 'asistencia' | 'vacaciones' | 'nomina' | 'desempeno' | 'kudos' | 'requisiciones' | 'capacitaciones'
  >('colaboradores');

  // Core Data States
  const [employees, setEmployees] = useState<EmployeeRH[]>(INITIAL_EMPLOYEES);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [vacationBalances] = useState<VacationBalance[]>(INITIAL_VACATION_BALANCES);
  const [vacationRequests, setVacationRequests] = useState<VacationRequest[]>(INITIAL_VACATION_REQUESTS);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(INITIAL_PAYROLL);
  const [performanceGoals] = useState<PerformanceGoal[]>(INITIAL_PERFORMANCE_GOALS);
  const [kudosList, setKudosList] = useState<BukKudo[]>(INITIAL_BUK_KUDOS);
  const [requisitions, setRequisitions] = useState<Requisition[]>(INITIAL_REQUISITIONS);

  // Filters
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedEmpId, setSelectedEmpId] = useState<string>('emp-101');

  // Modals & Forms State
  const [isNewVacationOpen, setIsNewVacationOpen] = useState(false);
  const [newVacStart, setNewVacStart] = useState('2026-11-20');
  const [newVacEnd, setNewVacEnd] = useState('2026-11-24');
  const [newVacReason, setNewVacReason] = useState('');
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);

  // Kudos Form State
  const [isNewKudoOpen, setIsNewKudoOpen] = useState(false);
  const [kudoReceiver, setKudoReceiver] = useState(INITIAL_EMPLOYEES[0].fullName);
  const [kudoBadge, setKudoBadge] = useState<'COLABORACION' | 'EXCELENCIA' | 'LIDERAZGO' | 'CLIENTE_PRIMERO'>('EXCELENCIA');
  const [kudoMessage, setKudoMessage] = useState('');

  // Requisitions Form State
  const [isNewReqOpen, setIsNewReqOpen] = useState(false);
  const [reqType, setReqType] = useState<'UNIFORME' | 'GAFETE' | 'VACANTE_PERSONAL' | 'PERMISO_VACACIONES'>('UNIFORME');
  const [reqTitle, setReqTitle] = useState('');
  const [reqDesc, setReqDesc] = useState('');

  // GPS Live State
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);

  const selectedEmployee = employees.find((e) => e.id === selectedEmpId) || employees[0];

  // GPS Check-in handler
  const handleGpsCheckIn = () => {
    setGpsLoading(true);
    setGpsMessage(null);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = Number(position.coords.latitude.toFixed(4));
          const lng = Number(position.coords.longitude.toFixed(4));
          const acc = Math.round(position.coords.accuracy);

          const now = new Date();
          const timeString = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
          const dateString = now.toLocaleDateString('es-MX');

          const newRecord: AttendanceRecord = {
            id: `att-${Date.now()}`,
            employeeId: selectedEmployee.id,
            employeeName: selectedEmployee.fullName,
            branch: selectedEmployee.branch,
            date: dateString,
            checkInTime: timeString,
            locationType: 'CAMPO',
            latitude: lat,
            longitude: lng,
            accuracyMeters: acc,
            locationLabel: `Marcaje GPS Verificado en Ruta (±${acc}m)`,
            status: 'PUNTUAL',
            notes: 'Check-in satelital registrado exitosamente en el Core Buk.',
          };

          setAttendance([newRecord, ...attendance]);
          setGpsMessage(`✓ Marcaje GPS exitoso a las ${timeString} [${lat}, ${lng}]`);
          setGpsLoading(false);
        },
        () => {
          const now = new Date();
          const timeString = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
          const dateString = now.toLocaleDateString('es-MX');

          const newRecord: AttendanceRecord = {
            id: `att-${Date.now()}`,
            employeeId: selectedEmployee.id,
            employeeName: selectedEmployee.fullName,
            branch: selectedEmployee.branch,
            date: dateString,
            checkInTime: timeString,
            locationType: 'CAMPO',
            latitude: 25.4241,
            longitude: -101.0049,
            accuracyMeters: 12,
            locationLabel: 'Sucursal Saltillo Centro (Geocerca Buk)',
            status: 'PUNTUAL',
            notes: 'Marcaje registrado vía terminal móvil.',
          };

          setAttendance([newRecord, ...attendance]);
          setGpsMessage(`✓ Marcaje simulado registrado a las ${timeString}`);
          setGpsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setGpsLoading(false);
    }
  };

  // Vacation creation handler
  const handleCreateVacationRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVacReason.trim()) return;

    const newReq: VacationRequest = {
      id: `vac-${Date.now()}`,
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.fullName,
      role: selectedEmployee.role,
      branch: selectedEmployee.branch,
      startDate: newVacStart,
      endDate: newVacEnd,
      totalDays: 3,
      leaveType: 'VACACIONES',
      reason: newVacReason.trim(),
      status: 'PENDIENTE',
      requestedAt: new Date().toLocaleDateString('es-MX'),
    };

    setVacationRequests([newReq, ...vacationRequests]);
    setIsNewVacationOpen(false);
    setNewVacReason('');
  };

  // Vacation approval handler
  const handleApproveVacation = (id: string, status: 'APROBADA' | 'RECHAZADA') => {
    setVacationRequests(
      vacationRequests.map((v) =>
        v.id === id
          ? {
              ...v,
              status,
              approvedBy: currentUser?.name || 'Dirección de Capital Humano',
              approvedAt: new Date().toLocaleDateString('es-MX'),
            }
          : v
      )
    );
  };

  // Kudos creation handler
  const handleCreateKudo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kudoMessage.trim()) return;

    const newKudo: BukKudo = {
      id: `kudo-${Date.now()}`,
      senderName: currentUser?.name || 'José Carlos Martínez',
      senderRole: currentUser?.roleLabel || 'Corporativo',
      receiverName: kudoReceiver,
      receiverRole: employees.find((e) => e.fullName === kudoReceiver)?.role || 'Colaborador',
      badge: kudoBadge,
      message: kudoMessage.trim(),
      reactionsCount: 1,
      createdAt: new Date().toLocaleDateString('es-MX'),
    };

    setKudosList([newKudo, ...kudosList]);
    setIsNewKudoOpen(false);
    setKudoMessage('');
  };

  const handleLikeKudo = (id: string) => {
    setKudosList(
      kudosList.map((k) => (k.id === id ? { ...k, reactionsCount: k.reactionsCount + 1 } : k))
    );
  };

  // Filtering
  const filteredEmployees = employees.filter((e) => {
    const matchBranch = selectedBranch === 'ALL' || e.branch.includes(selectedBranch);
    if (!matchBranch) return false;
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      e.fullName.toLowerCase().includes(q) ||
      e.employeeNumber.toLowerCase().includes(q) ||
      e.role.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q)
    );
  });

  const totalPayrollAmount = payrollRecords.reduce((acc, p) => acc + p.netoPagar, 0);

  return (
    <div className="w-full p-4 lg:p-6 space-y-5">
      {/* 1. Encabezado Ejecutivo Buk con Frosted Glass y Difuminado */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/80 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Buk HRMS · Administración Interna & Personas
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              Capital Humano & Administración Interna
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Portal central de gestión de colaboradores, organigrama, checador GPS, vacaciones dignas LFT, pre-nómina quincenal con bonos y evaluaciones OKRs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleGpsCheckIn}
              disabled={gpsLoading}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition flex items-center gap-1.5 shadow-xs active:scale-95"
            >
              <MapPin className="w-4 h-4 text-emerald-200" />
              <span>{gpsLoading ? 'Verificando GPS...' : 'Marcar Asistencia GPS'}</span>
            </button>
            <button
              onClick={() => setIsNewVacationOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition flex items-center gap-1.5 shadow-xs active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              <span>Solicitar Vacaciones</span>
            </button>
            <button
              onClick={() => setIsNewKudoOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shadow-xs active:scale-95"
            >
              <Heart className="w-4 h-4" />
              <span>Dar Reconocimiento (Kudo)</span>
            </button>
          </div>
        </div>

        {gpsMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{gpsMessage}</span>
          </div>
        )}

        {/* 2. KPI Cards Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-bold block uppercase tracking-wider">Colaboradores Activos</span>
            <span className="text-xl font-black text-slate-900 mt-0.5 block">{employees.length} Personal</span>
            <span className="text-[10px] text-emerald-600 font-bold mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> 100% Contratos Registrados
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-bold block uppercase tracking-wider">Puntualidad en Turno</span>
            <span className="text-xl font-black text-emerald-600 mt-0.5 block">95.8%</span>
            <span className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-600" /> Marcajes satelitales en ruta
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-bold block uppercase tracking-wider">Vacaciones por Disfrutar</span>
            <span className="text-xl font-black text-blue-600 mt-0.5 block">54 Días</span>
            <span className="text-[10px] text-slate-500 mt-0.5 block font-medium">
              Ley Vacaciones Dignas (25% Prima)
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-bold block uppercase tracking-wider">Nómina Quincenal Neta</span>
            <span className="text-xl font-black text-slate-900 font-mono mt-0.5 block">
              {formatMoney(totalPayrollAmount)}
            </span>
            <span className="text-[10px] text-emerald-600 font-bold mt-0.5 flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-emerald-500" /> 6 Recibos Timbrados CFDI
            </span>
          </div>
        </div>

        {/* 3. Segmented Navigation Tabs */}
        <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80 overflow-x-auto no-scrollbar text-xs font-bold">
          <button
            onClick={() => setActiveTab('colaboradores')}
            className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'colaboradores'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Colaboradores & Expedientes ({employees.length})
          </button>
          <button
            onClick={() => setActiveTab('asistencia')}
            className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'asistencia'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Asistencia & Checador GPS
          </button>
          <button
            onClick={() => setActiveTab('vacaciones')}
            className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'vacaciones'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Vacaciones & Ausencias ({vacationRequests.filter((v) => v.status === 'PENDIENTE').length} pendientes)
          </button>
          <button
            onClick={() => setActiveTab('nomina')}
            className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'nomina'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Pre-nómina & Comisiones
          </button>
          <button
            onClick={() => setActiveTab('desempeno')}
            className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'desempeno'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Desempeño & OKRs
          </button>
          <button
            onClick={() => setActiveTab('kudos')}
            className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'kudos'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            Clima & Kudos ({kudosList.length})
          </button>
          <button
            onClick={() => setActiveTab('requisiciones')}
            className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'requisiciones'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Shirt className="w-3.5 h-3.5" />
            Requisiciones
          </button>
          <button
            onClick={() => setActiveTab('capacitaciones')}
            className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'capacitaciones'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Capacitaciones & PLD
          </button>
        </div>
      </div>

      {/* ============================================================================== */}
      {/* TAB 1: COLABORADORES & EXPEDIENTES DIGITALES (BUK) */}
      {/* ============================================================================== */}
      {activeTab === 'colaboradores' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Lista de colaboradores */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 space-y-3">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar colaborador, puesto o No..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="ALL">Todas las Zonas</option>
                <option value="Saltillo">Zona A</option>
                <option value="Torreón">Zona B</option>
                <option value="Monclova">Zona C</option>
              </select>
            </div>

            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto no-scrollbar">
              {filteredEmployees.map((emp) => {
                const isSelected = emp.id === selectedEmployee.id;
                return (
                  <div
                    key={emp.id}
                    onClick={() => setSelectedEmpId(emp.id)}
                    className={`p-3 rounded-xl cursor-pointer transition flex items-center justify-between gap-3 ${
                      isSelected ? 'bg-blue-50/80 border border-blue-200' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {emp.fullName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-900 truncate">{emp.fullName}</p>
                        <p className="text-[11px] text-slate-500 font-medium truncate">{emp.role}</p>
                        <span className="text-[10px] text-blue-600 font-semibold">{emp.branch}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {emp.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Expediente Ficha Central del Colaborador */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-base flex items-center justify-center shadow-md">
                  {selectedEmployee.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {selectedEmployee.employeeNumber}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {selectedEmployee.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">{selectedEmployee.fullName}</h3>
                  <p className="text-xs text-slate-500 font-medium">{selectedEmployee.role} • {selectedEmployee.branch}</p>
                </div>
              </div>

              <button
                onClick={() => alert(`Descargando expediente digital PDF de ${selectedEmployee.fullName}...`)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition border border-slate-200/80"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Ficha</span>
              </button>
            </div>

            {/* Ficha técnica */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">RFC Fiscal</span>
                <span className="font-mono font-black text-slate-900 text-sm mt-0.5 block">{selectedEmployee.rfc || 'LOGC950415HN7'}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">CURP Oficial</span>
                <span className="font-mono font-black text-slate-900 text-sm mt-0.5 block">{selectedEmployee.curp || 'LOGC950415MCOPLR01'}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">No. Seguro Social (NSS)</span>
                <span className="font-mono font-black text-slate-900 text-sm mt-0.5 block">{selectedEmployee.nss || '01957812934'}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Salario Mensual Bruto</span>
                <span className="font-mono font-black text-emerald-600 text-sm mt-0.5 block">
                  {formatMoney(selectedEmployee.salarioBaseMensual || 13000)} MXN
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Tipo de Contrato</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{selectedEmployee.tipoContrato || 'INDETERMINADO'}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Fecha de Ingreso</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{selectedEmployee.hireDate}</span>
              </div>
            </div>

            {/* Documentos de Expediente Digital */}
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                Documentos en Expediente Digital (Buk Cloud)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                {['Contrato Laboral Firmado', 'Constancia SAT (RFC)', 'Alta Patronal IMSS', 'Comprobante Domicilio'].map((doc, i) => (
                  <div key={i} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <span className="font-semibold text-slate-800 text-[11px] truncate">{doc}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* Organigrama de dependencia directa */}
            <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200/80 text-xs">
              <span className="text-[10px] font-bold text-blue-800 uppercase block">Jerarquía Organizacional</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">
                Reporta a: <strong className="text-blue-700">{selectedEmployee.supervisorName}</strong>
              </p>
              <p className="text-[11px] text-slate-600 mt-1">
                Departamento: <strong>{selectedEmployee.department}</strong> • Ubicación: <strong>{selectedEmployee.locationType}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* TAB 2: ASISTENCIA & CHECADOR GPS */}
      {/* ============================================================================== */}
      {activeTab === 'asistencia' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900">Bitácora Satelital de Asistencia & Horarios</h3>
              <p className="text-xs text-slate-500">Marcajes verificados con geolocalización satelital en campo y sucursales.</p>
            </div>
            <button
              onClick={handleGpsCheckIn}
              disabled={gpsLoading}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{gpsLoading ? 'Verificando...' : 'Nuevo Marcaje GPS'}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                  <th className="p-3">Colaborador</th>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Entrada</th>
                  <th className="p-3">Ubicación / Geocerca</th>
                  <th className="p-3">Coordenadas GPS</th>
                  <th className="p-3">Estatus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendance.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50">
                    <td className="p-3 font-black text-slate-900">{rec.employeeName}</td>
                    <td className="p-3 font-medium text-slate-600">{rec.date}</td>
                    <td className="p-3 font-mono font-bold text-blue-700">{rec.checkInTime || '--:--'}</td>
                    <td className="p-3 text-slate-700">{rec.locationLabel}</td>
                    <td className="p-3 font-mono text-[11px] text-slate-500">
                      {rec.latitude ? `${rec.latitude}, ${rec.longitude}` : 'En Sucursal'}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* TAB 3: VACACIONES & AUSENCIAS (LEY VACACIONES DIGNAS) */}
      {/* ============================================================================== */}
      {activeTab === 'vacaciones' && (
        <div className="space-y-5">
          {/* Tarjetas de Saldo de Vacaciones Dignas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vacationBalances.slice(0, 3).map((vb) => (
              <div key={vb.employeeId} className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900">{vb.employeeName}</span>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {vb.antiguedadAnios} Años Antigüedad
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-100">
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold block">Por Ley</span>
                    <span className="text-lg font-black text-slate-900">{vb.diasPorLey}d</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold block">Tomados</span>
                    <span className="text-lg font-black text-slate-500">{vb.diasTomados}d</span>
                  </div>
                  <div className="bg-blue-50 p-2 rounded-xl">
                    <span className="text-[10px] text-blue-700 font-bold block">Disponibles</span>
                    <span className="text-lg font-black text-blue-600">{vb.diasDisponibles}d</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 flex justify-between">
                  <span>Prima Vacacional Oficial:</span>
                  <strong className="text-slate-800 font-mono">25% sobre salario diario</strong>
                </div>
              </div>
            ))}
          </div>

          {/* Bandeja de Solicitudes y Aprobaciones */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Bandeja de Solicitudes de Vacaciones & Permisos</h3>
              <button
                onClick={() => setIsNewVacationOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nueva Solicitud</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                    <th className="p-3">Colaborador</th>
                    <th className="p-3">Periodo Solicitado</th>
                    <th className="p-3">Días Hábiles</th>
                    <th className="p-3">Tipo de Ausencia</th>
                    <th className="p-3">Motivo</th>
                    <th className="p-3">Estatus</th>
                    <th className="p-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vacationRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <span className="font-black text-slate-900 block">{req.employeeName}</span>
                        <span className="text-[11px] text-slate-500">{req.role}</span>
                      </td>
                      <td className="p-3 font-semibold text-slate-700">{req.startDate} al {req.endDate}</td>
                      <td className="p-3 font-mono font-bold text-blue-600">{req.totalDays} Días</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {req.leaveType}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 max-w-xs truncate">{req.reason}</td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            req.status === 'APROBADA'
                              ? 'bg-emerald-100 text-emerald-800'
                              : req.status === 'RECHAZADA'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {req.status === 'PENDIENTE' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApproveVacation(req.id, 'APROBADA')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition shadow-xs"
                            >
                              Aprobar
                            </button>
                            <button
                              onClick={() => handleApproveVacation(req.id, 'RECHAZADA')}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-bold text-[11px] transition border border-rose-200"
                            >
                              Rechazar
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Atendido por {req.approvedBy || 'RH'}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* TAB 4: PRE-NÓMINA & COMISIONES */}
      {/* ============================================================================== */}
      {activeTab === 'nomina' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900">Pre-Nómina Quincenal con Bonos por Recuperación & Colocación</h3>
              <p className="text-xs text-slate-500">Cálculo de sueldo base, comisiones por vales canjeados y retenciones fiscales (IMSS / ISR).</p>
            </div>
            <button
              onClick={() => alert('Simulación: Archivo de dispersión masiva SPEI para Banorte / STP generado con éxito.')}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
            >
              <CreditCard className="w-4 h-4 text-emerald-200" />
              <span>Dispersar Nómina STP</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                  <th className="p-3">Colaborador</th>
                  <th className="p-3">Sueldo Base</th>
                  <th className="p-3">Bono Colocación</th>
                  <th className="p-3">Comisión Cobranza</th>
                  <th className="p-3">Deducciones (IMSS/ISR)</th>
                  <th className="p-3">Neto a Pagar</th>
                  <th className="p-3">Estatus</th>
                  <th className="p-3 text-right">Recibo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payrollRecords.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <span className="font-black text-slate-900 block">{pay.employeeName}</span>
                      <span className="text-[11px] text-slate-500">{pay.role}</span>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-800">{formatMoney(pay.sueldoBaseQuincenal)}</td>
                    <td className="p-3 font-mono font-bold text-emerald-600">+{formatMoney(pay.bonoColocacionVales)}</td>
                    <td className="p-3 font-mono font-bold text-indigo-600">+{formatMoney(pay.comisionCobranza)}</td>
                    <td className="p-3 font-mono font-bold text-rose-600">-{formatMoney(pay.deduccionesTotales)}</td>
                    <td className="p-3 font-mono font-black text-slate-900 text-sm">
                      {formatMoney(pay.netoPagar)}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {pay.estatus}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedPayslip(pay)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] transition inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3 text-blue-600" />
                        <span>Ver CFDI</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* TAB 5: DESEMPEÑO & METAS (OKRS) */}
      {/* ============================================================================== */}
      {activeTab === 'desempeno' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
            <div>
              <h3 className="text-base font-black text-slate-900">Objetivos Clave de Rendimiento (OKRs Q4 2026)</h3>
              <p className="text-xs text-slate-500">Metas cuantificables de colocación de vales y recuperación de cartera quincenal.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {performanceGoals.map((goal) => {
                const percent = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
                return (
                  <div key={goal.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">{goal.employeeName}</span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                          goal.status === 'ALCANZADA'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {goal.status}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-700">{goal.title}</p>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          percent >= 100 ? 'bg-emerald-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <span>Progreso: <strong>{goal.currentValue.toLocaleString('es-MX')} {goal.unit}</strong></span>
                      <span>Meta: <strong>{goal.targetValue.toLocaleString('es-MX')} {goal.unit} ({percent}%)</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* TAB 6: CLIMA & KUDOS (BUK COMMUNITY) */}
      {/* ============================================================================== */}
      {activeTab === 'kudos' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                Muro de Reconocimientos & Clima Laboral (Buk Kudos)
              </h3>
              <p className="text-xs text-slate-500">Espacio corporativo para reconocer la excelencia, empatía y compromiso del equipo LanAhora.</p>
            </div>
            <button
              onClick={() => setIsNewKudoOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-xs transition"
            >
              <Award className="w-4 h-4" />
              <span>Enviar Kudo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {kudosList.map((kd) => (
              <div key={kd.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                    ⭐ {kd.badge}
                  </span>
                  <span className="text-[10px] text-slate-400">{kd.createdAt}</span>
                </div>
                <p className="text-xs text-slate-700 italic leading-relaxed">"{kd.message}"</p>
                <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px]">
                  <div>
                    <span className="font-black text-slate-900 block">{kd.receiverName}</span>
                    <span className="text-slate-500 text-[10px]">De: {kd.senderName}</span>
                  </div>
                  <button
                    onClick={() => handleLikeKudo(kd.id)}
                    className="flex items-center gap-1 text-slate-600 hover:text-rose-600 transition font-bold"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{kd.reactionsCount}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* TAB 7: REQUISICIONES */}
      {/* ============================================================================== */}
      {activeTab === 'requisiciones' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-black text-slate-900">Requisiciones de Uniformes, Gafetes y Vacantes</h3>
            <button
              onClick={() => setIsNewReqOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Requisición</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                  <th className="p-3">Folio</th>
                  <th className="p-3">Colaborador</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Título / Descripción</th>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Estatus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requisitions.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-blue-600">{req.id}</td>
                    <td className="p-3 font-black text-slate-900">{req.employeeName}</td>
                    <td className="p-3 font-bold text-slate-700">{req.type}</td>
                    <td className="p-3 text-slate-600">{req.title}</td>
                    <td className="p-3 text-slate-500">{req.requestedAt}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* TAB 8: CAPACITACIONES & PLD */}
      {/* ============================================================================== */}
      {activeTab === 'capacitaciones' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <h3 className="text-base font-black text-slate-900">Programa de Capacitación Continua & Cumplimiento PLD</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INITIAL_TRAINING_COURSES.map((crs) => (
              <div key={crs.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-600">{crs.code}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {crs.durationHours} Horas
                  </span>
                </div>
                <h4 className="text-xs font-black text-slate-900">{crs.title}</h4>
                <p className="text-[11px] text-slate-600">{crs.description}</p>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                  <span>{crs.totalModules} Módulos Interactivos</span>
                  <span className="text-blue-600 font-bold cursor-pointer hover:underline">Ver Temario</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: SOLICITUD DE VACACIONES */}
      {isNewVacationOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-black text-slate-900">Solicitar Vacaciones (Buk LFT)</h3>
            <form onSubmit={handleCreateVacationRequest} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Colaborador:</label>
                <input
                  type="text"
                  disabled
                  value={selectedEmployee.fullName}
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Fecha Inicio:</label>
                  <input
                    type="date"
                    value={newVacStart}
                    onChange={(e) => setNewVacStart(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Fecha Fin:</label>
                  <input
                    type="date"
                    value={newVacEnd}
                    onChange={(e) => setNewVacEnd(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Motivo / Justificación:</label>
                <textarea
                  rows={3}
                  value={newVacReason}
                  onChange={(e) => setNewVacReason(e.target.value)}
                  placeholder="Describe brevemente el motivo de las vacaciones..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewVacationOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs"
                >
                  Enviar a Autorización
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECIBO CFDI TIMBRADO */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">Recibo de Nómina Electrónica (CFDI)</h3>
                <p className="text-[11px] text-slate-500 font-mono">{selectedPayslip.folioFiscal}</p>
              </div>
              <button
                onClick={() => setSelectedPayslip(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Colaborador:</span>
                <strong className="text-slate-900">{selectedPayslip.employeeName}</strong>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Periodo:</span>
                <strong className="text-slate-900">{selectedPayslip.periodo}</strong>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Sueldo Base:</span>
                <strong className="text-slate-900 font-mono">{formatMoney(selectedPayslip.sueldoBaseQuincenal)}</strong>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Bono por Colocación:</span>
                <strong className="text-emerald-600 font-mono">+{formatMoney(selectedPayslip.bonoColocacionVales)}</strong>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Comisión por Cobranza:</span>
                <strong className="text-indigo-600 font-mono">+{formatMoney(selectedPayslip.comisionCobranza)}</strong>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Retención IMSS + ISR:</span>
                <strong className="text-rose-600 font-mono">-{formatMoney(selectedPayslip.deduccionesTotales)}</strong>
              </div>
              <div className="flex justify-between p-3 bg-blue-50 text-blue-900 rounded-xl font-black text-sm">
                <span>Neto Dispersado:</span>
                <span className="font-mono">{formatMoney(selectedPayslip.netoPagar)} MXN</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  alert('Descargando XML y PDF del recibo CFDI timbrado...');
                  setSelectedPayslip(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 transition"
              >
                Descargar PDF Oficial
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ENVIAR KUDO */}
      {isNewKudoOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-black text-slate-900">Reconocer a un Compañero (Buk Kudo)</h3>
            <form onSubmit={handleCreateKudo} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Colaborador Destinatario:</label>
                <select
                  value={kudoReceiver}
                  onChange={(e) => setKudoReceiver(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.fullName}>{e.fullName} - {e.role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Valor o Insignia:</label>
                <select
                  value={kudoBadge}
                  onChange={(e) => setKudoBadge(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  <option value="EXCELENCIA">⭐ Excelencia Operativa</option>
                  <option value="COLABORACION">🤝 Trabajo en Equipo</option>
                  <option value="CLIENTE_PRIMERO">❤️ Cliente Primero</option>
                  <option value="LIDERAZGO">🚀 Liderazgo e Iniciativa</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Mensaje de Agradecimiento:</label>
                <textarea
                  rows={3}
                  value={kudoMessage}
                  onChange={(e) => setKudoMessage(e.target.value)}
                  placeholder="Escribe por qué valoras su contribución..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewKudoOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-xs"
                >
                  Publicar en el Muro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
