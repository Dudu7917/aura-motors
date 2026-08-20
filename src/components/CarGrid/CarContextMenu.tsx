import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, Scale, Copy, Download, Check, ExternalLink, MessageSquare } from 'lucide-react';
import { Car } from '../../types';
import JSZip from 'jszip';
import { generateWhatsAppText } from '../../utils/whatsappFormatter';

interface CarContextMenuProps {
  menu: { x: number; y: number; car: Car } | null;
  onClose: () => void;
  onSelectCar: (car: Car) => void;
  onAddToCompare: (car: Car) => void;
  isCompared: boolean;
}

export default function CarContextMenu({
  menu,
  onClose,
  onSelectCar,
  onAddToCompare,
  isCompared,
}: CarContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  // Fecha ao clicar fora ou rolar a página
  useEffect(() => {
    if (!menu) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleScrollOrResize = () => {
      onClose();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menu, onClose]);

  if (!menu) return null;

  const { x, y, car } = menu;

  // Ajustes de colisão com a borda da janela
  const menuWidth = 190;
  const menuHeight = 216;
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  const leftPos = x + menuWidth > screenWidth ? screenWidth - menuWidth - 10 : x;
  const topPos = y + menuHeight > screenHeight ? screenHeight - menuHeight - 10 : y;

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const linkToCopy = car.detailUrl || `https://www.webmotors.com.br/carros/estoque?q=${encodeURIComponent(car.brand + ' ' + car.name)}`;
    try {
      await navigator.clipboard.writeText(linkToCopy);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Falha ao copiar link:', err);
    }
  };

  const handleCopyWhatsApp = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = generateWhatsAppText(car);
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedWhatsApp(true);
      setTimeout(() => {
        setCopiedWhatsApp(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Falha ao copiar texto do WhatsApp:', err);
    }
  };

  const handleDownloadAllImages = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const urls = (car.gallery && car.gallery.length > 0) ? car.gallery : [car.image].filter(Boolean);

    const zip = new JSZip();
    const folderName = `${car.brand}_${car.name.replace(/\s+/g, '_')}`;

    // Busca todas as imagens e insere no zip
    const fetchPromises = urls.map(async (url, i) => {
      try {
        const res = await fetch(`/api/download-image?url=${encodeURIComponent(url)}`);
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const blob = await res.blob();
        
        // Extrai extensão ou padroniza para jpg
        const urlPath = url.split('?')[0] || '';
        const ext = urlPath.split('.').pop()?.toLowerCase() || 'jpg';
        const cleanExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg';
        const filename = `foto_${i + 1}.${cleanExt}`;
        
        zip.file(filename, blob);
      } catch (err) {
        console.error(`Erro ao baixar imagem da galeria (${url}):`, err);
      }
    });

    try {
      await Promise.all(fetchPromises);
      const content = await zip.generateAsync({ type: 'blob' });
      const blobUrl = URL.createObjectURL(content);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${folderName}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Erro ao gerar ZIP:', err);
      // Se der erro grave de CORS / zip, abre a principal em uma nova aba
      window.open(car.image, '_blank');
    }
    
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        style={{ top: topPos, left: leftPos }}
        className="fixed z-[9999] w-[190px] rounded-xl border border-zinc-800 bg-zinc-950/95 p-1.5 shadow-2xl backdrop-blur-md"
      >
        <div className="px-2.5 py-1.5 border-b border-white/5 mb-1">
          <p className="font-display text-[9px] font-bold uppercase tracking-wider text-amber-500 truncate">
            {car.name}
          </p>
          <p className="font-mono text-[7px] text-zinc-500 uppercase tracking-widest truncate">
            Ações Rápidas
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectCar(car);
            onClose();
          }}
          className="w-full flex items-center space-x-2 rounded-lg px-2 py-2 text-left font-display text-[10.5px] text-zinc-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
        >
          <Eye className="h-3.5 w-3.5 text-zinc-400" />
          <span>Ver Detalhes</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCompare(car);
            onClose();
          }}
          className="w-full flex items-center space-x-2 rounded-lg px-2 py-2 text-left font-display text-[10.5px] text-zinc-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
        >
          <Scale className="h-3.5 w-3.5 text-zinc-400" />
          <span>{isCompared ? 'Remover Comparação' : 'Comparar Veículo'}</span>
        </button>

        <button
          onClick={handleCopyLink}
          className="w-full flex items-center justify-between rounded-lg px-2 py-2 text-left font-display text-[10.5px] text-zinc-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-zinc-400" />
            )}
            <span>{copied ? 'Link Copiado!' : 'Copiar Link'}</span>
          </div>
          {!copied && <ExternalLink className="h-2.5 w-2.5 text-zinc-600" />}
        </button>

        <button
          onClick={handleCopyWhatsApp}
          className="w-full flex items-center justify-between rounded-lg px-2 py-2 text-left font-display text-[10.5px] text-zinc-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            {copiedWhatsApp ? (
              <Check className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            ) : (
              <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
            )}
            <span>{copiedWhatsApp ? 'Texto Copiado!' : 'Texto p/ WhatsApp'}</span>
          </div>
          {!copiedWhatsApp && <ExternalLink className="h-2.5 w-2.5 text-zinc-600" />}
        </button>

        <button
          onClick={handleDownloadAllImages}
          className="w-full flex items-center space-x-2 rounded-lg px-2 py-2 text-left font-display text-[10.5px] text-zinc-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
        >
          <Download className="h-3.5 w-3.5 text-zinc-400" />
          <span>Salvar Fotos</span>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
