import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { Plus, Search, FileText, Upload, CheckCircle2, Edit2, X, Calendar, User, DollarSign, FileCheck } from 'lucide-react'

const Contratos = () => {
  const navigate = useNavigate()
  const [contratos, setContratos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [contratoSelecionado, setContratoSelecionado] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    buscarContratos()
  }, [])

  const buscarContratos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('contratos')
        .select(`
          *,
          clientes ( razao_social, cnpj )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setContratos(data || [])
    } catch (error) {
      console.error('Erro ao buscar contratos:', error)
      alert('Erro ao carregar contratos!')
    } finally {
      setLoading(false)
    }
  }

  const handleUploadPDF = async (event, contratoId) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `ged_${contratoId}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('contratos_ged')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('contratos_ged')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('contratos')
        .update({ arquivo_pdf_url: urlData.publicUrl })
        .eq('id', contratoId);

      if (updateError) throw updateError;

      alert('PDF vinculado com sucesso!');
      buscarContratos();
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao vincular PDF!');
    }
  };

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

  const contratosFiltrados = contratos.filter((c) => {
    const termo = busca.toLowerCase()
    return (
      c.clientes?.razao_social?.toLowerCase().includes(termo) ||
      c.descricao_contrato?.toLowerCase().includes(termo) ||
      c.responsavel?.toLowerCase().includes(termo)
    )
  })

  const abrirModal = (contrato) => {
    setContratoSelecionado(contrato)
    setShowModal(true)
  }

  const fecharModal = () => {
    setShowModal(false)
    setContratoSelecionado(null)
  }

  const irParaEdicao = (id) => {
    navigate(`/contratos/editar/${id}`)
  }

  const formatarMoeda = (valor) => {
    if (!valor) return 'R$ 0,00'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  const formatarData = (data) => {
    if (!data) return '-'
    return new Date(data).toLocaleDateString('pt-BR')
  }

  return (
    <div className='w-full space-y-6'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-[#0F2C4C]'>
            Gestão de Contratos
          </h1>
          <p className='text-gray-500'>
            Acompanhe o status de todas as demandas e documentos vinculados.
          </p>
        </div>

        <Link
          to='/contratos/novo'
          className='flex items-center gap-2 bg-[#0F2C4C] text-white px-5 py-2.5 rounded-lg hover:bg-blue-900 transition-colors shadow-lg font-bold'
        >
          <Plus size={20} />
          <span>Novo Contrato</span>
        </Link>
      </div>

      <div className='bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-3 text-gray-400' size={20} />
          <input
            type='text'
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder='Buscar por cliente, descrição ou responsável...'
            className='w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>
      </div>

      <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
        {loading ? (
          <div className='p-10 text-center text-gray-500 font-bold animate-pulse'>
            Carregando dados da controladoria...
          </div>
        ) : contratosFiltrados.length === 0 ? (
          <div className='p-16 flex flex-col items-center justify-center text-gray-400'>
            <FileText size={48} className='mb-4 opacity-20' />
            <p className='text-lg'>Nenhum contrato encontrado.</p>
            <p className='text-sm'>Clique em "Novo Contrato" para começar.</p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-left'>
              <thead className='bg-gray-50 border-b border-gray-100'>
                <tr>
                  <th className='px-6 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest'>
                    Status
                  </th>
                  <th className='px-6 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest'>
                    Cliente
                  </th>
                  <th className='px-6 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest'>
                    Descrição do Contrato
                  </th>
                  <th className='px-6 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest text-center'>
                    GED (PDF)
                  </th>
                  <th className='px-6 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest text-center'>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-50'>
                {contratosFiltrados.map((contrato) => (
                  <tr
                    key={contrato.id}
                    className='hover:bg-gray-50 transition-colors cursor-pointer'
                    onClick={() => abrirModal(contrato)}
                  >
                    <td className='px-6 py-4'>
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${getStatusColor(
                          contrato.status
                        )}`}
                      >
                        {contrato.status}
                      </span>
                    </td>
                    <td className='px-6 py-4 font-bold text-[#0F2C4C] text-sm'>
                      {contrato.clientes?.razao_social || 'Cliente não identificado'}
                    </td>
                    <td className='px-6 py-4 text-gray-600 text-xs italic'>
                      {contrato.descricao_contrato || '-'}
                    </td>
                    <td className='px-6 py-4 text-center'>
                      {contrato.status === 'Contrato Fechado' && (
                        <div className="flex justify-center items-center" onClick={(e) => e.stopPropagation()}>
                          {contrato.arquivo_pdf_url ? (
                            <div className="text-emerald-600 flex items-center gap-1 text-[10px] font-black bg-emerald-50 px-2 py-1 rounded-lg">
                              <CheckCircle2 size={14} /> PDF OK
                            </div>
                          ) : (
                            <label className="cursor-pointer bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 hover:bg-blue-100 transition-all">
                              <Upload size={14} /> Vincular PDF
                              <input 
                                type="file" 
                                accept=".pdf" 
                                className="hidden" 
                                onChange={(e) => handleUploadPDF(e, contrato.id)} 
                              />
                            </label>
                          )}
                        </div>
                      )}
                    </td>
                    <td className='px-6 py-4 text-center'>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          irParaEdicao(contrato.id)
                        }}
                        className='inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all'
                      >
                        <Edit2 size={14} />
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Visualização */}
      {showModal && contratoSelecionado && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm' onClick={fecharModal}>
          <div className='bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl' onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className='bg-gradient-to-r from-[#0F2C4C] to-blue-900 p-6 flex items-center justify-between text-white'>
              <div className='flex items-center gap-3'>
                <FileCheck size={28} />
                <div>
                  <h2 className='text-xl font-bold'>Detalhes do Contrato</h2>
                  <p className='text-sm text-blue-100'>{contratoSelecionado.clientes?.razao_social}</p>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <button
                  onClick={() => {
                    fecharModal()
                    irParaEdicao(contratoSelecionado.id)
                  }}
                  className='p-2 hover:bg-white/20 rounded-lg transition-colors'
                  title='Editar'
                >
                  <Edit2 size={20} />
                </button>
                <button
                  onClick={fecharModal}
                  className='p-2 hover:bg-white/20 rounded-lg transition-colors'
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className='p-6 overflow-y-auto max-h-[calc(90vh-120px)]'>
              {/* Status Badge */}
              <div className='mb-6'>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(contratoSelecionado.status)}`}>
                  {contratoSelecionado.status}
                </span>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Informações Básicas */}
                <div className='space-y-4'>
                  <h3 className='text-sm font-bold text-gray-700 border-b pb-2'>Informações Básicas</h3>
                  
                  <div>
                    <label className='text-xs text-gray-500 font-semibold'>Cliente</label>
                    <p className='text-sm font-bold text-gray-800'>{contratoSelecionado.clientes?.razao_social || '-'}</p>
                  </div>

                  <div>
                    <label className='text-xs text-gray-500 font-semibold'>CNPJ</label>
                    <p className='text-sm text-gray-800'>{contratoSelecionado.clientes?.cnpj || '-'}</p>
                  </div>

                  <div>
                    <label className='text-xs text-gray-500 font-semibold'>Área</label>
                    <p className='text-sm text-gray-800'>{contratoSelecionado.area || '-'}</p>
                  </div>

                  <div>
                    <label className='text-xs text-gray-500 font-semibold'>Responsável</label>
                    <p className='text-sm text-gray-800'>{contratoSelecionado.responsavel || '-'}</p>
                  </div>
                </div>

                {/* Dados do Processo */}
                <div className='space-y-4'>
                  <h3 className='text-sm font-bold text-gray-700 border-b pb-2'>Dados do Processo</h3>
                  
                  <div>
                    <label className='text-xs text-gray-500 font-semibold'>Contrário</label>
                    <p className='text-sm text-gray-800'>{contratoSelecionado.contrario || '-'}</p>
                  </div>

                  <div>
                    <label className='text-xs text-gray-500 font-semibold'>Processo</label>
                    <p className='text-sm text-gray-800'>{contratoSelecionado.processo || '-'}</p>
                  </div>

                  <div>
                    <label className='text-xs text-gray-500 font-semibold'>Valor da Causa</label>
                    <p className='text-sm text-gray-800 font-mono'>{formatarMoeda(contratoSelecionado.valor_causa)}</p>
                  </div>

                  <div>
                    <label className='text-xs text-gray-500 font-semibold'>Tribunal/Turma</label>
                    <p className='text-sm text-gray-800'>{contratoSelecionado.tribunal_turma || '-'}</p>
                  </div>

                  <div>
                    <label className='text-xs text-gray-500 font-semibold'>UF</label>
                    <p className='text-sm text-gray-800'>{contratoSelecionado.uf || '-'}</p>
                  </div>
                </div>

                {/* Descrição */}
                <div className='md:col-span-2'>
                  <h3 className='text-sm font-bold text-gray-700 border-b pb-2 mb-3'>Descrição</h3>
                  <p className='text-sm text-gray-700 bg-gray-50 p-4 rounded-lg'>
                    {contratoSelecionado.descricao_contrato || 'Sem descrição'}
                  </p>
                </div>

                {/* Dados Financeiros (se Contrato Fechado) */}
                {contratoSelecionado.status === 'Contrato Fechado' && (
                  <div className='md:col-span-2 bg-green-50 p-4 rounded-lg'>
                    <h3 className='text-sm font-bold text-green-800 border-b border-green-200 pb-2 mb-3'>Dados Financeiros</h3>
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                      <div>
                        <label className='text-xs text-green-700 font-semibold'>Pró-labore</label>
                        <p className='text-sm font-bold text-green-900 font-mono'>{formatarMoeda(contratoSelecionado.contrato_pro_labore)}</p>
                      </div>
                      <div>
                        <label className='text-xs text-green-700 font-semibold'>Honorário Fixo</label>
                        <p className='text-sm font-bold text-green-900 font-mono'>{formatarMoeda(contratoSelecionado.contrato_honorario_fixo)}</p>
                      </div>
                      <div>
                        <label className='text-xs text-green-700 font-semibold'>Êxito Total</label>
                        <p className='text-sm font-bold text-green-900 font-mono'>{formatarMoeda(contratoSelecionado.contrato_exito_total)}</p>
                      </div>
                      <div>
                        <label className='text-xs text-green-700 font-semibold'>Êxito %</label>
                        <p className='text-sm font-bold text-green-900'>{contratoSelecionado.contrato_exito_percentual || '-'}</p>
                      </div>
                    </div>
                    <div className='mt-3'>
                      <label className='text-xs text-green-700 font-semibold'>Número HON</label>
                      <p className='text-sm font-bold text-green-900'>{contratoSelecionado.numero_hon || '-'}</p>
                    </div>
                  </div>
                )}

                {/* Dados da Proposta (se Proposta Enviada) */}
                {contratoSelecionado.status === 'Proposta Enviada' && (
                  <div className='md:col-span-2 bg-blue-50 p-4 rounded-lg'>
                    <h3 className='text-sm font-bold text-blue-800 border-b border-blue-200 pb-2 mb-3'>Dados da Proposta</h3>
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                      <div>
                        <label className='text-xs text-blue-700 font-semibold'>Pró-labore</label>
                        <p className='text-sm font-bold text-blue-900 font-mono'>{formatarMoeda(contratoSelecionado.proposta_pro_labore)}</p>
                      </div>
                      <div>
                        <label className='text-xs text-blue-700 font-semibold'>Honorário Fixo</label>
                        <p className='text-sm font-bold text-blue-900 font-mono'>{formatarMoeda(contratoSelecionado.proposta_honorario_fixo)}</p>
                      </div>
                      <div>
                        <label className='text-xs text-blue-700 font-semibold'>Êxito Total</label>
                        <p className='text-sm font-bold text-blue-900 font-mono'>{formatarMoeda(contratoSelecionado.proposta_exito_total)}</p>
                      </div>
                      <div>
                        <label className='text-xs text-blue-700 font-semibold'>Data Proposta</label>
                        <p className='text-sm font-bold text-blue-900'>{formatarData(contratoSelecionado.data_proposta)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className='p-4 bg-gray-50 border-t flex justify-end gap-3'>
              <button
                onClick={fecharModal}
                className='px-6 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-bold transition-colors'
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  fecharModal()
                  irParaEdicao(contratoSelecionado.id)
                }}
                className='px-6 py-2 bg-[#0F2C4C] text-white rounded-lg font-bold hover:bg-blue-900 transition-colors flex items-center gap-2'
              >
                <Edit2 size={16} />
                Editar Contrato
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Contratos
