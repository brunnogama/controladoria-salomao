import React, { useState, useEffect } from 'react'
import { Save, Image as ImageIcon, CheckCircle, Monitor, Lock } from 'lucide-react'

const Configuracoes = () => {
  const [logoInterno, setLogoInterno] = useState('/logo-default.png')
  const [logoLogin, setLogoLogin] = useState('/logo-default.png')
  
  // Lista dos logos que você tem na pasta PUBLIC
  const opcoesLogos = [
    { id: 1, nome: 'Padrão Colorido', path: '/logo-color.png' },
    { id: 2, nome: 'Versão Branca', path: '/logo-white.png' },
    { id: 3, nome: 'Horizontal', path: '/logo-horizontal.png' },
    { id: 4, nome: 'Símbolo', path: '/favicon.png' },
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
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold text-[#0F2C4C] mb-6 flex items-center gap-2">
        <ImageIcon /> Configurações de Identidade Visual
      </h1>

      {/* SEÇÃO LOGO INTERNO */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-gray-700">
          <Monitor size={20} /> Logotipo Interno (Menu Lateral)
        </h2>
        <p className="text-sm text-gray-500 mb-6">Este logo aparece no topo da barra lateral esquerda.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {opcoesLogos.map((logo) => (
            <div 
              key={`int-${logo.id}`}
              onClick={() => selecionarLogo('interno', logo.path)}
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${logoInterno === logo.path ? 'border-blue-500 bg-blue-50' : 'border-gray-100'}`}
            >
              <img src={logo.path} className="h-12 mx-auto object-contain mb-2" />
              <p className="text-[10px] text-center font-bold uppercase">{logo.nome}</p>
              {logoInterno === logo.path && <CheckCircle size={14} className="text-blue-500 mx-auto mt-1" />}
            </div>
          ))}
        </div>
      </div>

      {/* SEÇÃO LOGO LOGIN */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-gray-700">
          <Lock size={20} /> Logotipo da Tela de Login
        </h2>
        <p className="text-sm text-gray-500 mb-6">Este logo aparece na página de entrada do sistema.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {opcoesLogos.map((logo) => (
            <div 
              key={`log-${logo.id}`}
              onClick={() => selecionarLogo('login', logo.path)}
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${logoLogin === logo.path ? 'border-[#0F2C4C] bg-gray-50' : 'border-gray-100'}`}
            >
              <img src={logo.path} className="h-12 mx-auto object-contain mb-2" />
              <p className="text-[10px] text-center font-bold uppercase">{logo.nome}</p>
              {logoLogin === logo.path && <CheckCircle size={14} className="text-[#0F2C4C] mx-auto mt-1" />}
            </div>
          ))}
        </div>
      </div>
      
      <button onClick={() => window.location.reload()} className="bg-[#0F2C4C] text-white px-6 py-2 rounded-lg font-bold">
        Aplicar Mudanças
      </button>
    </div>
  )
}

export default Configuracoes
