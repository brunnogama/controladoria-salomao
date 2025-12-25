import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import { User, Lock, Loader2, ArrowRight, AlertCircle } from 'lucide-react'

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

      {/* LADO ESQUERDO */}
      <div className='w-full lg:w-1/2 flex flex-col justify-center items-center p-8 z-10'>
        <div className='w-full max-w-sm space-y-10'>
          
          <div className='flex justify-center'>
            {customLogo ? (
              <img
                src={customLogo}
                alt='Logo'
                className='h-20 object-contain'
                onError={() => setCustomLogo(null)}
              />
            ) : (
              <div className='text-center'>
                <h1 className='text-3xl font-bold text-[#0F2C4C] tracking-tight'>Salomão Advogados</h1>
                <div className='h-1 w-12 bg-[#0F2C4C] mx-auto mt-2'></div>
                <p className='text-[10px] text-gray-400 uppercase tracking-widest mt-1 font-semibold'>Controladoria Jurídica</p>
              </div>
            )}
          </div>

          <form className='space-y-5' onSubmit={handleLogin}>
            <div>
              <label className='block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider'>Usuário Corporativo</label>
              <div className='flex border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#0F2C4C] transition-all'>
                <div className='flex items-center pl-3 bg-white'><User size={18} className='text-gray-400'/></div>
                <input type='text' required value={userPrefix} onChange={(e)=>setUserPrefix(e.target.value)} className='flex-1 p-3 outline-none text-sm text-gray-900' placeholder='nome.sobrenome' />
                <div className='bg-gray-50 px-3 flex items-center border-l text-[10px] font-bold text-gray-400'>@salomaoadv</div>
              </div>
            </div>

            <div>
              <label className='block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider'>Senha</label>
              <div className='relative border border-gray-300 rounded-lg flex items-center focus-within:ring-2 focus-within:ring-[#0F2C4C] transition-all'>
                <div className='pl-3'><Lock size={18} className='text-gray-400'/></div>
                <input type='password' required value={password} onChange={(e)=>setPassword(e.target.value)} className='flex-1 p-3 outline-none text-sm text-gray-900' placeholder='••••••••' />
              </div>
            </div>

            {error && <div className='bg-red-50 text-red-600 p-3 rounded-lg text-xs text-center border border-red-200 animate-pulse'>{error}</div>}

            <button type='submit' disabled={loading} className={`w-full py-3 rounded-lg text-white font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${shake ? 'animate-shake bg-red-600' : 'bg-[#0F2C4C] hover:bg-blue-900'}`}>
              {loading ? <Loader2 className='animate-spin' size={18} /> : <>Acessar Painel <ArrowRight size={18} /></>}
            </button>
          </form>
        </div>
      </div>

      {/* LADO DIREITO */}
      <div className='hidden lg:flex w-1/2 bg-[#0F2C4C] relative items-center justify-center'>
        <img src='https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=2070' className='absolute inset-0 w-full h-full object-cover opacity-20' alt='Bg' />
        <div className='absolute inset-0 bg-gradient-to-tr from-[#0F2C4C] to-transparent opacity-90'></div>
        <div className='relative z-10 p-16 text-white'>
          <h2 className='text-3xl font-bold mb-4 leading-tight'>Controladoria Jurídica <br /><span className='text-blue-300 uppercase text-2xl'>Estratégica</span></h2>
          <div className='h-1 w-16 bg-yellow-500 mb-6'></div>
          <p className='text-gray-300 text-base font-light leading-relaxed max-w-sm'>Gestão inteligente de processos e contratos com foco em eficiência jurídica.</p>
        </div>
      </div>
    </div>
  )
}

export default Login
