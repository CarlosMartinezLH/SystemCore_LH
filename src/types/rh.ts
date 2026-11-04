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
  locationLabel?: string; // ej. "Sector Comercial Centro" o "Sucursal Saltillo Matriz"
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

