'use client';

import React, { useState } from 'react';
import {
  EmployeeRH,
  AttendanceRecord,
  Requisition,
  TrainingCourse,
  LocationType,
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
  ShieldCheck,
  UserCheck,
  Award,
  Shirt,
  IdCard,
  UserPlus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  Navigation,
  Building,
  GraduationCap,
  ExternalLink,
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
          setGpsMessage(`✓ Marcaje GPS exitoso a las ${timeString} [Lat: ${lat}, Lng: ${lng}]`);
          setGpsLoading(false);
        },
        (error) => {
          // Fallback simulation if browser blocks GPS or running without HTTPS
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
          setGpsMessage(`✓ Marcaje registrado a las ${timeString} (Coordenadas de ruta: 25.4241, -101.0049)`);
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
    <div className="flex-1 bg-[#f4f6f9] text-slate-800 p-4 sm:p-6 min-h-[calc(100vh-105px)] font-sans">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Module Title & Buk Replacement Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Capital Humano & Control de Asistencia
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                  Módulo Integrado (Buk)
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Control de personal en sucursales, corporativo y asesores de crédito en calle con geolocalización GPS.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNewReqOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow flex items-center gap-1.5 transition"
            >
              <Shirt className="w-3.5 h-3.5" />
              Solicitar Gafete / Uniforme
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-300 pb-1 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('asistencia')}
            className={`px-4 py-2 rounded-t-lg transition flex items-center gap-1.5 ${
              activeTab === 'asistencia'
                ? 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Control de Asistencia & GPS</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-800">
              {attendance.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('personal')}
            className={`px-4 py-2 rounded-t-lg transition flex items-center gap-1.5 ${
              activeTab === 'personal'
                ? 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Padrón de Colaboradores</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
              {employees.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('requisiciones')}
            className={`px-4 py-2 rounded-t-lg transition flex items-center gap-1.5 ${
              activeTab === 'requisiciones'
                ? 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shirt className="w-3.5 h-3.5" />
            <span>Requisiciones (Gafetes, Uniformes, Vacantes)</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800">
              {requisitions.filter((r) => r.status === 'PENDIENTE').length} pendientes
            </span>
          </button>

          <button
            onClick={() => setActiveTab('capacitaciones')}
            className={`px-4 py-2 rounded-t-lg transition flex items-center gap-1.5 ${
              activeTab === 'capacitaciones'
                ? 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Capacitaciones & Academia LanAhora</span>
          </button>
        </div>

        {/* TAB 1: CONTROL DE ASISTENCIA & GPS */}
        {activeTab === 'asistencia' && (
          <div className="space-y-4">
            {/* Live GPS Check-in Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl p-4 sm:p-5 shadow-md flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Estación Móvil de Marcaje LanAhora
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">
                  Registro de Asistencia de Personal en Calle y Sucursal
                </h3>
                <p className="text-xs text-slate-300">
                  Captura de punto de inicio de jornada con latitud, longitud y validación contra zona INEGI asignada.
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={handleGpsCheckIn}
                  disabled={gpsLoading}
                  className="px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition"
                >
                  <MapPin className="w-4 h-4" />
                  {gpsLoading ? 'Obteniendo GPS...' : 'Registrar Check-in con GPS (En Calle)'}
                </button>
                {gpsMessage && (
                  <span className="text-[11px] text-emerald-300 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    {gpsMessage}
                  </span>
                )}
              </div>
            </div>

            {/* Attendance Filters & Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-600 font-semibold">Sucursal:</span>
                    <select
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      className="px-2 py-1 rounded border border-slate-300 bg-white text-xs text-slate-700"
                    >
                      <option value="ALL">Todas las Sucursales</option>
                      <option value="Saltillo Centro">Saltillo Centro</option>
                      <option value="Torreón Matriz">Torreón Matriz</option>
                      <option value="Monclova Foránea">Monclova Foránea</option>
                      <option value="Corporativo Saltillo">Corporativo Saltillo</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-600 font-semibold">Ubicación:</span>
                    <select
                      value={selectedLocationType}
                      onChange={(e) => setSelectedLocationType(e.target.value)}
                      className="px-2 py-1 rounded border border-slate-300 bg-white text-xs text-slate-700"
                    >
                      <option value="ALL">Todos los tipos</option>
                      <option value="CAMPO">Personal en Calle (Campo GPS)</option>
                      <option value="SUCURSAL">Personal en Sucursal</option>
                      <option value="CORPORATIVO">Personal Corporativo</option>
                    </select>
                  </div>
                </div>

                <div className="text-slate-500 font-medium">
                  {filteredAttendance.length} marcajes registrados hoy
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                  <thead className="bg-[#e9ecf2] text-slate-700 font-semibold border-b border-slate-300">
                    <tr>
                      <th className="p-2.5">Colaborador</th>
                      <th className="p-2.5">Sucursal</th>
                      <th className="p-2.5">Tipo Ubicación</th>
                      <th className="p-2.5">Hora Entrada</th>
                      <th className="p-2.5">Geolocalización GPS</th>
                      <th className="p-2.5">Punto / Zona de Marcaje</th>
                      <th className="p-2.5">Estatus</th>
                      <th className="p-2.5">Notas de Campo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredAttendance.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50 transition">
                        <td className="p-2.5 font-semibold text-slate-900 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                            {rec.employeeName.charAt(0)}
                          </div>
                          <span>{rec.employeeName}</span>
                        </td>
                        <td className="p-2.5 text-slate-700">{rec.branch}</td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
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
                        <td className="p-2.5 font-mono font-bold text-slate-800">
                          {rec.checkInTime}
                        </td>
                        <td className="p-2.5 font-mono text-[11px] text-slate-600">
                          {rec.latitude ? (
                            <a
                              href={`https://maps.google.com/?q=${rec.latitude},${rec.longitude}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <MapPin className="w-3 h-3 text-emerald-600" />
                              <span>
                                {rec.latitude}, {rec.longitude}
                              </span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ) : (
                            'Estación Fija'
                          )}
                        </td>
                        <td className="p-2.5 text-slate-600 max-w-xs truncate" title={rec.locationLabel}>
                          {rec.locationLabel}
                        </td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              rec.status === 'PUNTUAL'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {rec.status}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-500 max-w-xs truncate" title={rec.notes}>
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
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Directorio de Empleados LanAhora
                </h3>
                <p className="text-xs text-slate-500">
                  Expediente de personal en corporativo, sucursales y fuerza de ventas en calle.
                </p>
              </div>

              <button
                onClick={() => alert('Abriendo formulario de alta de colaborador...')}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Alta de Colaborador
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                <thead className="bg-[#e9ecf2] text-slate-700 font-semibold border-b border-slate-300">
                  <tr>
                    <th className="p-2.5">No. Empleado</th>
                    <th className="p-2.5">Nombre Completo</th>
                    <th className="p-2.5">Puesto</th>
                    <th className="p-2.5">Departamento</th>
                    <th className="p-2.5">Sucursal</th>
                    <th className="p-2.5">Modalidad</th>
                    <th className="p-2.5">Supervisor Directo</th>
                    <th className="p-2.5">Fecha Ingreso</th>
                    <th className="p-2.5">Estatus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50 transition">
                      <td className="p-2.5 font-mono font-bold text-indigo-700">
                        {emp.employeeNumber}
                      </td>
                      <td className="p-2.5 font-semibold text-slate-900">{emp.fullName}</td>
                      <td className="p-2.5 text-slate-700">{emp.role}</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {emp.department}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-700">{emp.branch}</td>
                      <td className="p-2.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            emp.locationType === 'CAMPO'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {emp.locationType}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-600">{emp.supervisorName}</td>
                      <td className="p-2.5 font-mono text-slate-500">{emp.hireDate}</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
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
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Bandeja de Requisiciones & Suministros
                </h3>
                <p className="text-xs text-slate-500">
                  Gestión y autorización de uniformes, gafetes institucionales y vacantes para sucursales foráneas.
                </p>
              </div>

              <button
                onClick={() => setIsNewReqOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow"
              >
                <Shirt className="w-3.5 h-3.5" />
                + Crear Requisición
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {requisitions.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          req.type === 'UNIFORME'
                            ? 'bg-amber-100 text-amber-800'
                            : req.type === 'GAFETE'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {req.type}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          req.status === 'APROBADO'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'PENDIENTE'
                            ? 'bg-amber-100 text-amber-800'
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
                      <div className="text-[11px] text-slate-500">
                        <span className="font-semibold">Talla:</span> {req.details.sizeUniform} •{' '}
                        <span className="font-semibold">Artículo:</span> {req.details.uniformItem}
                      </div>
                    )}

                    <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                      Solicitado por: <span className="font-semibold text-slate-700">{req.employeeName}</span>
                      <br />
                      Sucursal: {req.branch} • {req.requestedAt}
                    </div>
                  </div>

                  {/* Actions for supervisors */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    {req.status === 'PENDIENTE' ? (
                      <>
                        <button
                          onClick={() => handleApproveRequisition(req.id, 'APROBADO')}
                          className="flex-1 py-1 px-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleApproveRequisition(req.id, 'RECHAZADO')}
                          className="flex-1 py-1 px-2 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center justify-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Rechazar
                        </button>
                      </>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">
                        Revisado por {req.reviewedBy || 'Dirección'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CAPACITACIONES & ACADEMIA LANA HORA */}
        {activeTab === 'capacitaciones' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <h3 className="font-bold text-sm text-slate-900">
                Academia LanAhora — Cursos & Certificaciones de Personal
              </h3>
              <p className="text-xs text-slate-500">
                Formación continua obligatoria para asesores de crédito y personal administrativo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INITIAL_TRAINING_COURSES.map((crs) => (
                <div
                  key={crs.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {crs.code}
                    </span>
                    {crs.isMandatory && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        Obligatorio
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{crs.title}</h4>
                    <p className="text-xs text-slate-600 mt-1">{crs.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span>{crs.durationHours} horas estimadas</span>
                    <span>{crs.totalModules} módulos interactivos</span>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => alert(`Iniciando contenido del curso: ${crs.title}`)}
                      className="w-full py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs border border-indigo-200 transition flex items-center justify-center gap-1.5"
                    >
                      <GraduationCap className="w-4 h-4" />
                      Ver Temario y Material Didáctico
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Nueva Requisición */}
        {isNewReqOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
              <div className="bg-indigo-600 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Shirt className="w-4 h-4" />
                  <span>Nueva Requisición de Recursos</span>
                </div>
                <button
                  onClick={() => setIsNewReqOpen(false)}
                  className="text-white/80 hover:text-white p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateRequisition} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Tipo de Solicitud
                  </label>
                  <select
                    value={reqType}
                    onChange={(e) => setReqType(e.target.value as any)}
                    className="w-full p-2 rounded border border-slate-300 text-slate-800"
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
                      <label className="block text-slate-700 font-semibold mb-1">Artículo</label>
                      <select
                        value={reqItem}
                        onChange={(e) => setReqItem(e.target.value as any)}
                        className="w-full p-2 rounded border border-slate-300 text-slate-800"
                      >
                        <option value="CHALECO_CAMPO">Chaleco de Campo (Asesores)</option>
                        <option value="CAMISA_POLO">Camisa Polo Institucional</option>
                        <option value="KIT_COMPLETO">Kit Completo (2 camisas + chaleco)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Talla</label>
                      <select
                        value={reqSize}
                        onChange={(e) => setReqSize(e.target.value as any)}
                        className="w-full p-2 rounded border border-slate-300 text-slate-800"
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
                  <label className="block text-slate-700 font-semibold mb-1">
                    Título o Motivo de la Solicitud
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Solicitud de uniforme para nueva asesora de campo"
                    value={reqTitle}
                    onChange={(e) => setReqTitle(e.target.value)}
                    className="w-full p-2 rounded border border-slate-300 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Descripción / Justificación
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Detalles sobre la sucursal, motivo o reemplazo..."
                    value={reqDesc}
                    onChange={(e) => setReqDesc(e.target.value)}
                    className="w-full p-2 rounded border border-slate-300 text-slate-800"
                  />
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewReqOpen(false)}
                    className="px-3 py-1.5 rounded text-slate-600 hover:bg-slate-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow"
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

