import React from 'react';
import { motion } from 'motion/react';

interface CinematicTextRevealProps {
  text: string;
  className?: string;
  type?: 'words' | 'chars' | 'lines';
  delay?: number;
  duration?: number;
  staggerDelay?: number;
  yOffset?: number;
  letterSpacingStart?: string;
  letterSpacingEnd?: string;
  once?: boolean;
}

export default function CinematicTextReveal({
  text,
  className = '',
  type = 'words',
  delay = 0,
  duration = 0.8,
  staggerDelay = 0.05,
  yOffset = 24,
  letterSpacingStart = '0.05em',
  letterSpacingEnd = 'normal',
  once = true,
}: CinematicTextRevealProps) {
  // Configuração para animação de revelação de palavra por palavra
  if (type === 'words') {
    const words = text.split(' ');

    const containerVariants = {
      hidden: {},
      visible: {
        transition: {
          staggerChildren: staggerDelay,
          delayChildren: delay,
        },
      },
    };

    const wordVariants = {
      hidden: {
        opacity: 0,
        y: yOffset,
      },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: duration,
          ease: [0.16, 1, 0.3, 1], // Custom Ease-out (Quart/Quint)
        },
      },
    };

    return (
      <motion.span
        variants={containerVariants as any}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, margin: "-50px" }}
        className={`inline-flex flex-wrap ${className}`}
      >
        {words.map((word, idx) => (
          <span key={idx} className="inline-block overflow-hidden mr-[0.25em] py-1">
            <motion.span variants={wordVariants as any} className="inline-block">
              {word === '' ? '\u00A0' : word}
            </motion.span>
          </span>
        ))}
      </motion.span>
    );
  }

  // Configuração para revelação letra por letra com efeito cinemático (de espaçamento e desfoque)
  if (type === 'chars') {
    const chars = Array.from(text);

    const containerVariants = {
      hidden: {
        letterSpacing: letterSpacingStart,
      },
      visible: {
        letterSpacing: letterSpacingEnd,
        transition: {
          staggerChildren: staggerDelay,
          delayChildren: delay,
          duration: duration * 1.5,
          ease: [0.16, 1, 0.3, 1],
        },
      },
    };

    const charVariants = {
      hidden: {
        opacity: 0,
        y: yOffset,
        filter: 'blur(4px)',
        scale: 0.9,
      },
      visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        scale: 1,
        transition: {
          duration: duration,
          ease: [0.16, 1, 0.3, 1],
        },
      },
    };

    return (
      <motion.span
        variants={containerVariants as any}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, margin: "-50px" }}
        className={`inline-block ${className}`}
        style={{ whiteSpace: 'pre-wrap' }}
      >
        {chars.map((char, idx) => (
          <motion.span
            key={idx}
            variants={charVariants as any}
            className="inline-block origin-center"
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </motion.span>
    );
  }

  // Fallback simples
  return <span className={className}>{text}</span>;
}
