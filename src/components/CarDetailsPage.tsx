import React, { useState, useEffect } from 'react';
import { Car, Lead } from '../types';
import { motion } from 'motion/react';
import { Download } from 'lucide-react';
import CarDetailsGallery from './CarDetailsGallery';
import DeepScrapePanel from './CarDetails/DeepScrapePanel';
import TechnicalSpecsGrid from './CarDetails/TechnicalSpecsGrid';
import FipePricingSection from './CarDetails/FipePricingSection';
import LaudoVistoriaSection from './CarDetails/LaudoVistoriaSection';
import CommonActions from './CarDetails/CommonActions';
import PrintPosterModal from './CarDetails/PrintPosterModal';
import FeaturesChecklist from './CarDetails/FeaturesChecklist';
import CarDetailsHeader from './CarDetails/CarDetailsHeader';
import MatchingLeadsSection from './CarDetails/MatchingLeadsSection';
import DeliveryGuidelines from './CarDetails/DeliveryGuidelines';
import { generateWhatsAppText } from '../utils/whatsappFormatter';

export interface CarDetailsPageProps {
  car: Car;
  leads?: Lead[];
  onUpdateLead?: (lead: Lead) => Promise<boolean>;
  onBack: () => void;
  onOpenAiConcierge: (car: Car, initialQuery?: string) => void;
}

export default function CarDetailsPage({
  car,
  leads = [],
  onUpdateLead,
  onBack,
  onOpenAiConcierge
}: CarDetailsPageProps) {
  const [currentCar, setCurrentCar] = useState<Car>(car);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [activeImage, setActiveImage] = useState<string>(car.image);
  const [copied, setCopied] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isPrintPosterOpen, setIsPrintPosterOpen] = useState(false);
  const [isScraping, setIsScraping] = useState(false);

  // Estados da Extração em Profundidade (Deep Scraping)
  const [isEnriched, setIsEnriched] = useState<boolean>(false);
  const [laudoCompleto, setLaudoCompleto] = useState<string | null>(null);
  const [sellerNotes, setSellerNotes] = useState<string | null>(null);
  const [extractedFeatures, setExtractedFeatures] = useState<string[]>([]);

  const handleDownloadAllPhotos = async () => {
    if (galleryImages.length === 0) return;
    setDownloading(true);
    setDownloadProgress(0);

    try {
      for (let i = 0; i < galleryImages.length; i++) {
        const imageUrl = galleryImages[i];
        const ext = imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
        const cleanExt = ['jpg', 'jpeg', 'png', 'webp', 'jfif', 'gif'].includes(ext.toLowerCase()) ? ext : 'jpg';
        const filename = `${currentCar.brand.toLowerCase()}_${currentCar.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_foto_${i + 1}.${cleanExt}`;
        
        const downloadUrl = `/api/download-image?url=${encodeURIComponent(imageUrl)}&filename=${encodeURIComponent(filename)}`;
        
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setDownloadProgress(Math.round(((i + 1) / galleryImages.length) * 100));
        await new Promise(r => setTimeout(r, 600));
      }
    } catch (e) {
      console.error("Falha no download das fotos:", e);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = () => {
    const link = currentCar.detailUrl || `https://www.garagemdonelsinho.com.br/Veiculos?busca=${encodeURIComponent(currentCar.name)}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      const input = document.createElement('input');
      input.value = link;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCopyWhatsAppText = () => {
    const textToCopy = generateWhatsAppText(currentCar);
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedWhatsApp(true);
      setTimeout(() => setCopiedWhatsApp(false), 2000);
    }).catch(() => {
      const input = document.createElement('textarea');
      input.value = textToCopy;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopiedWhatsApp(true);
      setTimeout(() => setCopiedWhatsApp(false), 2000);
    });
  };
  
  const handleEnrichCar = (data: {
    enrichedCar: Car;
    laudoCompleto: string;
    sellerNotes: string;
    extractedFeatures: string[];
  }) => {
    setCurrentCar(data.enrichedCar);
    setLaudoCompleto(data.laudoCompleto);
    setSellerNotes(data.sellerNotes);
    setExtractedFeatures(data.extractedFeatures);
    setIsEnriched(true);
    if (data.enrichedCar.gallery && data.enrichedCar.gallery.length > 0) {
      setGalleryImages(data.enrichedCar.gallery);
      if (data.enrichedCar.gallery[0]) setActiveImage(data.enrichedCar.gallery[0]);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentCar(car);
    setIsEnriched(false);
    setLaudoCompleto(null);
    setSellerNotes(null);
    setExtractedFeatures([]);
    const list = (car.gallery && car.gallery.length > 0) ? [...car.gallery] : [car.image];
    setGalleryImages(list);
    setActiveImage(list[0] || car.image);
  }, [car]);

  const handleOpenAiAssisChat = () => {
    onOpenAiConcierge(currentCar, `Olá Nelsinho! Tenho muito interesse neste carro real do pátio: *${currentCar.name}* de valor R$ ${currentCar.price.toLocaleString('pt-BR')}. Quais opcionais ele tem e como está o estado de conservação dele?`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 90, damping: 14 } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      exit="hidden"
      variants={containerVariants}
      className="bg-zinc-950 py-8 px-4 md:px-6 border-t border-white/5 relative overflow-hidden"
    >
      {/* Glow de fundo de luxo */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-amber-500/3 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-amber-500/2 blur-[150px] pointer-events-none" />
      <div className="mx-auto max-w-7xl text-left relative z-10">
        <CarDetailsHeader
          onBack={onBack}
          handleCopyLink={handleCopyLink}
          copied={copied}
          handleCopyWhatsAppText={handleCopyWhatsAppText}
          copiedWhatsApp={copiedWhatsApp}
          car={currentCar}
        />

        <div className="grid gap-8 lg:grid-cols-12">
          
          <div className="lg:col-span-7 space-y-8">
            <motion.div variants={itemVariants}>
              <CarDetailsGallery
                carName={currentCar.name}
                galleryImages={galleryImages}
                activeImage={activeImage}
                onSetActiveImage={setActiveImage}
                isScraping={isScraping}
              />
            </motion.div>

            {/* Ficha Técnica */}
            <motion.div variants={itemVariants}>
              <TechnicalSpecsGrid car={currentCar} />
            </motion.div>

            {/* Seção Tabela FIPE */}
            <motion.div variants={itemVariants}>
              <FipePricingSection car={currentCar} />
            </motion.div>

            {/* Itens de Série */}
            <motion.div variants={itemVariants}>
              <FeaturesChecklist
                features={currentCar.features}
                extractedFeatures={extractedFeatures}
                isEnriched={isEnriched}
              />
            </motion.div>

            <DeliveryGuidelines car={currentCar} />

          </div>

          <div className="lg:col-span-5 space-y-6">

            <MatchingLeadsSection car={currentCar} leads={leads} onUpdateLead={onUpdateLead} />
            
            {/* Painel Deep Scraping */}
            <motion.div variants={itemVariants}>
              <DeepScrapePanel 
                car={currentCar} 
                onEnrich={handleEnrichCar} 
                onScrapeStateChange={setIsScraping}
              />
            </motion.div>

            {/* Seção Laudo Vistoria / IA */}
            <motion.div variants={itemVariants}>
              <LaudoVistoriaSection laudoCompleto={laudoCompleto} sellerNotes={sellerNotes} />
            </motion.div>

            {/* Ações Comuns */}
            <motion.div variants={itemVariants}>
              <CommonActions 
                detailUrl={currentCar.detailUrl}
                carName={currentCar.name}
                copied={copied}
                copiedWhatsApp={copiedWhatsApp}
                downloading={downloading}
                downloadProgress={downloadProgress}
                onCopyAnuncioLink={handleCopyLink}
                onCopyWhatsAppText={handleCopyWhatsAppText}
                onDownloadPhotos={handleDownloadAllPhotos}
                onOpenAiChat={handleOpenAiAssisChat}
                onPrintPoster={() => setIsPrintPosterOpen(true)}
              />
            </motion.div>

          </div>

        </div>

      </div>

      {/* Modal do Cartaz A4 de Showroom */}
      <PrintPosterModal
        car={currentCar}
        isOpen={isPrintPosterOpen}
        onClose={() => setIsPrintPosterOpen(false)}
      />
    </motion.div>
  );
}
