import React, { useState } from 'react';
import { 
  Key, 
  Sparkles, 
  Cpu, 
  Eye, 
  EyeOff, 
  Trash2, 
  Plus, 
  Check, 
  ShieldAlert, 
  ToggleLeft, 
  ToggleRight 
} from 'lucide-react';
import { ApiKeyEntry } from '../../utils/apiKeyHelper';

interface ApiKeysTabProps {
  keys: ApiKeyEntry[];
  fallbackMode: 'fallback' | 'single';
  onToggleFallbackMode: () => void;
  onToggleActiveKey: (id: string) => void;
  onDeleteKey: (id: string) => void;
  onAddKey: (name: string, service: ApiKeyEntry['service'], key: string) => void;
}

export default function ApiKeysTab({
  keys,
  fallbackMode,
  onToggleFallbackMode,
  onToggleActiveKey,
  onDeleteKey,
  onAddKey
}: ApiKeysTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [visibleKeyIds, setVisibleKeyIds] = useState<Set<string>>(new Set());

  const [newName, setNewName] = useState('');
  const [newService, setNewService] = useState<ApiKeyEntry['service']>('gemini');
  const [newKey, setNewKey] = useState('');

  const toggleVisibility = (id: string) => {
    setVisibleKeyIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newKey.trim()) return;
    onAddKey(newName.trim(), newService, newKey.trim());
    setNewName('');
    setNewKey('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Modo Fallback */}
      <div className="rounded-2xl border border-white/5 bg-zinc-900/60 p-4 flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="font-mono text-xs text-white font-bold block">Modo Fallback Automático</span>
          <span className="font-display text-[11px] text-zinc-400">
            Alterna para a próxima chave válida se uma chave atingir rate-limit ou cota (429)
          </span>
        </div>
        <button
          onClick={onToggleFallbackMode}
          className="text-amber-500 hover:text-amber-400 transition-colors cursor-pointer"
        >
          {fallbackMode === 'fallback' ? (
            <ToggleRight className="h-7 w-7 text-amber-500" />
          ) : (
            <ToggleLeft className="h-7 w-7 text-zinc-600" />
          )}
        </button>
      </div>

      {/* Lista de Chaves */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-zinc-400 font-bold uppercase tracking-wider">
            Chaves Cadastradas ({keys.length})
          </span>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-mono text-[11px] font-bold uppercase tracking-wider border border-amber-500/30 transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Adicionar Chave</span>
          </button>
        </div>

        {/* Formulário de Adição */}
        {showAddForm && (
          <form onSubmit={handleFormSubmit} className="rounded-2xl border border-amber-500/30 bg-zinc-900 p-4 space-y-3">
            <h5 className="font-mono text-xs text-amber-400 font-bold uppercase tracking-wider">
              Nova Chave de API
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[10px] text-zinc-400 block mb-1">Nome / Rótulo</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Gemini Pro 01"
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 font-mono text-xs text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="font-mono text-[10px] text-zinc-400 block mb-1">Serviço</label>
                <select
                  value={newService}
                  onChange={(e) => setNewService(e.target.value as any)}
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 font-mono text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="gemini">Google Gemini</option>
                  <option value="jina">Jina Reader</option>
                  <option value="scrapingbee">ScrapingBee</option>
                </select>
              </div>
            </div>
            <div>
              <label className="font-mono text-[10px] text-zinc-400 block mb-1">API Key (Token Secreto)</label>
              <input
                type="password"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="Cole a chave aqui..."
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 font-mono text-xs text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-mono text-xs cursor-pointer hover:bg-zinc-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 text-black font-mono text-xs font-bold uppercase cursor-pointer hover:bg-amber-400"
              >
                Salvar Chave
              </button>
            </div>
          </form>
        )}

        {/* Cards de Chaves */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {keys.map((k) => {
            const isVisible = visibleKeyIds.has(k.id);
            return (
              <div
                key={k.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900/40 border border-white/5 hover:border-white/10 transition-all font-mono text-xs"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onToggleActiveKey(k.id)}
                    className={`h-4 w-4 rounded-full border flex items-center justify-center cursor-pointer ${
                      k.isActive ? 'bg-amber-500 border-amber-500 text-black' : 'border-zinc-600'
                    }`}
                  >
                    {k.isActive && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{k.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] uppercase bg-white/5 border border-white/10 text-zinc-400">
                        {k.service}
                      </span>
                    </div>
                    <span className="text-zinc-500 text-[11px] block mt-0.5">
                      {isVisible ? k.key : `${k.key.slice(0, 4)}••••••••••••${k.key.slice(-4)}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleVisibility(k.id)}
                    className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 cursor-pointer"
                    title={isVisible ? 'Ocultar' : 'Visualizar'}
                  >
                    {isVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={() => onDeleteKey(k.id)}
                    className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-white/5 cursor-pointer"
                    title="Remover Chave"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {keys.length === 0 && (
            <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl text-zinc-500 text-xs font-mono">
              Nenhuma chave personalizada cadastrada. Usando configurações do .env padrão.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
