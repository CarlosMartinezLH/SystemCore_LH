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
import { CoreSyncProvider, useCoreSync } from '@/context/CoreSyncContext';

const STORAGE_KEY = 'lanahora_crm_prospects_v4';
const AUTH_KEY = 'lanahora_user_session_v2';

export default function Home() {
  return (
    <CoreSyncProvider>
      <SystemCoreApp />
    </CoreSyncProvider>
  );
}

function SystemCoreApp() {
  const {
    prospects,
    updateProspect,
    addProspect,
    registrarProspectoEnPersonas,
    pasarProspectoACore,
    distribuidores,
    personas,
  } = useCoreSync();

  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [activeModule, setActiveModule] = useState<ActiveAppModule>('core_dashboard');
  const [selectedProspectId, setSelectedProspectId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [quickAddStage, setQuickAddStage] = useState<StageId>('contacto');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [selectedDvForModal, setSelectedDvForModal] = useState<DistribuidorCore | null>(null);
  const [selectedSucursal, setSelectedSucursal] = useState<string>('GÓMEZ PALACIO');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handlePasarACore = async (prospectId: string) => {
    const res = await pasarProspectoACore(prospectId);
    showToast(res.message);
  };

  const handleVerPerfilDv = (noDist: number) => {
    const existing = distribuidores.find((d) => d.noDist === noDist);
    if (existing) {
      setSelectedDvForModal(existing);
      return;
    }
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
    } catch (e) {
      console.error('Error loading session:', e);
    }
  }, []);

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
      salesTeam: selectedSucursal === 'TODAS' ? 'Ventas Gómez Palacio' : `Ventas ${selectedSucursal}`,
      company: 'Lanahora',
      distributorType: 'DV',
      experienceType: '',
      origin: leadData.origin,
      financialCurpStatus: 'NO_EVALUADO',
      street: '',
      extNumber: '',
      zipCode: '',
      neighborhood: '',
      municipality: selectedSucursal === 'GÓMEZ PALACIO' ? 'GOMEZ PALACIO' : selectedSucursal,
      city: selectedSucursal === 'TODAS' ? 'Gómez Palacio' : selectedSucursal === 'TORREÓN' ? 'Torreón' : selectedSucursal === 'SALTILLO' ? 'Saltillo' : selectedSucursal === 'MONCLOVA' ? 'Monclova' : selectedSucursal === 'RAMOS ARIZPE' ? 'Ramos Arizpe' : 'Gómez Palacio',
      state: selectedSucursal === 'GÓMEZ PALACIO' ? 'Durango' : 'Coahuila',
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

    addProspect(newLead);
    if (leadData.stage !== 'contacto' && leadData.stage !== 'perdido') {
      registrarProspectoEnPersonas(newLead.id, leadData.stage).then((res) => {
        if (res?.message) showToast(res.message);
      });
    }
    setSelectedProspectId(newLead.id);
    setActiveModule('crm');
  };

  // Add new lead directly from Mobile App
  const handleAddMobileLead = (newProspect: Prospect) => {
    addProspect(newProspect);
  };

  // Update lead
  const handleUpdateProspect = (updatedProspect: Prospect) => {
    updateProspect(updatedProspect);
  };

  // Move prospect across Kanban stages via Drag and Drop
  const handleMoveStage = async (prospectId: string, newStage: StageId) => {
    const target = prospects.find((p) => p.id === prospectId);
    if (!target || target.stage === newStage) return;

    // Si se pasa a activación, dar de alta automáticamente en Core (Personas y Distribuidores)
    if (newStage === 'activacion') {
      const res = await pasarProspectoACore(prospectId);
      showToast(res.message);
      return;
    }

    // Desde que se pasa a Consulta de Buró (o etapas intermedias), dar de alta automáticamente en Personas
    if (newStage !== 'contacto' && newStage !== 'perdido') {
      const res = await registrarProspectoEnPersonas(prospectId, newStage);
      showToast(res.message);
      return;
    }

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
    updateProspect(updated);
  };

  // Filter prospects con filtro de sucursal activa y búsqueda
  const filteredProspects = prospects.filter((p) => {
    // Filtrado por sucursal seleccionable
    if (selectedSucursal && selectedSucursal !== 'TODAS') {
      const normalize = (s: string) =>
        s
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toUpperCase()
          .trim();

      const normTarget = normalize(selectedSucursal);
      const normCity = normalize(p.city || '');
      const normTeam = normalize(p.salesTeam || '');
      const normCompany = normalize(p.company || '');

      const matchesBranch =
        normCity.includes(normTarget) ||
        normTarget.includes(normCity) ||
        normTeam.includes(normTarget) ||
        normCompany.includes(normTarget);

      if (!matchesBranch) return false;
    }

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
        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden bg-transparent relative z-10">
          <main className="flex-1 flex flex-col min-w-0 min-h-0 bg-transparent overflow-hidden">
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
                  selectedSucursal={selectedSucursal}
                  onSelectSucursal={setSelectedSucursal}
                />
              ) : (
                <TableView
                  prospects={filteredProspects}
                  onSelectProspect={(p) => setSelectedProspectId(p.id)}
                  onToggleView={(v) => setCurrentView(v)}
                  selectedSucursal={selectedSucursal}
                  onSelectSucursal={setSelectedSucursal}
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
    );
}
