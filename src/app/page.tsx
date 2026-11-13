'use client';

import React, { useState, useEffect } from 'react';
import Header, { ActiveAppModule } from '@/components/Header';
import LoginView from '@/components/LoginView';
import MobileAdvisorApp from '@/components/MobileAdvisorApp';
import KanbanBoard from '@/components/KanbanBoard';
import TableView from '@/components/TableView';
import LeadDetailView from '@/components/LeadDetailView';
import NewLeadModal from '@/components/NewLeadModal';
import CoreDashboard from '@/components/CoreDashboard';
import PersonasView from '@/components/PersonasView';
import CoordinadoresView from '@/components/CoordinadoresView';
import DistribuidoresView from '@/components/DistribuidoresView';
import RHView from '@/components/RHView';
import DispersionView from '@/components/DispersionView';
import IntegracionesView from '@/components/IntegracionesView';
import ConfiguracionView from '@/components/ConfiguracionView';
import LanaTiendaAdminView from '@/components/LanaTiendaAdminView';
import NotificationManagerView from '@/components/NotificationManagerView';
import LanAppView from '@/components/LanAppView';
import BusinessRulesView from '@/components/BusinessRulesView';
import MesaCreditoView from '@/components/MesaCreditoView';
import GestoriaView from '@/components/GestoriaView';
import ReportesView from '@/components/ReportesView';
import ContabilidadView from '@/components/ContabilidadView';
import BuzonPLDView from '@/components/BuzonPLDView';
import InactivityTimeoutModal from '@/components/InactivityTimeoutModal';
import PerfilDistribuidorModal from '@/components/modals/PerfilDistribuidorModal';
import { UserSession } from '@/types/auth';
import { DistribuidorCore } from '@/types/core';
import { Prospect, StageId, OriginType } from '@/types/crm';
import { INITIAL_PROSPECTS, STAGES, createDefaultDocuments } from '@/lib/data/initialData';
import { CoreSyncProvider } from '@/context/CoreSyncContext';

const STORAGE_KEY = 'lanahora_crm_prospects_v4';
const AUTH_KEY = 'lanahora_user_session_v2';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [activeModule, setActiveModule] = useState<ActiveAppModule>('core_dashboard');
  const [prospects, setProspects] = useState<Prospect[]>(INITIAL_PROSPECTS);
  const [selectedProspectId, setSelectedProspectId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [quickAddStage, setQuickAddStage] = useState<StageId>('contacto');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [selectedDvForModal, setSelectedDvForModal] = useState<DistribuidorCore | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handlePasarACore = (prospectId: string) => {
    const prospect = prospects.find((p) => p.id === prospectId);
    if (!prospect) return;

    if (prospect.coreSincronizado && prospect.coreDistribuidorId) {
      showToast(`El prospecto ya está enlazado a Core Central (DV #${prospect.coreDistribuidorId}).`);
      return;
    }

    const nuevoNoDist = 1043 + Math.floor(Math.random() * 50);
    const nuevaPersonaId = 14090 + Math.floor(Math.random() * 50);
    const nombreCompleto = `${prospect.firstName} ${prospect.lastName}`.trim().toUpperCase();

    const updated: Prospect = {
      ...prospect,
      stage: 'activacion',
      coreSincronizado: true,
      coreDistribuidorId: nuevoNoDist,
      corePersonaId: nuevaPersonaId,
      fechaPaseCore: new Date().toLocaleString('es-MX'),
      messages: [
        {
          id: `msg-pase-${Date.now()}`,
          author: 'Sistema Core Central',
          authorEmail: 'sistema@core.lanahora.com.mx',
          type: 'sistema',
          content: `✓ Prospecto transferido a Core Central con éxito. Se dio de alta como Distribuidora Oficial No. ${nuevoNoDist} con línea autorizada de $${(prospect.creditLines?.valelana || 150000).toLocaleString('es-MX')} MXN.`,
          createdAt: new Date().toLocaleString('es-MX'),
        },
        ...prospect.messages,
      ],
      updatedAt: new Date().toISOString(),
    };

    const newProspects = prospects.map((p) => (p.id === prospectId ? updated : p));
    saveProspects(newProspects);
    showToast(`✓ ¡${nombreCompleto} ha sido dada de alta en Core Central como Distribuidora #${nuevoNoDist}!`);
  };

  const handleVerPerfilDv = (noDist: number) => {
    const p = prospects.find((pr) => pr.coreDistribuidorId === noDist);
    const dvObj: DistribuidorCore = {
      noDist,
      nombreDistribuidor: p ? `${p.firstName} ${p.lastName}`.toUpperCase() : 'DISTRIBUIDORA LANAHORA',
      sucursal: p?.city?.toUpperCase() || 'GÓMEZ PALACIO',
      zona: 'ZONA NORTE',
      subzona: 'LAGUNA',
      coordinador: p?.salesTeam || 'MARIA GUADALUPE AGUILERA',
      promotor: p?.advisorName || 'SIN PROMOTOR',
      genero: 'FEMENINO',
      estatus: 'ACTIVO',
      nivel: 'BRONCE',
      personaId: p?.corePersonaId || 14080,
      curp: p?.curp || 'MACE750312MCO',
      telefono: p?.phone || '8711002030',
      creditoLimite: p?.creditLines?.valelana || 150000,
      saldoActual: 0,
      disponible: p?.creditLines?.valelana || 150000,
      lineaPersonal: p?.creditLines?.personal || 15000,
      disponiblePersonal: p?.creditLines?.personal || 15000,
      lineaLanaTienda: p?.creditLines?.lanatienda || 20000,
      disponibleLanaTienda: p?.creditLines?.lanatienda || 20000,
      tieneLanaApp: true,
      fechaAlta: new Date().toLocaleDateString('es-MX'),
      usuarioValida: 'Mesa de Crédito / CRM',
      fechaValidacion: new Date().toLocaleDateString('es-MX') + ' 10:00:00',
      direccion: p ? `${p.street} ${p.extNumber}, ${p.neighborhood}, ${p.city}` : 'AVENIDA HIDALGO 120, CENTRO, GOMEZ PALACIO',
      perfil: p?.assignedProfile || 'D-AAA',
      valesActivos: 0,
    };
    setSelectedDvForModal(dvObj);
  };

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem(AUTH_KEY);
      if (savedAuth) {
        const user = JSON.parse(savedAuth);
        setCurrentUser(user);
      }

      const savedProspects = localStorage.getItem(STORAGE_KEY);
      if (savedProspects) {
        setProspects(JSON.parse(savedProspects));
      }
    } catch (e) {
      console.error('Error loading session or prospects:', e);
    }
  }, []);

  // Save prospects to localStorage
  const saveProspects = (newList: Prospect[]) => {
    setProspects(newList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    } catch (e) {
      console.error('Error saving prospects:', e);
    }
  };

  // Login handler
  const handleLoginSuccess = (user: UserSession) => {
    setCurrentUser(user);
    try {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Error saving session:', e);
    }
    setActiveModule('core_dashboard');
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(AUTH_KEY);
    } catch (e) {
      console.error('Error clearing session:', e);
    }
  };

  // Create new lead from Desktop modal
  const handleCreateLead = (leadData: {
    opportunityName: string;
    firstName: string;
    lastName: string;
    phone: string;
    origin: OriginType;
    stage: StageId;
  }) => {
    const newLead: Prospect = {
      id: `lead-${Date.now()}`,
      opportunityName: leadData.opportunityName,
      stage: leadData.stage,
      daysInStage: 0,
      priorityStars: 1,
      firstName: leadData.firstName,
      lastName: leadData.lastName,
      email: '',
      phone: leadData.phone,
      curp: '',
      rfc: '',
      advisorName: currentUser?.name || 'Alejandro Domínguez',
      advisorEmail: currentUser?.email || 'alejandro_dominguez@lanahora.com',
      salesTeam: 'Ventas Campo',
      company: 'Lanahora',
      distributorType: 'DV',
      experienceType: '',
      origin: leadData.origin,
      financialCurpStatus: 'NO_EVALUADO',
      street: '',
      extNumber: '',
      zipCode: '',
      neighborhood: '',
      municipality: '',
      city: '',
      state: 'Coahuila',
      bureauResult: 'NO_CONSULTADO',
      smsSent: false,
      smsAuthorized: false,
      assignedProfile: 'SIN_ASIGNAR',
      hasSpouse: false,
      hasGuarantor: false,
      hasAdditionalProperty: false,
      hasPepFamily: false,
      references: [],
      creditLines: { valelana: 0, lanatienda: 0, personal: 0 },
      documents: createDefaultDocuments(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          author: currentUser?.name || 'Sistema',
          authorEmail: currentUser?.email || 'admin@lanahora.com',
          type: 'sistema',
          content: `Lead creado en etapa ${leadData.stage}`,
          createdAt: new Date().toLocaleString('es-MX'),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newLead, ...prospects];
    saveProspects(updated);
    setSelectedProspectId(newLead.id);
    setActiveModule('core_dashboard');
  };

  // Add new lead directly from Mobile App
  const handleAddMobileLead = (newProspect: Prospect) => {
    const updated = [newProspect, ...prospects];
    saveProspects(updated);
  };

  // Update lead
  const handleUpdateProspect = (updatedProspect: Prospect) => {
    const updated = prospects.map((p) =>
      p.id === updatedProspect.id ? updatedProspect : p
    );
    saveProspects(updated);
  };

  // Move prospect across Kanban stages via Drag and Drop
  const handleMoveStage = (prospectId: string, newStage: StageId) => {
    const target = prospects.find((p) => p.id === prospectId);
    if (!target || target.stage === newStage) return;
    const stageObj = STAGES.find((s) => s.id === newStage);
    const stageName = stageObj ? stageObj.name : newStage;
    const updated: Prospect = {
      ...target,
      stage: newStage,
      daysInStage: 0,
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          author: currentUser?.name || 'Sistema',
          authorEmail: currentUser?.email || 'admin@lanahora.com',
          type: 'sistema',
          content: `Prospecto movido a etapa "${stageName}" arrastrado en Kanban`,
          createdAt: new Date().toLocaleString('es-MX'),
        },
        ...target.messages,
      ],
    };
    saveProspects(prospects.map((p) => (p.id === prospectId ? updated : p)));
  };

  // Filter prospects
  const filteredProspects = prospects.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      p.opportunityName.toLowerCase().includes(q) ||
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      p.curp.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.origin.toLowerCase().includes(q) ||
      p.advisorName.toLowerCase().includes(q)
    );
  });

  const selectedProspect = prospects.find((p) => p.id === selectedProspectId);

  // If user is not authenticated, show modern Login Screen
  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <CoreSyncProvider>
      <div className="flex flex-col h-screen overflow-hidden bg-[#f8fafc] text-slate-800 font-sans relative">
        {/* Difuminados Ambientales de Fondo (Luz Mesh Suave de Alta Fidelidad) */}
        <div className="fixed top-[-100px] left-[20%] w-[550px] h-[380px] bg-blue-100/30 rounded-full blur-3xl pointer-events-none animate-ambient-glow z-0" />
        <div className="fixed bottom-[-80px] right-[5%] w-[650px] h-[450px] bg-indigo-50/40 rounded-full blur-3xl pointer-events-none z-0" />

        {/* Menú Principal Superior en Header (Más vista para tablas y dashboards) */}
        <Header
          currentUser={currentUser}
          activeModule={activeModule}
          onModuleChange={(mod) => {
            setSelectedProspectId(null);
            setActiveModule(mod);
          }}
          onLogout={handleLogout}
          onOpenNewLead={() => setIsNewLeadOpen(true)}
          onToggleMobile={() => setIsMobileNavOpen(!isMobileNavOpen)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Main Content Workspace - 100% Ancho Completo para Tablas y Dashboards */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-transparent relative z-10">
          <main className="flex-1 flex flex-col min-w-0 bg-transparent">
            {activeModule === 'core_dashboard' ? (
              <CoreDashboard
                currentUser={currentUser}
                onNavigateToPersonas={() => setActiveModule('personas')}
                onNavigateToDistribuidores={() => setActiveModule('distribuidores')}
                onNavigateToDispersion={() => setActiveModule('dispersion')}
                onNavigateToGestoria={() => setActiveModule('gestoria')}
                onNavigateToPLD={() => setActiveModule('pld')}
              />
            ) : activeModule === 'mesa_credito' ? (
              <MesaCreditoView />
            ) : activeModule === 'gestoria' ? (
              <GestoriaView />
            ) : activeModule === 'reportes' ? (
              <ReportesView />
            ) : activeModule === 'contabilidad' ? (
              <ContabilidadView />
            ) : activeModule === 'pld' ? (
              <BuzonPLDView />
            ) : activeModule === 'personas' ? (
              <PersonasView currentUser={currentUser} />
            ) : activeModule === 'coordinadores' ? (
              <CoordinadoresView
                currentUser={currentUser}
                onNavigateToDistribuidores={() => setActiveModule('distribuidores')}
              />
            ) : activeModule === 'distribuidores' ? (
              <DistribuidoresView currentUser={currentUser} />
            ) : activeModule === 'rh' ? (
              <RHView currentUser={currentUser} />
            ) : activeModule === 'dispersion' ? (
              <DispersionView />
            ) : activeModule === 'integraciones' ? (
              <IntegracionesView />
            ) : activeModule === 'configuracion' ? (
              <div className="p-6">
                <ConfiguracionView />
              </div>
            ) : activeModule === 'lanatienda' ? (
              <LanaTiendaAdminView />
            ) : activeModule === 'notificaciones' ? (
              <NotificationManagerView />
            ) : activeModule === 'reglas' ? (
              <BusinessRulesView />
            ) : activeModule === 'lanapp' ? (
              <LanAppView onNavigateToDispersion={() => setActiveModule('dispersion')} />
            ) : activeModule === 'asesores' ? (
              <div className="p-4 flex justify-center">
                <MobileAdvisorApp
                  user={currentUser}
                  prospects={prospects}
                  onAddNewProspect={handleAddMobileLead}
                  onLogout={handleLogout}
                  onSwitchToDesktop={() => setActiveModule('crm')}
                />
              </div>
            ) : (
              /* MODULE CRM DESKTOP */
              selectedProspect ? (
                <LeadDetailView
                  prospect={selectedProspect}
                  onBack={() => setSelectedProspectId(null)}
                  onUpdate={handleUpdateProspect}
                  onVerPerfilCore={handleVerPerfilDv}
                />
              ) : currentView === 'kanban' ? (
                <KanbanBoard
                  prospects={filteredProspects}
                  onSelectProspect={(p) => setSelectedProspectId(p.id)}
                  onQuickAdd={(st) => {
                    setQuickAddStage(st);
                    setIsNewLeadOpen(true);
                  }}
                  onMoveStage={handleMoveStage}
                  onPasarACore={handlePasarACore}
                  onVerPerfilCore={handleVerPerfilDv}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onToggleView={(v) => setCurrentView(v)}
                />
              ) : (
                <TableView
                  prospects={filteredProspects}
                  onSelectProspect={(p) => setSelectedProspectId(p.id)}
                />
              )
            )}
          </main>

          <NewLeadModal
            isOpen={isNewLeadOpen}
            onClose={() => setIsNewLeadOpen(false)}
            defaultStage={quickAddStage}
            onCreate={handleCreateLead}
          />

          {/* Level 3 Security: 15-Minute Banking Inactivity Auto-Logout Watcher */}
          <InactivityTimeoutModal onLogout={handleLogout} />

          {/* Toast Notification Flotante */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 z-[140] bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Modal Oficial de Perfil Distribuidor abierto directamente desde CRM */}
          {selectedDvForModal && (
            <PerfilDistribuidorModal
              isOpen={selectedDvForModal !== null}
              onClose={() => setSelectedDvForModal(null)}
              distribuidor={selectedDvForModal}
            />
          )}
        </div>
      </div>
    </CoreSyncProvider>
  );
}
