import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import { User, Lock, Loader2, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react'

const Login = () => {
  const navigate = useNavigate()
  const [userPrefix, setUserPrefix] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [customLogo, setCustomLogo] = useState(null)
  const [shake, setShake] = useState(false)

  useEffect(() => {
    const savedLoginLogo = localStorage.getItem('app_login_logo_path')
    if (savedLoginLogo && savedLoginLogo !== '/') {
      setCustomLogo(savedLoginLogo)
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const emailCompleto = `${userPrefix}@salomaoadv.com.br`
    const nomeFormatado = userPrefix.split('.').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: emailCompleto,
        password: password,
      })

      if (authError) throw authError

      localStorage.setItem('user_name', nomeFormatado)
      navigate('/')
    } catch (err) {
      setError('Credenciais inválidas. Verifique usuário e senha.')
      setShake(true)
      setTimeout(() => setShake(false), 500)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex w-full bg-white font-sans'>
      <style>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); } 20%, 40%, 60%, 80% { transform: translateX(4px); } }
        .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
      `}</style>

      {/* LADO ESQUERDO: FORMULÁRIO */}
      <div className='w-full lg:w-[500px] flex flex-col justify-center items-center p-10 z-10 shadow-2xl bg-white'>
        <div className='w-full max-w-sm space-y-10'>
          
          <div className='flex justify-center'>
            {customLogo ? (
              <img
                src={customLogo}
                alt='Logo'
                className='h-24 object-contain'
                onError={() => setCustomLogo(null)}
              />
            ) : (
              <div className='text-center'>
                <h1 className='text-3xl font-black text-[#0F2C4C] tracking-tight uppercase'>Salomão</h1>
                <div className='h-1.5 w-12 bg-yellow-500 mx-auto mt-2'></div>
                <p className='text-[10px] text-gray-400 uppercase tracking-[0.3em] mt-2 font-bold'>Controladoria Jurídica</p>
              </div>
            )}
          </div>

          <form className='space-y-6' onSubmit={handleLogin}>
            <div className='space-y-1'>
              <label className='block text-xs font-black text-[#0F2C4C] uppercase tracking-widest ml-1'>Usuário</label>
              <div className='flex border-2 border-gray-100 rounded-xl overflow-hidden focus-within:border-[#0F2C4C] transition-all bg-gray-50/50'>
                <div className='flex items-center pl-4'><User size={20} className='text-gray-400'/></div>
                <input type='text' required value={userPrefix} onChange={(e)=>setUserPrefix(e.target.value)} className='flex-1 p-4 outline-none text-base text-gray-900 bg-transparent' placeholder='nome.sobrenome' />
                <div className='bg-gray-100 px-4 flex items-center border-l text-[10px] font-bold text-gray-400 italic'>@salomaoadv</div>
              </div>
            </div>

            <div className='space-y-1'>
              <label className='block text-xs font-black text-[#0F2C4C] uppercase tracking-widest ml-1'>Senha</label>
              <div className='relative border-2 border-gray-100 rounded-xl flex items-center focus-within:border-[#0F2C4C] transition-all bg-gray-50/50'>
                <div className='pl-4'><Lock size={20} className='text-gray-400'/></div>
                <input type='password' required value={password} onChange={(e)=>setPassword(e.target.value)} className='flex-1 p-4 outline-none text-base text-gray-900 bg-transparent' placeholder='••••••••' />
              </div>
            </div>

            {error && (
              <div className='bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2 animate-pulse'>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <button type='submit' disabled={loading} className={`w-full py-4 rounded-xl text-white font-black text-base tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 ${shake ? 'animate-shake bg-red-600' : 'bg-[#0F2C4C] hover:bg-[#1a3a5c] hover:-translate-y-0.5'}`}>
              {loading ? <Loader2 className='animate-spin' size={24} /> : <>ENTRAR NO SISTEMA <ArrowRight size={20} /></>}
            </button>
          </form>

          <p className='text-center text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em] pt-4'>
            © 2025 Salomão Advogados • v1.2.0
          </p>
        </div>
      </div>

      {/* LADO DIREITO: UX APRIMORADA */}
      <div className='hidden lg:flex flex-1 bg-[#0F2C4C] relative items-center justify-center overflow-hidden'>
        {/* Elementos Decorativos de Fundo */}
        <div className='absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]'></div>
        <div className='absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-500/10 rounded-full blur-[120px]'></div>
        
        <img src='https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2070' className='absolute inset-0 w-full h-full object-cover opacity-10 grayscale' alt='Justiça' />
        
        <div className='relative z-10 p-20 text-white max-w-2xl'>
          <div className='bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md border border-white/10'>
            <ShieldCheck size={32} className='text-yellow-400' />
          </div>
          
          <h2 className='text-5xl font-black mb-6 leading-[1.1] tracking-tight'>
            Controladoria Jurídica <br />
            <span className='text-yellow-400'>Inteligente.</span>
          </h2>
          
          <div className='h-1.5 w-24 bg-yellow-500 mb-8 rounded-full'></div>
          
          <p className='text-blue-50/80 text-xl font-light leading-relaxed mb-10'>
            Gerencie processos, contratos e volumetria com a precisão que o Direito moderno exige. 
            Segurança de dados e alta performance em uma única plataforma.
          </p>

          <div className='grid grid-cols-2 gap-8 pt-8 border-t border-white/10'>
            <div>
              <p className='text-2xl font-black text-white'>100%</p>
              <p className='text-[10px] uppercase font-bold text-blue-300 tracking-widest'>Cloud & Security</p>
            </div>
            <div>
              <p className='text-2xl font-black text-white'>Real-time</p>
              <p className='text-[10px] uppercase font-bold text-blue-300 tracking-widest'>Data Analytics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
