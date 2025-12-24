import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import {
  Plus,
  Search,
  Users,
  Phone,
  Mail,
  User,
  Edit2,
  Trash2,
  X,
  Building2,
  FileText,
  Hash,
} from 'lucide-react'

const Clientes = () => {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')

  // Controle do Modal
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  // Formulário
  const [formData, setFormData] = useState({
    razao_social: '',
    cnpj: '',
    nome_contato: '',
    email: '',
    telefone: '',
    observacoes: '',
  })

  useEffect(() => {
    fetchClientes()
  }, [])

  const fetchClientes = async () => {
    try {
      setLoading(true)
      // Busca clientes, conta contratos e TRAZ OS NÚMEROS HON
      const { data, error } = await supabase
        .from('clientes')
        .select(
          `
          *,
          contratos (count),
          lista_contratos: contratos ( numero_hon )
        `
        )
        .order('razao_social', { ascending: true })

      if (error) throw error
      setClientes(data || [])
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNew = () => {
    setEditingId(null)
    setFormData({
      razao_social: '',
      cnpj: '',
      nome_contato: '',
      email: '',
      telefone: '',
      observacoes: '',
    })
    setShowModal(true)
  }

  const handleEdit = (cliente) => {
    setEditingId(cliente.id)
    setFormData({
      razao_social: cliente.razao_social || '',
      cnpj: cliente.cnpj || '',
      nome_contato: cliente.nome_contato || '',
      email: cliente.email || '',
      telefone: cliente.telefone || '',
      observacoes: cliente.observacoes || '',
    })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (editingId) {
        const { error } = await supabase
          .from('clientes')
          .update(formData)
          .eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('clientes').insert([formData])
        if (error) throw error
      }
      setShowModal(false)
      fetchClientes()
    } catch (error) {
      alert('Erro ao salvar: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja excluir ${nome}?`)) return
    try {
      const { error } = await supabase.from('clientes').delete().eq('id', id)
      if (error) throw error
      fetchClientes()
    } catch (error) {
      alert('Erro ao excluir: ' + error.message)
    }
  }

  const formatPhone = (v) =>
    v
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/g, '($1) $2')
      .replace(/(\d)(\d{4})$/, '$1-$2')

  const clientesFiltrados = clientes.filter(
    (c) =>
      c.razao_social?.toLowerCase().includes(busca.toLowerCase()) ||
      c.cnpj?.includes(busca) ||
      c.nome_contato?.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className='w-full space-y-6 relative'>
      {/* Header */}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-[#0F2C4C]'>
            Carteira de Clientes
          </h1>
          <p className='text-gray-500'>
            Gerencie os dados cadastrais e contatos.
          </p>
        </div>

        <button
          onClick={handleNew}
          className='flex items-center gap-2 bg-[#0F2C4C] text-white px-5 py-2.5 rounded-lg hover:bg-blue-900 transition-colors shadow-lg'
        >
          <Plus size={20} /> <span>Novo Cliente</span>
        </button>
      </div>

      {/* Busca */}
      <div className='bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-3 text-gray-400' size={20} />
          <input
            type='text'
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder='Buscar por nome, CNPJ ou contato...'
            className='w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className='p-10 text-center text-gray-500'>
          Carregando carteira...
        </div>
      ) : clientesFiltrados.length === 0 ? (
        <div className='p-16 flex flex-col items-center justify-center text-gray-400 bg-white rounded-xl border border-gray-100'>
          <Users size={48} className='mb-4 opacity-20' />
          <p className='text-lg'>Nenhum cliente encontrado.</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {clientesFiltrados.map((cliente) => {
            // Extrai os números HON válidos
            const hons =
              cliente.lista_contratos
                ?.map((c) => c.numero_hon)
                .filter((h) => h && h.trim() !== '') || []

            return (
              <div
                key={cliente.id}
                className='bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative flex flex-col'
              >
                <div className='absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                  <button
                    onClick={() => handleEdit(cliente)}
                    className='p-2 bg-gray-100 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-lg'
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() =>
                      handleDelete(cliente.id, cliente.razao_social)
                    }
                    className='p-2 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-lg'
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className='flex items-start gap-4 mb-4'>
                  <div className='w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-bold text-lg shrink-0'>
                    {cliente.razao_social?.charAt(0).toUpperCase()}
                  </div>
                  <div className='overflow-hidden'>
                    <h3
                      className='font-bold text-gray-800 truncate'
                      title={cliente.razao_social}
                    >
                      {cliente.razao_social}
                    </h3>
                    <p className='text-xs text-gray-400 flex items-center gap-1 mt-1'>
                      <Building2 size={12} /> {cliente.cnpj || 'CNPJ não inf.'}
                    </p>
                  </div>
                </div>

                <div className='space-y-3 text-sm text-gray-600 border-t border-gray-50 pt-4 flex-1'>
                  <div className='flex items-center gap-2'>
                    <User size={16} className='text-gray-400 shrink-0' />
                    <span className='truncate'>
                      {cliente.nome_contato || '-'}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Mail size={16} className='text-gray-400 shrink-0' />
                    <span className='truncate'>{cliente.email || '-'}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Phone size={16} className='text-gray-400 shrink-0' />
                    <span>{cliente.telefone || '-'}</span>
                  </div>
                </div>

                {/* Exibição dos Números HON */}
                {hons.length > 0 && (
                  <div className='mt-4 bg-blue-50/50 p-2 rounded-lg border border-blue-100'>
                    <p className='text-xs font-bold text-blue-800 mb-1 flex items-center gap-1'>
                      <Hash size={10} /> HONs (LegalOne)
                    </p>
                    <div className='flex flex-wrap gap-1'>
                      {hons.slice(0, 3).map((num, i) => (
                        <span
                          key={i}
                          className='bg-white px-2 py-0.5 rounded border border-blue-100 text-xs text-blue-600 font-mono'
                        >
                          {num}
                        </span>
                      ))}
                      {hons.length > 3 && (
                        <span className='text-xs text-blue-400 self-center'>
                          +{hons.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className='mt-4 pt-3 border-t border-gray-100 flex justify-between items-center'>
                  <div className='flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded'>
                    <FileText size={14} /> {cliente.contratos?.[0]?.count || 0}{' '}
                    processos ativos
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm'>
          <div className='bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200'>
            <div className='bg-[#0F2C4C] p-4 flex justify-between items-center text-white'>
              <h3 className='font-bold text-lg'>
                {editingId ? 'Editar Cliente' : 'Novo Cliente'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className='hover:bg-white/20 p-1 rounded transition-colors'
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className='p-6 space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Razão Social / Nome
                </label>
                <input
                  required
                  type='text'
                  value={formData.razao_social}
                  onChange={(e) =>
                    setFormData({ ...formData, razao_social: e.target.value })
                  }
                  className='w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
                />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    CNPJ / CPF
                  </label>
                  <input
                    type='text'
                    value={formData.cnpj}
                    onChange={(e) =>
                      setFormData({ ...formData, cnpj: e.target.value })
                    }
                    className='w-full p-2.5 border border-gray-300 rounded-lg outline-none'
                    placeholder='00.000.000/0000-00'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Pessoa de Contato
                  </label>
                  <input
                    type='text'
                    value={formData.nome_contato}
                    onChange={(e) =>
                      setFormData({ ...formData, nome_contato: e.target.value })
                    }
                    className='w-full p-2.5 border border-gray-300 rounded-lg outline-none'
                    placeholder='Gerente...'
                  />
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Email
                  </label>
                  <input
                    type='email'
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className='w-full p-2.5 border border-gray-300 rounded-lg outline-none'
                    placeholder='contato@empresa.com'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Telefone
                  </label>
                  <input
                    type='text'
                    value={formData.telefone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        telefone: formatPhone(e.target.value),
                      })
                    }
                    className='w-full p-2.5 border border-gray-300 rounded-lg outline-none'
                    placeholder='(00) 00000-0000'
                  />
                </div>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Observações
                </label>
                <textarea
                  rows='3'
                  value={formData.observacoes}
                  onChange={(e) =>
                    setFormData({ ...formData, observacoes: e.target.value })
                  }
                  className='w-full p-2.5 border border-gray-300 rounded-lg outline-none'
                  placeholder='Detalhes importantes...'
                ></textarea>
              </div>
              <div className='flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2'>
                <button
                  type='button'
                  onClick={() => setShowModal(false)}
                  className='px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg'
                >
                  Cancelar
                </button>
                <button
                  type='submit'
                  disabled={saving}
                  className='px-6 py-2 bg-[#0F2C4C] text-white rounded-lg hover:bg-blue-900 transition-colors shadow disabled:opacity-50'
                >
                  {saving ? 'Salvando...' : 'Salvar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Clientes
