import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'recharts',
        'lucide-react',
        'motion/react',
        'react-markdown',
        'remark-gfm'
      ],
    },
    server: {
      proxy: {
        '/socket.io': {
          target: 'http://localhost:3000',
          ws: true,
        },
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
      // Desativa o HMR overlay e ignora alterações em arquivos de cache JSON para evitar recargas indesejadas da tela
      hmr: process.env.DISABLE_HMR === 'true' ? false : { overlay: false },
      watch: {
        ignored: [
          '**/fipe-cache*.json',
          '**/showroom-cache*.json',
          '**/leads-cache*.json',
          '**/scraper-settings*.json',
          '**/*.json',
          '**/downloads/**',
          '**/downloads'
        ]
      },
    },
  };
});
