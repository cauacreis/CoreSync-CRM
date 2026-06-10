import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogoutModal } from '../components/LogoutModal';

export function SettingsScreen() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('profile');
  const sidebarScrollRef = useRef<HTMLDivElement>(null);
  const pipelineTagsScrollRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent, ref: React.RefObject<HTMLDivElement>, forceHorizontal = false) => {
    if (e.deltaY !== 0 && ref.current) {
      // Se for desktop e for a sidebar (que é vertical no md:), não converte scroll
      const isMobile = window.innerWidth < 768;
      if (forceHorizontal || isMobile) {
        ref.current.scrollLeft += e.deltaY;
      }
    }
  };

  // Mocks
  const [currency, setCurrency] = useState(localStorage.getItem('@CoreSync:currency') || 'USD');
  const [notifications, setNotifications] = useState(localStorage.getItem('@CoreSync:notifications') !== 'false');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('@CoreSync:token');
    navigate('/login');
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrency(e.target.value);
    localStorage.setItem('@CoreSync:currency', e.target.value);
  };

  const handleNotificationToggle = () => {
    const newVal = !notifications;
    setNotifications(newVal);
    localStorage.setItem('@CoreSync:notifications', String(newVal));
  };

  return (
    <div className="flex h-screen w-full flex-col p-4 md:p-8 overflow-hidden bg-zinc-100 dark:bg-zinc-950">
      
      {/* Header Neo-Brutalista */}
      <div className="mb-4 md:mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-zinc-950 dark:text-zinc-100">Configurações</h1>
        <div className="flex gap-4 w-full md:w-auto">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 md:flex-none border-4 border-zinc-950 dark:border-zinc-100 bg-lime-400 px-6 py-3 font-black uppercase text-zinc-950 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-1 active:translate-y-1 hover:bg-lime-500"
          >
            Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 md:flex-none border-4 border-zinc-950 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-950 px-6 py-3 font-black uppercase text-zinc-950 dark:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-1 active:translate-y-1 hover:bg-zinc-200 dark:hover:bg-zinc-900"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex flex-col md:flex-row flex-1 min-h-0 gap-8 overflow-hidden">
        
        {/* Sidebar */}
        <div 
          ref={sidebarScrollRef}
          onWheel={(e) => handleWheel(e, sidebarScrollRef, false)}
          className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto scrollbar-hide pb-2 md:pb-0"
        >
          <button 
            onClick={() => setActiveTab('profile')}
            className={`border-4 p-4 text-left font-black uppercase transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-1 active:translate-y-1 ${activeTab === 'profile' ? 'bg-lime-400 border-zinc-950 dark:border-zinc-100 text-zinc-950' : 'bg-white dark:bg-zinc-900 border-zinc-950 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-500'}`}
          >
            Perfil & Preferências
          </button>
          <button 
            onClick={() => setActiveTab('crm')}
            className={`border-4 p-4 text-left font-black uppercase transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-1 active:translate-y-1 ${activeTab === 'crm' ? 'bg-lime-400 border-zinc-950 dark:border-zinc-100 text-zinc-950' : 'bg-white dark:bg-zinc-900 border-zinc-950 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-500'}`}
          >
            Regras do CRM
          </button>
          <button 
            onClick={() => setActiveTab('integrations')}
            className={`border-4 p-4 text-left font-black uppercase transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-1 active:translate-y-1 ${activeTab === 'integrations' ? 'bg-lime-400 border-zinc-950 dark:border-zinc-100 text-zinc-950' : 'bg-white dark:bg-zinc-900 border-zinc-950 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-500'}`}
          >
            Integrações & API
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`border-4 p-4 text-left font-black uppercase transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-1 active:translate-y-1 ${activeTab === 'security' ? 'bg-red-500 border-zinc-950 dark:border-zinc-100 text-zinc-950' : 'bg-white dark:bg-zinc-900 border-zinc-950 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-500'}`}
          >
            Segurança
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto border-4 border-zinc-950 dark:border-zinc-100 bg-white dark:bg-zinc-900 p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
          
          {/* ABA: PERFIL */}
          {activeTab === 'profile' && (
            <div className="flex flex-col gap-8 max-w-xl">
              <h2 className="text-3xl font-black uppercase text-zinc-950 dark:text-zinc-100 border-b-4 border-zinc-950 dark:border-zinc-800 pb-4">Dados do Usuário</h2>
              
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-zinc-600 dark:text-zinc-400 uppercase">Nome Completo</label>
                  <input type="text" defaultValue="Admin User" className="border-4 border-zinc-950 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 p-3 text-zinc-950 dark:text-white focus:border-lime-400 dark:focus:border-lime-400 outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-zinc-600 dark:text-zinc-400 uppercase">Cargo</label>
                  <input type="text" defaultValue="Head of Sales" className="border-4 border-zinc-950 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 p-3 text-zinc-950 dark:text-white focus:border-lime-400 dark:focus:border-lime-400 outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-zinc-600 dark:text-zinc-400 uppercase">E-mail</label>
                  <input type="email" defaultValue="admin@coresync.com" disabled className="border-4 border-zinc-950 dark:border-zinc-800 bg-zinc-200 dark:bg-zinc-900 p-3 text-zinc-600 dark:text-zinc-500 outline-none cursor-not-allowed" />
                </div>
              </div>

              <h2 className="text-3xl font-black uppercase text-zinc-950 dark:text-zinc-100 border-b-4 border-zinc-950 dark:border-zinc-800 pb-4 mt-4">Preferências Locais</h2>
              
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-zinc-600 dark:text-zinc-400 uppercase">Tema da Interface</label>
                  <select 
                    value={localStorage.getItem('@CoreSync:theme') || 'dark'}
                    onChange={(e) => {
                      localStorage.setItem('@CoreSync:theme', e.target.value);
                      window.location.reload();
                    }}
                    className="border-4 border-zinc-950 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 p-3 text-zinc-950 dark:text-white focus:border-lime-400 outline-none w-full max-w-xs appearance-none font-bold"
                  >
                    <option value="dark">🌑 Modo Escuro (Neo-Brutalismo)</option>
                    <option value="light">☀️ Modo Claro (Brutalismo Puro)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-bold text-zinc-600 dark:text-zinc-400 uppercase">Idioma da Interface</label>
                  <select 
                    value={i18n.language} 
                    onChange={handleLanguageChange}
                    className="border-4 border-zinc-950 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 p-3 text-zinc-950 dark:text-white focus:border-lime-400 outline-none w-full max-w-xs appearance-none font-bold"
                  >
                    <option value="pt">🇧🇷 Português</option>
                    <option value="en">🇺🇸 English</option>
                    <option value="es">🇪🇸 Español</option>
                    <option value="it">🇮🇹 Italiano</option>
                  </select>
                </div>

                <div className="flex items-center gap-4">
                  <div 
                    onClick={handleNotificationToggle}
                    className={`w-16 h-8 border-4 border-zinc-950 dark:border-zinc-100 cursor-pointer transition-colors relative flex items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] ${notifications ? 'bg-lime-400' : 'bg-zinc-600'}`}
                  >
                    <div className={`w-6 h-6 border-4 border-zinc-950 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-950 absolute transition-transform ${notifications ? 'translate-x-8' : 'translate-x-1'}`}></div>
                  </div>
                  <span className="font-bold text-zinc-950 dark:text-zinc-100 uppercase">Notificações em Tela</span>
                </div>
              </div>

              <button className="mt-4 border-4 border-lime-400 bg-lime-400 p-3 text-lg font-black uppercase text-zinc-950 transition-transform active:translate-x-1 active:translate-y-1 shadow-[4px_4px_0px_0px_rgba(163,230,53,1)] hover:bg-lime-300 w-fit">
                Salvar Preferências
              </button>
            </div>
          )}

          {/* ABA: CRM */}
          {activeTab === 'crm' && (
            <div className="flex flex-col gap-8 max-w-2xl">
              <h2 className="text-3xl font-black uppercase text-zinc-950 dark:text-zinc-100 border-b-4 border-zinc-950 dark:border-zinc-800 pb-4">Regras do Funil</h2>

              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-zinc-600 dark:text-zinc-400 uppercase">SLA de Primeiro Contato</label>
                  <select className="border-4 border-zinc-950 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 p-3 text-zinc-950 dark:text-white focus:border-lime-400 outline-none w-full max-w-xs appearance-none font-bold">
                    <option>2 Horas</option>
                    <option>4 Horas</option>
                    <option>24 Horas</option>
                  </select>
                  <span className="text-sm text-zinc-500">Tempo máximo esperado para mover um Lead de NEW para CONTACTED.</span>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-bold text-zinc-600 dark:text-zinc-400 uppercase">Meta de Vendas Mensal (Receita)</label>
                  <input type="number" defaultValue="50000" className="border-4 border-zinc-950 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 p-3 text-zinc-950 dark:text-white focus:border-lime-400 outline-none w-full max-w-xs font-bold" />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-zinc-600 dark:text-zinc-400 uppercase">Motivos de Perda de Lead (Padrão)</label>
                  <textarea rows={3} defaultValue="Preço Alto&#10;Perdeu para o Concorrente&#10;Falta de Funcionalidade" className="border-4 border-zinc-950 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 p-3 text-zinc-950 dark:text-white focus:border-lime-400 outline-none w-full max-w-md font-bold"></textarea>
                  <span className="text-sm text-zinc-500">Um motivo por linha. Usado quando o estágio é alterado para LOST.</span>
                </div>
              </div>
              
              <h2 className="text-3xl font-black uppercase text-zinc-950 dark:text-zinc-100 border-b-4 border-zinc-950 dark:border-zinc-800 pb-4 mt-4">Pipeline Management</h2>
              
              <div 
                ref={pipelineTagsScrollRef}
                onWheel={(e) => handleWheel(e, pipelineTagsScrollRef, true)}
                className="flex flex-row gap-4 overflow-x-auto scrollbar-hide pb-4"
              >
                {['NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'UNPAID', 'LOST'].map(stage => (
                  <div key={stage} className="shrink-0 border-4 border-zinc-700 bg-zinc-200 dark:bg-zinc-800 p-3 font-black text-zinc-300 uppercase flex items-center gap-2 cursor-move hover:border-lime-400 transition-colors">
                    <span className="text-zinc-500">::</span> {stage}
                  </div>
                ))}
                <button className="shrink-0 border-4 border-lime-400 border-dashed bg-transparent p-3 font-black text-lime-600 dark:text-lime-400 uppercase hover:bg-lime-400/10 transition-colors">
                  + NOVO ESTÁGIO
                </button>
              </div>

              <h2 className="text-3xl font-black uppercase text-zinc-950 dark:text-zinc-100 border-b-4 border-zinc-950 dark:border-zinc-800 pb-4 mt-4">Catálogo</h2>
              <p className="text-zinc-600 dark:text-zinc-400 font-bold mb-2">Gerencie produtos e SKUs do seu SaaS</p>
              <button 
                onClick={() => navigate('/products')}
                className="border-4 border-zinc-950 dark:border-zinc-100 bg-purple-500 p-3 text-lg font-black uppercase text-zinc-950 dark:text-white transition-transform active:translate-x-1 active:translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:bg-purple-400 w-fit"
              >
                Abrir Catálogo de Produtos
              </button>
            </div>
          )}

          {/* ABA: INTEGRAÇÕES */}
          {activeTab === 'integrations' && (
            <div className="flex flex-col gap-8">
              <h2 className="text-3xl font-black uppercase text-zinc-950 dark:text-zinc-100 border-b-4 border-zinc-950 dark:border-zinc-800 pb-4">Serviços Conectados</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Telegram */}
                <div className="border-4 border-zinc-950 dark:border-zinc-100 bg-blue-600 p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-black text-zinc-950 dark:text-white uppercase">Telegram Bot</h3>
                    <span className="bg-lime-400 text-zinc-950 font-black px-2 py-1 border-2 border-black text-sm">🟢 CONECTADO</span>
                  </div>
                  <p className="text-blue-100 font-bold">Chat ID Vinculado: <span className="text-zinc-950 dark:text-white">@CoreSync_Alpha_Bot</span></p>
                  <button className="mt-auto border-4 border-black bg-white p-2 font-black uppercase text-black hover:bg-zinc-200 w-fit shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1">
                    Testar Conexão
                  </button>
                </div>

                {/* Groq AI */}
                <div className="border-4 border-zinc-950 dark:border-zinc-100 bg-zinc-200 dark:bg-zinc-800 p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-black text-lime-600 dark:text-lime-400 uppercase">Groq AI (Llama)</h3>
                    <span className="bg-lime-400 text-zinc-950 font-black px-2 py-1 border-2 border-black text-sm">🟢 ATIVO</span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 font-bold">Modelo Atual: <span className="text-zinc-950 dark:text-white">llama3-8b-8192</span></p>
                  <button className="mt-auto border-4 border-lime-400 bg-transparent p-2 font-black uppercase text-lime-600 dark:text-lime-400 hover:bg-lime-400/20 w-fit shadow-[2px_2px_0px_0px_rgba(163,230,53,1)] active:translate-x-1 active:translate-y-1">
                    Ping LPU
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-bold text-zinc-600 dark:text-zinc-400 uppercase">Fuso Horário</label>
                  <select className="border-4 border-zinc-950 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 p-3 text-zinc-950 dark:text-white focus:border-lime-400 outline-none w-full max-w-xs appearance-none font-bold">
                    <option>GMT-03:00 (Brasília)</option>
                    <option>GMT-04:00 (Manaus)</option>
                    <option>GMT+00:00 (UTC)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-bold text-zinc-600 dark:text-zinc-400 uppercase">Formato de Data</label>
                  <select className="border-4 border-zinc-950 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 p-3 text-zinc-950 dark:text-white focus:border-lime-400 outline-none w-full max-w-xs appearance-none font-bold">
                    <option>DD/MM/YYYY (25/12/2026)</option>
                    <option>MM/DD/YYYY (12/25/2026)</option>
                    <option>YYYY-MM-DD (2026-12-25)</option>
                  </select>
                </div>

              </div>
            </div>
          )}

          {/* ABA: SEGURANÇA */}
          {activeTab === 'security' && (
            <div className="flex flex-col gap-8 max-w-xl">
              <h2 className="text-3xl font-black uppercase text-zinc-950 dark:text-zinc-100 border-b-4 border-zinc-950 dark:border-zinc-800 pb-4">Credenciais</h2>
              
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-zinc-600 dark:text-zinc-400 uppercase">Nova Senha</label>
                  <input type="password" placeholder="••••••••" className="border-4 border-zinc-950 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 p-3 text-zinc-950 dark:text-white focus:border-lime-400 outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-zinc-600 dark:text-zinc-400 uppercase">Confirmar Nova Senha</label>
                  <input type="password" placeholder="••••••••" className="border-4 border-zinc-950 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 p-3 text-zinc-950 dark:text-white focus:border-lime-400 outline-none" />
                </div>
                <button className="mt-2 border-4 border-zinc-950 dark:border-zinc-100 bg-zinc-100 p-3 font-black uppercase text-zinc-950 hover:bg-zinc-200 w-fit shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-1 active:translate-y-1">
                  Atualizar Senha
                </button>
              </div>

              <h2 className="text-3xl font-black uppercase text-red-500 border-b-4 border-red-900 pb-4 mt-8">Zona de Perigo</h2>
              <p className="text-zinc-600 dark:text-zinc-400 font-bold">Isso irá desconectar você e todos os outros dispositivos ativos instantaneamente.</p>
              
              <button className="border-4 border-red-500 bg-red-600 p-4 text-xl font-black uppercase text-zinc-950 dark:text-white hover:bg-red-500 w-fit shadow-[6px_6px_0px_0px_rgba(239,68,68,1)] active:translate-x-1 active:translate-y-1">
                Revogar Todas as Sessões
              </button>

            </div>
          )}

        </div>
      </div>
      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onConfirm={confirmLogout} 
        onCancel={() => setIsLogoutModalOpen(false)} 
      />
    </div>
  );
}
