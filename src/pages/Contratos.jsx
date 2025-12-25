import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { Plus, Search, FileText, Upload, CheckCircle2 } from 'lucide-react'

const Contratos = () => {
  const [contratos, setContratos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')

  // Busca os dados assim que a tela abre
  useEffect(() => {
    buscarContratos()
  }, [])

  const buscarContratos = async () => {
    try {
      setLoading(true)
      // Busca contratos e "junta" com a tabela de clientes para pegar o nome
      const { data, error } = await supabase
        .from('contratos')
        .select(
          `
          *,
          clientes ( razao_social )
        `
        )
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

  // Função para vincular PDF ao GED
  const handleUploadPDF = async (event, contratoId) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `ged_${contratoId}_${Date.now()}.${fileExt}`;

      // 1. Upload para o Storage
      const { error: uploadError } = await supabase.storage
        .from('contratos_ged')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 2. Pegar URL pública
      const { data: urlData } = supabase.storage.from('contratos_ged').getPublicUrl(fileName);

      // 3. Atualizar Banco de Dados
      const { error: updateError } = await supabase
        .from('contratos')
        .update({ 
          arquivo_pdf_url: urlData.publicUrl,
          data_vinculo_pdf: new Date().toISOString()
        })
        .eq('id', contratoId);

      if (updateError) throw updateError;

      alert('Contrato PDF vinculado ao GED com sucesso!');
      buscarContratos();
    } catch (error) {
      alert('Erro no upload: ' + error.message);
    }
  };

  // Função para dar cor aos Status
  const getStatusColor = (status) => {
    const cores = {
      'Sob Análise': 'bg-yellow-100 text-yellow-800',
      'Proposta Enviada': 'bg-blue-100 text-blue-800',
      'Contrato Fechado': 'bg-green-100 text-green-800',
      Rejeitada: 'bg-red-100 text-red-800',
      Probono: 'bg-purple-100 text-purple-800',
    }
    return cores[status] || 'bg-gray-100 text-gray-800'
  }

  // Filtragem simples no front-end
  const contratosFiltrados = contratos.filter(
    (c) =>
      c.clientes?.razao_social?.toLowerCase().includes(busca.toLowerCase()) ||
      c.responsavel_socio?.toLowerCase().includes(busca.toLowerCase()) ||
      c.descricao_contrato?.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className='w-full space-y-6'>
      {/* Cabeçalho */}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-[#0F2C4C]'>
            Gestão de Contratos
          </h1>
          <p className='text-gray-500'>
            Acompanhe o status de todas as demandas e documentos vinculados.
          </p>
        </div>

        {/* Botão Novo Contrato */}
        <Link
          to='/contratos/novo'
          className='flex items-center gap-2 bg-[#0F2C4C] text-white px-5 py-2.5 rounded-lg hover:bg-blue-900 transition-colors shadow-lg font-bold'
        >
          <Plus size={20} />
          <span>Novo Contrato</span>
        </Link>
      </div>

      {/* Filtros e Busca */}
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

      {/* Tabela de Contratos */}
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
                  <th className='px-6 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest text-right'>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-50'>
                {contratosFiltrados.map((contrato) => (
                  <tr
                    key={contrato.id}
                    className='hover:bg-gray-50 transition-colors'
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
                        <div className="flex justify-center items-center">
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
                    <td className='px-6 py-4 text-right'>
                      <Link
                        to={`/contratos/editar/${contrato.id}`}
                        className='text-blue-600 hover:text-blue-800 font-black text-[10px] uppercase hover:underline'
                      >
                        Ver Detalhes
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Contratos
