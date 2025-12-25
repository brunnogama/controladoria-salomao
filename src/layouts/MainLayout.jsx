// Altere seu MainLayout.jsx para isso:
import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

const MainLayout = () => {
  return (
    <div className='flex h-screen bg-gray-50 overflow-hidden'> 
      {/* Sidebar fixa à esquerda */}
      <Sidebar />

      {/* ÁREA DO CONTEÚDO PRINCIPAL - Adicionamos h-full e overflow-y-auto */}
      <main className='flex-1 ml-64 h-full overflow-y-auto p-8 w-full transition-all duration-300'>
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
