import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface CarDetailsGalleryProps {
  carName: string;
  galleryImages: string[];
  activeImage: string;
  onSetActiveImage: (img: string) => void;
  isScraping?: boolean;
}

export default function CarDetailsGallery({
  carName,
  galleryImages,
  activeImage,
  onSetActiveImage,
  isScraping = false
}: CarDetailsGalleryProps) {
  const [failedImages, setFailedImages] = useState<string[]>([]);

  // Limpa o estado quando muda de carro de estoque
  useEffect(() => {
    setFailedImages([]);
  }, [galleryImages]);

  const visibleImages = galleryImages.filter(img => !failedImages.includes(img));

  // Trata falha no carregamento da imagem principal
  const handleMainImageError = () => {
    if (!failedImages.includes(activeImage)) {
      const updatedFailed = [...failedImages, activeImage];
      setFailedImages(updatedFailed);
      const nextVisible = galleryImages.find(img => img !== activeImage && !updatedFailed.includes(img));
      if (nextVisible) {
        onSetActiveImage(nextVisible);
      }
    }
  };

  // Trata falha no carregamento de uma miniatura
  const handleThumbnailError = (imgUrl: string) => {
    if (!failedImages.includes(imgUrl)) {
      const updatedFailed = [...failedImages, imgUrl];
      setFailedImages(updatedFailed);
      if (activeImage === imgUrl) {
        const nextVisible = galleryImages.find(img => img !== imgUrl && !updatedFailed.includes(img));
        if (nextVisible) {
          onSetActiveImage(nextVisible);
        }
      }
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-zinc-900/30 p-2 group text-left luxury-glass hover:shadow-[0_0_30px_rgba(245,158,11,0.06)] hover:border-amber-500/10 transition-all duration-500">
      <div className="absolute top-4 left-4 z-20 rounded-full bg-zinc-950/80 border border-white/10 px-3.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-amber-500 flex items-center space-x-1.5 backdrop-blur-md">
        <span className={`h-1.5 w-1.5 rounded-full ${isScraping ? 'bg-amber-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
        <span>{isScraping ? 'AUDITANDO VEÍCULO VIA IA...' : 'Foto Real Garantida'}</span>
      </div>

      {/* Main Active image container */}
      <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-zinc-950 border border-white/5 group/image">
        <AnimatePresence mode="wait">
          <motion.img 
            key={activeImage}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
            src={activeImage} 
            alt={carName} 
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover cursor-zoom-in transition-all duration-700"
            onError={handleMainImageError}
          />
        </AnimatePresence>
        
        {/* Visual vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent pointer-events-none z-10" />

        {/* Efeito de Scanline a Laser quando o scraper está ativo */}
        {isScraping && (
          <>
            <div className="absolute inset-0 bg-amber-550/5 mix-blend-overlay pointer-events-none animate-pulse z-10" />
            <motion.div 
              initial={{ y: "-10%" }}
              animate={{ y: "110%" }}
              transition={{ 
                repeat: Infinity, 
                duration: 2.2, 
                ease: "easeInOut" 
              }}
              className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent shadow-[0_0_15px_#f59e0b,0_0_5px_#f59e0b] opacity-90 pointer-events-none z-20"
            />
            {/* Efeito de radar grid sutil */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none z-10 animate-pulse" />
          </>
        )}
        
        {/* Active photo info */}
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between z-20">
          <p className="font-display text-sm font-semibold tracking-wide text-white drop-shadow-md">
            {carName}
          </p>
          <span className="font-mono text-[9px] text-zinc-300 bg-zinc-950/85 py-1 px-2.5 rounded border border-white/10 uppercase tracking-widest leading-none backdrop-blur-md">
            {galleryImages.indexOf(activeImage) === 0 ? "Foto Real do Pátio" : `Detalhe do Carro - ${galleryImages.indexOf(activeImage) + 1}`}
          </span>
        </div>
      </div>

      {/* Thumbnails row */}
      {visibleImages.length > 1 && (
        <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin select-none">
          {visibleImages.map((img, idx) => (
            <motion.button
              key={img}
              onClick={() => onSetActiveImage(img)}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className={`relative flex-shrink-0 w-20 sm:w-24 aspect-[16/10] rounded-lg overflow-hidden border transition-all duration-350 cursor-pointer ${
                activeImage === img 
                  ? 'border-amber-500 ring-4 ring-amber-500/25 shadow-[0_0_12px_rgba(245,158,11,0.2)]' 
                  : 'border-white/10 hover:border-amber-500/20'
              }`}
            >
              <img 
                src={img} 
                alt={`Miniatura ${idx}`} 
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover brightness-90 hover:brightness-110 transition-all duration-300"
                onError={() => handleThumbnailError(img)}
              />
              {galleryImages.indexOf(img) === 0 && (
                <div className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)] border border-zinc-950" title="Foto oficial" />
              )}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
