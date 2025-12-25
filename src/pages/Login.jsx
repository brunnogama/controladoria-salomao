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
    // Busca a logo configurada especificamente para o LOGIN
    const savedLoginLogo = localStorage.getItem('app_login_logo_path')
    if (savedLoginLogo) setCustomLogo(savedLoginLogo)
  }, [])

  const formatUserName = (login) => {
    if (!login) return 'Usuário'
    return login
      .split('.')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const emailCompleto = `${userPrefix}@salomaoadv.com.br`
    const nomeFormatado = formatUserName(userPrefix)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailCompleto,
        password: password,
      })

      if (error) throw error

      await supabase.from('logs_sistema').insert([
        {
          categoria: 'Acesso',
          acao: 'Login',
          detalhes: `Usuário ${nomeFormatado} acessou o sistema.`,
          referencia_id: data.user.id,
        },
      ])

      localStorage.setItem('user_name', nomeFormatado)
      navigate('/')
    } catch (err) {
      console.error('Erro de login:', err.message)
      setError('Credenciais inválidas. Verifique usuário e senha.')
      setShake(true)
      setTimeout(() => setShake(false), 500)
    } finally {
      setLoading(false)
    }
  }

  const inputContainerClass = error
    ? 'flex rounded-lg shadow-sm border border-red-300 bg-red-50 focus-within:ring-2 focus-within:ring-red-500 transition-all'
    : 'flex rounded-lg shadow-sm border border-gray-300 focus-within:ring-2 focus-within:ring-[#0F2C4C] focus-within:border-transparent transition-all'

  const passwordContainerClass = error
    ? 'relative rounded-lg shadow-sm border border-red-300 bg-red-50 focus-within:ring-2 focus-within:ring-red-500 transition-all'
    : 'relative rounded-lg shadow-sm border border-gray-300 focus-within:ring-2 focus-within:ring-[#0F2C4C] focus-within:border-transparent transition-all'

  return (
    <div className='min-h-screen flex w-full bg-white'>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
      `}</style>

      {/* LADO ESQUERDO */}
      <div className='w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 relative bg-white z-10'>
        <div className='w-full max-w-sm space-y-8'>
          <div className='flex justify-center mb-6'>
            {customLogo ? (
              <img
                src={customLogo}
                alt='Logo'
                className='h-20 object-contain'
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

          <div className='text-center'>
            <h2 className='text-2xl font-bold text-gray-800'>Acesso Restrito</h2>
            <p className='mt-2 text-sm text-gray-500'>Identifique-se para acessar o painel.</p>
          </div>

          <form className='mt-8 space-y-5' onSubmit={handleLogin}>
            <div>
              <label className={`block text-sm font-medium mb-1 ${error ? 'text-red-600' : 'text-gray-700'}`}>Usuário Corporativo</label>
              <div className={inputContainerClass}>
                <div className='relative flex-grow'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <User className={error ? 'text-red-400' : 'text-gray-400'} size={18} />
                  </div>
                  <input
                    type='text'
                    required
                    className='block w-full pl-10 py-3 sm:text-sm border-0 bg-transparent text-gray-900'
                    placeholder='nome.sobrenome'
                    value={userPrefix}
                    onChange={(e) => { setUserPrefix(e.target.value); if (error) setError(null); }}
                  />
                </div>
                <div className='flex items-center px-4 border-l bg-gray-50 text-gray-500 sm:text-sm font-medium'>@salomaoadv.com.br</div>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${error ? 'text-red-600' : 'text-gray-700'}`}>Senha</label>
              <div className={passwordContainerClass}>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Lock className={error ? 'text-red-400' : 'text-gray-400'} size={18} />
                </div>
                <input
                  type='password'
                  required
                  className='block w-full pl-10 pr-3 py-3 sm:text-sm border-0 bg-transparent text-gray-900'
                  placeholder='••••••••'
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (error) setError(null); }}
                />
              </div>
            </div>

            <button
              type='submit'
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white transition-all shadow-lg ${shake ? 'animate-shake bg-red-600' : 'bg-[#0F2C4C] hover:bg-blue-900'}`}
            >
              {loading ? <Loader2 className='animate-spin h-5 w-5' /> : 'Acessar Sistema'}
            </button>
          </form>
        </div>
      </div>

      {/* LADO DIREITO */}
      <div className='hidden lg:flex w-1/2 bg-[#0F2C4C] relative overflow-hidden items-center justify-center'>
        <div className='absolute inset-0 bg-[#0F2C4C]'>
          <img src='https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=2070&auto=format&fit=crop' className='w-full h-full object-cover opacity-20 mix-blend-luminosity' alt='Jurídico' />
          <div className='absolute inset-0 bg-gradient-to-tr from-[#0F2C4C] via-[#0F2C4C]/90 to-blue-900/40'></div>
        </div>
        <div className='relative z-10 p-16 max-w-xl text-white'>
          <h2 className='text-4xl font-bold mb-6 leading-tight'>Controladoria Jurídica <br /><span className='text-blue-200'>Estratégica</span></h2>
          <div className='h-1 w-24 bg-yellow-500 mb-8'></div>
          <p className='text-gray-300 text-lg leading-relaxed font-light'>Gestão inteligente de processos e contratos. A tecnologia garantindo a segurança e eficiência do <strong>Salomão Advogados</strong>.</p>
        </div>
      </div>
    </div>
  )
}

export default Login
