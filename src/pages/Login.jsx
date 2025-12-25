import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Lock, User } from 'lucide-react'

const Login = () => {
  const navigate = useNavigate()
  const [logo, setLogo] = useState('/logo-default.png') // Caminho padrão na pasta Public

  useEffect(() => {
    const savedLogo = localStorage.getItem('app_logo_path')
    if (savedLogo) setLogo(savedLogo)
  }, [])

  const handleLogin = (e) => {
    e.preventDefault()
    localStorage.setItem('user_name', 'Usuário Admin')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#0F2C4C] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8 text-center bg-gray-50 border-b">
          {/* LOGO DINÂMICO NO LUGAR DO TEXTO */}
          <img 
            src={logo} 
            alt="Logo" 
            className="h-20 mx-auto mb-4 object-contain"
            onError={(e) => { e.target.src = '/logo-default.png' }} // Fallback caso o arquivo suma
          />
          <h2 className="text-xl font-bold text-[#0F2C4C]">Controladoria Jurídica</h2>
        </div>
        
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {/* ... campos de input (User/Pass) continuam iguais ... */}
          <button type="submit" className="w-full bg-[#0F2C4C] text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition-all">
            Entrar no Sistema
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
