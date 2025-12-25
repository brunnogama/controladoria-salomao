import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Contratos from './pages/Contratos';
import ContratoForm from './pages/ContratoForm'; // Novo componente de formulário
import Clientes from './pages/Clientes';
import Historico from './pages/Historico';
import Configuracoes from './pages/Configuracoes';
import GED from './pages/GED';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="contratos" element={<Contratos />} />
          <Route path="contratos/novo" element={<ContratoForm />} />
          <Route path="contratos/editar/:id" element={<ContratoForm />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="ged" element={<GED />} />
          <Route path="historico" element={<Historico />} />
          <Route path="configuracoes" element={<Configuracoes />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
