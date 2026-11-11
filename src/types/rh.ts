export type LocationType = 'SUCURSAL' | 'CORPORATIVO' | 'CAMPO';

export interface EmployeeRH {
  id: string;
  employeeNumber: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  department: 'COMERCIAL' | 'OPERACIONES' | 'ADMINISTRACION' | 'MESA_CREDITO' | 'DIRECCION';
  branch: string; // ej. Saltillo Centro, Torreón, Monclova, etc.
  locationType: LocationType;
  hireDate: string;
  status: 'ACTIVO' | 'INACTIVO' | 'VACACIONES' | 'INCAPACIDAD';
  avatarUrl?: string;
  supervisorName: string;
  rfc?: string;
  curp?: string;
  nss?: string;
  salarioBaseMensual?: number;
  tipoContrato?: 'INDETERMINADO' | 'DETERMINADO' | 'PRUEBA';
}

export type AttendanceStatus = 'PUNTUAL' | 'RETARDO' | 'FALTA' | 'JUSTIFICADA';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  branch: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  locationType: LocationType;
  latitude?: number;
  longitude?: number;
  accuracyMeters?: number;
  locationLabel?: string;
  status: AttendanceStatus;
  notes?: string;
}

export type RequisitionType = 'UNIFORME' | 'GAFETE' | 'VACANTE_PERSONAL' | 'PERMISO_VACACIONES';
export type RequisitionStatus = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'ENTREGADO';

export interface Requisition {
  id: string;
  employeeId: string;
  employeeName: string;
  branch: string;
  type: RequisitionType;
  title: string;
  description: string;
  details?: {
    sizeUniform?: 'CH' | 'M' | 'G' | 'XG';
    uniformItem?: 'CAMISA_POLO' | 'CHALECO_CAMPO' | 'KIT_COMPLETO';
    badgeReason?: 'NUEVO_INGRESO' | 'EXTRAVIO' | 'DETERIORO';
    badgePhotoUrl?: string;
    vacantTitle?: string;
    vacantHeadcount?: number;
    leaveStartDate?: string;
    leaveEndDate?: string;
  };
  status: RequisitionStatus;
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewerNotes?: string;
}

export interface TrainingCourse {
  id: string;
  code: string;
  title: string;
  durationHours: number;
  isMandatory: boolean;
  category: 'VENTAS_PROSPECCION' | 'CUMPLIMIENTO_PLD' | 'OPERACIONES_CREDITO' | 'INDUCCION';
  description: string;
  totalModules: number;
}

export interface EmployeeProgress {
  courseId: string;
  courseTitle: string;
  completedModules: number;
  totalModules: number;
  percentage: number;
  score?: number;
  status: 'EN_PROGRESO' | 'COMPLETADO' | 'NO_INICIADO';
  certificateUrl?: string;
}

// ==============================================================================
// BUK INTEGRATION MODULES: VACACIONES, NÓMINA, OKRS, CLIMA LABORAL
// ==============================================================================

export interface VacationBalance {
  employeeId: string;
  employeeName: string;
  antiguedadAnios: number;
  diasPorLey: number; // Vacaciones Dignas México
  diasTomados: number;
  diasPendientesAprobacion: number;
  diasDisponibles: number;
  primaVacacionalRate: number; // 25% oficial
  periodoVigencia: string;
}

export type LeaveType = 'VACACIONES' | 'PERMISO_CON_GOCE' | 'PERMISO_SIN_GOCE' | 'INCAPACIDAD_IMSS' | 'PATERNIDAD_MATERNIDAD';
export type LeaveStatus = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';

export interface VacationRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  role: string;
  branch: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  leaveType: LeaveType;
  reason: string;
  status: LeaveStatus;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  role: string;
  branch: string;
  periodo: string; // Ej. "1a Quincena Noviembre 2026"
  sueldoBaseQuincenal: number;
  bonoColocacionVales: number;
  comisionCobranza: number;
  bonoPuntualidad: number;
  percepcionesTotales: number;
  deduccionImss: number;
  deduccionIsr: number;
  otrasDeducciones: number;
  deduccionesTotales: number;
  netoPagar: number;
  estatus: 'TIMBRADO' | 'DISPERSADO_STP' | 'EN_REVISION';
  folioFiscal?: string;
  fechaPago: string;
}

export type GoalCategory = 'COLOCACION_VALES' | 'RECUPERACION_CARTERA' | 'PROSPECCION_NUEVAS_DV' | 'CALIDAD_CARTERA';

export interface PerformanceGoal {
  id: string;
  employeeId: string;
  employeeName: string;
  title: string;
  category: GoalCategory;
  targetValue: number;
  currentValue: number;
  unit: string; // "$ MXN", "DV", "%"
  weightPercentage: number;
  quarter: string; // "Q4 2026"
  status: 'ALCANZADA' | 'EN_CAMINO' | 'EN_RIESGO';
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  periodo: string;
  calificacionGeneral: number; // 1.0 a 5.0
  potencial: 'ALTO' | 'MEDIO' | 'EN_DESARROLLO';
  desempeno: 'SOBRESALIENTE' | 'ESPERADO' | 'MEJORABLE';
  nineBoxGridLabel: string; // Ej. "Estrella (Alto Desempeño / Alto Potencial)"
  fortalezas: string[];
  areasOportunidad: string[];
  evaluadorNombre: string;
}

export interface BukKudo {
  id: string;
  senderName: string;
  senderRole: string;
  receiverName: string;
  receiverRole: string;
  badge: 'COLABORACION' | 'EXCELENCIA' | 'LIDERAZGO' | 'CLIENTE_PRIMERO' | 'INNOVACION';
  message: string;
  reactionsCount: number;
  createdAt: string;
}
