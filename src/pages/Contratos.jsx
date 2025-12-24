import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { Plus, Search, FileText } from 'lucide-react'

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
      c.responsavel_socio?.toLowerCase().includes(busca.toLowerCase())
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
            Acompanhe o status de todas as demandas.
          </p>
        </div>

        {/* Botão Novo Contrato */}
        <Link
          to='/contratos/novo'
          className='flex items-center gap-2 bg-[#0F2C4C] text-white px-5 py-2.5 rounded-lg hover:bg-blue-900 transition-colors shadow-lg'
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
            placeholder='Buscar por cliente ou responsável...'
            className='w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>
      </div>

      {/* Tabela de Contratos */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
        {loading ? (
          <div className='p-10 text-center text-gray-500'>
            Carregando dados...
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
                  <th className='px-6 py-4 font-semibold text-gray-600'>
                    Status
                  </th>
                  <th className='px-6 py-4 font-semibold text-gray-600'>
                    Cliente
                  </th>
                  <th className='px-6 py-4 font-semibold text-gray-600'>
                    Responsável
                  </th>
                  <th className='px-6 py-4 font-semibold text-gray-600'>
                    Data Cadastro
                  </th>
                  <th className='px-6 py-4 font-semibold text-gray-600 text-right'>
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
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          contrato.status
                        )}`}
                      >
                        {contrato.status}
                      </span>
                    </td>
                    <td className='px-6 py-4 font-medium text-gray-800'>
                      {contrato.clientes?.razao_social || 'Cliente sem nome'}
                    </td>
                    <td className='px-6 py-4 text-gray-600'>
                      {contrato.responsavel_socio || '-'}
                    </td>
                    <td className='px-6 py-4 text-gray-500'>
                      {new Date(contrato.created_at).toLocaleDateString(
                        'pt-BR'
                      )}
                    </td>
                    <td className='px-6 py-4 text-right'>
                      <Link
                        to={`/contratos/editar/${contrato.id}`}
                        className='text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline'
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
