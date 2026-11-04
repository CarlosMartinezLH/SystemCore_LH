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
import DistribuidoresView from '@/components/DistribuidoresView';
import RHView from '@/components/RHView';
import { UserSession } from '@/types/auth';
import { Prospect, StageId, OriginType } from '@/types/crm';
import { INITIAL_PROSPECTS, createDefaultDocuments } from '@/lib/data/initialData';

const STORAGE_KEY = 'lanahora_crm_prospects_v2';
const AUTH_KEY = 'lanahora_user_session_v2';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [activeModule, setActiveModule] = useState<ActiveAppModule>('crm');
  const [prospects, setProspects] = useState<Prospect[]>(INITIAL_PROSPECTS);
  const [selectedProspectId, setSelectedProspectId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [quickAddStage, setQuickAddStage] = useState<StageId>('contacto');

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
    setActiveModule('crm');
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
    setActiveModule('crm');
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
    <div className="min-h-screen bg-[#f0f4fa] flex flex-col font-sans">
      <Header
        currentUser={currentUser}
        activeModule={activeModule}
        onModuleChange={(mod) => {
          setSelectedProspectId(null);
          setActiveModule(mod);
        }}
        onLogout={handleLogout}
        onOpenNewLead={() => {
          setQuickAddStage('contacto');
          setIsNewLeadOpen(true);
        }}
      />

      <main className="flex-1 flex flex-col">
        {activeModule === 'core_dashboard' ? (
          <CoreDashboard
            onNavigateToPersonas={() => setActiveModule('personas')}
            onNavigateToDistribuidores={() => setActiveModule('distribuidores')}
          />
        ) : activeModule === 'personas' ? (
          <PersonasView />
        ) : activeModule === 'distribuidores' ? (
          <DistribuidoresView />
        ) : activeModule === 'rh' ? (
          <RHView />
        ) : (
          /* MODULE CRM DESKTOP */
          selectedProspect ? (
            <LeadDetailView
              prospect={selectedProspect}
              onBack={() => setSelectedProspectId(null)}
              onUpdate={handleUpdateProspect}
            />
          ) : currentView === 'kanban' ? (
            <KanbanBoard
              prospects={filteredProspects}
              onSelectProspect={(p) => setSelectedProspectId(p.id)}
              onQuickAdd={(st) => {
                setQuickAddStage(st);
                setIsNewLeadOpen(true);
              }}
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
    </div>
  );
}
