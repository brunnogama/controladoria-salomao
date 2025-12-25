import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import {
  MoreHorizontal,
  Plus,
  DollarSign,
  Calendar,
  AlertCircle,
  Loader2,
  Briefcase,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const Kanban = () => {
  const [contratos, setContratos] = useState([])
  const [loading, setLoading] = useState(true)
  const [draggedItem, setDraggedItem] = useState(null)

  // CONFIGURAÇÀO DAS COLUNAS E CORES SOLICITADAS
  const colunas = [
    {
      id: 'Sob Análise',
      titulo: 'Sob Análise',
      cor: 'bg-orange-500',
      border: 'border-orange-500',
    },
    {
      id: 'Proposta Enviada',
      titulo: 'Proposta Enviada',
      cor: 'bg-yellow-400',
      border: 'border-yellow-400',
    },
    {
      id: 'Contrato Fechado',
      titulo: 'Contrato Fechado',
      cor: 'bg-green-600',
      border: 'border-green-600',
    },
    {
      id: 'Probono',
      titulo: 'Probono',
      cor: 'bg-blue-500',
      border: 'border-blue-500',
    },
    {
      id: 'Rejeitada',
      titulo: 'Rejeitados',
      cor: 'bg-red-600',
      border: 'border-red-600',
    },
  ]

  useEffect(() => {
    fetchContratos()
  }, [])

  const fetchContratos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('contratos')
        .select(`*, clientes (razao_social)`)
        .order('updated_at', { ascending: false })

      if (error) throw error
      setContratos(data || [])
    } catch (error) {
      console.error('Erro ao buscar contratos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDrop = async (e, colunaDestinoID) => {
    e.preventDefault()
    if (!draggedItem || draggedItem.status === colunaDestinoID) return

    // Atualização Otimista na Interface
    const novosContratos = contratos.map((c) =>
      c.id === draggedItem.id ? { ...c, status: colunaDestinoID } : c
    )
    setContratos(novosContratos)

    try {
      // Persistência no Banco de Dados
      const { error } = await supabase
        .from('contratos')
        .update({ status: colunaDestinoID })
        .eq('id', draggedItem.id)

      if (error) throw error

      // Registro no Histórico de Atividades
      await supabase.from('logs_sistema').insert([
        {
          categoria: 'Kanban',
          acao: 'Movimentação',
          detalhes: `"${draggedItem.clientes?.razao_social || 'Contrato'}" movido para "${colunaDestinoID}"`,
          referencia_id: draggedItem.id,
        },
      ])
    } catch (error) {
      console.error('Erro ao salvar movimentação:', error)
      fetchContratos() // Reverte em caso de erro
    } finally {
      setDraggedItem(null)
    }
  }

  const formatMoney = (val) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val || 0)

  if (loading)
    return (
      <div className='flex justify-center items-center h-full text-gray-400'>
        <Loader2 className='animate-spin mr-2' /> Carregando Kanban...
      </div>
    )

  return (
    <div className='w-full h-[calc(100vh-100px)] flex flex-col'>
      <div className='flex justify-between items-center mb-6 px-2'>
        <div>
          <h1 className='text-3xl font-bold text-[#0F2C4C]'>Kanban de Casos</h1>
          <p className='text-gray-500'>Gestão visual e movimentação de contratos.</p>
        </div>
        <Link
          to='/contratos/novo'
          className='flex items-center gap-2 bg-[#0F2C4C] text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors shadow-lg'
        >
          <Plus size={20} /> Novo Caso
        </Link>
      </div>

      <div className='flex-1 flex gap-4 overflow-x-auto pb-4 px-2'>
        {colunas.map((coluna) => {
          const itens = contratos.filter((c) => c.status === coluna.id)
          const totalPL = itens.reduce((acc, curr) => acc + (Number(curr.proposta_pro_labore) || 0), 0)

          return (
            <div
              key={coluna.id}
              className='flex-shrink-0 w-80 flex flex-col bg-gray-50/50 rounded-xl border border-gray-200 h-full'
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, coluna.id)}
            >
              <div className={`p-4 border-b border-gray-100 rounded-t-xl bg-white sticky top-0 z-10 shadow-sm border-t-4 ${coluna.border}`}>
                <div className='flex justify-between items-center mb-1'>
                  <h3 className='font-bold text-gray-700 flex items-center gap-2'>
                    <span className={`w-3 h-3 rounded-full ${coluna.cor}`}></span>
                    {coluna.titulo}
                  </h3>
                  <span className='bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-bold'>
                    {itens.length}
                  </span>
                </div>
                {totalPL > 0 && (
                  <p className='text-[10px] text-gray-400 font-mono mt-1'>
                    Total PL: {formatMoney(totalPL)}
                  </p>
                )}
              </div>

              <div className='flex-1 p-3 space-y-3 overflow-y-auto min-h-[100px]'>
                {itens.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => setDraggedItem(item)}
                    className='bg-white p-4 rounded-lg border border-gray-200 shadow-sm cursor-move hover:shadow-md hover:border-blue-300 transition-all group relative'
                  >
                    <Link to={`/contratos/editar/${item.id}`} className='absolute top-3 right-3 text-gray-300 hover:text-blue-600'>
                      <MoreHorizontal size={16} />
                    </Link>

                    <div className='flex items-start gap-3 mb-3 pr-6'>
                      <div className='w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0 uppercase'>
                        {item.clientes?.razao_social?.substring(0, 2) || '?'}
                      </div>
                      <div className='overflow-hidden'>
                        <h4 className='font-bold text-sm text-gray-800 truncate' title={item.clientes?.razao_social}>
                          {item.clientes?.razao_social || 'Cliente s/ nome'}
                        </h4>
                        <p className='text-[11px] text-gray-500 truncate flex items-center gap-1'>
                          <Briefcase size={10} /> {item.parte_contraria || 'Não informada'}
                        </p>
                      </div>
                    </div>

                    <div className='space-y-2'>
                      {item.proposta_pro_labore > 0 ? (
                        <div className='text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded w-fit'>
                          PL: {formatMoney(item.proposta_pro_labore)}
                        </div>
                      ) : (
                        <span className='text-[10px] text-gray-400 italic'>Valores a definir</span>
                      )}

                      <div className='flex items-center justify-between pt-2 border-t border-gray-50 mt-2'>
                        <span className='text-[10px] text-gray-400 flex items-center gap-1'>
                          <Calendar size={10} /> {new Date(item.created_at).toLocaleDateString('pt-BR')}
                        </span>

                        {item.status === 'Contrato Fechado' && !item.contrato_assinado && (
                          <span className='text-[9px] text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded flex items-center gap-1 font-bold animate-pulse'>
                            <AlertCircle size={10} /> ASSINAR
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Kanban
