import React, { useState, useEffect } from 'react'
import { Save, Image as ImageIcon, CheckCircle } from 'lucide-react'

const Configuracoes = () => {
  const [currentLogo, setCurrentLogo] = useState('/logo-default.png')
  
  // Lista dos logos disponíveis na sua pasta Public
  // Você deve adicionar os nomes exatos dos arquivos aqui
  const opcoesLogos = [
    { id: 1, nome: 'Padrão', path: '/logo-default.png' },
    { id: 2, nome: 'Variação Branca', path: '/logo-white.png' },
    { id: 3, nome: 'Símbolo', path: '/favicon.png' },
  ]

  useEffect(() => {
    const saved = localStorage.getItem('app_logo_path')
    if (saved) setCurrentLogo(saved)
  }, [])

  const selecionarLogo = (path) => {
    localStorage.setItem('app_logo_path', path)
    setCurrentLogo(path)
    // Opcional: window.location.reload() para atualizar a Sidebar instantaneamente
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0F2C4C] mb-6 flex items-center gap-2">
          <ImageIcon /> Personalização do Sistema
        </h1>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Logotipo do Sistema</h2>
          <p className="text-sm text-gray-500 mb-6">Escolha o logo que será exibido no Login e na Barra Lateral.</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {opcoesLogos.map((logo) => (
              <div 
                key={logo.id}
                className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  currentLogo === logo.path 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-100 hover:border-gray-300'
                }`}
                onClick={() => selecionarLogo(logo.path)}
              >
                <div className="h-24 w-full flex items-center justify-center mb-3">
                  <img src={logo.path} alt={logo.nome} className="max-h-full object-contain" />
                </div>
                <p className="text-center text-xs font-bold text-gray-700">{logo.nome}</p>
                
                {currentLogo === logo.path && (
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1 shadow-lg">
                    <CheckCircle size={16} />
                  </div>
                )}
                
                <button className={`w-full mt-3 py-1.5 text-[10px] uppercase font-bold rounded ${
                  currentLogo === logo.path ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {currentLogo === logo.path ? 'Selecionado' : 'Escolher'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* ... Resto das configurações (Versões, etc) ... */}
    </div>
  )
}

export default Configuracoes
