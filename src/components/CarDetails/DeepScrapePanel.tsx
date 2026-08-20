import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Play, Terminal, AlertTriangle, ChevronDown, Sparkles, Zap, Eye, Check } from 'lucide-react';
import { Car } from '../../types';
import { getApiHeaders } from '../../utils/apiKeyHelper';
import { motion, AnimatePresence } from 'motion/react';

interface ModelOption {
  value: string;
  label: string;
  sublabel: string;
  badge?: string;
  icon: React.ReactNode;
}

const DEEP_SCRAPE_MODELS: ModelOption[] = [
  {
    value: 'gemini-3.6-flash',
    label: 'Gemini 3.6 Flash',
    sublabel: 'O novo carro-chefe para extração e raciocínio avançado',
    badge: 'Novo 3.6',
    icon: <Sparkles className="h-3.5 w-3.5 text-amber-500" />
  },
  {
    value: 'gemini-3.5-flash-lite',
    label: 'Gemini 3.5 Flash-Lite',
    sublabel: 'Resposta ultra rápida com cota maior (30 RPM)',
    badge: 'Rápido',
    icon: <Zap className="h-3.5 w-3.5 text-emerald-400" />
  },
  {
    value: 'gemini-3.5-flash',
    label: 'Gemini 3.5 Flash',
    sublabel: 'Equilíbrio ideal de inteligência e agilidade',
    icon: <Sparkles className="h-3.5 w-3.5 text-amber-400" />
  },
  {
    value: 'gemini-3.1-pro',
    label: 'Gemini 3.1 Pro',
    sublabel: 'Modelo Pro avançado para análises profundas',
    icon: <Cpu className="h-3.5 w-3.5 text-cyan-400" />
  }
];

interface DeepScrapePanelProps {
  car: Car;
  onEnrich: (data: {
    enrichedCar: Car;
    laudoCompleto: string;
    sellerNotes: string;
    extractedFeatures: string[];
  }) => void;
  onScrapeStateChange?: (scraping: boolean) => void;
}

export default function DeepScrapePanel({ car, onEnrich, onScrapeStateChange }: DeepScrapePanelProps) {
  const [deepScrapingUrl, setDeepScrapingUrl] = useState<string>(car.detailUrl || '');
  const [selectedAiModel, setSelectedAiModel] = useState<string>('gemini-3.6-flash');
  const [isScrapingDeep, setIsScrapingDeep] = useState<boolean>(false);
  const [deepScrapingLogs, setDeepScrapingLogs] = useState<string[]>([]);
  const [deepScrapingError, setDeepScrapingError] = useState<string | null>(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedModelObj = DEEP_SCRAPE_MODELS.find(m => m.value === selectedAiModel) || DEEP_SCRAPE_MODELS[0];

  useEffect(() => {
    setDeepScrapingUrl(car.detailUrl || '');
    setDeepScrapingError(null);
    setDeepScrapingLogs([]);
  }, [car]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isDropdownOpen]);

  const handleDeepScrape = async () => {
    if (!deepScrapingUrl || deepScrapingUrl.trim() === '') {
      setDeepScrapingError('Por favor, informe uma URL válida para extrair os detalhes do veículo.');
      return;
    }
    
    setIsScrapingDeep(true);
    if (onScrapeStateChange) onScrapeStateChange(true);
    setDeepScrapingError(null);
    setDeepScrapingLogs([
      `[${new Date().toLocaleTimeString('pt-BR')}] 🚀 Inicializando mecanismo de raspagem em profundidade por link...`,
      `[${new Date().toLocaleTimeString('pt-BR')}] 🤖 Modelo de IA designado: "${selectedAiModel}"`,
      `[${new Date().toLocaleTimeString('pt-BR')}] 🔗 URL identificada: ${deepScrapingUrl}`,
      `[${new Date().toLocaleTimeString('pt-BR')}] ⚙️ Estabelecendo handshake seguro de redirecionamento...`
    ]);

    try {
      await new Promise(r => setTimeout(r, 800));
      setDeepScrapingLogs(prev => [...prev, `[${new Date().toLocaleTimeString('pt-BR')}] 🌐 Conectando com Jina Reader Cloud (bypassing proxies e cookies)...`]);
      
      const response = await fetch('/api/scrape-vehicle-details', {
        method: 'POST',
        headers: getApiHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ url: deepScrapingUrl, modelName: selectedAiModel })
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Falha ao processar a extração em profundidade do anúncio.');
      }

      if (result.routingLogs && result.routingLogs.length > 0) {
        setDeepScrapingLogs(result.routingLogs);
      }

      const fresh = result.data;
      
      const mergedSpecs = {
        acceleration: fresh.specs?.acceleration ?? car.specs?.acceleration ?? 9.5,
        topSpeed: fresh.specs?.topSpeed ?? car.specs?.topSpeed ?? 190,
        power: fresh.specs?.power ?? car.specs?.power ?? 135,
        torque: fresh.specs?.torque ?? car.specs?.torque ?? 180,
        rangeOrdisplacement: fresh.kmText || fresh.specs?.rangeOrdisplacement || car.specs?.rangeOrdisplacement || "Disponível",
        weight: fresh.specs?.weight ?? car.specs?.weight ?? 1250
      };

      // Mapeia galeria
      let mergedGallery: string[] = [];
      let primaryImage = car.image;

      if (fresh.gallery && fresh.gallery.length > 0) {
        const cleanedIncomings = fresh.gallery.filter((img: string) => img && img.startsWith('http') && !img.includes('pixel') && !img.includes('transparent'));
        if (cleanedIncomings.length > 0) {
          primaryImage = cleanedIncomings[0];
          mergedGallery = Array.from(new Set([...cleanedIncomings, ...(car.gallery || [car.image])]));
        }
      }
      if (mergedGallery.length === 0) {
        mergedGallery = car.gallery && car.gallery.length > 0 ? [...car.gallery] : [car.image];
      }

      // Mapeia opcionais
      const originalFeatures = car.features || [];
      const incomingFeatures = fresh.features || [];
      const mergedFeatures = Array.from(new Set([...originalFeatures, ...incomingFeatures]));
      
      const newlyExtractedFeatures = incomingFeatures.filter((f: string) => !originalFeatures.includes(f));

      const enrichedCar: Car = {
        ...car,
        name: fresh.name || car.name,
        brand: fresh.brand || car.brand,
        price: fresh.price && fresh.price > 0 ? fresh.price : car.price,
        year: fresh.year || car.year,
        image: primaryImage,
        description: fresh.description || car.description,
        specs: mergedSpecs,
        gallery: mergedGallery,
        features: mergedFeatures,
        detailUrl: deepScrapingUrl,
        sellerName: fresh.sellerName || car.sellerName || "Garagem do Nelsinho",
        sellerPhone: fresh.sellerPhone || car.sellerPhone
      };

      setDeepScrapingLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString('pt-BR')}] 🎉 SUCESSO! Ficha do veículo foi enriquecida nativamente.`,
        `[${new Date().toLocaleTimeString('pt-BR')}] ✅ Estruturação inteligente absorvida no showroom com sucesso!`
      ]);

      onEnrich({
        enrichedCar,
        laudoCompleto: fresh.laudoCompleto,
        sellerNotes: fresh.sellerNotes,
        extractedFeatures: newlyExtractedFeatures
      });

    } catch (err: any) {
      console.error("[Deep Scrape Error]", err);
      setDeepScrapingError(err.message || String(err));
      setDeepScrapingLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString('pt-BR')}] ❌ ERRO CATASTRÓFICO: ${err.message || String(err)}`
      ]);
    } finally {
      setIsScrapingDeep(false);
      if (onScrapeStateChange) onScrapeStateChange(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/5 bg-zinc-900/30 p-6 text-left space-y-5 relative luxury-glass hover:border-amber-500/20 transition-all duration-300 group">
      <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-amber-500/5 to-transparent pointer-events-none transition-all duration-500 group-hover:from-amber-500/10 group-hover:scale-110 rounded-tr-3xl" />
      
      <div className="flex items-center space-x-2.5">
        <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.05)] transition-all group-hover:border-amber-500/40">
          <Cpu className="h-4.5 w-4.5 text-amber-500 group-hover:scale-110 transition-transform duration-300" />
        </div>
        <div>
          <h4 className="font-luxury text-xs tracking-widest text-white uppercase leading-none mb-1">
            AUDITORIA & DEEP SCRAPING DE LINK
          </h4>
          <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Puxe detalhes finos da Web em profundidade</p>
        </div>
      </div>

      <div className="space-y-4 pt-1">
        <div>
          <label className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider mb-1.5 block">Configuração do Modelo de IA:</label>
          <div className="grid grid-cols-2 gap-2 relative">
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between gap-2 rounded-lg bg-zinc-950 text-amber-500 border border-white/10 hover:border-amber-500/30 px-3 py-2.5 text-[10px] font-mono transition-all focus:outline-none focus:border-amber-500/50 cursor-pointer select-none shadow-lg text-left"
              >
                <span className="flex items-center gap-1.5 truncate">
                  {selectedModelObj.icon}
                  <span className="truncate">{selectedModelObj.label}</span>
                </span>
                <ChevronDown className={`h-3.5 w-3.5 text-zinc-500 transition-transform duration-300 flex-shrink-0 ${isDropdownOpen ? 'rotate-180 text-amber-500' : ''}`} />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 right-0 z-[1000] mt-1.5 w-[250px] rounded-xl border border-zinc-800 bg-zinc-950/95 p-1 shadow-2xl backdrop-blur-md"
                  >
                    <div className="px-2.5 py-1.5 border-b border-white/5 mb-1">
                      <span className="font-mono text-[7px] text-zinc-500 uppercase tracking-widest block">Selecione o Modelo</span>
                    </div>

                    <div className="space-y-0.5 max-h-[220px] overflow-y-auto custom-scrollbar">
                      {DEEP_SCRAPE_MODELS.map((model) => {
                        const isSelected = model.value === selectedAiModel;
                        return (
                          <button
                            key={model.value}
                            type="button"
                            onClick={() => {
                              setSelectedAiModel(model.value);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full rounded-lg px-2.5 py-1.5 text-left transition-all hover:bg-white/5 cursor-pointer flex items-start gap-2.5 group ${
                              isSelected ? 'bg-white/5 border border-white/5' : 'border border-transparent'
                            }`}
                          >
                            <div className="mt-0.5 flex-shrink-0">{model.icon}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className={`font-display text-[10.5px] font-medium leading-none block truncate ${
                                  isSelected ? 'text-amber-400 font-bold' : 'text-zinc-300 group-hover:text-white'
                                }`}>
                                  {model.label}
                                </span>
                                {model.badge && (
                                  <span className={`font-mono text-[6.5px] px-1.5 py-0.5 rounded leading-none flex-shrink-0 ${
                                    model.badge === 'Padrão' 
                                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/25'
                                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700/50'
                                  }`}>
                                    {model.badge}
                                  </span>
                                )}
                              </div>
                              <span className="font-display text-[8.5px] text-zinc-500 group-hover:text-zinc-400 block mt-1 leading-snug">
                                {model.sublabel}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="bg-zinc-950/80 border border-white/5 rounded-lg p-2.5 flex flex-col justify-center text-[8px] font-mono text-zinc-550 uppercase tracking-widest text-right leading-relaxed">
              <span>RPM: {selectedAiModel === 'gemini-3.1-flash-lite' ? '30' : '15'} | TPM: 1.0M</span>
              <span className="text-amber-500/80">Janela: 1.0M Tokens</span>
            </div>
          </div>
        </div>

        <div>
          <label className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider mb-1.5 block">URL do Anúncio do Carro:</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Cole o link do veículo (Webmotors, OLX, KBB, etc)"
              value={deepScrapingUrl}
              onChange={(e) => setDeepScrapingUrl(e.target.value)}
              className="flex-1 text-[10px] bg-zinc-950 text-zinc-200 border border-white/10 rounded-lg p-2.5 transition-all focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/10 placeholder:text-zinc-600 focus:shadow-[0_0_15px_rgba(245,158,11,0.03)]"
            />
          </div>
        </div>

        <div className="pt-1">
          <motion.button
            onClick={handleDeepScrape}
            disabled={isScrapingDeep || !deepScrapingUrl}
            whileHover={!isScrapingDeep && deepScrapingUrl ? { scale: 1.015, boxShadow: "0 0 20px rgba(245,158,11,0.25)" } : {}}
            whileTap={!isScrapingDeep && deepScrapingUrl ? { scale: 0.985 } : {}}
            transition={{ duration: 0.2 }}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 font-display text-xs text-black font-extrabold tracking-widest py-3.5 hover:bg-amber-400 transition-all cursor-pointer disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed uppercase shrink-0"
          >
            {isScrapingDeep ? (
              <>
                <span className="h-4 w-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                <span>Extraindo Dados via IA...</span>
              </>
            ) : (
              <>
                <Play className="h-4.5 w-4.5 text-black fill-current" />
                <span>Iniciar Auditoria de Link</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {(deepScrapingLogs.length > 0 || isScrapingDeep || deepScrapingError) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-white/5 pt-4"
          >
            <div className="flex items-center justify-between font-mono text-[8px] text-zinc-550 uppercase tracking-widest mb-2">
              <span className="flex items-center gap-1.5">
                <Terminal className="h-3 w-3 text-amber-500 animate-pulse" />
                Terminal logs de processamento:
              </span>
              <span>STATUS: {isScrapingDeep ? 'RUNNING' : deepScrapingError ? 'FAILED' : 'SUCCESS'}</span>
            </div>

            {/* Terminal com efeito CRT e Scanline */}
            <div className="relative bg-zinc-950 rounded-xl border border-white/5 overflow-hidden">
              {/* Efeito scanline do terminal */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.015)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px] pointer-events-none z-10" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/2 to-transparent pointer-events-none z-10 animate-[scanline_6s_linear_infinite]" />
              
              <div className="p-3.5 h-36 overflow-y-auto font-mono text-[9.5px] text-zinc-400 uppercase tracking-wider space-y-2 leading-relaxed select-text custom-scrollbar relative z-0">
                <AnimatePresence>
                  {deepScrapingLogs.map((log, idx) => {
                    let colorClass = 'text-zinc-400';
                    if (log.includes('✅') || log.includes('SUCESSO')) colorClass = 'text-emerald-450 font-bold';
                    else if (log.includes('❌') || log.includes('FAILED') || log.includes('FALHA')) colorClass = 'text-rose-450 font-bold';
                    else if (log.includes('⚠️') || log.includes('Modelo')) colorClass = 'text-amber-500';
                    else if (log.includes('🤖')) colorClass = 'text-cyan-400';
                    
                    return (
                      <motion.div 
                        key={idx} 
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25 }}
                        className={`${colorClass} whitespace-pre-wrap font-sans`}
                      >
                        {log}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {isScrapingDeep && (
                  <div className="flex items-center gap-1.5 text-amber-500 animate-pulse text-[8.5px] font-sans mt-2">
                    <span>●</span>
                    <span>Aguardando resposta do servidor remoto...</span>
                  </div>
                )}
              </div>
            </div>

            {deepScrapingError && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 rounded-xl bg-rose-500/5 border border-rose-500/20 p-3 flex gap-2 text-rose-350 text-[10px] leading-relaxed select-text text-left"
              >
                <AlertTriangle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-extrabold uppercase font-sans text-rose-400 block mb-0.5">Erro no Deep Scraping</strong>
                  <p className="font-sans font-light">{deepScrapingError}</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
