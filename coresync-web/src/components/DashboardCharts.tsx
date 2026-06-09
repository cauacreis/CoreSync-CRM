import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useTranslation } from 'react-i18next';

interface DashboardChartsProps {
  leadsByStatus?: Record<string, number>;
  revenueByStatus?: Record<string, number>;
}

export function DashboardCharts({ leadsByStatus, revenueByStatus }: DashboardChartsProps) {
  const { t } = useTranslation();

  if (!leadsByStatus || !revenueByStatus || Object.keys(leadsByStatus).length === 0) {
    return (
      <div className="mt-8 border-4 border-zinc-100 bg-zinc-900 p-8 text-center shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
        <h2 className="text-2xl font-black uppercase tracking-tighter text-lime-400">
          {t('dashboard.no_data', 'Ainda não há dados para os gráficos')}
        </h2>
        <p className="mt-2 font-bold text-zinc-400">
          {t('dashboard.add_leads_to_view', 'Adicione leads ao funil para visualizar os relatórios neo-brutalistas.')}
        </p>
      </div>
    );
  }

  const leadsData = Object.entries(leadsByStatus).map(([status, count]) => ({
    status,
    count
  }));

  const revenueData = Object.entries(revenueByStatus).map(([status, value]) => ({
    status,
    value
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="border-4 border-black bg-white p-4 shadow-[4px_4px_0px_0px_black]">
          <p className="font-black text-black uppercase">{label}</p>
          <p className="font-bold text-black">
            {payload[0].name === 'value' ? '$' + payload[0].value.toFixed(2) : payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
    return `$${value}`;
  };

  return (
    <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
      {/* Gráfico de Barras: Leads por Status */}
      <div className="flex flex-col border-4 border-zinc-100 bg-zinc-900 p-6 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
        <h2 className="mb-6 text-xl font-bold uppercase text-zinc-100">{t('dashboard.lead_status', 'Leads por Status')}</h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={leadsData}>
              <XAxis dataKey="status" stroke="#ffffff" tick={{ fill: '#ffffff', fontWeight: 'bold' }} tickLine={false} axisLine={{ strokeWidth: 3 }} />
              <YAxis stroke="#ffffff" tick={{ fill: '#ffffff', fontWeight: 'bold' }} tickLine={false} axisLine={{ strokeWidth: 3 }} allowDecimals={false} width={40} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} />
              <Bar dataKey="count" name="Leads" fill="#a3e635" stroke="black" strokeWidth={3} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Área: Receita por Status */}
      <div className="flex flex-col border-4 border-zinc-100 bg-zinc-900 p-6 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
        <h2 className="mb-6 text-xl font-bold uppercase text-zinc-100">{t('dashboard.revenue', 'Receita Estimada / Status')}</h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <XAxis dataKey="status" stroke="#ffffff" tick={{ fill: '#ffffff', fontWeight: 'bold' }} tickLine={false} axisLine={{ strokeWidth: 3 }} />
              <YAxis stroke="#ffffff" tick={{ fill: '#ffffff', fontWeight: 'bold' }} tickLine={false} axisLine={{ strokeWidth: 3 }} tickFormatter={formatYAxis} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" name="value" stroke="black" strokeWidth={3} fill="#c084fc" fillOpacity={1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
