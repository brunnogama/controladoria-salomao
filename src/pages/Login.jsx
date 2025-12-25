import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, User, ShieldCheck, ArrowRight } from 'lucide-react'

const Login = () => {
  const navigate = useNavigate()
  const [logo, setLogo] = useState('/logo-default.png') // Fallback para pasta public

  useEffect(() => {
    // Busca o logo escolhido em Configurações
    const savedLogo = localStorage.getItem('app_logo_path')
    if (savedLogo) setLogo(savedLogo)
  }, [])

  const handleLogin = (e) => {
    e.preventDefault()
    // Simulação de login
    localStorage.setItem('user_name', 'Usuário Admin')
    navigate('/')
  }

  return (
    <div className='min-h-screen flex bg-white font-sans'>
      {/* LADO ESQUERDO: FORMULÁRIO */}
      <div className='w-full lg:w-[450px] flex flex-col justify-center p-8 md:p-12 shadow-2xl z-10'>
        <div className='mb-10'>
          {/* LOGO DINÂMICO QUE VOCÊ ESCOLHE NAS CONFIGURAÇÕES */}
          <img 
            src={logo} 
            alt="Logo" 
            className="h-16 mb-4 object-contain"
            onError={(e) => { e.target.src = '/logo-default.png' }} 
          />
          <h1 className='text-2xl font-black text-[#0F2C4C] tracking-tight'>
            Controladoria Jurídica
          </h1>
          <p className='text-gray-400 text-sm mt-1'>
            Acesse para gerenciar seus contratos e casos.
          </p>
        </div>

        <form onSubmit={handleLogin} className='space-y-5'>
          <div>
            <label className='block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider'>
              Usuário
            </label>
            <div className='relative'>
              <User
                className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                size={18}
              />
              <input
                type='text'
                required
                className='w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:border-[#0F2C4C] outline-none transition-all placeholder:text-gray-300'
                placeholder='seu.usuario'
              />
            </div>
          </div>

          <div>
            <label className='block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider'>
              Senha
            </label>
            <div className='relative'>
              <Lock
                className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                size={18}
              />
              <input
                type='password'
                required
                className='w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:border-[#0F2C4C] outline-none transition-all placeholder:text-gray-300'
                placeholder='••••••••'
              />
            </div>
          </div>

          <div className='flex items-center justify-between py-2'>
            <label className='flex items-center gap-2 cursor-pointer'>
              <input
                type='checkbox'
                className='w-4 h-4 border-2 border-gray-200 rounded text-[#0F2C4C] focus:ring-0'
              />
              <span className='text-xs text-gray-500 font-medium'>
                Lembrar acesso
              </span>
            </label>
            <a href='#' className='text-xs font-bold text-[#0F2C4C] hover:underline'>
              Esqueceu a senha?
            </a>
          </div>

          <button
            type='submit'
            className='w-full bg-[#0F2C4C] text-white py-4 rounded-xl font-bold hover:bg-[#0a1e35] transition-all flex items-center justify-center gap-2 group'
          >
            Entrar no Sistema
            <ArrowRight size={18} className='group-hover:translate-x-1 transition-transform' />
          </button>
        </form>

        <footer className='mt-auto pt-10 text-center text-[10px] text-gray-400 uppercase tracking-widest font-bold'>
          © 2025 Salomão Advogados • v1.2.0
        </footer>
      </div>

      {/* LADO DIREITO: IMAGEM LATERAL (ORIGINAL) */}
      <div className='hidden lg:flex flex-1 bg-[#0F2C4C] relative overflow-hidden'>
        {/* Padrão de fundo/Overlay decorativo */}
        <div className='absolute inset-0 opacity-10'>
          <div className='absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl'></div>
          <div className='absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-400 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl'></div>
        </div>

        <div className='relative z-20 m-auto text-center p-12 max-w-2xl'>
          <div className='bg-white/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur-md border border-white/20 shadow-2xl'>
            <ShieldCheck size={40} className='text-white' />
          </div>
          <h2 className='text-4xl font-black text-white mb-6 leading-tight'>
            Gestão Estratégica e Controladoria Jurídica
          </h2>
          <p className='text-blue-100 text-lg font-light leading-relaxed'>
            Acompanhe a volumetria, prazos e o status financeiro de todos os 
            contratos em tempo real com segurança e precisão.
          </p>
          
          <div className='mt-12 flex items-center justify-center gap-8'>
            <div className='text-center'>
              <p className='text-2xl font-bold text-white'>100%</p>
              <p className='text-[10px] text-blue-300 uppercase font-black tracking-widest'>Cloud Based</p>
            </div>
            <div className='w-px h-10 bg-white/20'></div>
            <div className='text-center'>
              <p className='text-2xl font-bold text-white'>SSL</p>
              <p className='text-[10px] text-blue-300 uppercase font-black tracking-widest'>Encriptado</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
