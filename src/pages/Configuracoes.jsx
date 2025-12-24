import React, { useState, useEffect } from 'react'
import {
  Save,
  Settings,
  Code,
  Terminal,
  User,
  Building2,
  History,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Monitor,
} from 'lucide-react'

const Configuracoes = () => {
  const [logoPath, setLogoPath] = useState('')
  const [showAllVersions, setShowAllVersions] = useState(false)

  useEffect(() => {
    const savedLogo = localStorage.getItem('app_logo_path')
    if (savedLogo) setLogoPath(savedLogo)
  }, [])

  const handleSaveLogo = () => {
    localStorage.setItem('app_logo_path', logoPath)
    window.location.reload()
  }

  const handleResetLogo = () => {
    localStorage.removeItem('app_logo_path')
    window.location.reload()
  }

  // --- DATAS ATUALIZADAS PARA O CENÁRIO DE 2025 ---
  const versionsData = [
    {
      version: 'v1.2.0',
      date: 'Dez 2025 (Atual)',
      current: true,
      changes: [
        "Rebranding: Sistema oficial 'Controladoria Jurídica do Salomão Advogados'.",
        'Integração completa com Banco de Dados (Supabase).',
        'Módulo de Configurações com personalização de Logo.',
        'Correção de bugs no Kanban e Histórico.',
      ],
    },
    {
      version: 'v1.1.0',
      date: 'Nov 2025',
      current: false,
      changes: [
        'Implementação do Kanban com Drag & Drop.',
        'Visualização de cards coloridos por status.',
        'Cadastro de Clientes com busca automática de CNPJ.',
        'Dashboard com indicadores financeiros.',
      ],
    },
    {
      version: 'v1.0.0',
      date: 'Out 2025',
      current: false,
      changes: [
        'Lançamento inicial do Sistema.',
        'Estrutura base de navegação.',
        'Formulário de Novo Contrato.',
        'Listagem simples de contratos.',
      ],
    },
    {
      version: 'Beta v0.9',
      date: 'Set 2025',
      current: false,
      changes: [
        'Definição de arquitetura e prototipagem.',
        'Testes iniciais de interface.',
      ],
    },
  ]

  const visibleVersions = showAllVersions
    ? versionsData
    : versionsData.slice(0, 2)

  return (
    <div className='w-full max-w-4xl mx-auto space-y-8 pb-10'>
      <div className='flex items-center gap-3'>
        <div className='bg-[#0F2C4C] p-2 rounded-lg text-white'>
          <Settings size={24} />
        </div>
        <div>
          <h1 className='text-3xl font-bold text-[#0F2C4C]'>Configurações</h1>
          <p className='text-gray-500'>Gestão do sistema Salomão Advogados.</p>
        </div>
      </div>

      {/* 1. PERSONALIZAÇÃO VISUAL */}
      <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100'>
        <h2 className='text-xl font-bold text-gray-800 mb-4 flex items-center gap-2'>
          <ImageIcon size={20} className='text-blue-600' /> Identidade Visual
        </h2>

        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Caminho do Logo (Pasta Public)
            </label>
            <p className='text-xs text-gray-500 mb-2'>
              Caso queira alterar o logo padrão do escritório, coloque a imagem
              na pasta <code>public</code> e digite o nome aqui.
            </p>
            <div className='flex gap-2'>
              <input
                type='text'
                value={logoPath}
                onChange={(e) => setLogoPath(e.target.value)}
                placeholder='/logo_salomao.png'
                className='flex-1 p-2 border border-gray-300 rounded-lg'
              />
              <button
                onClick={handleSaveLogo}
                className='bg-[#0F2C4C] text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors flex items-center gap-2'
              >
                <Save size={18} /> Salvar
              </button>
            </div>
          </div>

          {logoPath && (
            <div className='mt-4 p-4 bg-gray-50 rounded border border-gray-200'>
              <p className='text-xs font-bold text-gray-500 mb-2'>
                Pré-visualização:
              </p>
              <img
                src={logoPath}
                alt='Logo Preview'
                className='h-12 object-contain'
                onError={(e) => (e.target.style.display = 'none')}
              />
              <button
                onClick={handleResetLogo}
                className='text-xs text-red-500 hover:underline mt-2'
              >
                Restaurar Padrão (Texto Salomão Advogados)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. CHANGELOG */}
      <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100'>
        <h2 className='text-xl font-bold text-gray-800 mb-6 flex items-center gap-2'>
          <History size={20} className='text-green-600' /> Changelog (Versões)
        </h2>

        <div className='space-y-6 border-l-2 border-gray-100 ml-2 pl-6 relative'>
          {visibleVersions.map((v, index) => (
            <VersionItem
              key={index}
              version={v.version}
              date={v.date}
              current={v.current}
            >
              {v.changes.map((change, idx) => (
                <li key={idx}>{change}</li>
              ))}
            </VersionItem>
          ))}
        </div>

        {versionsData.length > 2 && (
          <div className='mt-6 pl-8'>
            <button
              onClick={() => setShowAllVersions(!showAllVersions)}
              className='text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors'
            >
              {showAllVersions ? (
                <>
                  Mostrar menos <ChevronUp size={16} />
                </>
              ) : (
                <>
                  Mostrar histórico completo <ChevronDown size={16} />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* 3. SOBRE O SISTEMA */}
      <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100'>
        <h2 className='text-xl font-bold text-gray-800 mb-6 flex items-center gap-2'>
          <Code size={20} className='text-purple-600' /> Sobre o Sistema
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          {/* Informações do Produto */}
          <div className='space-y-4'>
            <div className='flex items-center gap-3'>
              <div className='bg-blue-50 p-2 rounded-full text-blue-700'>
                <Monitor size={20} />
              </div>
              <div>
                <p className='text-xs text-gray-500 uppercase font-bold'>
                  Produto
                </p>
                <p className='font-bold text-gray-800'>
                  Controladoria Jurídica do Salomão Advogados
                </p>
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <div className='bg-blue-50 p-2 rounded-full text-blue-700'>
                <User size={20} />
              </div>
              <div>
                <p className='text-xs text-gray-500 uppercase font-bold'>
                  Criado por
                </p>
                <p className='font-bold text-gray-800'>Marcio Gama</p>
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <div className='bg-blue-50 p-2 rounded-full text-blue-700'>
                <Building2 size={20} />
              </div>
              <div>
                <p className='text-xs text-gray-500 uppercase font-bold'>
                  Empresa Desenvolvedora
                </p>
                <p className='font-bold text-gray-800'>Flow Metrics</p>
              </div>
            </div>
          </div>

          {/* Tecnologias */}
          <div>
            <p className='text-xs text-gray-500 uppercase font-bold mb-3 flex items-center gap-2'>
              <Terminal size={14} /> Tecnologias Utilizadas
            </p>
            <div className='flex flex-wrap gap-2'>
              <TechBadge name='React.js' />
              <TechBadge name='Vite' />
              <TechBadge name='Tailwind CSS' />
              <TechBadge name='Supabase' />
              <TechBadge name='PostgreSQL' />
              <TechBadge name='Lucide Icons' />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componentes Auxiliares
const TechBadge = ({ name }) => (
  <span className='px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full border border-gray-200'>
    {name}
  </span>
)

const VersionItem = ({ version, date, children, current }) => (
  <div className='relative animate-in fade-in slide-in-from-top-2 duration-300'>
    <div
      className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 ${
        current ? 'bg-green-500 border-green-100' : 'bg-gray-200 border-white'
      }`}
    ></div>
    <div className='mb-1 flex items-baseline gap-2'>
      <h3
        className={`font-bold ${current ? 'text-green-700' : 'text-gray-800'}`}
      >
        {version}
      </h3>
      <span className='text-xs text-gray-400'>{date}</span>
      {current && (
        <span className='text-[10px] bg-green-100 text-green-700 px-1.5 rounded font-bold'>
          LATEST
        </span>
      )}
    </div>
    <ul className='list-disc list-inside text-sm text-gray-600 space-y-1'>
      {children}
    </ul>
  </div>
)

export default Configuracoes
