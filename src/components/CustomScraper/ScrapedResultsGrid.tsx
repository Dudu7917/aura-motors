import React from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Car } from '../../types';

interface ScrapedResultsGridProps {
  scrapedCars: Car[];
  comparedCarIds: string[];
  onSelectCarDetails: (car: Car) => void;
  onAddToCompare: (car: Car) => void;
  onOpenAiConcierge: (car: Car, query: string) => void;
}

export default function ScrapedResultsGrid({
  scrapedCars,
  comparedCarIds,
  onSelectCarDetails,
  onAddToCompare,
  onOpenAiConcierge
}: ScrapedResultsGridProps) {
  return (
    <AnimatePresence>
      {scrapedCars.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pb-4 border-b border-white/5">
            <div className="text-left space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500" />
                <span className="font-mono text-[9px] uppercase tracking-widest text-amber-500 font-bold">
                  AURA MOTORS • RESULTADOS ENCONTRADOS
                </span>
              </div>
              <h3 className="font-luxury text-xl tracking-wider text-white uppercase">SHOWROOM PERSONALIZADO DA WEB</h3>
            </div>
            <span className="font-mono text-[10px] text-zinc-400 bg-zinc-900 border border-white/5 px-3 py-1.5 rounded-full">
              Estoque Extraído: <strong className="text-amber-500">{scrapedCars.length} veículos</strong>
            </span>
          </div>

          {/* Grid dos Carros Extraídos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {scrapedCars.map((car) => {
              const isCompared = comparedCarIds.includes(car.id);
              return (
                <div
                  key={car.id}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/20 transition-all duration-500 hover:border-amber-500/30 hover:bg-zinc-900/40 text-left"
                >
                  {/* Imagem */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={car.image}
                      alt={car.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover object-center transition-all duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/10 to-transparent" />
                    
                    {/* Categoria tag & Badge do Ano */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="rounded-full bg-zinc-950/70 border border-white/10 px-3 py-1 font-mono text-[8px] uppercase tracking-widest text-amber-500 font-bold backdrop-blur">
                        {car.category}
                      </span>
                      <span className="rounded-full bg-amber-500 px-3 py-1 font-mono text-[8.5px] font-bold text-black backdrop-blur">
                        {car.year}
                      </span>
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="flex flex-1 flex-col p-6 space-y-4">
                    <div className="space-y-1">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-550">
                        {car.brand}
                      </span>
                      <h4 className="font-luxury text-base tracking-wider text-white uppercase line-clamp-1">
                        {car.name}
                      </h4>
                    </div>

                    <p className="font-display text-[11px] text-zinc-400 font-light leading-relaxed line-clamp-2 h-8">
                      {car.description}
                    </p>

                    <div className="flex items-center justify-between border-t border-white/5 pt-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-[8px] uppercase tracking-widest text-zinc-550">PREÇO ESTIMADO</span>
                        <span className="font-display text-base font-semibold text-amber-500">
                          {car.price > 0 ? `R$ ${car.price.toLocaleString('pt-BR')}` : "Sob Consulta"}
                        </span>
                      </div>
                      
                      <span className="font-mono text-[9.5px] text-zinc-400 bg-zinc-950 border border-white/10 px-2.5 py-1 rounded-md">
                        {car.specs.rangeOrdisplacement || "Disponível"}
                      </span>
                    </div>

                    {/* Botões de Ação do Showroom */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => onSelectCarDetails(car)}
                        className="w-full rounded-xl border border-white/10 bg-zinc-950 hover:bg-zinc-900 py-3 text-center text-[10px] font-display font-bold tracking-widest uppercase text-zinc-300 hover:text-white transition-all cursor-pointer"
                      >
                        Ficha Técnica
                      </button>
                      <button
                        type="button"
                        onClick={() => onAddToCompare(car)}
                        className={`w-full rounded-xl py-3 text-center text-[10px] font-display font-bold tracking-widest uppercase transition-all cursor-pointer border ${
                          isCompared
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                            : 'border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-amber-400 hover:text-amber-300'
                        }`}
                      >
                        {isCompared ? 'Comparando' : 'Comparar'}
                      </button>
                    </div>

                    {/* AI Chat button quick integration */}
                    <button
                      type="button"
                      onClick={() => onOpenAiConcierge(car, `Me apresente os principais argumentos de venda e diferenciais do ${car.name} para eu negociar com o cliente.`)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 border border-white/5 hover:border-amber-500/15 p-2.5 font-display text-[9.5px] uppercase tracking-wider font-bold text-zinc-400 hover:text-amber-500 transition-all cursor-pointer"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      <span>ARGUMENTOS DE VENDA IA</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
