import { Sparkles, Compass, Activity, Globe, Settings, Users, Sun, Moon } from 'lucide-react';
import { triggerNelsinhoMouseHover } from './MouseTelemetryDashboard';

interface NavbarProps {
  onOpenAiConcierge: () => void;
  activeTab: 'showroom' | 'metrics' | 'custom_scrape' | 'waiting_list';
  onTabChange: (tab: 'showroom' | 'metrics' | 'custom_scrape' | 'waiting_list') => void;
  onOpenSettings: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function Navbar({
  onOpenAiConcierge,
  activeTab,
  onTabChange,
  onOpenSettings,
  theme,
  onToggleTheme,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-zinc-950/85 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        
        {/* Brand Logo and Slogan */}
        <div 
          className="flex items-center space-x-6 cursor-pointer"
          onClick={() => onTabChange('showroom')}
          onMouseEnter={() => triggerNelsinhoMouseHover('nav-logo')}
        >
          <div className="flex flex-col">
            <span className="font-luxury text-xl tracking-[0.25em] text-white">
              NELSINHO<span className="text-amber-500 font-bold font-sans">.</span>
            </span>
            <span className="font-mono text-[8.5px] uppercase tracking-[0.25em] text-amber-500 font-semibold">
              GARAGEM • SISTEMA INTERNO
            </span>
          </div>
          
          {/* Decorative Divider */}
          <div 
            className="hidden h-8 w-px bg-white/10 md:block transition-all hover:bg-amber-500/50" 
            onMouseEnter={() => triggerNelsinhoMouseHover('nav-divider')}
          />
          
          {/* Internal Slogan */}
          <p 
            className="hidden font-display text-[10px] font-semibold tracking-widest text-zinc-400 lg:block uppercase transition-colors hover:text-white"
            onMouseEnter={() => triggerNelsinhoMouseHover('nav-slogan')}
          >
            Painel de Consulta & Atendimento
          </p>
        </div>

        {/* Dynamic Navigation Tabs inside Navbar */}
        <div className="hidden md:flex items-center space-x-1 rounded-full border border-white/5 bg-zinc-900/40 p-1 flex-shrink-0">
          <button
            onClick={() => onTabChange('showroom')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-all text-[10px] xl:text-[11px] font-medium uppercase tracking-wider cursor-pointer whitespace-nowrap flex-shrink-0 ${
              activeTab === 'showroom'
                ? 'bg-amber-500 text-black font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Showroom</span>
          </button>

          <button
            onClick={() => onTabChange('metrics')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-all text-[10px] xl:text-[11px] font-medium uppercase tracking-wider cursor-pointer whitespace-nowrap flex-shrink-0 ${
              activeTab === 'metrics'
                ? 'bg-amber-500 text-black font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Métricas</span>
          </button>

          <button
            onClick={() => onTabChange('custom_scrape')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-all text-[10px] xl:text-[11px] font-medium uppercase tracking-wider cursor-pointer whitespace-nowrap flex-shrink-0 ${
              activeTab === 'custom_scrape'
                ? 'bg-amber-500 text-black font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Scraper URL</span>
          </button>

          <button
            onClick={() => onTabChange('waiting_list')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-all text-[10px] xl:text-[11px] font-medium uppercase tracking-wider cursor-pointer whitespace-nowrap flex-shrink-0 ${
              activeTab === 'waiting_list'
                ? 'bg-amber-500 text-black font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Fila de Espera</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          {/* Visible on mobile only dropdown/simple toggle tab representation */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => onTabChange('showroom')}
              className={`p-2 rounded-full border ${activeTab === 'showroom' ? 'border-amber-500/50 bg-amber-500/10 text-amber-500' : 'border-white/5 text-zinc-400'}`}
              title="Showroom"
            >
              <Compass className="h-4 w-4" />
            </button>
            <button
              onClick={() => onTabChange('metrics')}
              className={`p-2 rounded-full border ${activeTab === 'metrics' ? 'border-amber-500/50 bg-amber-500/10 text-amber-500' : 'border-white/5 text-zinc-400'}`}
              title="Métricas de Controle"
            >
              <Activity className="h-4 w-4" />
            </button>
            <button
              onClick={() => onTabChange('custom_scrape')}
              className={`p-2 rounded-full border ${activeTab === 'custom_scrape' ? 'border-amber-500/50 bg-amber-500/10 text-amber-500' : 'border-white/5 text-zinc-400'}`}
              title="Scraper de URL"
            >
              <Globe className="h-4 w-4" />
            </button>
            <button
              onClick={() => onTabChange('waiting_list')}
              className={`p-2 rounded-full border ${activeTab === 'waiting_list' ? 'border-amber-500/50 bg-amber-500/10 text-amber-500' : 'border-white/5 text-zinc-400'}`}
              title="Fila de Espera"
            >
              <Users className="h-4 w-4" />
            </button>
          </div>

          {/* AI Helper Trigger */}
          <button
            id="btn-navbar-concierge"
            onClick={onOpenAiConcierge}
            onMouseEnter={() => triggerNelsinhoMouseHover('nav-concierge-btn')}
            className="relative flex items-center space-x-2 overflow-hidden rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-2 font-display text-[10px] sm:text-xs font-medium tracking-widest text-amber-400 transition-all hover:border-amber-500/40 hover:bg-amber-500/10 cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 animate-pulse text-amber-500" />
            <span className="hidden xs:inline">AI CONCIERGE</span>
            <span className="xs:hidden">CONCIERGE</span>
          </button>

          {/* Theme Toggle Trigger */}
          <button
            onClick={onToggleTheme}
            onMouseEnter={() => triggerNelsinhoMouseHover('nav-theme-btn')}
            className="p-2 rounded-full border border-white/5 bg-zinc-900/45 text-zinc-400 hover:text-white hover:border-amber-500/20 transition-all cursor-pointer"
            title={theme === 'dark' ? "Alternar para Modo Claro" : "Alternar para Modo Escuro"}
          >
            {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            onMouseEnter={() => triggerNelsinhoMouseHover('nav-settings-btn')}
            className="p-2 rounded-full border border-white/5 bg-zinc-900/45 text-zinc-400 hover:text-white hover:border-amber-500/20 transition-all cursor-pointer"
            title="Configurações de Chaves de API"
          >
            <Settings className="h-4.5 w-4.5" />
          </button>
        </div>

      </div>
    </header>
  );
}
