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

  const filteredAttendance = attendance.filter((a) => {
    const matchBranch = selectedBranch === 'ALL' || a.branch === selectedBranch;
    const matchLoc = selectedLocationType === 'ALL' || a.locationType === selectedLocationType;
    return matchBranch && matchLoc;
  });

  return (
    <div className="flex-1 bg-[#f0f4fa] text-slate-800 p-4 sm:p-6 min-h-[calc(100vh-105px)] font-sans">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Module Title Banner in LanAhora Royal Blue */}
        <div className="bg-gradient-to-r from-[#1d4ed8] to-[#2563eb] text-white rounded-3xl p-6 shadow-lg flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#facc15] text-slate-950 font-black text-xl flex items-center justify-center shadow-md">
              <UserCheck className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">
                  Capital Humano & Control de Asistencia
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#facc15] text-slate-950">
                  Módulo Buk Integrado
                </span>
              </div>
              <p className="text-xs text-yellow-200 mt-0.5 font-medium">
                Control de asistencia de personal en sucursales, corporativo y asesores en calle con geolocalización GPS.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNewReqOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#facc15] hover:bg-yellow-400 text-slate-950 font-black text-xs shadow-md flex items-center gap-2 transition active:scale-95"
            >
              <Shirt className="w-4 h-4" />
              <span>Solicitar Gafete / Uniforme</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-blue-200 pb-1 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('asistencia')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 border ${
              activeTab === 'asistencia'
                ? 'bg-[#2563eb] text-white border-[#2563eb] font-extrabold shadow-sm'
                : 'text-slate-600 hover:text-blue-900 border-transparent hover:bg-white'
            }`}
          >
            <Clock className="w-4 h-4 text-[#facc15]" />
            <span>Control de Asistencia & GPS</span>
            <span className="ml-1 px-2 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-mono">
              {attendance.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('personal')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 border ${
              activeTab === 'personal'
                ? 'bg-[#2563eb] text-white border-[#2563eb] font-extrabold shadow-sm'
                : 'text-slate-600 hover:text-blue-900 border-transparent hover:bg-white'
            }`}
          >
            <Building className="w-4 h-4 text-[#facc15]" />
            <span>Padrón de Colaboradores</span>
            <span className="ml-1 px-2 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-mono">
              {employees.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('requisiciones')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 border ${
              activeTab === 'requisiciones'
                ? 'bg-[#2563eb] text-white border-[#2563eb] font-extrabold shadow-sm'
                : 'text-slate-600 hover:text-blue-900 border-transparent hover:bg-white'
            }`}
          >
            <Shirt className="w-4 h-4 text-[#facc15]" />
            <span>Requisiciones (Gafetes & Uniformes)</span>
            <span className="ml-1 px-2 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-mono font-bold">
              {requisitions.filter((r) => r.status === 'PENDIENTE').length} pendientes
            </span>
          </button>

          <button
            onClick={() => setActiveTab('capacitaciones')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 border ${
              activeTab === 'capacitaciones'
                ? 'bg-[#2563eb] text-white border-[#2563eb] font-extrabold shadow-sm'
                : 'text-slate-600 hover:text-blue-900 border-transparent hover:bg-white'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-[#facc15]" />
            <span>Capacitaciones & Academia</span>
          </button>
        </div>

        {/* TAB 1: ASISTENCIA */}
        {activeTab === 'asistencia' && (
          <div className="space-y-4">
            {/* GPS Punch Card */}
            <div className="bg-white border border-blue-100 rounded-3xl p-6 shadow-md flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-[#2563eb] animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-wider text-[#2563eb]">
                    Estación Satelital de Marcaje LanAhora
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900">
                  Registro de Asistencia de Personal en Calle y Sucursal
                </h3>
                <p className="text-xs text-slate-500">
                  Captura de punto de inicio de jornada con latitud, longitud y validación contra zona INEGI asignada.
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={handleGpsCheckIn}
                  disabled={gpsLoading}
                  className="px-4 py-2.5 rounded-xl bg-[#22c55e] hover:bg-emerald-600 text-white font-black text-xs flex items-center gap-2 shadow-md transition active:scale-95"
                >
                  <MapPin className="w-4 h-4" />
                  {gpsLoading ? 'Obteniendo GPS...' : 'Registrar Check-in con GPS (En Calle)'}
                </button>
                {gpsMessage && (
                  <span className="text-[11px] text-emerald-800 font-mono bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-300 font-bold">
                    {gpsMessage}
                  </span>
                )}
              </div>
            </div>

            {/* Attendance Table */}
            <div className="bg-white rounded-3xl border border-blue-100 overflow-hidden shadow-md">
              <div className="p-4 bg-blue-50/60 border-b border-blue-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 font-bold">Sucursal:</span>
                    <select
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-[#2563eb] font-semibold"
                    >
                      <option value="ALL">Todas las Sucursales</option>
                      <option value="Saltillo Centro">Saltillo Centro</option>
                      <option value="Torreón Matriz">Torreón Matriz</option>
                      <option value="Monclova Foránea">Monclova Foránea</option>
                      <option value="Corporativo Saltillo">Corporativo Saltillo</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 font-bold">Ubicación:</span>
                    <select
                      value={selectedLocationType}
                      onChange={(e) => setSelectedLocationType(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-[#2563eb] font-semibold"
                    >
                      <option value="ALL">Todos los tipos</option>
                      <option value="CAMPO">Personal en Calle (Campo GPS)</option>
                      <option value="SUCURSAL">Personal en Sucursal</option>
                      <option value="CORPORATIVO">Personal Corporativo</option>
                    </select>
                  </div>
                </div>

                <div className="text-slate-600 font-medium">
                  <span className="font-black text-[#2563eb] font-mono">{filteredAttendance.length}</span> marcajes registrados hoy
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                  <thead className="bg-[#1d4ed8] text-white font-bold border-b border-blue-700 text-[11px] uppercase tracking-wider select-none">
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
                  <tbody className="divide-y divide-slate-100">
                    {filteredAttendance.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-semibold text-slate-900 flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#2563eb] text-white font-black text-xs flex items-center justify-center shadow-xs">
                            {rec.employeeName.charAt(0)}
                          </div>
                          <span>{rec.employeeName}</span>
                        </td>
                        <td className="p-3 text-slate-700">{rec.branch}</td>
                        <td className="p-3">
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
                        <td className="p-3 font-mono font-bold text-[#2563eb]">
                          {rec.checkInTime}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-600">
                          {rec.latitude ? (
                            <a
                              href={`https://maps.google.com/?q=${rec.latitude},${rec.longitude}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#2563eb] hover:underline flex items-center gap-1.5 font-bold"
                            >
                              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                              <span>
                                {rec.latitude}, {rec.longitude}
                              </span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ) : (
                            <span className="text-slate-400">Estación Fija</span>
                          )}
                        </td>
                        <td className="p-3 text-slate-700 max-w-xs truncate" title={rec.locationLabel}>
                          {rec.locationLabel}
                        </td>
                        <td className="p-3">
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
                        <td className="p-3 text-slate-500 max-w-xs truncate" title={rec.notes}>
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

        {/* TAB 2: PADRÓN */}
        {activeTab === 'personal' && (
          <div className="bg-white rounded-3xl border border-blue-100 overflow-hidden shadow-md">
            <div className="p-4 bg-blue-50/60 border-b border-blue-100 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-blue-950">
                  Directorio de Empleados LanAhora
                </h3>
                <p className="text-xs text-slate-500">
                  Expediente de personal en corporativo, sucursales y fuerza de ventas en calle.
                </p>
              </div>

              <button
                onClick={() => alert('Abriendo formulario de alta...')}
                className="px-3.5 py-1.5 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Alta de Colaborador
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                <thead className="bg-[#1d4ed8] text-white font-bold border-b border-blue-700 text-[11px] uppercase tracking-wider select-none">
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
                <tbody className="divide-y divide-slate-100">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-[#2563eb]">
                        {emp.employeeNumber}
                      </td>
                      <td className="p-3 font-semibold text-slate-900">{emp.fullName}</td>
                      <td className="p-3 text-slate-700">{emp.role}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                          {emp.department}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700">{emp.branch}</td>
                      <td className="p-3">
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
                      <td className="p-3 text-slate-600">{emp.supervisorName}</td>
                      <td className="p-3 font-mono text-slate-500">{emp.hireDate}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
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

        {/* TAB 3: REQUISICIONES */}
        {activeTab === 'requisiciones' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-blue-100 p-5 flex flex-wrap items-center justify-between gap-3 shadow-md">
              <div>
                <h3 className="font-bold text-sm text-blue-950">
                  Bandeja de Requisiciones & Suministros
                </h3>
                <p className="text-xs text-slate-500">
                  Gestión y autorización de uniformes, gafetes institucionales y vacantes para sucursales foráneas.
                </p>
              </div>

              <button
                onClick={() => setIsNewReqOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#facc15] hover:bg-yellow-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" />
                Crear Requisición
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {requisitions.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-3xl border border-blue-100 p-5 shadow-md flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
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
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 line-clamp-2">
                      {req.title}
                    </h4>
                    <p className="text-xs text-slate-600">{req.description}</p>

                    {req.details?.sizeUniform && (
                      <div className="text-[11px] text-slate-700 pt-1">
                        <span className="font-bold text-[#2563eb]">Talla:</span> {req.details.sizeUniform} •{' '}
                        <span className="font-bold text-[#2563eb]">Artículo:</span> {req.details.uniformItem}
                      </div>
                    )}

                    <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 space-y-0.5">
                      <div>Solicitado por: <span className="font-bold text-slate-800">{req.employeeName}</span></div>
                      <div className="text-[10px] text-slate-400">{req.branch} • {req.requestedAt}</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    {req.status === 'PENDIENTE' ? (
                      <>
                        <button
                          onClick={() => handleApproveRequisition(req.id, 'APROBADO')}
                          className="flex-1 py-1.5 px-2.5 rounded-xl bg-[#22c55e] hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1 shadow transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleApproveRequisition(req.id, 'RECHAZADO')}
                          className="flex-1 py-1.5 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center justify-center gap-1 transition"
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

        {/* TAB 4: CAPACITACIONES */}
        {activeTab === 'capacitaciones' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-blue-100 p-6 shadow-md">
              <h3 className="font-bold text-sm text-blue-950">
                Academia LanAhora — Cursos & Certificaciones de Personal
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Formación continua obligatoria para asesores de crédito y personal administrativo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INITIAL_TRAINING_COURSES.map((crs) => (
                <div
                  key={crs.id}
                  className="bg-white rounded-3xl border border-blue-100 p-6 shadow-md space-y-3.5 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2563eb] border border-blue-200">
                        {crs.code}
                      </span>
                      {crs.isMandatory && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          Obligatorio
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-slate-900">{crs.title}</h4>
                    <p className="text-xs text-slate-600">{crs.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span>{crs.durationHours} horas</span>
                      <span>{crs.totalModules} módulos</span>
                    </div>

                    <button
                      onClick={() => alert(`Temario del curso: ${crs.title}`)}
                      className="w-full py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#2563eb] font-bold text-xs border border-blue-200 transition flex items-center justify-center gap-2"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl shadow-2xl border border-blue-100 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
              <div className="bg-gradient-to-r from-[#1d4ed8] to-[#2563eb] text-white p-5 flex items-center justify-between">
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

              <form onSubmit={handleCreateRequisition} className="p-6 space-y-4 text-xs">
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
                        <option value="CHALECO_CAMPO">Chaleco de Campo (Asesores)</option>
                        <option value="CAMISA_POLO">Camisa Polo Institucional</option>
                        <option value="KIT_COMPLETO">Kit Completo (2 camisas + chaleco)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1.5">Talla</label>
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
                    Título o Motivo de la Solicitud
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Solicitud de uniforme para nueva asesora de campo"
                    value={reqTitle}
                    onChange={(e) => setReqTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#2563eb]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    Descripción / Justificación
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Detalles sobre la sucursal, motivo o reemplazo..."
                    value={reqDesc}
                    onChange={(e) => setReqDesc(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#2563eb]"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewReqOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#facc15] hover:bg-yellow-400 text-slate-950 font-black shadow"
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
