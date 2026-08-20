import React, { useState, useEffect } from 'react';
import { X, Key, Check, Eye, EyeOff, Sparkles, Cpu, ShieldAlert, Plus, Trash2, ToggleLeft, ToggleRight, Zap, Shield } from 'lucide-react';
import { ApiKeyEntry, getApiKeysList, saveApiKeysList, getFallbackMode, setFallbackMode } from '../utils/apiKeyHelper';
import { motion } from 'motion/react';
import CustomSelect from './CustomSelect';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SERVICE_OPTIONS: { value: ApiKeyEntry['service']; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'gemini', label: 'Google Gemini', icon: <Sparkles className="h-3 w-3" />, color: 'text-purple-400' },
  { value: 'jina', label: 'Jina Reader', icon: <Cpu className="h-3 w-3" />, color: 'text-emerald-400' },
  { value: 'scrapingbee', label: 'ScrapingBee', icon: <Key className="h-3 w-3" />, color: 'text-rose-400' },
];

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [keys, setKeys] = useState<ApiKeyEntry[]>([]);
  const [fallbackMode, setFallbackModeState] = useState<'fallback' | 'single'>('fallback');
  const [showAddForm, setShowAddForm] = useState(false);
  const [visibleKeyIds, setVisibleKeyIds] = useState<Set<string>>(new Set());

  // Formulário de nova chave
  const [newName, setNewName] = useState('');
  const [newService, setNewService] = useState<ApiKeyEntry['service']>('gemini');
  const [newKey, setNewKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      setKeys(getApiKeysList());
      setFallbackModeState(getFallbackMode());
      setShowAddForm(false);
      setVisibleKeyIds(new Set());
    }
  }, [isOpen]);

  const handleSave = async () => {
    saveApiKeysList(keys);
    setFallbackMode(fallbackMode);
    
    // Sincroniza a chave ativa de cada serviço com o backend
    const activeGemini = keys.find(k => k.service === 'gemini' && k.isActive);
    const activeJina = keys.find(k => k.service === 'jina' && k.isActive);
    const activeBee = keys.find(k => k.service === 'scrapingbee' && k.isActive);
    
    try {
      await fetch('/api/save-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          geminiKey: activeGemini?.key?.trim() || '',
          jinaKey: activeJina?.key?.trim() || '',
          scrapingBeeKey: activeBee?.key?.trim() || ''
        })
      });
    } catch (err) {
      console.error("Erro ao sincronizar chaves com o servidor:", err);
    }
    
    window.dispatchEvent(new Event('aura_api_keys_changed'));
    onClose();
  };

  const handleClearAll = async () => {
    setKeys([]);
    saveApiKeysList([]);
    localStorage.removeItem('aura_gemini_api_key');
    localStorage.removeItem('aura_jina_api_key');
    localStorage.removeItem('aura_scrapingbee_api_key');
    
    try {
      await fetch('/api/clear-keys', { method: 'POST' });
    } catch (err) {
      console.error("Erro ao limpar chaves no servidor:", err);
    }
    
    window.dispatchEvent(new Event('aura_api_keys_changed'));
    onClose();
  };

  const handleAddKey = () => {
    if (!newKey.trim() || !newName.trim()) return;
    
    const newEntry: ApiKeyEntry = {
      id: `key-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: newName.trim(),
      service: newService,
      key: newKey.trim(),
      isActive: !keys.some(k => k.service === newService && k.isActive),
      useFallback: true
    };
    
    const updated = [...keys, newEntry];
    setKeys(updated);
    saveApiKeysList(updated);
    window.dispatchEvent(new Event('aura_api_keys_changed'));
    setNewName('');
    setNewKey('');
    setShowAddForm(false);
  };

  const handleRemoveKey = (id: string) => {
    const updated = keys.filter(k => k.id !== id);
    setKeys(updated);
    saveApiKeysList(updated);
    window.dispatchEvent(new Event('aura_api_keys_changed'));
  };

  const handleSetActive = (id: string) => {
    const target = keys.find(k => k.id === id);
    if (!target) return;
    const updated = keys.map(k => {
      if (k.service === target.service) {
        return { ...k, isActive: k.id === id };
      }
      return k;
    });
    setKeys(updated);
    saveApiKeysList(updated);
    window.dispatchEvent(new Event('aura_api_keys_changed'));
  };

  const handleToggleFallback = (id: string) => {
    const updated = keys.map(k => k.id === id ? { ...k, useFallback: !k.useFallback } : k);
    setKeys(updated);
    saveApiKeysList(updated);
    window.dispatchEvent(new Event('aura_api_keys_changed'));
  };

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeyIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getServiceBadge = (service: ApiKeyEntry['service']) => {
    const opt = SERVICE_OPTIONS.find(o => o.value === service);
    if (!opt) return null;
    const bgMap = {
      gemini: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
      jina: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      scrapingbee: 'bg-rose-500/10 border-rose-500/20 text-rose-400'
    };
    return (
      <span className={`inline-flex items-center gap-1 text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border font-bold ${bgMap[service]}`}>
        {opt.icon} {opt.label}
      </span>
    );
  };

  const geminiKeys = keys.filter(k => k.service === 'gemini');
  const jinaKeys = keys.filter(k => k.service === 'jina');
  const beeKeys = keys.filter(k => k.service === 'scrapingbee');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-left max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500">
              <Key className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold tracking-wider text-white uppercase">Gerenciador de Chaves</h3>
              <span className="block font-mono text-[8px] uppercase tracking-widest text-zinc-500">Multi-Chave com Fallback Inteligente</span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-full p-2 text-zinc-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modo de Fallback */}
        <div className="bg-zinc-900/40 rounded-2xl p-3.5 border border-white/5 mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-500" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-300 font-bold">Modo de Roteamento</span>
            </div>
            <button
              onClick={() => setFallbackModeState(prev => prev === 'fallback' ? 'single' : 'fallback')}
              className={`flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                fallbackMode === 'fallback'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-zinc-900 border-white/10 text-zinc-400'
              }`}
            >
              {fallbackMode === 'fallback' ? (
                <><ToggleRight className="h-3.5 w-3.5" /> Fallback Inteligente</>
              ) : (
                <><ToggleLeft className="h-3.5 w-3.5" /> Apenas Chave Ativa</>
              )}
            </button>
          </div>
          <p className="font-display text-[10px] text-zinc-500 mt-2 leading-relaxed">
            {fallbackMode === 'fallback'
              ? 'Se a chave ativa falhar (cota 429), o sistema tentará as demais chaves marcadas como fallback automaticamente.'
              : 'O sistema utilizará estritamente a chave marcada como Ativa. Se falhar, usará o .env do servidor.'}
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-zinc-900/40 rounded-2xl p-3.5 border border-white/5 text-[10.5px] text-zinc-400 font-light leading-relaxed mb-5">
          <ShieldAlert className="h-4 w-4 text-amber-500 inline-block mr-1.5 align-text-bottom" />
          <span>As chaves são salvas no <strong className="text-zinc-300">localStorage</strong> e transmitidas nos cabeçalhos. Se nenhuma chave for cadastrada, o servidor usará o <strong className="text-zinc-300">.env</strong>.</span>
        </div>

        {/* Lista de Chaves */}
        <div className="space-y-2 mb-5">
          {keys.length === 0 && !showAddForm && (
            <div className="p-6 rounded-xl border border-dashed border-white/10 bg-zinc-900/10 text-center">
              <Key className="h-5 w-5 text-zinc-600 mx-auto mb-2" />
              <p className="font-mono text-xs text-zinc-500">Nenhuma chave cadastrada.</p>
              <p className="font-display text-[10px] text-zinc-600 mt-1">Clique em "Adicionar Chave" para começar.</p>
            </div>
          )}
          
          {keys.map((entry) => (
            <div key={entry.id} className={`rounded-xl border p-3 transition-all ${
              entry.isActive
                ? 'bg-zinc-900/50 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]'
                : 'bg-zinc-900/20 border-white/5'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getServiceBadge(entry.service)}
                  <span className="font-mono text-[11px] text-zinc-200 font-semibold">{entry.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  {entry.isActive ? (
                    <span className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20 font-bold">✦ Ativa</span>
                  ) : (
                    <button
                      onClick={() => handleSetActive(entry.id)}
                      className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-500 border border-white/5 hover:text-amber-400 hover:border-amber-500/20 transition-all cursor-pointer font-bold"
                    >
                      Ativar
                    </button>
                  )}
                  <button
                    onClick={() => handleToggleFallback(entry.id)}
                    className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded border transition-all cursor-pointer font-bold ${
                      entry.useFallback
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-zinc-900 text-zinc-600 border-white/5'
                    }`}
                    title={entry.useFallback ? 'Desabilitar como fallback' : 'Habilitar como fallback'}
                  >
                    <Zap className="h-2.5 w-2.5 inline" /> {entry.useFallback ? 'FB' : '--'}
                  </button>
                  <button
                    onClick={() => handleRemoveKey(entry.id)}
                    className="p-1 text-zinc-600 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <div className="relative flex items-center">
                <input
                  type={visibleKeyIds.has(entry.id) ? "text" : "password"}
                  value={entry.key}
                  readOnly
                  className="w-full rounded-lg border border-white/5 bg-zinc-950 py-1.5 pl-3 pr-8 font-mono text-[10px] text-zinc-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => toggleKeyVisibility(entry.id)}
                  className="absolute right-2.5 text-zinc-600 hover:text-white transition-colors cursor-pointer"
                >
                  {visibleKeyIds.has(entry.id) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Formulário de Adição */}
        {showAddForm ? (
          <div className="rounded-xl border border-amber-500/20 bg-zinc-900/50 p-4 mb-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Plus className="h-3.5 w-3.5 text-amber-500" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-amber-400 font-bold">Nova Chave de API</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Nome do Projeto</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Minha Chave Principal"
                  className="w-full rounded-lg border border-white/10 bg-zinc-950 py-2 pl-3 font-mono text-[11px] text-zinc-200 placeholder-zinc-700 focus:border-amber-500 focus:outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Serviço</label>
                <CustomSelect
                  value={newService}
                  onChange={(val) => setNewService(val as ApiKeyEntry['service'])}
                  options={SERVICE_OPTIONS.map(opt => ({ value: opt.value, label: opt.label }))}
                  className="w-full text-left"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Valor da Chave</label>
              <input
                type="password"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="Cole aqui a sua API Key"
                className="w-full rounded-lg border border-white/10 bg-zinc-950 py-2 pl-3 font-mono text-[11px] text-zinc-200 placeholder-zinc-700 focus:border-amber-500 focus:outline-none transition-all"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 rounded-lg border border-white/5 bg-zinc-900 py-2 text-[10px] font-mono font-bold uppercase text-zinc-400 hover:text-white transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddKey}
                disabled={!newKey.trim() || !newName.trim()}
                className="flex-1 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black py-2 text-[10px] font-mono font-bold uppercase transition-all cursor-pointer"
              >
                <Check className="h-3 w-3 inline mr-1" /> Adicionar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full rounded-xl border border-dashed border-white/10 hover:border-amber-500/30 bg-zinc-900/10 hover:bg-zinc-900/30 py-3 text-center text-[10px] font-mono font-bold tracking-widest uppercase text-zinc-500 hover:text-amber-400 transition-all cursor-pointer mb-5 flex items-center justify-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Adicionar Chave
          </button>
        )}

        {/* Resumo */}
        {keys.length > 0 && (
          <div className="bg-zinc-900/20 rounded-xl p-3 border border-white/5 mb-5 space-y-1">
            <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 font-bold block">Resumo</span>
            <div className="flex gap-4 text-[10px] font-mono text-zinc-400">
              <span>Gemini: <strong className="text-zinc-200">{geminiKeys.length}</strong></span>
              <span>Jina: <strong className="text-zinc-200">{jinaKeys.length}</strong></span>
              <span>Bee: <strong className="text-zinc-200">{beeKeys.length}</strong></span>
              <span>Modo: <strong className={fallbackMode === 'fallback' ? 'text-emerald-400' : 'text-amber-400'}>{fallbackMode === 'fallback' ? 'Fallback' : 'Única'}</strong></span>
            </div>
          </div>
        )}

        {/* Footer buttons */}
        <div className="flex gap-3 pt-4 border-t border-white/5">
          <button
            onClick={handleClearAll}
            className="flex-1 rounded-xl border border-white/5 bg-zinc-900 hover:bg-zinc-850 hover:text-white py-3 text-center text-[10px] font-display font-bold tracking-widest uppercase text-zinc-400 transition-all cursor-pointer"
          >
            Limpar Tudo
          </button>
          
          <button
            onClick={handleSave}
            className="flex-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-black py-3 text-center text-[10px] font-display font-bold tracking-widest uppercase transition-all cursor-pointer shadow-lg shadow-amber-500/5"
          >
            Salvar Configurações
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
