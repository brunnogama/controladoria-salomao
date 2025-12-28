/**
 * @file App.jsx
 * @description Componente raiz da aplicação - Configuração de rotas
 * @version 1.8.0
 * @author Marcio Gama - Flow Metrics
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Contratos from './pages/Contratos';
import ContratoForm from './pages/ContratoForm';
import Propostas from './pages/Propostas';
import Clientes from './pages/Clientes';
import Compliance from './pages/Compliance';
import Historico from './pages/Historico';
import Configuracoes from './pages/Configuracoes';
import GED from './pages/GED';
import Kanban from './pages/Kanban';

// Sistema de Notificações
import { ToastProvider } from './components/Toast';
import ModalManager from './components/ModalManager';

/**
 * Componente principal da aplicação
 * Gerencia todas as rotas do sistema
 */
const App = () => {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          {/* Rota Pública - Login */}
          <Route path="/login" element={<Login />} />
          
          {/* Rotas Protegidas - Layout Principal */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="contratos" element={<Contratos />} />
            <Route path="contratos/novo" element={<ContratoForm />} />
            <Route path="contratos/editar/:id" element={<ContratoForm />} />
            <Route path="propostas" element={<Propostas />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="compliance" element={<Compliance />} />
            <Route path="ged" element={<GED />} />
            <Route path="historico" element={<Historico />} />
            <Route path="kanban" element={<Kanban />} />
            <Route path="configuracoes" element={<Configuracoes />} />
          </Route>
          
          {/* Fallback - Redireciona rotas não encontradas para home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      
      {/* Gerenciador Global de Modais */}
      <ModalManager />
    </ToastProvider>
  );
};

export default App;
