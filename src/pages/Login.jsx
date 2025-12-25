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
  const [bgImage, setBgImage] = useState('')

  useEffect(() => {
    // Carrega a logo personalizada
    const savedLoginLogo = localStorage.getItem('app_login_logo_path')
    if (savedLoginLogo && savedLoginLogo !== '/') {
      setCustomLogo(savedLoginLogo)
    }

    // Imagem Dinâmica (Direito/Escritório) com ID aleatório para mudar a cada acesso
    const randomID = Math.floor(Math.random() * 1000)
    setBgImage(`https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=2070&auto=format&fit=crop&sig=${randomID}`)
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
    <div className='min-h-screen flex w-full bg-white font-sans overflow-hidden'>
      <style>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); } 20%, 40%, 60%, 80% { transform: translateX(4px); } }
        .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
      `}</style>

      {/* LADO ESQUERDO: FORMULÁRIO (50% no Desktop, 100% no Mobile) */}
      <div className='w-full lg:w-1/2 flex flex-col justify-center items-center p-8 md:p-16 z-10 bg-white'>
        <div className='w-full max-w-md space-y-10'>
          
          <div className='flex justify-center'>
            {customLogo ? (
              <img
                src={customLogo}
                alt='Logo'
                className='h-24 md:h-32 object-contain'
                onError={() => setCustomLogo(null)}
              />
            ) : (
              <div className='text-center'>
                <h1 className='text-3xl font-bold text-[#0F2C4C] tracking-tight'>
                  Salomão Advogados
                </h1>
                <div className='h-1 w-12 bg-[#0F2C4C] mx-auto mt-2 mb-1'></div>
                <p className='text-xs text-gray-500 uppercase tracking-widest font-semibold'>
                  Controladoria Jurídica
                </p>
              </div>
            )}
          </div>

          <form className='space-y-6' onSubmit={handleLogin}>
            <div>
              <label className='block text-xs font-bold text-gray-700 uppercase mb-2 tracking-wider ml-1'>
                Usuário Corporativo
              </label>
              <div className='flex border-2 border-gray-100 rounded-2xl overflow-hidden focus-within:border-[#0F2C4C] transition-all bg-gray-50/50 shadow-sm'>
                <div className='flex items-center pl-4 bg-white'><User size={20} className='text-gray-400'/></div>
                <input 
                  type='text' 
                  required 
                  value={userPrefix} 
                  onChange={(e)=>setUserPrefix(e.target.value)} 
                  className='flex-1 p-4 outline-none text-base text-gray-900 bg-transparent min-w-0' 
                  placeholder='nome.sobrenome' 
                />
                <div className='bg-gray-100 px-4 flex items-center border-l text-[10px] md:text-[11px] font-bold text-[#0F2C4C]/60 whitespace-nowrap'>
                  @salomaoadv.com.br
                </div>
              </div>
            </div>

            <div>
              <label className='block text-xs font-bold text-gray-700 uppercase mb-2 tracking-wider ml-1'>
                Senha
              </label>
              <div className='relative border-2 border-gray-100 rounded-2xl flex items-center focus-within:border-[#0F2C4C] transition-all bg-gray-50/50 shadow-sm'>
                <div className='pl-4 bg-white'><Lock size={20} className='text-gray-400'/></div>
                <input 
                  type='password' 
                  required 
                  value={password} 
                  onChange={(e)=>setPassword(e.target.value)} 
                  className='flex-1 p-4 outline-none text-base text-gray-900 bg-transparent' 
                  placeholder='••••••••' 
                />
              </div>
            </div>

            {error && (
              <div className='text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-200 text-center animate-shake font-medium'>
                {error}
              </div>
            )}

            <button 
              type='submit' 
              disabled={loading} 
              className={`w-full py-4 rounded-2xl text-white font-black text-base tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 ${shake ? 'bg-red-600' : 'bg-[#0F2C4C] hover:bg-blue-900'}`}
            >
              {loading ? <Loader2 className='animate-spin' size={24} /> : <>ACESSAR SISTEMA <ArrowRight size={20} /></>}
            </button>
          </form>

          <p className='text-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] pt-4'>
            © 2025 Salomão Advogados • v1.2.0
          </p>
        </div>
      </div>

      {/* LADO DIREITO: DESIGN ORIGINAL RESTAURADO (Fica oculto no mobile) */}
      <div className='hidden lg:flex lg:w-1/2 bg-[#0F2C4C] relative items-center justify-center overflow-hidden'>
        <div className='absolute inset-0'>
          <img
            src={bgImage}
            alt='Jurídico'
            className='w-full h-full object-cover opacity-20 mix-blend-luminosity'
          />
          <div className='absolute inset-0 bg-gradient-to-tr from-[#0F2C4C] via-[#0F2C4C]/90 to-blue-900/40'></div>
        </div>

        <div className='relative z-10 p-16 max-w-xl'>
          <div className='inline-flex items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 mb-8 backdrop-blur-sm shadow-2xl'>
            <ArrowRight className='text-yellow-400 w-6 h-6' />
          </div>

          <h2 className='text-4xl font-bold text-white mb-6 leading-tight'>
            Controladoria Jurídica <br />
            <span className='text-blue-200'>Estratégica</span>
          </h2>
          <div className='h-1 w-24 bg-yellow-500 mb-8'></div>
          <p className='text-gray-300 text-lg leading-relaxed font-light mb-8'>
            Gestão inteligente de processos e contratos. A tecnologia garantindo
            a segurança e eficiência do{' '}
            <strong className='text-white font-medium'>
              Salomão Advogados
            </strong>
            .
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
