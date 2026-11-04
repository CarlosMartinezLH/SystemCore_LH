'use client';

import React, { useState } from 'react';
import {
  EmployeeRH,
  AttendanceRecord,
  Requisition,
  TrainingCourse,
} from '@/types/rh';
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
} from 'lucide-react';

export default function RHView() {
  const [activeTab, setActiveTab] = useState<'asistencia' | 'personal' | 'requisiciones' | 'capacitaciones'>('asistencia');
  const [employees, setEmployees] = useState<EmployeeRH[]>(INITIAL_EMPLOYEES);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [requisitions, setRequisitions] = useState<Requisition[]>(INITIAL_REQUISITIONS);

  // Filters
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [selectedLocationType, setSelectedLocationType] = useState('ALL');

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

  // Quick punch with browser geolocation
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

  // Requisition submit
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

  // Approve requisition
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

  const filteredAttendance = attendance.filter((a) => {
    const matchBranch = selectedBranch === 'ALL' || a.branch === selectedBranch;
    const matchLoc = selectedLocationType === 'ALL' || a.locationType === selectedLocationType;
    return matchBranch && matchLoc;
  });

  return (
    <div className="flex-1 bg-[#0c101c] text-slate-100 p-4 sm:p-6 min-h-[calc(100vh-105px)] font-sans">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Module Title & Buk Replacement Header (Estilo Unificado LanAhora) */}
        <div className="bg-[#131a2b] rounded-2xl border border-slate-800 p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-black text-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
              <UserCheck className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Capital Humano & Control de Asistencia
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Módulo Buk Unificado
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Control de asistencia de personal en sucursales, corporativo y asesores en calle con geolocalización GPS.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNewReqOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-2 transition active:scale-95"
            >
              <Shirt className="w-4 h-4" />
              <span>Solicitar Gafete / Uniforme</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation (Homologado con Header y Tabs de CRM) */}
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-1 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('asistencia')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 border ${
              activeTab === 'asistencia'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold shadow-xs'
                : 'text-slate-400 hover:text-white border-transparent hover:bg-slate-800/50'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Control de Asistencia & GPS</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-amber-300 font-mono">
              {attendance.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('personal')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 border ${
              activeTab === 'personal'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold shadow-xs'
                : 'text-slate-400 hover:text-white border-transparent hover:bg-slate-800/50'
            }`}
          >
            <Building className="w-4 h-4 text-amber-400" />
            <span>Padrón de Colaboradores</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
              {employees.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('requisiciones')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 border ${
              activeTab === 'requisiciones'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold shadow-xs'
                : 'text-slate-400 hover:text-white border-transparent hover:bg-slate-800/50'
            }`}
          >
            <Shirt className="w-4 h-4 text-amber-400" />
            <span>Requisiciones (Gafetes & Uniformes)</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-mono">
              {requisitions.filter((r) => r.status === 'PENDIENTE').length} pendientes
            </span>
          </button>

          <button
            onClick={() => setActiveTab('capacitaciones')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 border ${
              activeTab === 'capacitaciones'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold shadow-xs'
                : 'text-slate-400 hover:text-white border-transparent hover:bg-slate-800/50'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-amber-400" />
            <span>Capacitaciones & Academia</span>
          </button>
        </div>

        {/* TAB 1: CONTROL DE ASISTENCIA & GPS */}
        {activeTab === 'asistencia' && (
          <div className="space-y-4">
            {/* Live GPS Check-in Banner */}
            <div className="bg-[#131a2b] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Estación Satelital de Marcaje LanAhora
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">
                  Registro de Asistencia de Personal en Calle y Sucursal
                </h3>
                <p className="text-xs text-slate-400">
                  Captura de punto de inicio de jornada con latitud, longitud y validación contra zona INEGI asignada.
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={handleGpsCheckIn}
                  disabled={gpsLoading}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition"
                >
                  <MapPin className="w-4 h-4" />
                  {gpsLoading ? 'Obteniendo GPS...' : 'Registrar Check-in con GPS (En Calle)'}
                </button>
                {gpsMessage && (
                  <span className="text-[11px] text-emerald-300 font-mono bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800">
                    {gpsMessage}
                  </span>
                )}
              </div>
            </div>

            {/* Attendance Filters & Table */}
            <div className="bg-[#131a2b] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="p-3.5 bg-[#172138] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-semibold">Sucursal:</span>
                    <select
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-[#0c101c] text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
                    >
                      <option value="ALL">Todas las Sucursales</option>
                      <option value="Saltillo Centro">Saltillo Centro</option>
                      <option value="Torreón Matriz">Torreón Matriz</option>
                      <option value="Monclova Foránea">Monclova Foránea</option>
                      <option value="Corporativo Saltillo">Corporativo Saltillo</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-semibold">Ubicación:</span>
                    <select
                      value={selectedLocationType}
                      onChange={(e) => setSelectedLocationType(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-[#0c101c] text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
                    >
                      <option value="ALL">Todos los tipos</option>
                      <option value="CAMPO">Personal en Calle (Campo GPS)</option>
                      <option value="SUCURSAL">Personal en Sucursal</option>
                      <option value="CORPORATIVO">Personal Corporativo</option>
                    </select>
                  </div>
                </div>

                <div className="text-slate-400 font-medium">
                  <span className="font-bold text-amber-400 font-mono">{filteredAttendance.length}</span> marcajes registrados hoy
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                  <thead className="bg-[#172138] text-slate-300 font-bold border-b border-slate-800 text-[11px] uppercase tracking-wider select-none">
                    <tr>
                      <th className="p-3">Colaborador</th>
                      <th className="p-3">Sucursal</th>
                      <th className="p-3">Tipo Ubicación</th>
                      <th className="p-3">Hora Entrada</th>
                      <th className="p-3">Geolocalización GPS</th>
                      <th className="p-3">Punto / Zona de Marcaje</th>
                      <th className="p-3">Estatus</th>
                      <th className="p-3">Notas de Campo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredAttendance.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-800/50 transition">
                        <td className="p-3 font-semibold text-white flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow">
                            {rec.employeeName.charAt(0)}
                          </div>
                          <span>{rec.employeeName}</span>
                        </td>
                        <td className="p-3 text-slate-300">{rec.branch}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              rec.locationType === 'CAMPO'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : rec.locationType === 'CORPORATIVO'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}
                          >
                            {rec.locationType === 'CAMPO' ? '📍 CAMPO (CALLE)' : rec.locationType}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-amber-400">
                          {rec.checkInTime}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-300">
                          {rec.latitude ? (
                            <a
                              href={`https://maps.google.com/?q=${rec.latitude},${rec.longitude}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-amber-400 hover:underline flex items-center gap-1.5"
                            >
                              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                              <span>
                                {rec.latitude}, {rec.longitude}
                              </span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ) : (
                            <span className="text-slate-500">Estación Fija</span>
                          )}
                        </td>
                        <td className="p-3 text-slate-300 max-w-xs truncate" title={rec.locationLabel}>
                          {rec.locationLabel}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              rec.status === 'PUNTUAL'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {rec.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 max-w-xs truncate" title={rec.notes}>
                          {rec.notes || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PADRÓN DE COLABORADORES */}
        {activeTab === 'personal' && (
          <div className="bg-[#131a2b] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 bg-[#172138] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-white">
                  Directorio de Empleados LanAhora
                </h3>
                <p className="text-xs text-slate-400">
                  Expediente de personal en corporativo, sucursales y fuerza de ventas en calle.
                </p>
              </div>

              <button
                onClick={() => alert('Abriendo formulario de alta de colaborador...')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Alta de Colaborador
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                <thead className="bg-[#172138] text-slate-300 font-bold border-b border-slate-800 text-[11px] uppercase tracking-wider select-none">
                  <tr>
                    <th className="p-3">No. Empleado</th>
                    <th className="p-3">Nombre Completo</th>
                    <th className="p-3">Puesto</th>
                    <th className="p-3">Departamento</th>
                    <th className="p-3">Sucursal</th>
                    <th className="p-3">Modalidad</th>
                    <th className="p-3">Supervisor Directo</th>
                    <th className="p-3">Fecha Ingreso</th>
                    <th className="p-3">Estatus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-800/50 transition">
                      <td className="p-3 font-mono font-bold text-amber-400">
                        {emp.employeeNumber}
                      </td>
                      <td className="p-3 font-semibold text-white">{emp.fullName}</td>
                      <td className="p-3 text-slate-300">{emp.role}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {emp.department}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">{emp.branch}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            emp.locationType === 'CAMPO'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {emp.locationType}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{emp.supervisorName}</td>
                      <td className="p-3 font-mono text-slate-400">{emp.hireDate}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {emp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: REQUISICIONES (GAFETES, UNIFORMES, VACANTES) */}
        {activeTab === 'requisiciones' && (
          <div className="space-y-4">
            <div className="bg-[#131a2b] rounded-2xl border border-slate-800 p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
              <div>
                <h3 className="font-bold text-sm text-white">
                  Bandeja de Requisiciones & Suministros
                </h3>
                <p className="text-xs text-slate-400">
                  Gestión y autorización de uniformes, gafetes institucionales y vacantes para sucursales foráneas.
                </p>
              </div>

              <button
                onClick={() => setIsNewReqOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                Crear Requisición
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {requisitions.map((req) => (
                <div
                  key={req.id}
                  className="bg-[#131a2b] rounded-2xl border border-slate-800 p-5 shadow-lg flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          req.type === 'UNIFORME'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : req.type === 'GAFETE'
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        }`}
                      >
                        {req.type}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          req.status === 'APROBADO'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : req.status === 'PENDIENTE'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-white line-clamp-2">
                      {req.title}
                    </h4>
                    <p className="text-xs text-slate-400">{req.description}</p>

                    {req.details?.sizeUniform && (
                      <div className="text-[11px] text-slate-300 pt-1">
                        <span className="font-semibold text-amber-400">Talla:</span> {req.details.sizeUniform} •{' '}
                        <span className="font-semibold text-amber-400">Artículo:</span> {req.details.uniformItem}
                      </div>
                    )}

                    <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 space-y-0.5">
                      <div>Solicitado por: <span className="font-semibold text-slate-200">{req.employeeName}</span></div>
                      <div className="text-[10px] text-slate-500">{req.branch} • {req.requestedAt}</div>
                    </div>
                  </div>

                  {/* Actions for supervisors */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                    {req.status === 'PENDIENTE' ? (
                      <>
                        <button
                          onClick={() => handleApproveRequisition(req.id, 'APROBADO')}
                          className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1 shadow transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleApproveRequisition(req.id, 'RECHAZADO')}
                          className="flex-1 py-1.5 px-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-1 transition"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Rechazar
                        </button>
                      </>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">
                        Revisado por {req.reviewedBy || 'Dirección'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CAPACITACIONES & ACADEMIA LANAHORA */}
        {activeTab === 'capacitaciones' && (
          <div className="space-y-4">
            <div className="bg-[#131a2b] rounded-2xl border border-slate-800 p-5 shadow-xl">
              <h3 className="font-bold text-sm text-white">
                Academia LanAhora — Cursos & Certificaciones de Personal
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Formación continua obligatoria para asesores de crédito y personal administrativo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INITIAL_TRAINING_COURSES.map((crs) => (
                <div
                  key={crs.id}
                  className="bg-[#131a2b] rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3.5 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                        {crs.code}
                      </span>
                      {crs.isMandatory && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          Obligatorio
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-white">{crs.title}</h4>
                    <p className="text-xs text-slate-400">{crs.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                      <span>{crs.durationHours} horas estimadas</span>
                      <span>{crs.totalModules} módulos interactivos</span>
                    </div>

                    <button
                      onClick={() => alert(`Iniciando contenido del curso: ${crs.title}`)}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs border border-slate-700 transition flex items-center justify-center gap-2"
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>Ver Temario y Material Didáctico</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Nueva Requisición */}
        {isNewReqOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-[#131a2b] rounded-2xl shadow-2xl border border-slate-700 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-sm">
                  <Shirt className="w-4 h-4" />
                  <span>Nueva Requisición de Recursos</span>
                </div>
                <button
                  onClick={() => setIsNewReqOpen(false)}
                  className="text-slate-950 hover:opacity-75 p-1 font-bold text-base"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateRequisition} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Tipo de Solicitud
                  </label>
                  <select
                    value={reqType}
                    onChange={(e) => setReqType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#0c101c] text-white focus:outline-none focus:border-amber-500"
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
                      <label className="block text-slate-300 font-semibold mb-1.5">Artículo</label>
                      <select
                        value={reqItem}
                        onChange={(e) => setReqItem(e.target.value as any)}
                        className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#0c101c] text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="CHALECO_CAMPO">Chaleco de Campo (Asesores)</option>
                        <option value="CAMISA_POLO">Camisa Polo Institucional</option>
                        <option value="KIT_COMPLETO">Kit Completo (2 camisas + chaleco)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1.5">Talla</label>
                      <select
                        value={reqSize}
                        onChange={(e) => setReqSize(e.target.value as any)}
                        className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#0c101c] text-white focus:outline-none focus:border-amber-500"
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
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Título o Motivo de la Solicitud
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Solicitud de uniforme para nueva asesora de campo"
                    value={reqTitle}
                    onChange={(e) => setReqTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#0c101c] text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Descripción / Justificación
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Detalles sobre la sucursal, motivo o reemplazo..."
                    value={reqDesc}
                    onChange={(e) => setReqDesc(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#0c101c] text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewReqOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow"
                  >
                    Enviar Requisición
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
