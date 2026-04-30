import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { SupplyChain } from './pages/SupplyChain';
import { ScannerPage } from './pages/Scanner';
import { BlockchainAudit } from './pages/BlockchainAudit';
import { Analytics } from './pages/Analytics';

// Create a wrapper component for AnimatePresence
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="supply-chain" element={<SupplyChain />} />
          <Route path="scan" element={<ScannerPage />} />
          <Route path="alerts" element={<BlockchainAudit />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
          },
          success: {
            iconTheme: {
              primary: '#39ff14',
              secondary: '#000',
            },
          },
          error: {
            iconTheme: {
              primary: '#ff073a',
              secondary: '#fff',
            },
          },
        }}
      />
    </BrowserRouter>
  );
}

export default App;
