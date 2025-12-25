import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, User, ShieldCheck, ArrowRight } from 'lucide-react'

const Login = () => {
  const navigate = useNavigate()
  const [logo, setLogo] = useState('/logo-default.png') 

  useEffect(() => {
    // Busca especificamente a logo configurada para o LOGIN
    const savedLogo = localStorage.getItem('login_logo_path')
    if (savedLogo) setLogo(savedLogo)
  }, [])

  const handleLogin = (e) => {
    e.preventDefault()
    localStorage.setItem('user_name', 'Administrador')
    navigate('/')
  }

  return (
    <div className='min-h-screen flex bg-white font-sans'>
      {/* LADO ESQUERDO: LOGIN */}
      <div className='w-full lg:w-[450px] flex flex-col justify-center p-8 md:p-12 shadow-2xl z-10'>
        <div className='mb-10'>
          <img 
            src={logo} 
            alt="Logo Empresa" 
            className="h-20 mb-6 object-contain"
            onError={(e) => { e.target.src = '/logo-default.png' }} 
          />
          <h1 className='text-2xl font-black text-[#0F2C4C] tracking-tight uppercase'>
            Controladoria
          </h1>
          <p className='text-gray-400 text-sm mt-1'>
            Introduza as suas credenciais para aceder ao sistema.
          </p>
        </div>

        <form onSubmit={handleLogin} className='space-y-5'>
          <div>
            <label className='block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider'>Utilizador</label>
            <div className='relative'>
              <User className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' size={18} />
              <input type='text' required className='w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:border-[#0F2C4C] outline-none transition-all' placeholder='nome.apelido' />
            </div>
          </div>

          <div>
            <label className='block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider'>Palavra-passe</label>
            <div className='relative'>
              <Lock className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' size={18} />
              <input type='password' required className='w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:border-[#0F2C4C] outline-none transition-all' placeholder='••••••••' />
            </div>
          </div>

          <button type='submit' className='w-full bg-[#0F2C4C] text-white py-4 rounded-xl font-bold hover:bg-[#0a1e35] transition-all flex items-center justify-center gap-2 group'>
            Aceder ao Painel
            <ArrowRight size={18} className='group-hover:translate-x-1 transition-transform' />
          </button>
        </form>

        <footer className='mt-auto pt-10 text-center text-[10px] text-gray-400 uppercase tracking-widest font-bold'>
          © 2025 Salomão Advogados • Gestão Jurídica
        </footer>
      </div>

      {/* LADO DIREITO: PAINEL AZUL (ORIGINAL) */}
      <div className='hidden lg:flex flex-1 bg-[#0F2C4C] relative overflow-hidden'>
        <div className='absolute inset-0 opacity-10'>
          <div className='absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl'></div>
          <div className='absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-400 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl'></div>
        </div>

        <div className='relative z-20 m-auto text-center p-12 max-w-2xl'>
          <div className='bg-white/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur-md border border-white/20 shadow-2xl'>
            <ShieldCheck size={40} className='text-white' />
          </div>
          <h2 className='text-4xl font-black text-white mb-6 leading-tight'>
            Gestão Estratégica Jurídica
          </h2>
          <p className='text-blue-100 text-lg font-light leading-relaxed'>
            Acompanhe o status financeiro de todos os contratos em tempo real com segurança e precisão.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
