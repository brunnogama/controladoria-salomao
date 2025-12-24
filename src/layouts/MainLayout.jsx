import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

const MainLayout = () => {
  return (
    <div className='flex min-h-screen bg-gray-50'>
      {/* A Sidebar já é fixa (fixed) no componente dela */}
      <Sidebar />

      {/* ÁREA DO CONTEÚDO PRINCIPAL */}
      {/* Adicionei 'ml-64' para empurrar o conteúdo para a direita */}
      {/* w-64 da sidebar = 16rem = 256px. ml-64 compensa exatamente esse espaço. */}
      <main className='flex-1 ml-64 p-8 w-full transition-all duration-300'>
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
