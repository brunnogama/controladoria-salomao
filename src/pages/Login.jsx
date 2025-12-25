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
  const [bgImage, setBgImage] = useState('')

  useEffect(() => {
    const savedLoginLogo = localStorage.getItem('app_login_logo_path')
    if (savedLoginLogo && savedLoginLogo !== '/') setCustomLogo(savedLoginLogo)

    const randomID = Math.floor(Math.random() * 500)
    setBgImage(`https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1080&sig=${randomID}`)
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const emailCompleto = `${userPrefix}@salomaoadv.com.br`
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email: emailCompleto, password })
      if (authError) throw authError
      localStorage.setItem('user_name', userPrefix.split('.').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' '))
      navigate('/')
    } catch (err) {
      setError('Credenciais inválidas.')
      setShake(true)
      setTimeout(() => setShake(false), 500)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex w-full bg-white font-sans overflow-hidden'>
      <style>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); } 20%, 40%, 60%, 80% { transform: translateX(4px); } }
        .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
      `}</style>

      {/* LADO ESQUERDO: 100% Mobile, 50% Desktop */}
      <div className='w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-16 bg-white z-10'>
        <div className='w-full max-w-sm space-y-10'>
          
          <div className='flex justify-center'>
            {customLogo ? (
              <img src={customLogo} alt='Logo' className='h-20 md:h-28 object-contain' />
            ) : (
              <div className='text-center'>
                <h1 className='text-3xl md:text-4xl font-black text-[#0F2C4C] uppercase'>Salomão</h1>
                <div className='h-1.5 w-12 bg-yellow-500 mx-auto mt-2 rounded-full'></div>
              </div>
            )}
          </div>

          <form className='space-y-6' onSubmit={handleLogin}>
            <div className='space-y-2'>
              <label className='block text-xs font-black text-[#0F2C4C] uppercase tracking-widest'>Usuário</label>
              <div className='flex border-2 border-gray-100 rounded-2xl overflow-hidden focus-within:border-[#0F2C4C] bg-gray-50/50'>
                <div className='flex items-center pl-4'><User size={20} className='text-gray-400'/></div>
                <input type='text' required value={userPrefix} onChange={(e)=>setUserPrefix(e.target.value)} className='flex-1 p-3.5 outline-none text-sm' placeholder='nome.sobrenome' />
                <div className='bg-gray-100 px-3 flex items-center border-l text-[9px] md:text-[11px] font-bold text-gray-400'>@salomaoadv.com.br</div>
              </div>
            </div>

            <div className='space-y-2'>
              <label className='block text-xs font-black text-[#0F2C4C] uppercase tracking-widest'>Senha</label>
              <div className='border-2 border-gray-100 rounded-2xl flex items-center focus-within:border-[#0F2C4C] bg-gray-50/50'>
                <div className='pl-4'><Lock size={20} className='text-gray-400'/></div>
                <input type='password' required value={password} onChange={(e)=>setPassword(e.target.value)} className='flex-1 p-3.5 outline-none text-sm' placeholder='••••••••' />
              </div>
            </div>

            <button type='submit' disabled={loading} className={`w-full py-4 rounded-2xl text-white font-black transition-all shadow-xl flex items-center justify-center gap-3 ${shake ? 'bg-red-600 animate-shake' : 'bg-[#0F2C4C] hover:bg-[#153a63]'}`}>
              {loading ? <Loader2 className='animate-spin' size={24} /> : <>ENTRAR <ArrowRight size={20} /></>}
            </button>
          </form>
        </div>
      </div>

      {/* LADO DIREITO: FICA OCULTO NO MOBILE */}
      <div className='hidden lg:flex lg:w-1/2 bg-[#0F2C4C] relative items-center justify-center'>
        <div className='absolute inset-0'>
          <img src={bgImage} className='absolute inset-0 w-full h-full object-cover opacity-20 grayscale' alt='Bg' />
          <div className='absolute inset-0 bg-gradient-to-br from-[#0F2C4C] via-[#0F2C4C]/90 to-transparent'></div>
        </div>
        <div className='relative z-10 p-12 text-white max-w-lg'>
          <h2 className='text-4xl font-black mb-6 leading-tight'>Controladoria <br /><span className='text-yellow-500'>Estratégica.</span></h2>
          <p className='text-blue-50/70 text-xl font-light leading-relaxed'>Gestão inteligente de processos e contratos com precisão absoluta.</p>
        </div>
      </div>
    </div>
  )
}

export default Login
