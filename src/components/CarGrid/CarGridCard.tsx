import { useState, useEffect } from 'react';
import { Car, Lead } from '../../types';
import { Eye, Sparkles, Check, Scale, User } from 'lucide-react';
import { triggerNelsinhoMouseHover } from '../MouseTelemetryDashboard';
import { motion } from 'motion/react';

interface CarGridCardProps {
  car: Car;
  isCompared: boolean;
  onAddToCompare: (car: Car) => void;
  onSelectCarForDetails: (car: Car) => void;
  leads?: Lead[];
  onContextMenu: (e: React.MouseEvent, car: Car) => void;
}

export default function CarGridCard({
  car,
  isCompared,
  onAddToCompare,
  onSelectCarForDetails,
  leads = [],
  onContextMenu
}: CarGridCardProps) {
  const [currentImg, setCurrentImg] = useState(car.image);

  useEffect(() => {
    setCurrentImg(car.image);
  }, [car.image]);

  const handleImageError = () => {
    let fallback = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1200&auto=format&fit=crop";
    const b = (car.brand || '').toLowerCase();
    const n = (car.name || '').toLowerCase();
    if (n.includes('ka') || b.includes('ford')) fallback = "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=1200&auto=format&fit=crop";
    else if (b.includes('audi')) fallback = "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=1200&auto=format&fit=crop";
    else if (b.includes('bmw')) fallback = "https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1200&auto=format&fit=crop";
    else if (b.includes('jeep') || car.category === 'suv') fallback = "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=1200&auto=format&fit=crop";
    else if (b.includes('honda')) fallback = "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=1200&auto=format&fit=crop";
    else if (b.includes('toyota')) fallback = "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=1200&auto=format&fit=crop";
    else if (b.includes('chevrolet') || b.includes('gm')) fallback = "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop";
    else if (b.includes('fiat')) fallback = "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1200&auto=format&fit=crop";
    else if (b.includes('volkswagen') || b.includes('vw')) fallback = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop";
    
    if (currentImg !== fallback) {
      setCurrentImg(fallback);
    }
  };

  // Identificação inteligente de veículos críticos comerciais
  const isLastUnit = car.id === '3' || car.id === '11' || car.id === '16' || car.id === '2'; // Hilux, Corolla, BMW 320i, Compass
  const isMostSearched = car.id === '1' || car.id === '4' || car.id === '7' || car.id === '17'; // Renegade, Civic, T-Cross, Tracker

  // Cruzamento de leads compatíveis
  const matchingLeadsCount = leads.filter(lead => {
    if (lead.contacted) return false;
    if (lead.desiredBrand) {
      const brandMatch = car.brand.toLowerCase().includes(lead.desiredBrand.toLowerCase()) ||
                         lead.desiredBrand.toLowerCase().includes(car.brand.toLowerCase());
      if (!brandMatch) return false;
    }
    
    if (lead.desiredModel) {
      const modelMatch = car.name.toLowerCase().includes(lead.desiredModel.toLowerCase()) ||
                         car.description?.toLowerCase().includes(lead.desiredModel.toLowerCase()) ||
                         lead.desiredModel.toLowerCase().includes(car.name.toLowerCase());
      if (!modelMatch) return false;
    }
    
    if (lead.minYear && car.year < lead.minYear) {
      return false;
    }
    
    if (lead.maxYear && car.year > lead.maxYear) {
      return false;
    }
    
    if (lead.maxPrice && car.price > lead.maxPrice) {
      return false;
    }
    
    return true;
  }).length;

  return (
    <motion.article
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => triggerNelsinhoMouseHover('show-card-hover')}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu(e, car);
      }}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-zinc-900/40 border transition-all duration-500 text-zinc-100 ${
        isLastUnit 
          ? 'border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.06)] hover:border-amber-500/60 hover:shadow-[0_0_30px_rgba(245,158,11,0.18)]'
          : isMostSearched
            ? 'border-cyan-500/25 shadow-[0_0_20px_rgba(6,182,212,0.06)] hover:border-cyan-500/60 hover:shadow-[0_0_30px_rgba(6,182,212,0.18)]'
            : 'border-white/5 hover:border-amber-500/30 hover:shadow-2xl'
      } luxury-glow`}
    >
      {/* Decorative border glow animation line */}
      <div className={`absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left ${
        isLastUnit 
          ? 'from-amber-500 via-amber-400 to-transparent'
          : isMostSearched
            ? 'from-cyan-500 via-sky-400 to-transparent'
            : 'from-amber-600 via-yellow-400/10 to-transparent'
      }`} />

      {/* Shimmering glare effect moving overlay on hover */}
      <div className="absolute inset-0 w-[200%] -translate-x-full group-hover:translate-x-full transition-transform duration-[1200ms] bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none z-10" />

      {/* Car Thumbnail with Overlay */}
      <div 
        onClick={() => onSelectCarForDetails(car)}
        onMouseEnter={() => triggerNelsinhoMouseHover('show-photo')}
        className="relative aspect-[16/10] overflow-hidden bg-zinc-950 cursor-pointer group/thumb"
      >
        <motion.img
          src={currentImg}
          alt={car.name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
          loading="lazy"
          onError={handleImageError}
        />
        
        {/* Hover visual label overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2 text-center px-4 z-10 pointer-events-none">
          <Eye className="h-5 w-5 text-amber-500 animate-pulse flex-shrink-0" />
          <span className="font-mono text-[9px] uppercase tracking-widest text-white font-bold">FOTOS REAIS & OPCIONAIS</span>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 to-transparent pointer-events-none" />
        
        {/* Category badgework */}
        <span className="absolute top-4 left-4 rounded-full bg-zinc-950/80 border border-white/10 px-3.5 py-1 font-mono text-[9px] uppercase tracking-widest text-zinc-300 font-semibold shadow-lg z-10">
          {car.brand}
        </span>

        {/* Pulsating live-stock indicator badges */}
        {isLastUnit && (
          <span className="absolute top-4 right-4 rounded-full bg-red-600/95 border border-red-500/30 px-3 py-1 font-mono text-[8px] uppercase tracking-widest text-white font-black shadow-lg flex items-center space-x-1 animate-pulse z-10">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
            <span>ÚLTIMA UNIDADE NO PÁTIO</span>
          </span>
        )}

        {isMostSearched && (
          <span className="absolute top-4 right-4 rounded-full bg-cyan-600/95 border border-cyan-500/30 px-3 py-1 font-mono text-[8px] uppercase tracking-widest text-white font-black shadow-lg flex items-center space-x-1 z-10 animate-pulse">
            <Sparkles className="h-2.5 w-2.5 text-cyan-200" />
            <span>MAIS BUSCADO HOJE</span>
          </span>
        )}

        {matchingLeadsCount > 0 && (
          <span className="absolute bottom-4 left-4 rounded-full bg-amber-500/90 border border-amber-400/25 px-2.5 py-1 font-mono text-[8px] uppercase tracking-widest text-black font-black shadow-lg flex items-center space-x-1 z-10 animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-black animate-ping" />
            <span>🔥 {matchingLeadsCount} {matchingLeadsCount === 1 ? 'LEAD INTERESSADO' : 'LEADS INTERESSADOS'}</span>
          </span>
        )}

        {/* Pricing Display */}
        <span 
          onMouseEnter={() => triggerNelsinhoMouseHover('show-price')}
          className="absolute bottom-4 right-4 text-xs sm:text-sm font-mono tracking-wider bg-amber-500 text-black font-extrabold px-3 py-1 rounded-md shadow-lg z-10"
        >
          R$ {car.price.toLocaleString('pt-BR')}
        </span>
      </div>

      {/* Technical Overview and Stats */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 
              onClick={() => onSelectCarForDetails(car)}
              className="font-display text-base font-semibold tracking-wide text-white hover:text-amber-400 transition-colors cursor-pointer text-left leading-snug hover:underline decoration-amber-500/40 decoration-1"
            >
              {car.name}
            </h3>
            <div className="flex flex-col items-end flex-shrink-0 ml-1.5 mt-0.5">
              <span className="font-mono text-[10px] text-zinc-400 font-bold">
                {car.year}
              </span>
              <span className={`font-mono text-[7.5px] px-1.5 py-0.5 rounded uppercase tracking-widest font-bold mt-1 ${
                (car.name.toLowerCase().includes('manual') || car.description?.toLowerCase().includes('manual'))
                  ? 'badge-manual'
                  : 'badge-automatic'
              }`}>
                {(car.name.toLowerCase().includes('manual') || car.description?.toLowerCase().includes('manual')) ? 'Manual' : 'Aut.'}
              </span>
            </div>
          </div>
          <p className="font-mono text-[9px] text-amber-500/90 uppercase tracking-widest font-semibold text-left flex items-center justify-between">
            <span>{car.role}</span>
          </p>
          {car.sellerName && (
            <div className="flex items-center gap-2 pt-0.5 text-[8.5px] font-mono text-zinc-400">
              <span className="flex items-center gap-1 bg-zinc-950/80 px-2 py-0.5 rounded border border-white/5 truncate max-w-[200px]" title={car.sellerName}>
                <User className="h-2.5 w-2.5 text-amber-500 flex-shrink-0" />
                <span className="truncate">{car.sellerName || "Garagem do Nelsinho"}</span>
              </span>
            </div>
          )}
          <p className="line-clamp-2 text-xs text-zinc-400 font-light leading-relaxed pt-1 text-left">
            {car.description}
          </p>
        </div>

        {/* Performance Specs Bar */}
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-zinc-950/50 p-3.5 border border-white/5 font-mono text-[9px] text-center select-none">
          <div>
            <span className="block text-zinc-500 text-[7.5px] uppercase tracking-wider">0-100 KM/H</span>
            <strong className="text-white text-[11px] font-bold">{car.specs.acceleration}s</strong>
          </div>
          <div className="border-x border-white/5">
            <span className="block text-zinc-500 text-[7.5px] uppercase tracking-wider">POTÊNCIA</span>
            <strong className="text-white text-[11px] font-bold">{car.specs.power} cv</strong>
          </div>
          <div>
            <span className="block text-zinc-500 text-[7.5px] uppercase tracking-wider">RODADO</span>
            <strong className="text-emerald-400 text-[9px] font-bold block truncate max-w-[80px] mx-auto uppercase" title={car.specs.rangeOrdisplacement}>
              {car.specs.rangeOrdisplacement}
            </strong>
          </div>
        </div>

        {/* Actions Drawer */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex gap-2">
            <button
              onClick={() => onAddToCompare(car)}
              onMouseEnter={() => triggerNelsinhoMouseHover('show-compare')}
              title="Comparar Fichas Técnicas"
              className={`flex-1 flex items-center justify-center space-x-2 rounded-full border transition-all duration-300 py-2.5 font-display text-[9px] tracking-wider font-semibold uppercase cursor-pointer ${
                isCompared
                  ? 'bg-amber-500/15 border-amber-500 text-amber-550 shadow-md'
                  : 'border-white/10 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              {isCompared ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>COMPARANDO</span>
                </>
              ) : (
                <>
                  <Scale className="h-3.5 w-3.5" />
                  <span>COMPARAR</span>
                </>
              )}
            </button>
          </div>

          <button
            onClick={() => onSelectCarForDetails(car)}
            onMouseEnter={() => triggerNelsinhoMouseHover('show-details-btn')}
            className="w-full text-center rounded-full bg-amber-600 hover:bg-amber-500 py-3 text-black font-display text-[9px] font-bold tracking-widest uppercase transition-all duration-300 cursor-pointer flex items-center justify-center space-x-1.5 shadow-[0_4px_12px_rgba(217,119,6,0.15)]"
          >
            <Eye className="h-3.5 w-3.5 animate-pulse" />
            <span>FOTOS REAIS & COMPRAR</span>
          </button>
        </div>

      </div>
    </motion.article>
  );
}
