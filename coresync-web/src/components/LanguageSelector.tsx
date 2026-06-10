import { useTranslation } from 'react-i18next';

export function LanguageSelector() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex gap-2 bg-white dark:bg-zinc-900 p-2 border-4 border-zinc-950 dark:border-zinc-800 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]">
      <button 
        onClick={() => changeLanguage('pt')} 
        className={`px-2 py-1 text-xl transition-transform active:translate-y-1 ${i18n.language === 'pt' ? 'grayscale-0 scale-110' : 'grayscale opacity-50 hover:grayscale-0 hover:opacity-100'}`}
        title="Português"
      >
        🇧🇷
      </button>
      <button 
        onClick={() => changeLanguage('en')} 
        className={`px-2 py-1 text-xl transition-transform active:translate-y-1 ${i18n.language === 'en' ? 'grayscale-0 scale-110' : 'grayscale opacity-50 hover:grayscale-0 hover:opacity-100'}`}
        title="English"
      >
        🇺🇸
      </button>
      <button 
        onClick={() => changeLanguage('es')} 
        className={`px-2 py-1 text-xl transition-transform active:translate-y-1 ${i18n.language === 'es' ? 'grayscale-0 scale-110' : 'grayscale opacity-50 hover:grayscale-0 hover:opacity-100'}`}
        title="Español"
      >
        🇪🇸
      </button>
      <button 
        onClick={() => changeLanguage('it')} 
        className={`px-2 py-1 text-xl transition-transform active:translate-y-1 ${i18n.language === 'it' ? 'grayscale-0 scale-110' : 'grayscale opacity-50 hover:grayscale-0 hover:opacity-100'}`}
        title="Italiano"
      >
        🇮🇹
      </button>
    </div>
  );
}
