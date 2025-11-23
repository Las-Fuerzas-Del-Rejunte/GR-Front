import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Componente wrapper que oculta el loader inicial
function AppWrapper() {
  useEffect(() => {
    // Ocultar el loader después de que React monte
    const loader = document.getElementById('app-loader');
    if (loader) {
      loader.classList.add('loaded');
      // Remover el elemento del DOM después de la transición
      setTimeout(() => {
        loader.remove();
      }, 300);
    }
  }, []);

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>
);
