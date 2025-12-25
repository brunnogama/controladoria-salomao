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

  // Temas de imagens profissionais e sóbrias
  const temas = ['law', 'office', 'architecture', 'legal', 'justice', 'corporate']

  useEffect(() => {
    // 1. Carrega a logo personalizada
    const savedLoginLogo = localStorage.getItem('app_login_logo_path')
    if (savedLoginLogo && savedLoginLogo !== '/') {
      setCustomLogo(savedLoginLogo)
    }

    // 2. Sorteia uma imagem dinâmica do Unsplash para o lado direito
    const temaSorteado = temas[Math.floor(Math.random() * temas.length)]
    const randomID = Math.floor(Math.random() * 1000)
    setBgImage(`https://source.unsplash.com/featured/1080x1080?${temaSorteado}&sig=${randomID}`)
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

      {/* LADO ESQUERDO: 50% */}
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
                <h1 className='text-4xl font-black text-[#0F2C4C] tracking-tighter uppercase'>Salomão</h1>
                <div className='h-2 w-16 bg-yellow-500 mx-auto mt-2 rounded-full'></div>
                <p className='text-xs text-gray-400 uppercase tracking-[0.4em] mt-3 font-bold'>Controladoria Jurídica</p>
              </div>
            )}
          </div>

          <form className='space-y-6' onSubmit={handleLogin}>
            <div className='space-y-2'>
              <label className='block text-xs font-black text-[#0F2C4C] uppercase tracking-widest ml-1'>Usuário Corporativo</label>
              <div className='flex border-2 border-gray-100 rounded-2xl overflow-hidden focus-within:border-[#0F2C4C] transition-all bg-gray-50/50 shadow-sm'>
                <div className='flex items-center pl-4'><User size={22} className='text-gray-400'/></div>
                <input 
                  type='text' 
                  required 
                  value={userPrefix} 
                  onChange={(e)=>setUserPrefix(e.target.value)} 
                  className='flex-1 p-4 outline-none text-base text-gray-900 bg-transparent min-w-0' 
                  placeholder='nome.sobrenome' 
                />
                <div className='bg-gray-100 px-4 flex items-center border-l text-xs font-bold text-[#0F2C4C]/60 whitespace-nowrap'>
                  @salomaoadv.com.br
                </div>
              </div>
            </div>

            <div className='space-y-2'>
              <label className='block text-xs font-black text-[#0F2C4C] uppercase tracking-widest ml-1'>Senha</label>
              <div className='relative border-2 border-gray-100 rounded-2xl flex items-center focus-within:border-[#0F2C4C] transition-all bg-gray-50/50 shadow-sm'>
                <div className='pl-4'><Lock size={22} className='text-gray-400'/></div>
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
              <div className='bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100 flex items-center gap-3 animate-shake'>
                <AlertCircle size={20} /> {error}
              </div>
            )}

            <button 
              type='submit' 
              disabled={loading} 
              className={`w-full py-5 rounded-2xl text-white font-black text-base tracking-[0.2em] transition-all shadow-xl flex items-center justify-center gap-3 ${shake ? 'bg-red-600' : 'bg-[#0F2C4C] hover:bg-[#153a63] hover:shadow-2xl'}`}
            >
              {loading ? <Loader2 className='animate-spin' size={24} /> : <>ENTRAR NO SISTEMA <ArrowRight size={22} /></>}
            </button>
          </form>

          <p className='text-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] pt-8'>
            © 2025 Salomão Advogados • Gestão de Performance
          </p>
        </div>
      </div>

      {/* LADO DIREITO: 50% - IMAGEM DINÂMICA */}
      <div className='hidden lg:flex lg:w-1/2 bg-[#0F2C4C] relative items-center justify-center overflow-hidden'>
        {/* Camada de Imagem de Fundo */}
        <div className='absolute inset-0 transition-all duration-1000'>
          <img 
            src={bgImage} 
            className='absolute inset-0 w-full h-full object-cover opacity-30 grayscale transition-opacity duration-1000' 
            alt='Justiça'
            onLoad={(e) => e.target.style.opacity = '0.3'}
          />
          <div className='absolute inset-0 bg-gradient-to-br from-[#0F2C4C] via-[#0F2C4C]/95 to-transparent'></div>
        </div>
        
        <div className='relative z-10 p-20 text-white max-w-2xl'>
          <div className='bg-yellow-500/10 w-20 h-20 rounded-3xl flex items-center justify-center mb-10 backdrop-blur-xl border border-yellow-500/20 shadow-2xl'>
            <ShieldCheck size={40} className='text-yellow-500' />
          </div>
          
          <h2 className='text-5xl font-black mb-8 leading-[1.1] tracking-tighter'>
            Controladoria Jurídica <br />
            <span className='text-yellow-500'>Estratégica.</span>
          </h2>
          
          <div className='h-2 w-32 bg-yellow-500 mb-10 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.4)]'></div>
          
          <p className='text-blue-50/70 text-2xl font-light leading-relaxed mb-12'>
            A evolução da gestão jurídica. Dados precisos, volumetria em tempo real e segurança absoluta para a sua operação.
          </p>

          <div className='flex gap-12 pt-10 border-t border-white/10'>
            <div>
              <p className='text-3xl font-black text-white'>100%</p>
              <p className='text-xs uppercase font-bold text-blue-400 tracking-widest'>Digital Case Management</p>
            </div>
            <div className='w-px h-12 bg-white/10'></div>
            <div>
              <p className='text-3xl font-black text-white'>Secured</p>
              <p className='text-xs uppercase font-bold text-blue-400 tracking-widest'>Enterprise Encryption</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
