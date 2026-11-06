'use client';

import React, { useState } from 'react';
import {
  EmployeeRH,
  AttendanceRecord,
  Requisition,
  TrainingCourse,
} from '@/types/rh';
import { UserSession } from '@/types/auth';
import {
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE,
  INITIAL_REQUISITIONS,
  INITIAL_TRAINING_COURSES,
} from '@/lib/data/rhData';
import {
  MapPin,
  Clock,
  UserCheck,
  Shirt,
  UserPlus,
  CheckCircle2,
  XCircle,
  Navigation,
  Building,
  GraduationCap,
  ExternalLink,
  Plus,
  Search,
  FileSpreadsheet,
  Users,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';

interface RHViewProps {
  currentUser?: UserSession | null;
}

export default function RHView({ currentUser }: RHViewProps = {}) {
  const [activeTab, setActiveTab] = useState<'asistencia' | 'personal' | 'requisiciones' | 'capacitaciones'>('asistencia');
  const [employees, setEmployees] = useState<EmployeeRH[]>(INITIAL_EMPLOYEES);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [requisitions, setRequisitions] = useState<Requisition[]>(INITIAL_REQUISITIONS);

  // Filters
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [selectedLocationType, setSelectedLocationType] = useState('ALL');
  const [searchFilter, setSearchFilter] = useState('');

  // Selected row
  const [selectedEmpId, setSelectedEmpId] = useState<string>('emp-101');

  // New Requisition Form State
  const [isNewReqOpen, setIsNewReqOpen] = useState(false);
  const [reqType, setReqType] = useState<'UNIFORME' | 'GAFETE' | 'VACANTE_PERSONAL' | 'PERMISO_VACACIONES'>('UNIFORME');
  const [reqTitle, setReqTitle] = useState('');
  const [reqDesc, setReqDesc] = useState('');
  const [reqSize, setReqSize] = useState<'CH' | 'M' | 'G' | 'XG'>('M');
  const [reqItem, setReqItem] = useState<'CAMISA_POLO' | 'CHALECO_CAMPO' | 'KIT_COMPLETO'>('CHALECO_CAMPO');

  // GPS Check-in Simulation / Live GPS
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);

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
            employeeId: 'emp-101',
            employeeName: 'CINDY KARIME LOPEZ GARCIA',
            branch: 'Saltillo Centro',
            date: dateString,
            checkInTime: timeString,
            locationType: 'CAMPO',
            latitude: lat,
            longitude: lng,
            accuracyMeters: acc,
            locationLabel: `Marcaje GPS en Ruta Comercial (Precisión ±${acc}m)`,
            status: 'PUNTUAL',
            notes: 'Check-in verificado por geolocalización satelital en campo.',
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
            employeeId: 'emp-101',
            employeeName: 'CINDY KARIME LOPEZ GARCIA',
            branch: 'Saltillo Centro',
            date: dateString,
            checkInTime: timeString,
            locationType: 'CAMPO',
            latitude: 25.4241,
            longitude: -101.0049,
            accuracyMeters: 10,
            locationLabel: 'Zona Asignada Saltillo Sur (Simulación GPS)',
            status: 'PUNTUAL',
            notes: 'Marcaje en campo registrado mediante dispositivo móvil.',
          };

          setAttendance([newRecord, ...attendance]);
          setGpsMessage(`✓ Marcaje registrado a las ${timeString} [25.4241, -101.0049]`);
          setGpsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setGpsLoading(false);
      alert('Geolocalización no soportada por el navegador.');
    }
  };

  const handleCreateRequisition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle.trim()) return;

    const newReq: Requisition = {
      id: `req-${Date.now()}`,
      employeeId: 'emp-101',
      employeeName: 'CINDY KARIME LOPEZ GARCIA',
      branch: 'Saltillo Centro',
      type: reqType,
      title: reqTitle.trim(),
      description: reqDesc.trim(),
      details: {
        sizeUniform: reqType === 'UNIFORME' ? reqSize : undefined,
        uniformItem: reqType === 'UNIFORME' ? reqItem : undefined,
        badgeReason: reqType === 'GAFETE' ? 'DETERIORO' : undefined,
      },
      status: 'PENDIENTE',
      requestedAt: new Date().toLocaleString('es-MX'),
    };

    setRequisitions([newReq, ...requisitions]);
    setIsNewReqOpen(false);
    setReqTitle('');
    setReqDesc('');
    alert('✓ Solicitud enviada a Capital Humano para revisión y autorización.');
  };

  const handleApproveRequisition = (reqId: string, newStatus: 'APROBADO' | 'RECHAZADO' | 'ENTREGADO') => {
    const updated = requisitions.map((r) =>
      r.id === reqId
        ? {
            ...r,
            status: newStatus,
            reviewedBy: 'JOSE CARLOS MARTINEZ MAYORGA',
            reviewedAt: new Date().toLocaleString('es-MX'),
            reviewerNotes: newStatus === 'APROBADO' ? 'Autorizado para despacho inmediato.' : 'Atendido.',
          }
        : r
    );
    setRequisitions(updated);
  };

  // Filtered lists
  const filteredAttendance = attendance.filter((a) => {
    // Permisos por sucursal
    if (currentUser && currentUser.branchScope === 'BRANCH') {
      const uB = currentUser.branch.toUpperCase();
      const aB = (a.branch || '').toUpperCase();
      const match =
        (uB.includes('SALTILLO') && aB.includes('SALTILLO')) ||
        (uB.includes('TORRE') && aB.includes('TORRE')) ||
        (uB.includes('MONCLOVA') && aB.includes('MONCLOVA'));
      if (!match) return false;
    }

    const matchBranch = selectedBranch === 'ALL' || a.branch === selectedBranch;
    const matchLoc = selectedLocationType === 'ALL' || a.locationType === selectedLocationType;
    if (!matchBranch || !matchLoc) return false;
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      a.employeeName.toLowerCase().includes(q) ||
      a.branch.toLowerCase().includes(q) ||
      (a.locationLabel && a.locationLabel.toLowerCase().includes(q))
    );
  });

  const filteredEmployees = employees.filter((e) => {
    // Permisos por sucursal
    if (currentUser && currentUser.branchScope === 'BRANCH') {
      const uB = currentUser.branch.toUpperCase();
      const eB = (e.branch || '').toUpperCase();
      const match =
        (uB.includes('SALTILLO') && eB.includes('SALTILLO')) ||
        (uB.includes('TORRE') && eB.includes('TORRE')) ||
        (uB.includes('MONCLOVA') && eB.includes('MONCLOVA'));
      if (!match) return false;
    }

    const matchBranch = selectedBranch === 'ALL' || e.branch === selectedBranch;
    const matchLoc = selectedLocationType === 'ALL' || e.locationType === selectedLocationType;
    if (!matchBranch || !matchLoc) return false;
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      e.fullName.toLowerCase().includes(q) ||
      e.employeeNumber.toLowerCase().includes(q) ||
      e.role.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q)
    );
  });

  const filteredRequisitions = requisitions.filter((r) => {
    // Permisos por sucursal
    if (currentUser && currentUser.branchScope === 'BRANCH') {
      const uB = currentUser.branch.toUpperCase();
      const rB = (r.branch || '').toUpperCase();
      const match =
        (uB.includes('SALTILLO') && rB.includes('SALTILLO')) ||
        (uB.includes('TORRE') && rB.includes('TORRE')) ||
        (uB.includes('MONCLOVA') && rB.includes('MONCLOVA'));
      if (!match) return false;
    }

    const matchBranch = selectedBranch === 'ALL' || r.branch === selectedBranch;
    if (!matchBranch) return false;
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      r.employeeName.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.type.toLowerCase().includes(q)
    );
  });

  const selectedEmployee = employees.find((e) => e.id === selectedEmpId) || employees[0];

  return (
    <div className="flex-1 bg-slate-50 text-slate-800 flex flex-col min-h-0 overflow-y-auto font-sans p-4 lg:p-6 space-y-4">
      {/* Top Action Toolbar: Botones sobre la pantalla */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Left: Tab options as segmented pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          {[
            { id: 'asistencia', name: 'Asistencia & GPS', icon: Clock, count: attendance.length },
            { id: 'personal', name: 'Colaboradores', icon: Users, count: employees.length },
            { id: 'requisiciones', name: 'Requisiciones', icon: Shirt, count: requisitions.filter((r) => r.status === 'PENDIENTE').length },
            { id: 'capacitaciones', name: 'Capacitaciones & PLD', icon: GraduationCap, count: INITIAL_TRAINING_COURSES.length },
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

        {/* Right: Quick GPS & Requisition Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleGpsCheckIn}
            disabled={gpsLoading}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition active:scale-95"
          >
            <MapPin className="w-3.5 h-3.5 text-yellow-300" />
            <span>{gpsLoading ? 'Marcando...' : 'Check-in GPS'}</span>
          </button>

          <button
            onClick={() => setIsNewReqOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#facc15] hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-xs transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-slate-950" />
            <span>+ Requisición Recursos</span>
          </button>

          <button
            onClick={() => alert('Exportando reporte de asistencias y personal a Microsoft Excel (.xlsx)...')}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-2 border border-emerald-200 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Exportar Excel</span>
          </button>
        </div>
      </div>

      {/* Selected Employee Banner (if active) */}
      {selectedEmployee && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="font-extrabold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-lg">
              {selectedEmployee.employeeNumber}
            </span>
            <span className="font-bold text-slate-900 text-sm">
              {selectedEmployee.fullName}
            </span>
            <span className="text-slate-500">
              {selectedEmployee.role} • {selectedEmployee.branch}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              ✓ Checador Activo
            </span>
            {gpsMessage && (
              <span className="text-blue-700 font-medium font-mono text-[11px]">
                {gpsMessage}
              </span>
            )}
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-x-auto flex flex-col space-y-3">
        {/* Search & Stats Bar */}
        <div className="bg-white p-3 rounded-2xl border border-blue-100 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-blue-600 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por Colaborador, Sucursal, Puesto..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs w-72 text-slate-900 focus:outline-none focus:border-[#2563eb] focus:bg-white font-medium"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-600 font-semibold">Sucursal:</span>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:border-[#2563eb] font-semibold"
              >
                <option value="ALL">Todas las Sucursales</option>
                <option value="Saltillo Centro">Saltillo Centro</option>
                <option value="Torreón Matriz">Torreón Matriz</option>
                <option value="Monclova Foránea">Monclova Foránea</option>
                <option value="Corporativo Saltillo">Corporativo Saltillo</option>
              </select>
            </div>

            {activeTab !== 'capacitaciones' && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-600 font-semibold">Ubicación:</span>
                <select
                  value={selectedLocationType}
                  onChange={(e) => setSelectedLocationType(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:border-[#2563eb] font-semibold"
                >
                  <option value="ALL">Todos los tipos</option>
                  <option value="CAMPO">Personal en Calle (Campo GPS)</option>
                  <option value="SUCURSAL">Personal en Sucursal</option>
                  <option value="CORPORATIVO">Personal Corporativo</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {gpsMessage && (
              <span className="text-[11px] text-emerald-800 font-mono bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-300 font-bold">
                {gpsMessage}
              </span>
            )}
            <span className="text-xs text-slate-500 font-medium">
              Mostrando{' '}
              <strong className="text-[#2563eb]">
                {activeTab === 'asistencia'
                  ? filteredAttendance.length
                  : activeTab === 'personal'
                  ? filteredEmployees.length
                  : activeTab === 'requisiciones'
                  ? filteredRequisitions.length
                  : INITIAL_TRAINING_COURSES.length}
              </strong>{' '}
              registros en {activeTab}
            </span>
          </div>
        </div>

        {/* Table Container (Matching PersonasView) */}
        <div className="bg-white rounded-2xl border border-blue-100 overflow-hidden shadow-xs flex-1">
          {/* TAB 1: ASISTENCIA */}
          {activeTab === 'asistencia' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                <thead className="bg-[#2563eb] text-white uppercase text-[10px] tracking-wider font-extrabold select-none">
                  <tr>
                    <th className="px-3.5 py-2.5">Acciones</th>
                    <th className="px-3.5 py-2.5">Colaborador</th>
                    <th className="px-3.5 py-2.5">Sucursal</th>
                    <th className="px-3.5 py-2.5">Tipo Ubicación</th>
                    <th className="px-3.5 py-2.5">Hora Entrada</th>
                    <th className="px-3.5 py-2.5">Geolocalización GPS</th>
                    <th className="px-3.5 py-2.5">Punto / Zona de Marcaje</th>
                    <th className="px-3.5 py-2.5">Estatus</th>
                    <th className="px-3.5 py-2.5">Notas de Campo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-slate-400">
                        No se encontraron marcajes de asistencia con los filtros seleccionados
                      </td>
                    </tr>
                  ) : (
                    filteredAttendance.map((rec) => {
                      const isSelected = selectedEmpId === rec.employeeId;
                      return (
                        <tr
                          key={rec.id}
                          onClick={() => setSelectedEmpId(rec.employeeId)}
                          className={`cursor-pointer transition ${
                            isSelected ? 'bg-blue-50/90 font-medium' : 'hover:bg-blue-50/40'
                          }`}
                        >
                          <td className="px-3.5 py-2 font-medium">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                alert(`Verificando expediente de marcaje de ${rec.employeeName}`);
                              }}
                              className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-600 hover:text-white transition"
                            >
                              Detalle
                            </button>
                          </td>
                          <td className="px-3.5 py-2 font-bold text-slate-900 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
                              {rec.employeeName.charAt(0)}
                            </div>
                            <span>{rec.employeeName}</span>
                          </td>
                          <td className="px-3.5 py-2 text-slate-700">{rec.branch}</td>
                          <td className="px-3.5 py-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                rec.locationType === 'CAMPO'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : rec.locationType === 'CORPORATIVO'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {rec.locationType === 'CAMPO' ? '📍 CAMPO (CALLE)' : rec.locationType}
                            </span>
                          </td>
                          <td className="px-3.5 py-2 font-mono font-bold text-[#2563eb]">
                            {rec.checkInTime}
                          </td>
                          <td className="px-3.5 py-2 font-mono text-[11px]">
                            {rec.latitude ? (
                              <a
                                href={`https://maps.google.com/?q=${rec.latitude},${rec.longitude}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-[#2563eb] hover:underline flex items-center gap-1 font-bold"
                              >
                                <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                <span>
                                  {rec.latitude}, {rec.longitude}
                                </span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            ) : (
                              <span className="text-slate-400">Estación Fija</span>
                            )}
                          </td>
                          <td className="px-3.5 py-2 text-slate-700 max-w-xs truncate" title={rec.locationLabel}>
                            {rec.locationLabel}
                          </td>
                          <td className="px-3.5 py-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                rec.status === 'PUNTUAL'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {rec.status}
                            </span>
                          </td>
                          <td className="px-3.5 py-2 text-slate-500 max-w-xs truncate" title={rec.notes}>
                            {rec.notes || '—'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: PADRÓN DE COLABORADORES */}
          {activeTab === 'personal' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                <thead className="bg-[#2563eb] text-white uppercase text-[10px] tracking-wider font-extrabold select-none">
                  <tr>
                    <th className="px-3.5 py-2.5">Acciones</th>
                    <th className="px-3.5 py-2.5">No. Empleado</th>
                    <th className="px-3.5 py-2.5">Nombre Completo</th>
                    <th className="px-3.5 py-2.5">Puesto</th>
                    <th className="px-3.5 py-2.5">Departamento</th>
                    <th className="px-3.5 py-2.5">Sucursal</th>
                    <th className="px-3.5 py-2.5">Modalidad</th>
                    <th className="px-3.5 py-2.5">Supervisor Directo</th>
                    <th className="px-3.5 py-2.5">Fecha Ingreso</th>
                    <th className="px-3.5 py-2.5">Estatus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEmployees.map((emp) => {
                    const isSelected = selectedEmpId === emp.id;
                    return (
                      <tr
                        key={emp.id}
                        onClick={() => setSelectedEmpId(emp.id)}
                        className={`cursor-pointer transition ${
                          isSelected ? 'bg-blue-50/90 font-medium' : 'hover:bg-blue-50/40'
                        }`}
                      >
                        <td className="px-3.5 py-2 font-medium">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              alert(`Abriendo expediente laboral de ${emp.fullName}`);
                            }}
                            className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-600 hover:text-white transition"
                          >
                            Expediente
                          </button>
                        </td>
                        <td className="px-3.5 py-2 font-mono font-bold text-[#2563eb]">
                          {emp.employeeNumber}
                        </td>
                        <td className="px-3.5 py-2 font-bold text-slate-900">{emp.fullName}</td>
                        <td className="px-3.5 py-2 text-slate-700">{emp.role}</td>
                        <td className="px-3.5 py-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                            {emp.department}
                          </span>
                        </td>
                        <td className="px-3.5 py-2 text-slate-700">{emp.branch}</td>
                        <td className="px-3.5 py-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              emp.locationType === 'CAMPO'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {emp.locationType}
                          </span>
                        </td>
                        <td className="px-3.5 py-2 text-slate-600">{emp.supervisorName}</td>
                        <td className="px-3.5 py-2 font-mono text-slate-500">{emp.hireDate}</td>
                        <td className="px-3.5 py-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {emp.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: REQUISICIONES */}
          {activeTab === 'requisiciones' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                <thead className="bg-[#2563eb] text-white uppercase text-[10px] tracking-wider font-extrabold select-none">
                  <tr>
                    <th className="px-3.5 py-2.5">Acciones</th>
                    <th className="px-3.5 py-2.5">Folio / Tipo</th>
                    <th className="px-3.5 py-2.5">Colaborador Solicitante</th>
                    <th className="px-3.5 py-2.5">Sucursal</th>
                    <th className="px-3.5 py-2.5">Detalle / Artículo Solicitado</th>
                    <th className="px-3.5 py-2.5">Fecha Solicitud</th>
                    <th className="px-3.5 py-2.5">Estatus</th>
                    <th className="px-3.5 py-2.5">Autorización</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequisitions.map((req) => (
                    <tr key={req.id} className="hover:bg-blue-50/40 transition">
                      <td className="px-3.5 py-2 font-medium">
                        {req.status === 'PENDIENTE' ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleApproveRequisition(req.id, 'APROBADO')}
                              className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition"
                            >
                              Aprobar
                            </button>
                            <button
                              onClick={() => handleApproveRequisition(req.id, 'RECHAZADO')}
                              className="px-2 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition"
                            >
                              Rechazar
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-semibold italic">
                            Atendido
                          </span>
                        )}
                      </td>
                      <td className="px-3.5 py-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            req.type === 'UNIFORME'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : req.type === 'GAFETE'
                              ? 'bg-blue-100 text-blue-900 border border-blue-300'
                              : 'bg-purple-100 text-purple-900 border border-purple-300'
                          }`}
                        >
                          {req.type}
                        </span>
                      </td>
                      <td className="px-3.5 py-2 font-bold text-slate-900">{req.employeeName}</td>
                      <td className="px-3.5 py-2 text-slate-700">{req.branch}</td>
                      <td className="px-3.5 py-2 text-slate-800">
                        <div className="font-semibold">{req.title}</div>
                        {req.details?.sizeUniform && (
                          <div className="text-[10px] text-blue-700">
                            Talla: <strong>{req.details.sizeUniform}</strong> • Artículo: {req.details.uniformItem}
                          </div>
                        )}
                      </td>
                      <td className="px-3.5 py-2 font-mono text-slate-500">{req.requestedAt}</td>
                      <td className="px-3.5 py-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            req.status === 'APROBADO'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : req.status === 'PENDIENTE'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="px-3.5 py-2 text-[11px] text-slate-500">
                        {req.reviewedBy ? `Por ${req.reviewedBy}` : 'Pendiente de Director'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: CAPACITACIONES & ACADEMIA */}
          {activeTab === 'capacitaciones' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                <thead className="bg-[#2563eb] text-white uppercase text-[10px] tracking-wider font-extrabold select-none">
                  <tr>
                    <th className="px-3.5 py-2.5">Acciones</th>
                    <th className="px-3.5 py-2.5">Código</th>
                    <th className="px-3.5 py-2.5">Curso / Capacitación</th>
                    <th className="px-3.5 py-2.5">Carácter</th>
                    <th className="px-3.5 py-2.5">Duración</th>
                    <th className="px-3.5 py-2.5">Módulos</th>
                    <th className="px-3.5 py-2.5">Descripción de Formación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {INITIAL_TRAINING_COURSES.map((crs) => (
                    <tr key={crs.id} className="hover:bg-blue-50/40 transition">
                      <td className="px-3.5 py-2 font-medium">
                        <button
                          onClick={() => alert(`Abriendo temario y aula virtual para: ${crs.title}`)}
                          className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-600 hover:text-white transition flex items-center gap-1"
                        >
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>Ver Temario</span>
                        </button>
                      </td>
                      <td className="px-3.5 py-2 font-mono font-bold text-[#2563eb]">
                        {crs.code}
                      </td>
                      <td className="px-3.5 py-2 font-bold text-slate-900">{crs.title}</td>
                      <td className="px-3.5 py-2">
                        {crs.isMandatory ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            Obligatorio CNBV / PLD
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                            Optativo
                          </span>
                        )}
                      </td>
                      <td className="px-3.5 py-2 font-mono text-slate-700">{crs.durationHours} horas</td>
                      <td className="px-3.5 py-2 font-mono text-slate-700">{crs.totalModules} módulos</td>
                      <td className="px-3.5 py-2 text-slate-600 max-w-md truncate" title={crs.description}>
                        {crs.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Nueva Requisición */}
      {isNewReqOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-[#1d4ed8] to-[#2563eb] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-sm">
                <Shirt className="w-4 h-4 text-[#facc15]" />
                <span>Nueva Requisición de Recursos</span>
              </div>
              <button
                onClick={() => setIsNewReqOpen(false)}
                className="text-white hover:text-yellow-300 p-1 font-bold text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequisition} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Tipo de Solicitud
                </label>
                <select
                  value={reqType}
                  onChange={(e) => setReqType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#2563eb]"
                >
                  <option value="UNIFORME">Dotación de Uniforme (Camisa / Chaleco LanAhora)</option>
                  <option value="GAFETE">Gafete Institucional con Fotografía</option>
                  <option value="VACANTE_PERSONAL">Requisición de Vacante / Personal Foráneo</option>
                  <option value="PERMISO_VACACIONES">Permiso Laboral o Vacaciones</option>
                </select>
              </div>

              {reqType === 'UNIFORME' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1.5">Artículo</label>
                    <select
                      value={reqItem}
                      onChange={(e) => setReqItem(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#2563eb]"
                    >
                      <option value="CHALECO_CAMPO">Chaleco Institucional de Campo</option>
                      <option value="CAMISA_POLO">Camisa Polo Azul LanAhora</option>
                      <option value="KIT_COMPLETO">Kit Completo (Chaleco + 2 Polos)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1.5">Talla Solicitada</label>
                    <select
                      value={reqSize}
                      onChange={(e) => setReqSize(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#2563eb]"
                    >
                      <option value="CH">Chica (CH)</option>
                      <option value="M">Mediana (M)</option>
                      <option value="G">Grande (G)</option>
                      <option value="XG">Extra Grande (XG)</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Motivo o Justificación del Requerimiento
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Reposición por desgaste / Inicio de nuevo asesor de campo"
                  value={reqTitle}
                  onChange={(e) => setReqTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#2563eb]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Comentarios Adicionales
                </label>
                <textarea
                  rows={3}
                  placeholder="Detalles sobre entrega en sucursal o urgencia operativa..."
                  value={reqDesc}
                  onChange={(e) => setReqDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#2563eb]"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewReqOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#facc15] hover:bg-yellow-400 text-slate-950 font-black shadow-xs transition active:scale-95"
                >
                  Enviar Requisición
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
