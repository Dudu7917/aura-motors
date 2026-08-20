import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Previne que o Vite dev server recarregue a página inteira automaticamente ao reconectar após inatividade (idle)
if ((import.meta as any).hot) {
  (import.meta as any).hot.on('vite:beforeFullReload', (payload: any) => {
    console.log('[HMR] Evitando recarga automática por inatividade:', payload);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
