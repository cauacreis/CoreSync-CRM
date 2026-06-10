import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { NewLeadModal } from '../components/NewLeadModal';
import { LeadDetailsModal } from '../components/LeadDetailsModal';
import { LogoutModal } from '../components/LogoutModal';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  estimatedValue: number;
  description?: string;
  product?: {
    id: string;
    name: string;
  };
}

const STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'UNPAID', 'LOST'];

export function PipelineScreen() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await api.get('/leads');
      setLeads(response.data);
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
      showAlert(`Lead movido para ${newStatus}!`);
    } catch (err) {
      showAlert('Falha ao atualizar status.');
    }
  };

  const showAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(null), 3000);
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('@CoreSync:token');
    navigate('/login');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value || 0);
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
    <div className="flex h-full w-full flex-col p-8 overflow-hidden bg-white dark:bg-zinc-950">
      {/* Alerta Brutalista */}
      {alertMsg && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 border-4 border-zinc-950 dark:border-zinc-100 bg-lime-400 p-4 text-xl font-black uppercase text-zinc-950 shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] z-50">
          {alertMsg}
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex items-center justify-between shrink-0 flex-wrap gap-4">
        <h1 className="text-5xl font-black uppercase tracking-tighter text-zinc-950 dark:text-zinc-100">{t('pipeline.title')}</h1>
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() => setIsNewLeadModalOpen(true)}
            className="border-4 border-lime-400 bg-lime-400 px-6 py-2 font-bold text-zinc-950 transition-transform active:translate-x-1 active:translate-y-1 hover:bg-lime-300 shadow-[4px_4px_0px_0px_rgba(163,230,53,1)]"
          >
            {t('pipeline.new_lead')}
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="border-4 border-zinc-950 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-900 px-6 py-2 font-bold text-zinc-950 dark:text-zinc-100 transition-transform active:translate-x-1 active:translate-y-1 hover:bg-zinc-200 dark:bg-zinc-800 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
          >
            {t('nav.dashboard')}
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="border-4 border-zinc-950 dark:border-zinc-100 bg-zinc-400 px-4 py-2 font-black text-zinc-950 transition-transform active:translate-x-1 active:translate-y-1 hover:bg-zinc-300 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
            title="Configurações"
          >
            ⚙️
          </button>
          <button
            onClick={handleLogout}
            className="border-4 border-zinc-950 dark:border-zinc-100 bg-zinc-100 px-6 py-2 font-bold text-zinc-950 transition-transform active:translate-x-1 active:translate-y-1 hover:bg-zinc-200 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
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
          className="absolute left-0 top-1/2 z-10 -translate-x-4 -translate-y-1/2 border-4 border-zinc-950 dark:border-zinc-100 bg-lime-400 px-4 py-6 text-2xl font-black text-zinc-950 opacity-0 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all hover:bg-lime-300 active:translate-x-[-12px] active:translate-y-1 group-hover:opacity-100"
        >
          {'<'}
        </button>
        
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 z-10 translate-x-4 -translate-y-1/2 border-4 border-zinc-950 dark:border-zinc-100 bg-lime-400 px-4 py-6 text-2xl font-black text-zinc-950 opacity-0 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all hover:bg-lime-300 active:translate-x-5 active:translate-y-1 group-hover:opacity-100"
        >
          {'>'}
        </button>

        {/* Scroll Container Ocultando a Barra de Rolagem Nativamente */}
        <div 
          ref={scrollContainerRef}
          onWheel={handleWheel}
          className="flex h-full gap-6 overflow-x-auto scrollbar-hide pb-4 px-2"
        >
          {STATUSES.map((status) => (
            <div key={status} className="flex w-[320px] shrink-0 flex-col border-4 border-zinc-950 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4">
              <h2 className="mb-4 text-xl font-bold uppercase text-zinc-600 dark:text-zinc-400 border-b-4 border-zinc-950 dark:border-zinc-800 pb-2">
                {t(`pipeline.stages.${status}`)}
              </h2>
              <div className="flex flex-col gap-4 overflow-y-auto pr-2">
                {leads
                  .filter((lead) => lead.status === status)
                  .map((lead) => (
                    <div
                      key={lead.id}
                      className="flex flex-col gap-2 border-4 border-zinc-950 dark:border-zinc-100 bg-white dark:bg-zinc-950 p-4 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                    >
                      <div className="flex justify-between items-start">
                        <div className="font-bold text-lime-400 uppercase">{lead.name}</div>
                        {lead.product && (
                          <span className="bg-purple-500 text-xs text-zinc-950 dark:text-white font-bold px-2 py-1 uppercase tracking-tighter shrink-0 border-2 border-zinc-950 dark:border-zinc-100">
                            {lead.product.name}
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-bold text-zinc-600 dark:text-zinc-400">{lead.email}</div>
                      
                      {lead.description && (
                        <div className="mt-1 text-sm text-zinc-500 italic line-clamp-3 leading-tight border-l-2 border-zinc-700 pl-2">
                          "{lead.description}"
                        </div>
                      )}
                      
                      <div className="text-lg font-black text-zinc-950 dark:text-white mt-1">{formatCurrency(lead.estimatedValue)}</div>
                      
                      {/* Controles do Card */}
                      <div className="mt-2 flex gap-2 border-t-4 border-zinc-950 dark:border-zinc-800 pt-3">
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="flex-1 bg-blue-400 px-2 py-1 text-sm font-black uppercase text-zinc-950 transition-colors hover:bg-blue-300"
                        >
                          {t('pipeline.card.view', 'Ver')}
                        </button>
                        {status !== 'LOST' && (
                          <button
                            onClick={() => handleUpdateStatus(lead.id, STATUSES[STATUSES.indexOf(status) + 1])}
                            className="flex-1 bg-lime-400 px-2 py-1 text-sm font-black uppercase text-zinc-950 transition-colors hover:bg-lime-300"
                          >
                            {t('pipeline.card.advance', 'Avançar')}
                          </button>
                        )}
                        {status !== 'LOST' && (
                          <button
                            onClick={() => handleUpdateStatus(lead.id, 'LOST')}
                            className="flex-1 bg-zinc-700 px-2 py-1 text-sm font-black uppercase text-zinc-950 dark:text-zinc-100 transition-colors hover:bg-zinc-600"
                          >
                            Recusar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
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
