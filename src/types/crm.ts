export type StageId = 
  | 'contacto'
  | 'consulta_buro'
  | 'solicitud_credito'
  | 'autorizacion_comercial'
  | 'mesa_credito'
  | 'legales'
  | 'perdido';

export interface StageInfo {
  id: StageId;
  name: string;
  order: number;
  color: string;
}

export type OriginType =
  | 'COORDINADOR DE NEGOCIOS'
  | 'DISTRIBUIDOR'
  | 'CAMBACEO'
  | 'TELEMARKETING'
  | 'COMERCIOS'
  | 'PLANTON'
  | 'RECONSULTA'
  | 'OTRO';

export type DistributorProfile =
  | 'D-AAA'
  | 'D-AA'
  | 'D-A'
  | 'E-AAA'
  | 'E-AA'
  | 'E-A'
  | 'SIN_ASIGNAR';

export type BureauResult =
  | 'NO_CONSULTADO'
  | 'BUENO'
  | 'REGULAR'
  | 'MALO'
  | 'RECHAZO';

export type CurpStatus =
  | 'NO_EVALUADO'
  | 'VALIDO'
  | 'NO_VALIDO';

export type DocumentType = 'PDF' | 'FOTO';

export type DocumentStatus = 'PENDIENTE' | 'CARGADO' | 'VALIDADO' | 'RECHAZADO';

export interface RequiredDocument {
  id: string;
  financialName: string;
  odooField: string;
  type: DocumentType;
  category: 'EXPEDIENTE' | 'VERIFICACION' | 'CASA_TITULAR' | 'NEGOCIO_TITULAR' | 'SEGUNDA_PROPIEDAD';
  status: DocumentStatus;
  fileUrl?: string;
  fileName?: string;
  notes?: string;
  updatedAt?: string;
}

export interface ReferenceCheck {
  id: string;
  fullName: string;
  phone: string;
  relation: string;
  call1Status: 'EXITOSA' | 'NO_CONTESTO' | 'PENDIENTE';
  call2Status?: 'EXITOSA' | 'NO_CONTESTO' | 'PENDIENTE';
  call3Status?: 'EXITOSA' | 'NO_CONTESTO' | 'PENDIENTE';
  notes: string;
  isApproved: boolean;
}

export interface ChatterMessage {
  id: string;
  author: string;
  authorEmail: string;
  type: 'nota' | 'sistema' | 'actividad';
  content: string;
  createdAt: string;
}

export interface Prospect {
  id: string;
  opportunityName: string;
  stage: StageId;
  daysInStage: number;
  priorityStars: number; // 0 a 3

  // Datos Personales
  firstName: string;
  middleName?: string;
  lastName: string;
  secondLastName?: string;
  email: string;
  phone: string;
  curp: string;
  rfc: string;

  // Asignación y Comercial
  advisorName: string;
  advisorEmail: string;
  salesTeam: string;
  company: string;
  distributorType: 'DV' | 'Emprendedor';
  experienceType: string;
  origin: OriginType;

  // Validación CURP (Financialsoft)
  financialCurpStatus: CurpStatus;
  financialCurpReason?: string;
  financialComments?: string;

  // Domicilio y Socioeconómicos (Pestaña Contacto)
  street: string;
  extNumber: string;
  intNumber?: string;
  zipCode: string;
  neighborhood: string;
  municipality: string;
  city: string;
  state: string;
  birthDate?: string;
  gender?: 'MASCULINO' | 'FEMENINO' | 'OTRO';
  maritalStatus?: 'SOLTERO' | 'CASADO' | 'UNION_LIBRE' | 'DIVORCIADO' | 'VIUDO';
  workCompany?: string;
  jobTitle?: string;
  monthlySalary?: number;
  seniorityYears?: number;
  dependentsCount?: number;
  nationality?: string;

  // INE
  ineNumber?: string;
  ineFrontUrl?: string;
  ineBackUrl?: string;

  // Buró de Crédito
  bureauResult: BureauResult;
  bureauDictumDate?: string;
  smsSent: boolean;
  smsAuthorized: boolean;
  assignedProfile: DistributorProfile;

  // Solicitud de Crédito & Firma
  hasSpouse: boolean;
  spouseName?: string;
  spousePhone?: string;
  hasGuarantor: boolean;
  guarantorName?: string;
  guarantorPhone?: string;
  guarantorRelation?: string;
  hasAdditionalProperty: boolean;
  additionalPropertyAddress?: string;
  hasPepFamily: boolean;
  pepRelationDetail?: string;
  signatureDataUrl?: string;
  signedAt?: string;

  // Verificaciones y Mesa de Crédito
  references: ReferenceCheck[];
  creditLines: {
    valelana: number;
    lanatienda: number;
    personal: number;
  };

  // Matriz Documental (Anexo 1)
  documents: RequiredDocument[];

  // Historial / Chatter
  messages: ChatterMessage[];

  createdAt: string;
  updatedAt: string;
}

