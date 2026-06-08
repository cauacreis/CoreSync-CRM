import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { DashboardCharts } from '../components/DashboardCharts';

interface DashboardMetrics {
  totalLeads: number;
  totalWonLeads: number;
  conversionRate: number;
  totalPipelineValue: number;
  totalRevenueWon: number;
  leadsByStatus?: Record<string, number>;
  revenueByStatus?: Record<string, number>;
}

export function DashboardScreen() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await api.get('/dashboard');
        setMetrics(response.data);
      } catch (err) {
        // Se 401 ou token inválido, volta pro login
        localStorage.removeItem('@CoreSync:token');
        navigate('/login');
      }
    };
    fetchMetrics();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('@CoreSync:token');
    navigate('/login');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  if (!metrics) {
    return <div className="flex h-full w-full items-center justify-center text-2xl font-bold">CARREGANDO...</div>;
  }

  return (
    <div className="flex h-full w-full flex-col p-8 overflow-y-auto">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-5xl font-black uppercase tracking-tighter">Painel Executivo</h1>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/pipeline')}
            className="border-4 border-zinc-100 bg-lime-400 px-6 py-2 font-bold text-zinc-950 transition-transform active:translate-x-1 active:translate-y-1 hover:bg-lime-300 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
          >
            Quadro Kanban
          </button>
          <button
            onClick={() => navigate('/products')}
            className="border-4 border-zinc-100 bg-purple-400 px-6 py-2 font-bold text-zinc-950 transition-transform active:translate-x-1 active:translate-y-1 hover:bg-purple-300 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
          >
            Catálogo de Produtos
          </button>
          <button
            onClick={handleLogout}
            className="border-4 border-zinc-100 bg-zinc-100 px-6 py-2 font-bold text-zinc-950 transition-transform active:translate-x-1 active:translate-y-1 hover:bg-zinc-200 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
          >
            Sair
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Bloco 1: Pipeline */}
        <div className="flex flex-col border-4 border-zinc-100 bg-zinc-900 p-6 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
          <h2 className="text-xl font-bold uppercase text-zinc-400">Total Pipeline Value</h2>
          <p className="mt-4 text-4xl font-black text-lime-400">{formatCurrency(metrics.totalPipelineValue)}</p>
          <div className="mt-4 border-t-4 border-zinc-800 pt-4 text-sm font-bold uppercase text-zinc-500">
            {metrics.totalLeads} Leads Ativos
          </div>
        </div>

        {/* Bloco 2: Revenue Won */}
        <div className="flex flex-col border-4 border-zinc-100 bg-zinc-900 p-6 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
          <h2 className="text-xl font-bold uppercase text-zinc-400">Total Revenue Won</h2>
          <p className="mt-4 text-4xl font-black text-white">{formatCurrency(metrics.totalRevenueWon)}</p>
          <div className="mt-4 border-t-4 border-zinc-800 pt-4 text-sm font-bold uppercase text-zinc-500">
            {metrics.totalWonLeads} Negócios Fechados
          </div>
        </div>

        {/* Bloco 3: Conversion Rate */}
        <div className="flex flex-col border-4 border-zinc-100 bg-zinc-900 p-6 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
          <h2 className="text-xl font-bold uppercase text-zinc-400">Taxa de Conversão</h2>
          <p className="mt-4 text-4xl font-black text-lime-400">{metrics.conversionRate.toFixed(2)}%</p>
          <div className="mt-4 border-t-4 border-zinc-800 pt-4 text-sm font-bold uppercase text-zinc-500">
            Performance Global
          </div>
        </div>
      </div>

      {/* Gráficos Interativos Neo-Brutalistas */}
      <DashboardCharts
        leadsByStatus={metrics.leadsByStatus}
        revenueByStatus={metrics.revenueByStatus}
      />
    </div>
  );
}
