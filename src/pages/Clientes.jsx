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
  Unlink,
} from 'lucide-react'

const Clientes = () => {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')

  // Controle do Modal de Edição
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  // Controle do Modal de Visualização
  const [showViewModal, setShowViewModal] = useState(false)
  const [clienteSelecionado, setClienteSelecionado] = useState(null)
  const [contratosVinculados, setContratosVinculados] = useState([])
  const [loadingContratos, setLoadingContratos] = useState(false)

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
      const { data, error } = await supabase
        .from('clientes')
        .select(`
          *,
          lista_contratos:contratos(numero_hon, status)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setClientes(data || [])
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
      alert('Erro ao carregar clientes!')
    } finally {
      setLoading(false)
    }
  }

  const fetchContratosVinculados = async (clienteId) => {
    setLoadingContratos(true)
    try {
      const { data, error } = await supabase
        .from('contratos')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setContratosVinculados(data || [])
    } catch (error) {
      console.error('Erro ao buscar contratos:', error)
      alert('Erro ao carregar contratos vinculados!')
    } finally {
      setLoadingContratos(false)
    }
  }

  const handleViewCliente = async (cliente) => {
    setClienteSelecionado(cliente)
    setShowViewModal(true)
    await fetchContratosVinculados(cliente.id)
  }

  const handleDesvincularContrato = async (contratoId, numeroHon) => {
    if (!confirm(`Tem certeza que deseja desvincular o contrato ${numeroHon || contratoId}?`)) {
      return
    }

    try {
      // Buscar ou criar cliente "Sem Cliente"
      const { data: clienteExistente } = await supabase
        .from('clientes')
        .select('id')
        .eq('cnpj', '00000000000000')
        .maybeSingle()

      let clienteSemClienteId

      if (clienteExistente) {
        clienteSemClienteId = clienteExistente.id
      } else {
        // Criar cliente "Sem Cliente" se não existir
        const { data: novoCliente, error: erroCriacao } = await supabase
          .from('clientes')
          .insert([{
            razao_social: 'Sem Cliente',
            cnpj: '00000000000000',
            nome_contato: 'Sistema',
            observacoes: 'Cliente genérico para contratos desvinculados'
          }])
          .select()
          .single()

        if (erroCriacao) {
          // Se der erro de duplicate key, buscar novamente (race condition)
          const { data: clienteRace } = await supabase
            .from('clientes')
            .select('id')
            .eq('cnpj', '00000000000000')
            .single()
          
          if (clienteRace) {
            clienteSemClienteId = clienteRace.id
          } else {
            throw erroCriacao
          }
        } else {
          clienteSemClienteId = novoCliente.id
        }
      }

      // Atualizar contrato para o cliente "Sem Cliente"
      const { error } = await supabase
        .from('contratos')
        .update({ cliente_id: clienteSemClienteId })
        .eq('id', contratoId)

      if (error) throw error

      alert('✅ Contrato desvinculado com sucesso!')
      await fetchContratosVinculados(clienteSelecionado.id)
      await fetchClientes()
    } catch (error) {
      console.error('Erro ao desvincular contrato:', error)
      alert('❌ Erro ao desvincular contrato: ' + error.message)
    }
  }

  const handleEdit = (cliente) => {
    setEditingId(cliente.id)
    setFormData({
      razao_social: cliente.razao_social,
      cnpj: cliente.cnpj,
      nome_contato: cliente.nome_contato || '',
      email: cliente.email || '',
      telefone: cliente.telefone || '',
      observacoes: cliente.observacoes || '',
    })
    setShowModal(true)
    setShowViewModal(false)
  }

  const handleDelete = async (id, nome) => {
    const cliente = clientes.find(c => c.id === id)
    const temContratos = cliente?.lista_contratos && cliente.lista_contratos.length > 0

    if (temContratos) {
      alert(`❌ Não é possível excluir o cliente "${nome}" pois existem ${cliente.lista_contratos.length} contrato(s) vinculado(s). Desvincule os contratos antes de excluir.`)
      return
    }

    if (!confirm(`Tem certeza que deseja excluir o cliente "${nome}"?`)) {
      return
    }

    try {
      const { error } = await supabase.from('clientes').delete().eq('id', id)
      if (error) throw error

      alert('Cliente excluído com sucesso!')
      setShowViewModal(false)
      fetchClientes()
    } catch (error) {
      console.error('Erro ao excluir cliente:', error)
      alert('Erro ao excluir cliente: ' + error.message)
    }
  }

  const handleSubmit = async (e) => {
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

      closeModal()
      fetchClientes()
      alert('Cliente salvo com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar cliente:', error)
      alert('Erro ao salvar: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setFormData({
      razao_social: '',
      cnpj: '',
      nome_contato: '',
      email: '',
      telefone: '',
      observacoes: '',
    })
  }

  const clientesFiltrados = clientes.filter((c) =>
    c.razao_social?.toLowerCase().includes(busca.toLowerCase()) ||
    c.cnpj?.includes(busca) ||
    c.email?.toLowerCase().includes(busca.toLowerCase())
  )

  const getStatusColor = (status) => {
    const cores = {
      'Sob Análise': 'bg-orange-100 text-orange-700',
      'Proposta Enviada': 'bg-yellow-100 text-yellow-700',
      'Contrato Fechado': 'bg-green-100 text-green-700',
      'Rejeitada': 'bg-red-100 text-red-700',
      'Probono': 'bg-blue-100 text-blue-700',
    }
    return cores[status] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className='w-full space-y-6'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-[#0F2C4C]'>Gestão de Clientes</h1>
          <p className='text-gray-500'>Cadastre e gerencie seus clientes de forma centralizada.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className='flex items-center gap-2 bg-[#0F2C4C] text-white px-5 py-2.5 rounded-lg hover:bg-blue-900 transition-colors shadow-lg font-bold'
        >
          <Plus size={20} />
          <span>Novo Cliente</span>
        </button>
      </div>

      <div className='bg-white p-4 rounded-xl shadow-sm border border-gray-100'>
        <div className='relative'>
          <Search className='absolute left-3 top-3 text-gray-400' size={20} />
          <input
            type='text'
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder='Buscar por razão social, CNPJ ou email...'
            className='w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>
      </div>

      {loading ? (
        <div className='p-10 text-center text-gray-500 font-bold animate-pulse'>Carregando clientes...</div>
      ) : clientesFiltrados.length === 0 ? (
        <div className='p-16 flex flex-col items-center justify-center text-gray-400 bg-white rounded-xl'>
          <Users size={48} className='mb-4 opacity-20' />
          <p className='text-lg'>Nenhum cliente encontrado.</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {clientesFiltrados.map((cliente) => {
            const hons = cliente.lista_contratos?.map((c) => c.numero_hon).filter((h) => h && h.trim() !== '') || []

            return (
              <div
                key={cliente.id}
                onClick={() => handleViewCliente(cliente)}
                className='bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group relative flex flex-col'
              >
                <div className='absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10'>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(cliente) }}
                    className='p-2 bg-gray-100 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-lg'
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(cliente.id, cliente.razao_social) }}
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
                    <h3 className='font-bold text-gray-800 truncate' title={cliente.razao_social}>{cliente.razao_social}</h3>
                    <p className='text-xs text-gray-400 flex items-center gap-1 mt-1'>
                      <Building2 size={12} /> {cliente.cnpj || 'CNPJ não inf.'}
                    </p>
                  </div>
                </div>

                <div className='space-y-3 text-sm text-gray-600 border-t border-gray-50 pt-4 flex-1'>
                  <div className='flex items-center gap-2'>
                    <User size={16} className='text-gray-400 shrink-0' />
                    <span className='truncate'>{cliente.nome_contato || '-'}</span>
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

                {hons.length > 0 && (
                  <div className='mt-4 bg-blue-50/50 p-2 rounded-lg border border-blue-100'>
                    <p className='text-xs font-bold text-blue-800 mb-1 flex items-center gap-1'>
                      <Hash size={10} /> HONs (LegalOne)
                    </p>
                    <div className='flex flex-wrap gap-1'>
                      {hons.slice(0, 3).map((num, i) => (
                        <span key={i} className='bg-white px-2 py-0.5 rounded border border-blue-100 text-xs text-blue-600 font-mono'>{num}</span>
                      ))}
                      {hons.length > 3 && <span className='text-xs text-blue-400 self-center'>+{hons.length - 3}</span>}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal de Edição/Criação */}
      {showModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4' onClick={closeModal}>
          <div className='bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden' onClick={(e) => e.stopPropagation()}>
            <div className='bg-[#0F2C4C] p-6 flex items-center justify-between text-white'>
              <h2 className='text-xl font-bold flex items-center gap-2'>
                <Building2 size={24} />
                {editingId ? 'Editar Cliente' : 'Novo Cliente'}
              </h2>
              <button onClick={closeModal} className='p-2 hover:bg-white/20 rounded-lg'><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className='p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]'>
              <div>
                <label className='block text-sm font-bold text-gray-700 mb-2'>Razão Social *</label>
                <input type='text' required value={formData.razao_social} onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })} className='w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='Nome da empresa' />
              </div>

              <div>
                <label className='block text-sm font-bold text-gray-700 mb-2'>CNPJ *</label>
                <input type='text' required value={formData.cnpj} onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })} className='w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='00.000.000/0000-00' />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-bold text-gray-700 mb-2'>Nome do Contato</label>
                  <input type='text' value={formData.nome_contato} onChange={(e) => setFormData({ ...formData, nome_contato: e.target.value })} className='w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='Responsável' />
                </div>
                <div>
                  <label className='block text-sm font-bold text-gray-700 mb-2'>Email</label>
                  <input type='email' value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className='w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='email@exemplo.com' />
                </div>
              </div>

              <div>
                <label className='block text-sm font-bold text-gray-700 mb-2'>Telefone</label>
                <input type='text' value={formData.telefone} onChange={(e) => setFormData({ ...formData, telefone: e.target.value })} className='w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='(00) 00000-0000' />
              </div>

              <div>
                <label className='block text-sm font-bold text-gray-700 mb-2'>Observações</label>
                <textarea value={formData.observacoes} onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })} className='w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500' rows='3' placeholder='Informações adicionais...' />
              </div>

              <div className='flex gap-3 pt-4'>
                <button type='button' onClick={closeModal} className='flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200'>Cancelar</button>
                <button type='submit' disabled={saving} className='flex-1 px-6 py-3 bg-[#0F2C4C] text-white rounded-lg font-bold hover:bg-blue-900 disabled:opacity-50'>
                  {saving ? 'Salvando...' : 'Salvar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Visualização */}
      {showViewModal && clienteSelecionado && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm' onClick={() => setShowViewModal(false)}>
          <div className='bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl' onClick={(e) => e.stopPropagation()}>
            <div className='bg-gradient-to-r from-[#0F2C4C] to-blue-900 p-6 flex items-center justify-between text-white'>
              <div className='flex items-center gap-3'>
                <div className='w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold'>
                  {clienteSelecionado.razao_social?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className='text-xl font-bold'>{clienteSelecionado.razao_social}</h2>
                  <p className='text-sm text-blue-100'>{clienteSelecionado.cnpj || 'CNPJ não informado'}</p>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <button onClick={() => handleEdit(clienteSelecionado)} className='p-2 hover:bg-white/20 rounded-lg transition-colors' title='Editar'>
                  <Edit2 size={20} />
                </button>
                <button onClick={() => handleDelete(clienteSelecionado.id, clienteSelecionado.razao_social)} className='p-2 hover:bg-white/20 rounded-lg transition-colors' title='Excluir'>
                  <Trash2 size={20} />
                </button>
                <button onClick={() => setShowViewModal(false)} className='p-2 hover:bg-white/20 rounded-lg transition-colors'>
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className='p-6 overflow-y-auto max-h-[calc(90vh-120px)]'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
                <div className='space-y-4'>
                  <h3 className='text-sm font-bold text-gray-700 border-b pb-2'>Informações de Contato</h3>
                  <div>
                    <label className='text-xs text-gray-500 font-semibold'>Nome do Contato</label>
                    <p className='text-sm text-gray-800'>{clienteSelecionado.nome_contato || '-'}</p>
                  </div>
                  <div>
                    <label className='text-xs text-gray-500 font-semibold'>Email</label>
                    <p className='text-sm text-gray-800'>{clienteSelecionado.email || '-'}</p>
                  </div>
                  <div>
                    <label className='text-xs text-gray-500 font-semibold'>Telefone</label>
                    <p className='text-sm text-gray-800'>{clienteSelecionado.telefone || '-'}</p>
                  </div>
                </div>

                <div>
                  <h3 className='text-sm font-bold text-gray-700 border-b pb-2 mb-3'>Observações</h3>
                  <p className='text-sm text-gray-700 bg-gray-50 p-4 rounded-lg'>
                    {clienteSelecionado.observacoes || 'Sem observações'}
                  </p>
                </div>
              </div>

              <div className='border-t pt-6'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-sm font-bold text-gray-700 flex items-center gap-2'>
                    <FileText size={18} className='text-blue-600' />
                    Contratos Vinculados ({contratosVinculados.length})
                  </h3>
                </div>

                {loadingContratos ? (
                  <div className='text-center py-8 text-gray-500'>Carregando contratos...</div>
                ) : contratosVinculados.length === 0 ? (
                  <div className='text-center py-8 text-gray-400 bg-gray-50 rounded-lg'>
                    <FileText size={32} className='mx-auto mb-2 opacity-20' />
                    <p className='text-sm'>Nenhum contrato vinculado a este cliente</p>
                  </div>
                ) : (
                  <div className='space-y-3'>
                    {contratosVinculados.map((contrato) => (
                      <div key={contrato.id} className='bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-between'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2 mb-2'>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(contrato.status)}`}>
                              {contrato.status}
                            </span>
                            {contrato.numero_hon && (
                              <span className='text-xs text-gray-500 font-mono'>HON: {contrato.numero_hon}</span>
                            )}
                          </div>
                          <p className='text-sm text-gray-700'>{contrato.descricao_contrato || 'Sem descrição'}</p>
                          {contrato.area && (
                            <p className='text-xs text-gray-500 mt-1'>Área: {contrato.area}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDesvincularContrato(contrato.id, contrato.numero_hon)}
                          className='ml-4 p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors'
                          title='Desvincular contrato'
                        >
                          <Unlink size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className='p-4 bg-gray-50 border-t flex justify-end gap-3'>
              <button
                onClick={() => setShowViewModal(false)}
                className='px-6 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-bold transition-colors'
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Clientes
