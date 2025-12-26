import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { CompanyLogo } from '../hooks/useCompanyLogo'
import { Plus, Search, FileText, Upload, CheckCircle2, Edit2, X, Calendar, User, DollarSign, FileCheck, Trash2, Filter, Download } from 'lucide-react'

const Contratos = () => {
  const navigate = useNavigate()
  const [contratos, setContratos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [contratoSelecionado, setContratoSelecionado] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showBuscaModal, setShowBuscaModal] = useState(false)
  
  // Filtros
  const [filtroStatus, setFiltroStatus] = useState('')
  const [filtroResponsavel, setFiltroResponsavel] = useState('')
  const [filtroDataInicio, setFiltroDataInicio] = useState('')
  const [filtroDataFim, setFiltroDataFim] = useState('')

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
    
    // Filtro de busca textual
    const matchBusca = !termo || (
      c.clientes?.razao_social?.toLowerCase().includes(termo) ||
      c.descricao_contrato?.toLowerCase().includes(termo) ||
      c.responsavel?.toLowerCase().includes(termo)
    )
    
    // Filtro de status
    const matchStatus = !filtroStatus || c.status === filtroStatus
    
    // Filtro de responsável
    const matchResponsavel = !filtroResponsavel || c.responsavel?.toLowerCase().includes(filtroResponsavel.toLowerCase())
    
    // Filtro de data (usa created_at)
    let matchData = true
    if (filtroDataInicio || filtroDataFim) {
      const dataContrato = new Date(c.created_at)
      if (filtroDataInicio) {
        const dataInicio = new Date(filtroDataInicio)
        matchData = matchData && dataContrato >= dataInicio
      }
      if (filtroDataFim) {
        const dataFim = new Date(filtroDataFim)
        dataFim.setHours(23, 59, 59, 999) // Incluir o dia todo
        matchData = matchData && dataContrato <= dataFim
      }
    }
    
    return matchBusca && matchStatus && matchResponsavel && matchData
  })
  
  // Obter lista única de responsáveis para o filtro
  const responsaveisUnicos = [...new Set(contratos.map(c => c.responsavel).filter(Boolean))].sort()

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

  const excluirContrato = async (id, nomeCliente) => {
    if (!confirm(`⚠️ TEM CERTEZA que deseja EXCLUIR este contrato?\n\nCliente: ${nomeCliente}\n\nEsta ação NÃO pode ser desfeita!`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('contratos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('✅ Contrato excluído com sucesso!');
      buscarContratos(); // Recarregar lista
      
      // Se o modal estiver aberto, fechar
      if (showModal) {
        setShowModal(false);
        setContratoSelecionado(null);
      }
    } catch (error) {
      console.error('Erro ao excluir contrato:', error);
      alert('❌ Erro ao excluir contrato: ' + error.message);
    }
  };

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

  const exportarParaExcel = async () => {
    try {
      setLoading(true)

      // Usar contratos filtrados
      const dadosParaExportar = contratosFiltrados.map((contrato) => ({
        'Número HON': contrato.numero_hon || '-',
        'Cliente': contrato.clientes?.razao_social || '-',
        'CNPJ': contrato.clientes?.cnpj || '-',
        'Status': contrato.status || '-',
        'Responsável': contrato.responsavel || '-',
        'Área': contrato.area || '-',
        'Número Processo': contrato.numero_proc || '-',
        'Descrição': contrato.descricao_contrato || '-',
        
        // Datas
        'Data Prospect': formatarData(contrato.data_prospect),
        'Data Proposta': formatarData(contrato.data_proposta),
        'Data Contrato': formatarData(contrato.data_contrato),
        'Data Rejeição': formatarData(contrato.data_rejeicao),
        'Data Cadastro': formatarData(contrato.created_at),
        
        // Valores Proposta
        'Proposta Pró-labore': contrato.proposta_pro_labore || 0,
        'Proposta Êxito Total': contrato.proposta_exito_total || 0,
        'Proposta Fixo Mensal': contrato.proposta_fixo_mensal || 0,
        
        // Valores Contrato
        'Contrato Pró-labore': contrato.contrato_pro_labore || 0,
        'Contrato Êxito Total': contrato.contrato_exito_total || 0,
        'Contrato Fixo Mensal': contrato.contrato_fixo_mensal || 0,
        
        // Informações adicionais
        'Contrato Assinado': contrato.contrato_assinado === 'sim' ? 'Sim' : 'Não',
        'Observações': contrato.observacoes || '-',
        'Motivo Rejeição': contrato.motivo_rejeicao || '-',
        'Iniciativa Rejeição': contrato.iniciativa_rejeicao || '-',
        
        // Histórico
        'Histórico de Alterações': contrato.historico_alteracoes 
          ? contrato.historico_alteracoes.map(h => 
              `[${formatarData(h.data)}] ${h.usuario}: ${h.acao} - ${h.detalhes}`
            ).join(' | ')
          : '-'
      }))

      if (dadosParaExportar.length === 0) {
        alert('Nenhum contrato para exportar com os filtros aplicados!')
        return
      }

      // Importar biblioteca xlsx
      const XLSX = await import('xlsx')
      
      // Criar workbook e worksheet
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(dadosParaExportar)
      
      // Ajustar largura das colunas
      const colWidths = [
        { wch: 12 }, // Número HON
        { wch: 30 }, // Cliente
        { wch: 18 }, // CNPJ
        { wch: 18 }, // Status
        { wch: 20 }, // Responsável
        { wch: 15 }, // Área
        { wch: 25 }, // Número Processo
        { wch: 40 }, // Descrição
        { wch: 12 }, // Data Prospect
        { wch: 12 }, // Data Proposta
        { wch: 12 }, // Data Contrato
        { wch: 12 }, // Data Rejeição
        { wch: 12 }, // Data Cadastro
        { wch: 15 }, // Proposta Pró-labore
        { wch: 15 }, // Proposta Êxito
        { wch: 15 }, // Proposta Fixo
        { wch: 15 }, // Contrato Pró-labore
        { wch: 15 }, // Contrato Êxito
        { wch: 15 }, // Contrato Fixo
        { wch: 15 }, // Assinado
        { wch: 40 }, // Observações
        { wch: 25 }, // Motivo Rejeição
        { wch: 20 }, // Iniciativa
        { wch: 60 }  // Histórico
      ]
      ws['!cols'] = colWidths
      
      // Adicionar worksheet ao workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Contratos')
      
      // Criar nome do arquivo com data e filtros aplicados
      const hoje = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')
      let nomeArquivo = `Contratos_${hoje}`
      
      if (filtroStatus) nomeArquivo += `_${filtroStatus.replace(/ /g, '_')}`
      if (filtroResponsavel) nomeArquivo += `_${filtroResponsavel}`
      if (filtroDataInicio || filtroDataFim) nomeArquivo += '_Filtrado'
      
      nomeArquivo += `.xlsx`
      
      // Baixar arquivo
      XLSX.writeFile(wb, nomeArquivo)
      
      alert(`✅ ${dadosParaExportar.length} contratos exportados com sucesso!`)
    } catch (error) {
      console.error('Erro ao exportar:', error)
      alert('Erro ao exportar para Excel: ' + error.message)
    } finally {
      setLoading(false)
    }
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

        <div className='flex gap-3'>
          <button
            onClick={exportarParaExcel}
            disabled={loading || contratosFiltrados.length === 0}
            className='flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors shadow-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed'
            title={contratosFiltrados.length === 0 ? 'Nenhum contrato para exportar' : `Exportar ${contratosFiltrados.length} contratos para Excel`}
          >
            {/* Ícone Excel SVG */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 13L12 17L16 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 17V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            
            {contratosFiltrados.length > 0 && (
              <span className='bg-green-800 px-2 py-0.5 rounded text-xs'>
                {contratosFiltrados.length}
              </span>
            )}
          </button>

          <Link
            to='/contratos/novo'
            className='flex items-center gap-2 bg-[#0F2C4C] text-white px-5 py-2.5 rounded-lg hover:bg-blue-900 transition-colors shadow-lg font-bold'
          >
            <Plus size={20} />
            <span>Novo Contrato</span>
          </Link>
        </div>
      </div>

      <div className='bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4'>
        {/* Cabeçalho de Filtros com Busca */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Filter size={18} className='text-gray-400' />
            <span className='text-xs font-bold text-gray-500 uppercase'>Filtros:</span>
          </div>
          
          {/* Botão de Busca */}
          <button
            onClick={() => setShowBuscaModal(!showBuscaModal)}
            className='flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-gray-700 font-medium'
            title='Buscar contratos'
          >
            <Search size={20} />
            {busca && (
              <>
                <span className='text-sm font-normal text-gray-600'>"{busca}"</span>
                <X 
                  size={16} 
                  className='text-gray-500 hover:text-red-600'
                  onClick={(e) => {
                    e.stopPropagation()
                    setBusca('')
                  }}
                />
              </>
            )}
          </button>

          {/* Modal de Busca */}
          {showBuscaModal && (
            <div className='fixed inset-0 bg-black bg-opacity-30 flex items-start justify-center pt-20 z-50' onClick={() => setShowBuscaModal(false)}>
              <div className='bg-white rounded-xl shadow-2xl p-6 w-full max-w-xl' onClick={(e) => e.stopPropagation()}>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-lg font-bold text-gray-800'>Buscar Contratos</h3>
                  <button onClick={() => setShowBuscaModal(false)} className='text-gray-400 hover:text-gray-600'>
                    <X size={20} />
                  </button>
                </div>
                <div className='relative'>
                  <Search className='absolute left-3 top-3 text-gray-400' size={20} />
                  <input
                    type='text'
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder='Digite cliente, descrição ou responsável...'
                    className='w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-blue-500 text-lg'
                    autoFocus
                  />
                </div>
                <div className='mt-4 flex justify-end gap-2'>
                  <button
                    onClick={() => {
                      setBusca('')
                      setShowBuscaModal(false)
                    }}
                    className='px-4 py-2 text-gray-600 hover:text-gray-800'
                  >
                    Limpar
                  </button>
                  <button
                    onClick={() => setShowBuscaModal(false)}
                    className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Grid de Filtros */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          {/* Filtro de Status */}
          <div>
            <label className='block text-xs font-semibold text-gray-600 mb-1'>Status</label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className='w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>Todos</option>
              <option value='Sob Análise'>Sob Análise</option>
              <option value='Proposta Enviada'>Proposta Enviada</option>
              <option value='Contrato Fechado'>Contrato Fechado</option>
              <option value='Rejeitada'>Rejeitada</option>
              <option value='Probono'>Probono</option>
            </select>
          </div>
          
          {/* Filtro de Responsável */}
          <div>
            <label className='block text-xs font-semibold text-gray-600 mb-1'>Responsável</label>
            <select
              value={filtroResponsavel}
              onChange={(e) => setFiltroResponsavel(e.target.value)}
              className='w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>Todos</option>
              {responsaveisUnicos.map((resp) => (
                <option key={resp} value={resp}>{resp}</option>
              ))}
            </select>
          </div>
          
          {/* Filtro de Data Início */}
          <div>
            <label className='block text-xs font-semibold text-gray-600 mb-1'>Data Início</label>
            <input
              type='date'
              value={filtroDataInicio}
              onChange={(e) => setFiltroDataInicio(e.target.value)}
              className='w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          
          {/* Filtro de Data Fim */}
          <div>
            <label className='block text-xs font-semibold text-gray-600 mb-1'>Data Fim</label>
            <input
              type='date'
              value={filtroDataFim}
              onChange={(e) => setFiltroDataFim(e.target.value)}
              className='w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
        </div>
        
        {/* Botão limpar filtros */}
        {(filtroStatus || filtroResponsavel || filtroDataInicio || filtroDataFim) && (
          <div className='flex justify-end'>
            <button
              onClick={() => {
                setFiltroStatus('')
                setFiltroResponsavel('')
                setFiltroDataInicio('')
                setFiltroDataFim('')
              }}
              className='text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1'
            >
              <X size={14} />
              Limpar filtros
            </button>
          </div>
        )}
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
                    Data Criação
                  </th>
                  <th className='px-6 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest'>
                    Responsável
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
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-3'>
                        <CompanyLogo 
                          cnpj={contrato.clientes?.cnpj}
                          razaoSocial={contrato.clientes?.razao_social}
                          clienteId={contrato.cliente_id}
                          size="sm"
                        />
                        <span className='font-bold text-[#0F2C4C] text-sm'>
                          {contrato.clientes?.razao_social || 'Cliente não identificado'}
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-4 text-gray-600 text-xs'>
                      <div className='flex items-center gap-2'>
                        <Calendar size={14} className='text-gray-400' />
                        {new Date(contrato.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className='px-6 py-4 text-gray-700 text-sm font-medium'>
                      <div className='flex items-center gap-2'>
                        <User size={14} className='text-gray-400' />
                        {contrato.responsavel || '-'}
                      </div>
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
                      <div className='flex items-center justify-center gap-2'>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            irParaEdicao(contrato.id)
                          }}
                          className='p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all'
                          title='Editar contrato'
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            excluirContrato(contrato.id, contrato.clientes?.razao_social || 'Desconhecido')
                          }}
                          className='p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all'
                          title='Excluir contrato'
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
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
                  onClick={() => {
                    excluirContrato(contratoSelecionado.id, contratoSelecionado.clientes?.razao_social || 'Desconhecido')
                  }}
                  className='p-2 hover:bg-red-500 rounded-lg transition-colors'
                  title='Excluir'
                >
                  <Trash2 size={20} />
                </button>
                <button
                  onClick={fecharModal}
                  className='p-2 hover:bg-white/20 rounded-lg transition-colors'
                  title='Fechar'
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
