import React, { useState, useEffect } from 'react'
import {
  Save,
  Settings,
  Code,
  History,
  Monitor,
  Lock,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

const Configuracoes = () => {
  const [logoInternoNome, setLogoInternoNome] = useState('')
  const [logoLoginNome, setLogoLoginNome] = useState('')
  const [showAllVersions, setShowAllVersions] = useState(false)

  useEffect(() => {
    const savedInterno = localStorage.getItem('app_logo_path')
    const savedLogin = localStorage.getItem('app_login_logo_path')
    if (savedInterno) setLogoInternoNome(savedInterno.replace('/', ''))
    if (savedLogin) setLogoLoginNome(savedLogin.replace('/', ''))
  }, [])

  const salvarLogoInterna = () => {
    if (!logoInternoNome) return alert('Digite o nome do arquivo!')
    const path = `/${logoInternoNome.trim()}`
    localStorage.setItem('app_logo_path', path)
    alert('Caminho da Logo Interna atualizado para: ' + path)
  }

  const salvarLogoLogin = () => {
    if (!logoLoginNome) return alert('Digite o nome do arquivo!')
    const path = `/${logoLoginNome.trim()}`
    localStorage.setItem('app_login_logo_path', path)
    alert('Caminho da Logo de Login atualizado para: ' + path)
  }

  const versionsData = [
    {
      version: 'v1.2.0',
      date: 'Dez 2025 (Atual)',
      current: true,
      changes: [
        "Rebranding: Sistema oficial 'Controladoria Jurídica'.",
        'Configurações de Logos independentes via nome de arquivo.',
        'Correção de bugs no Kanban e Histórico.',
      ],
    },
    {
      version: 'v1.1.0',
      date: 'Nov 2025',
      changes: ['Lançamento do Dashboard Financeiro.', 'Sistema de Logs.'],
    }
  ]

  return (
    <div className='w-full max-w-6xl mx-auto space-y-8 pb-20'>
      <div className='flex items-center gap-3'>
        <Settings className='text-[#0F2C4C]' size={32} />
        <h1 className='text-3xl font-bold text-[#0F2C4C]'>Configurações</h1>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* LOGO SIDEBAR */}
        <div className='bg-white p-6 rounded-2xl border shadow-sm space-y-4'>
          <div className='flex items-center gap-2 font-bold text-gray-700 border-b pb-2'><Monitor size={20} /> Logo Interna (Sidebar)</div>
          <p className='text-[10px] text-gray-400 uppercase font-bold'>Nome do arquivo em /public</p>
          <div className='flex gap-2'>
            <input type="text" value={logoInternoNome} onChange={(e)=>setLogoInternoNome(e.target.value)} placeholder="ex: logo.png" className='flex-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500' />
            <button onClick={salvarLogoInterna} className='bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2'><Save size={18} /> Salvar</button>
          </div>
        </div>

        {/* LOGO LOGIN */}
        <div className='bg-white p-6 rounded-2xl border shadow-sm space-y-4'>
          <div className='flex items-center gap-2 font-bold text-gray-700 border-b pb-2'><Lock size={20} /> Logo do Login</div>
          <p className='text-[10px] text-gray-400 uppercase font-bold'>Nome do arquivo em /public</p>
          <div className='flex gap-2'>
            <input type="text" value={logoLoginNome} onChange={(e)=>setLogoLoginNome(e.target.value)} placeholder="ex: login-logo.png" className='flex-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#0F2C4C]' />
            <button onClick={salvarLogoLogin} className='bg-[#0F2C4C] text-white px-4 py-2 rounded-lg flex items-center gap-2'><Save size={18} /> Salvar</button>
          </div>
        </div>
      </div>

      <div className='flex justify-center'>
        <button onClick={() => window.location.reload()} className='flex items-center gap-2 bg-gray-100 p-3 rounded-lg font-bold hover:bg-gray-200 transition-all'><RefreshCw size={20} /> Atualizar Sistema para aplicar mudanças</button>
      </div>

      {/* CHANGELOG */}
      <div className='bg-white rounded-2xl border shadow-sm overflow-hidden'>
        <div className='p-6 border-b bg-gray-50 flex justify-between items-center'>
          <div className='flex items-center gap-2 font-bold text-gray-700'><History size={20} /> Histórico de Versões</div>
          <button onClick={() => setShowAllVersions(!showAllVersions)} className='text-blue-600 text-sm font-bold flex items-center gap-1'>
            {showAllVersions ? 'Ver menos' : 'Ver todas'}
          </button>
        </div>
        <div className='p-8 space-y-6'>
            {versionsData.filter((v, i) => showAllVersions || i === 0).map((v, i) => (
              <div key={i} className='border-l-2 border-gray-100 pl-6 relative'>
                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full ${v.current ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                <h3 className='font-bold'>{v.version} - {v.date}</h3>
                <ul className='text-sm text-gray-600 mt-2'>{v.changes.map((c, j) => <li key={j}>• {c}</li>)}</ul>
              </div>
            ))}
        </div>
      </div>

      {/* CREDITOS */}
      <div className='bg-[#0F2C4C] rounded-2xl p-8 text-white flex justify-between items-center'>
        <div>
          <div className='flex items-center gap-2 opacity-80'><Code size={18} /> STACK TECNOLÓGICA</div>
          <h2 className='text-xl font-bold'>Desenvolvido por Flow Metrics</h2>
        </div>
        <div className='flex gap-2'>{['React', 'Tailwind', 'Supabase'].map(t => <span key={t} className='px-3 py-1 bg-white/10 rounded-full text-xs'>{t}</span>)}</div>
      </div>
    </div>
  )
}

export default Configuracoes
