import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  estimatedValue: number;
}

const STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'LOST'];

export function PipelineScreen() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const navigate = useNavigate();

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
    localStorage.removeItem('@CoreSync:token');
    navigate('/login');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value || 0);
  };

  return (
    <div className="flex h-full w-full flex-col p-8 overflow-hidden bg-zinc-950">
      {/* Alerta Brutalista */}
      {alertMsg && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 border-4 border-zinc-100 bg-lime-400 p-4 text-xl font-black uppercase text-zinc-950 shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] z-50">
          {alertMsg}
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex items-center justify-between shrink-0">
        <h1 className="text-5xl font-black uppercase tracking-tighter text-zinc-100">Pipeline de Vendas</h1>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="border-4 border-zinc-100 bg-zinc-900 px-6 py-2 font-bold text-zinc-100 transition-transform active:translate-x-1 active:translate-y-1 hover:bg-zinc-800 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
          >
            Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="border-4 border-zinc-100 bg-zinc-100 px-6 py-2 font-bold text-zinc-950 transition-transform active:translate-x-1 active:translate-y-1 hover:bg-zinc-200 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex h-full gap-6 overflow-x-auto pb-4">
        {STATUSES.map((status) => (
          <div key={status} className="flex min-w-[320px] flex-col border-4 border-zinc-800 bg-zinc-900 p-4 shrink-0">
            <h2 className="mb-4 text-xl font-bold uppercase text-zinc-400 border-b-4 border-zinc-800 pb-2">
              {status}
            </h2>
            <div className="flex flex-col gap-4 overflow-y-auto pr-2">
              {leads
                .filter((lead) => lead.status === status)
                .map((lead) => (
                  <div
                    key={lead.id}
                    className="flex flex-col gap-2 border-4 border-zinc-100 bg-zinc-950 p-4 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                  >
                    <div className="font-bold text-lime-400 uppercase">{lead.name}</div>
                    <div className="text-sm font-bold text-zinc-400">{lead.email}</div>
                    <div className="text-lg font-black text-white">{formatCurrency(lead.estimatedValue)}</div>
                    
                    {/* Controles do Card */}
                    <div className="mt-2 flex gap-2 border-t-4 border-zinc-800 pt-3">
                      {status !== 'WON' && status !== 'LOST' && (
                        <button
                          onClick={() => handleUpdateStatus(lead.id, STATUSES[STATUSES.indexOf(status) + 1])}
                          className="flex-1 bg-lime-400 px-2 py-1 text-sm font-black uppercase text-zinc-950 transition-colors hover:bg-lime-300"
                        >
                          Avançar
                        </button>
                      )}
                      {status !== 'LOST' && status !== 'WON' && (
                        <button
                          onClick={() => handleUpdateStatus(lead.id, 'LOST')}
                          className="flex-1 bg-zinc-700 px-2 py-1 text-sm font-black uppercase text-zinc-100 transition-colors hover:bg-zinc-600"
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
  );
}
