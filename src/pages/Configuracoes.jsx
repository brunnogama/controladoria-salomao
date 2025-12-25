import React, { useState, useEffect } from 'react'
import { Save, Image as ImageIcon, CheckCircle, Monitor, Lock } from 'lucide-react'

const Configuracoes = () => {
  const [logoInterno, setLogoInterno] = useState('/logo-default.png')
  const [logoLogin, setLogoLogin] = useState('/logo-default.png')
  
  // Lista dos logos que estão na sua pasta PUBLIC
  // Adicione aqui os caminhos exatos dos ficheiros que estão em /public
  const opcoesLogos = [
    { id: 1, nome: 'Logo Cor', path: '/logo-color.png' },
    { id: 2, nome: 'Logo Branco', path: '/logo-white.png' },
    { id: 3, nome: 'Logo Horizontal', path: '/logo-horizontal.png' },
    { id: 4, nome: 'Ícone/Favicon', path: '/favicon.png' },
  ]

  useEffect(() => {
    const savedInterno = localStorage.getItem('app_logo_path')
    const savedLogin = localStorage.getItem('login_logo_path')
    if (savedInterno) setLogoInterno(savedInterno)
    if (savedLogin) setLogoLogin(savedLogin)
  }, [])

  const selecionarLogo = (tipo, path) => {
    if (tipo === 'interno') {
      localStorage.setItem('app_logo_path', path)
      setLogoInterno(path)
    } else {
      localStorage.setItem('login_logo_path', path)
      setLogoLogin(path)
    }
  }

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-2">
        <ImageIcon className="text-[#0F2C4C]" size={28} />
        <h1 className="text-2xl font-bold text-[#0F2C4C]">Identidade Visual</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* CONFIGURAÇÃO LOGO INTERNO */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-gray-800 font-bold border-b pb-3">
            <Monitor size={20} className="text-blue-600" />
            <h2>Logo do Menu Lateral (Sidebar)</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {opcoesLogos.map((logo) => (
              <div 
                key={`int-${logo.id}`}
                onClick={() => selecionarLogo('interno', logo.path)}
                className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                  logoInterno === logo.path ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <img src={logo.path} className="h-10 object-contain" alt={logo.nome} />
                <span className="text-[10px] font-bold text-gray-500">{logo.nome}</span>
                {logoInterno === logo.path && (
                  <CheckCircle size={16} className="absolute top-2 right-2 text-blue-500" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CONFIGURAÇÃO LOGO LOGIN */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-gray-800 font-bold border-b pb-3">
            <Lock size={20} className="text-orange-500" />
            <h2>Logo da Tela de Login</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {opcoesLogos.map((logo) => (
              <div 
                key={`log-${logo.id}`}
                onClick={() => selecionarLogo('login', logo.path)}
                className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                  logoLogin === logo.path ? 'border-[#0F2C4C] bg-gray-50' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <img src={logo.path} className="h-10 object-contain" alt={logo.nome} />
                <span className="text-[10px] font-bold text-gray-500">{logo.nome}</span>
                {logoLogin === logo.path && (
                  <CheckCircle size={16} className="absolute top-2 right-2 text-[#0F2C4C]" />
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="flex justify-end">
        <button 
          onClick={() => window.location.reload()} 
          className="bg-[#0F2C4C] text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-900 transition-all shadow-lg flex items-center gap-2"
        >
          <Save size={20} /> Aplicar Identidade Visual
        </button>
      </div>
    </div>
  )
}

export default Configuracoes
