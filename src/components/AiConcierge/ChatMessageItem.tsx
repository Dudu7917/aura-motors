import React from 'react';
import { motion } from 'motion/react';
import { ChatMessage, Car } from '../../types';
import { Bot, User, Globe, ArrowRight } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessageItemProps {
  msg: ChatMessage;
  cars: Car[];
  onSelectCar: (carId: string) => void;
  expandedActions: Record<string, boolean>;
  toggleActions: (msgId: string) => void;
  expandedSteps: Record<string, boolean>;
  toggleStep: (stepKey: string) => void;
}

export default function ChatMessageItem({
  msg,
  cars,
  onSelectCar,
  expandedActions,
  toggleActions,
  expandedSteps,
  toggleStep,
}: ChatMessageItemProps) {
  const isAi = msg.sender === 'assistant';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col space-y-1.5 ${isAi ? 'items-start' : 'items-end'}`}
    >
      <div className="flex items-center space-x-1.5 font-mono text-[8px] uppercase tracking-widest text-zinc-550">
        {isAi ? (
          <>
            <Bot className="h-3 w-3 text-amber-500" />
            <span>Nelsinho AI</span>
          </>
        ) : (
          <>
            <span>Você</span>
            <User className="h-3 w-3 text-zinc-400" />
          </>
        )}
      </div>

      <div className={`rounded-2xl px-4 py-3 text-xs leading-relaxed max-w-[95%] select-text text-left ${
        isAi ? 'bg-zinc-900 text-zinc-200 border border-white/5 w-full' : 'bg-amber-600 text-black font-medium selection:bg-white'
      }`}>
        {isAi && msg.agentActions && msg.agentActions.length > 0 && (
          <div className="mb-3.5 border border-white/5 rounded-2xl bg-zinc-950/40 p-3 select-none">
            <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-amber-500 font-bold">
              <div className="flex items-center space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>Raciocínio Técnico ({msg.agentActions.length} {msg.agentActions.length === 1 ? 'ação' : 'ações'})</span>
              </div>
              <button
                onClick={() => toggleActions(msg.id)}
                className="text-[8px] border border-white/10 px-1.5 py-0.5 rounded hover:bg-white/5 hover:text-amber-400 transition-all cursor-pointer focus:outline-none"
              >
                {expandedActions[msg.id] ? "OCULTAR [-]" : "EXIBIR DETALHES [+]"}
              </button>
            </div>

            {/* Exibe lista compacta quando fechado */}
            {!expandedActions[msg.id] && (
              <div className="mt-2 flex flex-wrap gap-1">
                {msg.agentActions.map((action, idx) => {
                  let label = "";
                  if (action.type === "consultarEstoque") label = "Estoque";
                  else if (action.type === "consultarPrecoFipe") label = "FIPE";
                  else if (action.type === "adicionarLeadFilaEspera") label = "Cadastrar Lead";
                  else if (action.type === "buscarLeadsCompativeis") label = "Match Leads";
                  else if (action.type === "gerarMensagemAbordagem") label = "WhatsApp Pitch";
                  else label = action.type;
                  return (
                    <span 
                      key={idx} 
                      className="font-mono text-[7px] text-zinc-400 bg-zinc-900 border border-white/5 px-2 py-0.5 rounded-md hover:text-amber-400 cursor-pointer"
                      onClick={() => {
                        toggleActions(msg.id);
                        toggleStep(`${msg.id}-${idx}`);
                      }}
                    >
                      ⚙️ {label}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Exibe lista detalhada quando aberto */}
            {expandedActions[msg.id] && (
              <div className="mt-3 flex flex-col gap-2">
                {msg.agentActions.map((action, idx) => {
                  const stepKey = `${msg.id}-${idx}`;
                  const isStepExpanded = expandedSteps[stepKey];
                  
                  let label = "";
                  let details = "";
                  
                  if (action.type === "consultarEstoque") {
                    label = "🚗 Verificação de Estoque";
                    details = action.params.query ? `Filtro: "${action.params.query}"` : "Verificação completa do showroom";
                  } else if (action.type === "consultarPrecoFipe") {
                    label = "📊 Consulta Tabela FIPE";
                    details = `${action.params.marca} ${action.params.modelo} (${action.params.ano})`;
                  } else if (action.type === "adicionarLeadFilaEspera") {
                    label = "👤 Cadastro de Fila de Espera";
                    details = `Lead cadastrado: ${action.params.fullName}`;
                  } else if (action.type === "buscarLeadsCompativeis") {
                    label = "🔍 Match Fila de Espera";
                    details = `Match para: ${action.params.brand || ""} ${action.params.model || ""}`;
                  } else if (action.type === "gerarMensagemAbordagem") {
                    label = "💬 Abordagem WhatsApp Comercial";
                    details = `Rascunho de proposta criado para ${action.params.fullName}`;
                  } else {
                    label = `⚙️ Ferramenta: ${action.type}`;
                    details = "Ação genérica do agente";
                  }

                  return (
                    <div 
                      key={idx} 
                      className="rounded-xl border border-white/5 bg-zinc-950/80 hover:border-white/10 overflow-hidden transition-all text-left"
                    >
                      <button
                        onClick={() => toggleStep(stepKey)}
                        className="w-full flex items-center justify-between px-3 py-2 text-left font-mono text-[9px] hover:bg-white/5 transition-all focus:outline-none cursor-pointer select-none"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-amber-500 font-bold">✓</span>
                          <div>
                            <div className="font-semibold text-zinc-300">{label}</div>
                            <div className="text-[8px] text-zinc-500 font-light mt-0.5">{details}</div>
                          </div>
                        </div>
                        <span className="text-[7px] text-zinc-500">
                          {isStepExpanded ? "Fechar [-]" : "Inspecionar [+]"}
                        </span>
                      </button>

                      {isStepExpanded && (
                        <div className="border-t border-white/5 bg-black/40 p-2.5 font-mono text-[8.5px] text-zinc-405 space-y-2 max-h-[180px] overflow-y-auto select-text">
                          <div>
                            <span className="text-amber-500 font-bold block mb-1 text-[7.5px] tracking-wider">📥 PARÂMETROS DE ENTRADA:</span>
                            <pre className="bg-zinc-950 p-2 rounded-lg border border-white/5 text-[8px] text-zinc-300 overflow-x-auto whitespace-pre-wrap font-mono">
                              {JSON.stringify(action.params, null, 2)}
                            </pre>
                          </div>
                          <div>
                            <span className="text-amber-500/80 font-bold block mb-1 text-[7.5px] tracking-wider">📤 RESULTADO RETORNADO:</span>
                            <pre className="bg-zinc-950 p-2 rounded-lg border border-white/5 text-[8px] text-zinc-300 overflow-x-auto whitespace-pre-wrap font-mono">
                              {JSON.stringify(action.result, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        
        {isAi ? (
          <div className="markdown-body text-zinc-200 space-y-2 prose prose-invert overflow-hidden">
            <Markdown 
              remarkPlugins={[remarkGfm]}
              components={{
                table: ({node, ...props}) => (
                  <div className="my-2 overflow-x-auto rounded-xl border border-white/5 bg-zinc-950/70 p-1">
                    <table className="w-full text-left text-[11px] border-collapse" {...props} />
                  </div>
                ),
                thead: ({node, ...props}) => <thead className="bg-zinc-800 border-b border-white/10 text-amber-500 font-mono text-[9px] uppercase tracking-widest" {...props} />,
                tbody: ({node, ...props}) => <tbody className="divide-y divide-white/5" {...props} />,
                tr: ({node, ...props}) => <tr className="hover:bg-white/5 transition-colors" {...props} />,
                th: ({node, ...props}) => <th className="px-2.5 py-1.5 font-bold" {...props} />,
                td: ({node, ...props}) => <td className="px-2.5 py-1.5 text-zinc-300 font-light" {...props} />,
                p: ({node, ...props}) => <p className="mb-1.5 last:mb-0 leading-relaxed font-light text-[11.5px]" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold text-amber-400" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-1.5 space-y-1 text-zinc-300" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-1.5 space-y-1 text-zinc-300" {...props} />,
                li: ({node, ...props}) => <li className="marker:text-amber-500 text-[11px] font-light" {...props} />,
                h1: ({node, ...props}) => <h1 className="text-xs font-bold text-white mb-1.5 uppercase tracking-wider border-b border-white/5 pb-0.5 font-display" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-[11px] font-bold text-amber-500 mb-1 uppercase tracking-wider font-display" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-[10.5px] font-semibold text-white mb-1 uppercase tracking-wider font-display" {...props} />,
              }}
            >
              {msg.text}
            </Markdown>
          </div>
        ) : (
          <div className="whitespace-pre-wrap text-[12.5px] font-sans pr-1">
            {msg.text}
          </div>
        )}
        
        {isAi && msg.recommendedCarId && (
          <div className="mt-4 border-t border-white/5 pt-3">
            <button
              onClick={() => onSelectCar(msg.recommendedCarId!)}
              className="inline-flex items-center space-x-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest text-amber-400 border border-amber-500/20 transition-all cursor-pointer"
            >
              <span>Visualizar Modelo Indicado</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Grounding Web Search Results */}
        {isAi && msg.groundingChunks && msg.groundingChunks.length > 0 && (
          <div className="mt-3.5 border-t border-white/5 pt-2.5">
            <span className="block font-mono text-[8px] uppercase tracking-widest text-amber-500 font-bold mb-1.5 flex items-center space-x-1">
              <Globe className="h-2.5 w-2.5 shrink-0 animate-pulse text-amber-500" />
              <span>Busca Ativa do Google (Grounding Citations):</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {msg.groundingChunks.map((chunk, idx) => {
                if (!chunk.web) return null;
                return (
                  <a
                    key={idx}
                    href={chunk.web.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 rounded bg-zinc-950/80 hover:bg-zinc-950 border border-white/10 hover:border-amber-500/20 px-2 py-1 text-[9px] text-zinc-400 hover:text-amber-400 font-light transition-all cursor-pointer"
                  >
                    <Globe className="h-2 w-2 text-zinc-500" />
                    <span className="max-w-[130px] truncate">{chunk.web.title}</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
