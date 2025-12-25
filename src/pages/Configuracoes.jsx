import React, { useState, useEffect } from 'react'
import {
  Save,
  Settings,
  Code,
  Terminal,
  History,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Monitor,
  Lock,
  CheckCircle
} from 'lucide-react'

const Configuracoes = () => {
  const [logoInterno, setLogoInterno] = useState('')
  const [logoLogin, setLogoLogin] = useState('')
  const [showAllVersions, setShowAllVersions] = useState(false)

  // Lista de arquivos na sua pasta /public
  const opcoesLogos = [
    { id: 1, nome: 'Logo Cor', path: '/logo-color.png' },
    { id: 2, nome: 'Logo Branco', path: '/logo-white.png' },
    { id: 3, nome: 'Logo Horizontal', path: '/logo-horizontal.png' },
    { id: 4, nome: 'Ícone Sistema', path: '/favicon.png' },
  ]

  useEffect(() => {
    const savedInterno = localStorage.getItem('app_logo_path')
    const savedLogin = localStorage.getItem('app_login_logo_path')
    if (savedInterno) setLogoInterno(savedInterno)
    if (savedLogin) setLogoLogin(savedLogin)
  }, [])

  const selecionarLogo = (tipo, path) => {
    if (tipo === 'interno') {
      localStorage.setItem('app_logo_path', path)
      setLogoInterno(path)
    } else {
      localStorage.setItem('app_login_logo_path', path)
      setLogoLogin(path)
    }
  }

  const versionsData = [
    {
      version: 'v1.2.0',
      date: 'Dez 2025 (Atual)',
      current: true,
      changes: [
        "Rebranding: Sistema oficial 'Controladoria Jurídica do Salomão Advogados'.",
        'Integração completa com Banco de Dados (Supabase).',
        'Módulo de Configurações com personalização de Logos independentes.',
        'Correção de bugs no Kanban e Histórico.',
      ],
    },
    {
      version: 'v1.1.0',
      date: 'Nov 2025',
      changes: ['Lançamento do Dashboard Financeiro.', 'Sistema de Logs de Atividade.'],
    }
  ]

  return (
    <div className='w-full max-w-6xl mx-auto space-y-8 pb-20'>
      <div className='flex items-center gap-3'>
        <Settings className='text-[#0F2C4C]' size={32} />
        <h1 className='text-3xl font-bold text-[#0F2C4C]'>Configurações</h1>
      </div>

      {/* SEÇÃO DE LOGOTIPOS */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* LOGO INTERNO */}
        <div className='bg-white p-6 rounded-2xl border shadow-sm space-y-4'>
          <div className='flex items-center gap-2 font-bold text-gray-700 border-b pb-2'>
            <Monitor size={20} /> Logo Interna (Sidebar)
          </div>
          <div className='grid grid-cols-2 gap-3'>
            {opcoesLogos.map((logo) => (
              <button
                key={`int-${logo.id}`}
                onClick={() => selecionarLogo('interno', logo.path)}
                className={`p-3 border-2 rounded-xl transition-all flex flex-col items-center gap-2 ${
                  logoInterno === logo.path ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:bg-gray-50'
                }`}
              >
                <img src={logo.path} className='h-8 object-contain' alt={logo.nome} />
                <span className='text-[10px] font-bold uppercase'>{logo.nome}</span>
                {logoInterno === logo.path && <CheckCircle size={14} className='text-blue-500' />}
              </button>
            ))}
          </div>
        </div>

        {/* LOGO LOGIN */}
        <div className='bg-white p-6 rounded-2xl border shadow-sm space-y-4'>
          <div className='flex items-center gap-2 font-bold text-gray-700 border-b pb-2'>
            <Lock size={20} /> Logo do Login
          </div>
          <div className='grid grid-cols-2 gap-3'>
            {opcoesLogos.map((logo) => (
              <button
                key={`log-${logo.id}`}
                onClick={() => selecionarLogo('login', logo.path)}
                className={`p-3 border-2 rounded-xl transition-all flex flex-col items-center gap-2 ${
                  logoLogin === logo.path ? 'border-[#0F2C4C] bg-gray-50' : 'border-gray-100 hover:bg-gray-50'
                }`}
              >
                <img src={logo.path} className='h-8 object-contain' alt={logo.nome} />
                <span className='text-[10px] font-bold uppercase'>{logo.nome}</span>
                {logoLogin === logo.path && <CheckCircle size={14} className='text-[#0F2C4C]' />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className='flex justify-end'>
        <button onClick={() => window.location.reload()} className='flex items-center gap-2 bg-[#0F2C4C] text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-900'>
          <Save size={20} /> Aplicar Alterações
        </button>
      </div>

      {/* CHANGELOG (RESTAURADO) */}
      <div className='bg-white rounded-2xl border shadow-sm overflow-hidden'>
        <div className='p-6 border-b bg-gray-50 flex justify-between items-center'>
          <div className='flex items-center gap-2 font-bold text-gray-700'>
            <History size={20} /> Histórico de Versões
          </div>
          <button onClick={() => setShowAllVersions(!showAllVersions)} className='text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline'>
            {showAllVersions ? <><ChevronUp size={16} /> Ver menos</> : <><ChevronDown size={16} /> Ver todas</>}
          </button>
        </div>
        <div className='p-8'>
          <div className='relative border-l-2 border-gray-100 ml-4 space-y-8'>
            {versionsData.filter((v, i) => showAllVersions || i === 0).map((v, i) => (
              <div key={i} className='relative pl-8'>
                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${v.current ? 'bg-green-500 border-green-100' : 'bg-gray-200 border-white'}`}></div>
                <h3 className='font-bold text-gray-800'>{v.version} <span className='text-xs text-gray-400 font-normal ml-2'>{v.date}</span></h3>
                <ul className='mt-2 space-y-1'>
                  {v.changes.map((change, j) => (
                    <li key={j} className='text-sm text-gray-600 flex items-start gap-2'>
                      <span className='text-blue-500 mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0'></span>
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CRÉDITOS (RESTAURADO) */}
      <div className='bg-[#0F2C4C] rounded-2xl p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6'>
        <div className='space-y-2 text-center md:text-left'>
          <div className='flex items-center justify-center md:justify-start gap-2 opacity-80'>
            <Code size={18} /> <span className='text-xs uppercase font-black tracking-widest'>Stack Tecnológica</span>
          </div>
          <h2 className='text-xl font-bold'>Desenvolvido por Flow Metrics</h2>
          <p className='text-blue-200 text-sm max-w-md'>Sistema de alta performance construído com tecnologias modernas para garantir segurança e escalabilidade.</p>
        </div>
        <div className='flex flex-wrap justify-center gap-2'>
          {['React.js', 'Vite', 'Tailwind CSS', 'Supabase', 'PostgreSQL'].map(t => (
            <span key={t} className='px-3 py-1 bg-white/10 text-white text-xs font-medium rounded-full border border-white/10'>{t}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Configuracoes
