import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { DashboardCharts } from '../components/DashboardCharts';
import { LogoutModal } from '../components/LogoutModal';

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
  const { t } = useTranslation();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

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
    }).format(value);
  };

  if (!metrics) {
    return <div className="flex h-full w-full items-center justify-center text-2xl font-bold">CARREGANDO...</div>;
  }

  return (
    <div className="flex h-full w-full flex-col p-8 overflow-y-auto">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-5xl font-black uppercase tracking-tighter">{t('dashboard.title')}</h1>
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() => navigate('/pipeline')}
            className="border-4 border-zinc-950 dark:border-zinc-100 bg-lime-400 px-6 py-2 font-bold text-zinc-950 transition-transform active:translate-x-1 active:translate-y-1 hover:bg-lime-300 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
          >
            {t('nav.pipeline')}
          </button>
          <button
            onClick={() => navigate('/products')}
            className="border-4 border-zinc-950 dark:border-zinc-100 bg-purple-400 px-6 py-2 font-bold text-zinc-950 transition-transform active:translate-x-1 active:translate-y-1 hover:bg-purple-300 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
          >
            {t('nav.products')}
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

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Bloco 1: Pipeline */}
        <div className="flex flex-col border-4 border-zinc-950 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-900 p-6 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
          <h2 className="text-xl font-bold uppercase text-zinc-600 dark:text-zinc-400">{t('dashboard.pipeline_value')}</h2>
          <p className="mt-4 text-4xl font-black text-lime-400">{formatCurrency(metrics.totalPipelineValue)}</p>
          <div className="mt-4 border-t-4 border-zinc-950 dark:border-zinc-800 pt-4 text-sm font-bold uppercase text-zinc-500">
            {metrics.totalLeads} {t('dashboard.total_leads')}
          </div>
        </div>

        {/* Bloco 2: Revenue Won */}
        <div className="flex flex-col border-4 border-zinc-950 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-900 p-6 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
          <h2 className="text-xl font-bold uppercase text-zinc-600 dark:text-zinc-400">{t('dashboard.revenue')}</h2>
          <p className="mt-4 text-4xl font-black text-zinc-950 dark:text-white">{formatCurrency(metrics.totalRevenueWon)}</p>
          <div className="mt-4 border-t-4 border-zinc-950 dark:border-zinc-800 pt-4 text-sm font-bold uppercase text-zinc-500">
            {metrics.totalWonLeads} {t('dashboard.won_leads')}
          </div>
        </div>

        {/* Bloco 3: Conversion Rate */}
        <div className="flex flex-col border-4 border-zinc-950 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-900 p-6 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
          <h2 className="text-xl font-bold uppercase text-zinc-600 dark:text-zinc-400">{t('dashboard.conversion_rate')}</h2>
          <p className="mt-4 text-4xl font-black text-lime-400">{metrics.conversionRate.toFixed(2)}%</p>
          <div className="mt-4 border-t-4 border-zinc-950 dark:border-zinc-800 pt-4 text-sm font-bold uppercase text-zinc-500">
            Performance Global
          </div>
        </div>
      </div>

      {/* Gráficos Interativos Neo-Brutalistas */}
      <DashboardCharts
        leadsByStatus={metrics.leadsByStatus}
        revenueByStatus={metrics.revenueByStatus}
      />
      {/* Modal de Logout Brutalista */}
      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onConfirm={confirmLogout} 
        onCancel={() => setIsLogoutModalOpen(false)} 
      />
    </div>
  );
}
