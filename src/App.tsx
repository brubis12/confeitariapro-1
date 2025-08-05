
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from './contexts/AuthContext';
import { PlanProvider } from './contexts/PlanContext';
import Index from './pages/Index';
import { Dashboard } from './pages/Dashboard';
import NotFound from './pages/NotFound';
import { AppLayout } from './components/layout/AppLayout';
import { Inventory } from './pages/Inventory';
import { Recipes } from './pages/Recipes';
import { Products } from './pages/Products';
import { Sales } from './pages/Sales';
import { Reports } from '@/pages/Reports';
import Settings from './pages/Settings';
import Upgrade from './pages/Upgrade';
import Production from './pages/Production';
import Loyalty from './pages/Loyalty';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <PlanProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
            <Route path="/inventory" element={<AppLayout><Inventory /></AppLayout>} />
            <Route path="/recipes" element={<AppLayout><Recipes /></AppLayout>} />
            <Route path="/products" element={<AppLayout><Products /></AppLayout>} />
            <Route path="/sales" element={<AppLayout><Sales /></AppLayout>} />
            <Route path="/reports" element={<AppLayout><Reports /></AppLayout>} />
            <Route path="/production" element={<AppLayout><Production /></AppLayout>} />
            <Route path="/loyalty" element={<AppLayout><Loyalty /></AppLayout>} />
            <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
            <Route path="/upgrade" element={<AppLayout><Upgrade /></AppLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </PlanProvider>
    </AuthProvider>
  );
}

export default App;
