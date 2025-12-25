import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Layout e Páginas
import MainLayout from './layouts/MainLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Kanban from './pages/Kanban' // <-- Importando o Kanban novo
import Contratos from './pages/Contratos'
import NovoContrato from './pages/NovoContrato'
import EditarContrato from './pages/EditarContrato'
import Clientes from './pages/Clientes'
import Historico from './pages/Historico'
import Configuracoes from './pages/Configuracoes'

// Componente simples para páginas em construção
const PaginaEmConstrucao = ({ nome }) => (
  <div className='p-10 text-center'>
    <h1 className='text-2xl font-bold text-gray-400'>Módulo {nome}</h1>
    <p className='text-gray-500'>Em desenvolvimento...</p>
  </div>
)

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- ROTA DE LOGIN (SEM SIDEBAR) --- */}
        <Route path='/login' element={<Login />} />

        {/* --- ROTAS DO SISTEMA (COM SIDEBAR) --- */}
        <Route path='/' element={<MainLayout />}>
          {/* Dashboard como página inicial */}
          <Route index element={<Dashboard />} />

          {/* Kanban de Casos */}
          <Route path='kanban' element={<Kanban />} />

          {/* Gestão de Contratos */}
          <Route path='contratos' element={<Contratos />} />
          <Route path='contratos/novo' element={<NovoContrato />} />
          <Route path='contratos/editar/:id' element={<EditarContrato />} />

          {/* Gestão de Clientes */}
          <Route path='clientes' element={<Clientes />} />

          {/* Histórico e Logs */}
          <Route path='historico' element={<Historico />} />

          {/* Volumetria (Em construção) */}
          <Route
            path='volumetria'
            element={<PaginaEmConstrucao nome='Volumetria' />}
          />

          {/* Configurações do Sistema */}
          <Route path='configuracoes' element={<Configuracoes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
