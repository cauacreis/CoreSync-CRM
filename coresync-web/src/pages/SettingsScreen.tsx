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
    <div className="flex h-full w-full flex-col p-8 overflow-hidden bg-zinc-950">
      
      {/* Header Neo-Brutalista */}
      <div className="mb-8 flex items-center justify-between shrink-0">
        <h1 className="text-5xl font-black uppercase tracking-tighter text-zinc-100">Configurações</h1>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="border-4 border-zinc-100 bg-lime-400 px-6 py-2 font-bold text-zinc-950 transition-transform active:translate-x-1 active:translate-y-1 hover:bg-lime-300 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
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

      {/* Main Layout: Sidebar + Content */}
      <div className="flex flex-col md:flex-row h-full min-h-0 gap-8 overflow-hidden">
        
        {/* Sidebar */}
        <div 
          ref={sidebarScrollRef}
          onWheel={(e) => handleWheel(e, sidebarScrollRef, false)}
          className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto scrollbar-hide pb-2 md:pb-0"
        >
          <button 
            onClick={() => setActiveTab('profile')}
            className={`border-4 p-4 text-left font-black uppercase transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-1 active:translate-y-1 ${activeTab === 'profile' ? 'bg-lime-400 border-zinc-100 text-zinc-950' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-500'}`}
          >
            Perfil & Preferências
          </button>
          <button 
            onClick={() => setActiveTab('crm')}
            className={`border-4 p-4 text-left font-black uppercase transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-1 active:translate-y-1 ${activeTab === 'crm' ? 'bg-lime-400 border-zinc-100 text-zinc-950' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-500'}`}
          >
            Regras do CRM
          </button>
          <button 
            onClick={() => setActiveTab('integrations')}
            className={`border-4 p-4 text-left font-black uppercase transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-1 active:translate-y-1 ${activeTab === 'integrations' ? 'bg-lime-400 border-zinc-100 text-zinc-950' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-500'}`}
          >
            Integrações & API
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`border-4 p-4 text-left font-black uppercase transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-1 active:translate-y-1 ${activeTab === 'security' ? 'bg-red-500 border-zinc-100 text-zinc-950' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-500'}`}
          >
            Segurança
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto border-4 border-zinc-100 bg-zinc-900 p-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
          
          {/* ABA: PERFIL */}
          {activeTab === 'profile' && (
            <div className="flex flex-col gap-8 max-w-xl">
              <h2 className="text-3xl font-black uppercase text-zinc-100 border-b-4 border-zinc-800 pb-4">Dados do Usuário</h2>
              
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-zinc-400 uppercase">Nome Completo</label>
                  <input type="text" defaultValue="Admin User" className="border-4 border-zinc-800 bg-zinc-950 p-3 text-white focus:border-lime-400 outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-zinc-400 uppercase">Cargo</label>
                  <input type="text" defaultValue="Head of Sales" className="border-4 border-zinc-800 bg-zinc-950 p-3 text-white focus:border-lime-400 outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-zinc-400 uppercase">E-mail</label>
                  <input type="email" defaultValue="admin@coresync.com" disabled className="border-4 border-zinc-800 bg-zinc-900 p-3 text-zinc-500 outline-none cursor-not-allowed" />
                </div>
              </div>

              <h2 className="text-3xl font-black uppercase text-zinc-100 border-b-4 border-zinc-800 pb-4 mt-4">Preferências Locais</h2>
              
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-zinc-400 uppercase">Idioma da Interface</label>
                  <select 
                    value={i18n.language} 
                    onChange={handleLanguageChange}
                    className="border-4 border-zinc-800 bg-zinc-950 p-3 text-white focus:border-lime-400 outline-none w-full max-w-xs appearance-none font-bold"
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
                    className={`w-16 h-8 border-4 border-zinc-100 cursor-pointer transition-colors relative flex items-center shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] ${notifications ? 'bg-lime-400' : 'bg-zinc-600'}`}
                  >
                    <div className={`w-6 h-6 border-4 border-zinc-100 bg-zinc-950 absolute transition-transform ${notifications ? 'translate-x-8' : 'translate-x-1'}`}></div>
                  </div>
                  <span className="font-bold text-zinc-100 uppercase">Notificações em Tela</span>
                </div>
              </div>

              <button className="mt-4 border-4 border-lime-400 bg-lime-400 p-3 text-lg font-black uppercase text-zinc-950 transition-transform active:translate-x-1 active:translate-y-1 shadow-[4px_4px_0px_0px_rgba(163,230,53,1)] hover:bg-lime-300 w-fit">
                Salvar Preferências
              </button>
            </div>
          )}

          {/* ABA: CRM */}
          {activeTab === 'crm' && (
            <div className="flex flex-col gap-8 max-w-3xl">
              <h2 className="text-3xl font-black uppercase text-zinc-100 border-b-4 border-zinc-800 pb-4">Configurações Base</h2>
              
              <div className="flex flex-col gap-2">
                <label className="font-bold text-zinc-400 uppercase">Moeda Padrão</label>
                <select 
                  value={currency} 
                  onChange={handleCurrencyChange}
                  className="border-4 border-zinc-800 bg-zinc-950 p-3 text-white focus:border-lime-400 outline-none w-full max-w-xs font-bold"
                >
                  <option value="USD">US$ - Dólar</option>
                  <option value="BRL">R$ - Real</option>
                  <option value="EUR">€ - Euro</option>
                </select>
              </div>

              <h2 className="text-3xl font-black uppercase text-zinc-100 border-b-4 border-zinc-800 pb-4 mt-4">Pipeline Management</h2>
              
              <div 
                ref={pipelineTagsScrollRef}
                onWheel={(e) => handleWheel(e, pipelineTagsScrollRef, true)}
                className="flex flex-row gap-4 overflow-x-auto scrollbar-hide pb-4"
              >
                {['NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'UNPAID', 'LOST'].map(stage => (
                  <div key={stage} className="shrink-0 border-4 border-zinc-700 bg-zinc-800 p-3 font-black text-zinc-300 uppercase flex items-center gap-2 cursor-move hover:border-lime-400 transition-colors">
                    <span className="text-zinc-500">::</span> {stage}
                  </div>
                ))}
                <button className="shrink-0 border-4 border-lime-400 border-dashed bg-transparent p-3 font-black text-lime-400 uppercase hover:bg-lime-400/10 transition-colors">
                  + NOVO ESTÁGIO
                </button>
              </div>

              <h2 className="text-3xl font-black uppercase text-zinc-100 border-b-4 border-zinc-800 pb-4 mt-4">Catálogo</h2>
              <p className="text-zinc-400 font-bold mb-2">Gerencie produtos e SKUs do seu SaaS</p>
              <button 
                onClick={() => navigate('/products')}
                className="border-4 border-zinc-100 bg-purple-500 p-3 text-lg font-black uppercase text-white transition-transform active:translate-x-1 active:translate-y-1 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:bg-purple-400 w-fit"
              >
                Abrir Catálogo de Produtos
              </button>
            </div>
          )}

          {/* ABA: INTEGRAÇÕES */}
          {activeTab === 'integrations' && (
            <div className="flex flex-col gap-8">
              <h2 className="text-3xl font-black uppercase text-zinc-100 border-b-4 border-zinc-800 pb-4">Serviços Conectados</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Telegram */}
                <div className="border-4 border-zinc-100 bg-blue-600 p-6 shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-black text-white uppercase">Telegram Bot</h3>
                    <span className="bg-lime-400 text-zinc-950 font-black px-2 py-1 border-2 border-black text-sm">🟢 CONECTADO</span>
                  </div>
                  <p className="text-blue-100 font-bold">Chat ID Vinculado: <span className="text-white">@CoreSync_Alpha_Bot</span></p>
                  <button className="mt-auto border-4 border-black bg-white p-2 font-black uppercase text-black hover:bg-zinc-200 w-fit shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1">
                    Testar Conexão
                  </button>
                </div>

                {/* Groq AI */}
                <div className="border-4 border-zinc-100 bg-zinc-800 p-6 shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-black text-lime-400 uppercase">Groq AI (Llama)</h3>
                    <span className="bg-lime-400 text-zinc-950 font-black px-2 py-1 border-2 border-black text-sm">🟢 ATIVO</span>
                  </div>
                  <p className="text-zinc-400 font-bold">Modelo Atual: <span className="text-white">llama3-8b-8192</span></p>
                  <button className="mt-auto border-4 border-lime-400 bg-transparent p-2 font-black uppercase text-lime-400 hover:bg-lime-400/20 w-fit shadow-[2px_2px_0px_0px_rgba(163,230,53,1)] active:translate-x-1 active:translate-y-1">
                    Ping LPU
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ABA: SEGURANÇA */}
          {activeTab === 'security' && (
            <div className="flex flex-col gap-8 max-w-xl">
              <h2 className="text-3xl font-black uppercase text-zinc-100 border-b-4 border-zinc-800 pb-4">Credenciais</h2>
              
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-zinc-400 uppercase">Nova Senha</label>
                  <input type="password" placeholder="••••••••" className="border-4 border-zinc-800 bg-zinc-950 p-3 text-white focus:border-lime-400 outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-zinc-400 uppercase">Confirmar Nova Senha</label>
                  <input type="password" placeholder="••••••••" className="border-4 border-zinc-800 bg-zinc-950 p-3 text-white focus:border-lime-400 outline-none" />
                </div>
                <button className="mt-2 border-4 border-zinc-100 bg-zinc-100 p-3 font-black uppercase text-zinc-950 hover:bg-zinc-200 w-fit shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-1 active:translate-y-1">
                  Atualizar Senha
                </button>
              </div>

              <h2 className="text-3xl font-black uppercase text-red-500 border-b-4 border-red-900 pb-4 mt-8">Zona de Perigo</h2>
              <p className="text-zinc-400 font-bold">Isso irá desconectar você e todos os outros dispositivos ativos instantaneamente.</p>
              
              <button className="border-4 border-red-500 bg-red-600 p-4 text-xl font-black uppercase text-white hover:bg-red-500 w-fit shadow-[6px_6px_0px_0px_rgba(239,68,68,1)] active:translate-x-1 active:translate-y-1">
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
