'use client';

import React, { useState, useEffect } from 'react';
import Header, { ActiveAppModule } from '@/components/Header';
import KanbanBoard from '@/components/KanbanBoard';
import TableView from '@/components/TableView';
import LeadDetailView from '@/components/LeadDetailView';
import NewLeadModal from '@/components/NewLeadModal';
import CoreDashboard from '@/components/CoreDashboard';
import PersonasView from '@/components/PersonasView';
import DistribuidoresView from '@/components/DistribuidoresView';
import RHView from '@/components/RHView';
import { Prospect, StageId, OriginType } from '@/types/crm';
import { INITIAL_PROSPECTS, createDefaultDocuments } from '@/lib/data/initialData';

const STORAGE_KEY = 'lanahora_crm_prospects_v1';

export default function Home() {
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
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setProspects(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading saved prospects:', e);
    }
  }, []);

  // Save to localStorage when prospects change
  const saveProspects = (newList: Prospect[]) => {
    setProspects(newList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    } catch (e) {
      console.error('Error saving prospects:', e);
    }
  };

  // Create new lead
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
      advisorName: 'Alejandro Domínguez',
      advisorEmail: 'alejandro_dominguez@lanahora.com',
      salesTeam: 'Ventas',
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
          author: 'Alejandro Domínguez',
          authorEmail: 'alejandro_dominguez@lanahora.com',
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

  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col font-sans">
      <Header
        activeModule={activeModule}
        onModuleChange={(mod) => {
          setSelectedProspectId(null);
          setActiveModule(mod);
        }}
        currentView={currentView}
        onViewChange={(v) => {
          setSelectedProspectId(null);
          setCurrentView(v);
        }}
        onOpenNewLead={() => {
          setQuickAddStage('contacto');
          setIsNewLeadOpen(true);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
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
          /* MODULE CRM */
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
