import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ensureDefaultConfig } from './db';
import './styles/global.css';

// Initialise la config par défaut dans IndexedDB
ensureDefaultConfig().catch(console.error);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
