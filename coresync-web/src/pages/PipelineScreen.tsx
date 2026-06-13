import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent, DragMoveEvent } from '@dnd-kit/core';
import { api } from '../services/api';
import { NewLeadModal } from '../components/NewLeadModal';
import { LeadDetailsModal } from '../components/LeadDetailsModal';
import { LogoutModal } from '../components/LogoutModal';
import { KanbanColumn } from '../components/KanbanColumn';
import { KanbanCard } from '../components/KanbanCard';
import type { Lead } from '../components/KanbanCard';
import { useToast } from '../contexts/ToastContext';
import { playDropSound } from '../utils/audio';

const STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'UNPAID', 'LOST'];

export function PipelineScreen() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const { showToast } = useToast();
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [swingRotate, setSwingRotate] = useState(0);
  const lastDeltaX = useRef(0);
  const swingTimeout = useRef<any>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (lead.email && lead.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (lead.smartTags && lead.smartTags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await api.get('/leads?size=100'); // Pegando até 100 leads na página inicial
      const data = response.data.content ? response.data.content : response.data;
      setLeads(data);
    } catch (err) {
      localStorage.removeItem('@CoreSync:token');
      navigate('/login');
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/leads/${id}/status`, { status: newStatus });
      setLeads((prevLeads) =>
        prevLeads.map((lead) =>
          lead.id === id ? { ...lead, status: newStatus } : lead
        )
      );
      showToast(`Lead movido para ${newStatus}!`, 'success');
    } catch (err) {
      showToast('Falha ao atualizar status.', 'error');
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveLead(active.data.current?.lead as Lead);
    setSwingRotate(0);
    lastDeltaX.current = 0;
  };

  const handleDragMove = (event: DragMoveEvent) => {
    const currentDeltaX = event.delta.x;
    const diff = currentDeltaX - lastDeltaX.current;
    
    // Calcula velocidade e aplica proporção de ângulo com cap de -15 a 15 graus
    const angle = Math.min(Math.max(diff * 1.5, -15), 15);
    setSwingRotate(angle);
    
    lastDeltaX.current = currentDeltaX;

    // Reseta pro meio quando o mouse para
    if (swingTimeout.current) clearTimeout(swingTimeout.current);
    swingTimeout.current = setTimeout(() => {
      setSwingRotate(0);
    }, 100);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveLead(null);
    setSwingRotate(0);
    if (swingTimeout.current) clearTimeout(swingTimeout.current);

    if (!over) return;

    const leadId = active.id as string;
    const newStatus = over.id as string;

    const lead = leads.find((l) => l.id === leadId);
    if (lead && lead.status !== newStatus) {
      playDropSound();
      handleUpdateStatus(leadId, newStatus);
    }
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('@CoreSync:token');
    navigate('/login');
  };



  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -344, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 344, behavior: 'smooth' });
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY !== 0 && scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <div className="flex h-full w-full flex-col p-8 overflow-hidden bg-zinc-100 dark:bg-zinc-950">

      {/* Header */}
      <div className="mb-8 flex items-center justify-between shrink-0 flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="text-5xl font-black uppercase tracking-tighter text-zinc-950 dark:text-zinc-100">{t('pipeline.title')}</h1>
          <input
            type="text"
            placeholder="Buscar leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-4 border-zinc-950 dark:border-zinc-100 bg-white dark:bg-zinc-900 px-4 py-2 font-bold text-zinc-950 dark:text-zinc-100 focus:outline-none focus:border-lime-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
          />
        </div>
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() => setIsNewLeadModalOpen(true)}
            className="border-4 border-lime-400 bg-lime-400 px-6 py-2 font-bold text-zinc-950 transition-transform active:translate-x-1 active:translate-y-1 hover:bg-lime-300 shadow-[4px_4px_0px_0px_rgba(163,230,53,1)]"
          >
            {t('pipeline.new_lead')}
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="border-4 border-zinc-950 dark:border-zinc-100 bg-white dark:bg-zinc-900 px-6 py-2 font-bold text-zinc-950 dark:text-zinc-100 transition-transform active:translate-x-1 active:translate-y-1 hover:bg-zinc-200 dark:bg-zinc-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
          >
            {t('nav.dashboard')}
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="border-4 border-zinc-950 dark:border-zinc-100 bg-zinc-400 px-4 py-2 font-black text-zinc-950 transition-transform active:translate-x-1 active:translate-y-1 hover:bg-zinc-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
            title="Configurações"
          >
            ⚙️
          </button>
          <button
            onClick={handleLogout}
            className="border-4 border-zinc-950 dark:border-zinc-100 bg-zinc-100 px-6 py-2 font-bold text-zinc-950 transition-transform active:translate-x-1 active:translate-y-1 hover:bg-zinc-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
          >
            {t('nav.logout')}
          </button>
        </div>
      </div>

      {/* Kanban Board Container com Setas */}
      <div className="relative flex h-full min-h-0 w-full flex-col group">
        {/* Setas de Navegação - visíveis no hover do container */}
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 z-10 -translate-x-4 -translate-y-1/2 border-4 border-zinc-950 dark:border-zinc-100 bg-lime-400 px-4 py-6 text-2xl font-black text-zinc-950 opacity-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all hover:bg-lime-300 active:translate-x-[-12px] active:translate-y-1 group-hover:opacity-100"
        >
          {'<'}
        </button>
        
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 z-10 translate-x-4 -translate-y-1/2 border-4 border-zinc-950 dark:border-zinc-100 bg-lime-400 px-4 py-6 text-2xl font-black text-zinc-950 opacity-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all hover:bg-lime-300 active:translate-x-5 active:translate-y-1 group-hover:opacity-100"
        >
          {'>'}
        </button>

        {/* Scroll Container Ocultando a Barra de Rolagem Nativamente */}
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragMove={handleDragMove} onDragEnd={handleDragEnd}>
          <div 
            ref={scrollContainerRef}
            onWheel={handleWheel}
            className="flex h-full gap-6 overflow-x-auto scrollbar-hide pb-4 px-2 pt-4"
          >
            {searchQuery && filteredLeads.length === 0 ? (
              <div className="flex-1 min-w-full h-full flex items-center justify-center p-8 pb-16">
                <div className="border-8 border-zinc-950 dark:border-zinc-100 bg-lime-400 p-12 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] dark:shadow-[16px_16px_0px_0px_rgba(255,255,255,1)] transform rotate-2">
                  <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-zinc-950 text-center">
                    Ops, parece que não existe esse lead! 🕵️‍♂️
                  </h2>
                </div>
              </div>
            ) : (
              STATUSES.map((status, index) => {
                const columnLeads = filteredLeads.filter((lead) => lead.status === status);
                
                // Se estiver buscando e a coluna não tiver leads, esconde a coluna
                if (searchQuery && columnLeads.length === 0) {
                  return null;
                }

                return (
                  <KanbanColumn key={status} status={status} index={index}>
                    {columnLeads.map((lead, leadIndex) => (
                      <KanbanCard
                        key={lead.id}
                        lead={lead}
                        index={leadIndex}
                        onView={setSelectedLead}
                        onAdvance={(id) => handleUpdateStatus(id, STATUSES[STATUSES.indexOf(status) + 1])}
                        onDecline={(id) => handleUpdateStatus(id, 'LOST')}
                        isNextStatusAvailable={status !== 'LOST' && STATUSES.indexOf(status) < STATUSES.length - 1}
                      />
                    ))}
                  </KanbanColumn>
                );
              })
            )}
          </div>

          <DragOverlay>
            {activeLead ? (
              <KanbanCard
                lead={activeLead}
                index={0}
                onView={() => {}}
                onAdvance={() => {}}
                onDecline={() => {}}
                isNextStatusAvailable={false}
                isOverlay={true}
                swingRotate={swingRotate}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <NewLeadModal
        isOpen={isNewLeadModalOpen}
        onClose={() => setIsNewLeadModalOpen(false)}
        onSuccess={fetchLeads}
      />
      
      <LeadDetailsModal
        isOpen={selectedLead !== null}
        onClose={() => setSelectedLead(null)}
        lead={selectedLead}
        onLeadUpdated={() => {
          fetchLeads();
          api.get('/leads').then(res => {
            setLeads(res.data);
            const updatedLead = res.data.find((l: Lead) => l.id === selectedLead?.id);
            if (updatedLead) setSelectedLead(updatedLead);
          });
        }}
      />
      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onConfirm={confirmLogout} 
        onCancel={() => setIsLogoutModalOpen(false)} 
      />
    </div>
  );
}
