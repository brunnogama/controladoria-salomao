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

  // COLUNAS EXATAS
  const colunas = [
    {
      id: 'Sob Análise',
      titulo: 'Sob Análise',
      cor: 'bg-orange-500',
      border: 'border-orange-500',
      bg: 'bg-orange-50',
    },
    {
      id: 'Proposta Enviada',
      titulo: 'Proposta Enviada',
      cor: 'bg-yellow-500',
      border: 'border-yellow-400',
      bg: 'bg-yellow-50',
    },
    {
      id: 'Contratos Fechados',
      titulo: 'Contratos Fechados',
      cor: 'bg-green-600',
      border: 'border-green-500',
      bg: 'bg-green-50',
    },
    {
      id: 'Rejeitados',
      titulo: 'Rejeitados',
      cor: 'bg-red-600',
      border: 'border-red-500',
      bg: 'bg-red-50',
    },
    {
      id: 'Probono',
      titulo: 'Probono',
      cor: 'bg-blue-500',
      border: 'border-blue-500',
      bg: 'bg-blue-50',
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
        .select(
          `
          *,
          clientes (razao_social)
        `
        )
        .order('updated_at', { ascending: false })

      if (error) throw error
      setContratos(data || [])
    } catch (error) {
      console.error('Erro ao buscar contratos:', error)
    } finally {
      setLoading(false)
    }
  }

  // --- INTELIGÊNCIA: Corrige nomes errados vindos do banco ---
  const mapearStatus = (statusBanco) => {
    if (!statusBanco) return 'Outros'
    const s = statusBanco
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')

    if (s.includes('analise')) return 'Sob Análise'
    if (s.includes('proposta')) return 'Proposta Enviada'
    if (s.includes('fechado')) return 'Contratos Fechados'
    if (s.includes('rejeita')) return 'Rejeitados'
    if (s.includes('bono')) return 'Probono'

    return 'Outros'
  }

  const handleDrop = async (e, colunaDestinoID) => {
    e.preventDefault()
    if (!draggedItem) return

    // 1. Atualiza na TELA imediatamente (para você ver mudando)
    const contratosAtualizados = contratos.map((c) =>
      c.id === draggedItem.id ? { ...c, status: colunaDestinoID } : c
    )
    setContratos(contratosAtualizados)

    try {
      // 2. Atualiza no BANCO DE DADOS (Aqui que estava faltando na versão Mock)
      const { error } = await supabase
        .from('contratos')
        .update({ status: colunaDestinoID }) // Salva o nome novo e correto da coluna
        .eq('id', draggedItem.id)

      if (error) throw error

      // 3. Grava no Histórico
      await supabase.from('logs_sistema').insert([
        {
          categoria: 'Kanban',
          acao: 'Movimentação',
          detalhes: `"${
            draggedItem.clientes?.razao_social || 'Contrato'
          }" movido para "${colunaDestinoID}"`,
          referencia_id: draggedItem.id,
        },
      ])
    } catch (error) {
      console.error('Erro ao salvar no banco:', error)
      alert('Erro ao salvar alteração: ' + error.message) // Avisa se der erro
      fetchContratos() // Volta como estava
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
          <p className='text-gray-500'>
            Gestão visual e movimentação de contratos.
          </p>
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
          // Filtra os cards usando o mapeamento inteligente
          const itens = contratos.filter(
            (c) => mapearStatus(c.status) === coluna.id
          )
          const totalValor = itens.reduce(
            (acc, curr) => acc + (Number(curr.proposta_pro_labore) || 0),
            0
          )

          return (
            <div
              key={coluna.id}
              className='flex-shrink-0 w-80 flex flex-col bg-gray-50/50 rounded-xl border border-gray-200 h-full max-h-full'
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, coluna.id)}
            >
              <div
                className={`p-4 border-b border-gray-100 rounded-t-xl bg-white sticky top-0 z-10 shadow-sm border-t-4 ${coluna.border}`}
              >
                <div className='flex justify-between items-center mb-1'>
                  <h3 className='font-bold text-gray-700 flex items-center gap-2'>
                    <span
                      className={`w-3 h-3 rounded-full ${coluna.cor}`}
                    ></span>
                    {coluna.titulo}
                  </h3>
                  <span className='bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-bold'>
                    {itens.length}
                  </span>
                </div>
                {totalValor > 0 && (
                  <p className='text-xs text-gray-400 font-mono mt-1 ml-5'>
                    PL: {formatMoney(totalValor)}
                  </p>
                )}
              </div>

              <div className='flex-1 p-3 space-y-3 overflow-y-auto min-h-[100px]'>
                {itens.map((item) => (
                  <CardKanban
                    key={item.id}
                    item={item}
                    setDraggedItem={setDraggedItem}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Componente do Card
const CardKanban = ({ item, setDraggedItem }) => (
  <div
    draggable
    onDragStart={() => setDraggedItem(item)}
    className='bg-white p-4 rounded-lg border border-gray-200 shadow-sm cursor-move hover:shadow-md hover:border-blue-300 transition-all group relative'
  >
    <Link
      to={`/contratos/editar/${item.id}`}
      className='absolute top-3 right-3 text-gray-300 hover:text-blue-600'
    >
      <MoreHorizontal size={16} />
    </Link>

    <div className='flex items-start gap-3 mb-3 pr-6'>
      <div className='w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs shrink-0'>
        {item.clientes?.razao_social?.substring(0, 2).toUpperCase() || '?'}
      </div>
      <div className='overflow-hidden'>
        <h4
          className='font-bold text-sm text-gray-800 truncate'
          title={item.clientes?.razao_social}
        >
          {item.clientes?.razao_social || 'Cliente sem nome'}
        </h4>
        <p className='text-xs text-gray-500 truncate flex items-center gap-1'>
          <Briefcase size={10} />{' '}
          {item.parte_contraria || 'Sem parte contrária'}
        </p>
      </div>
    </div>

    <div className='space-y-1.5'>
      {item.proposta_pro_labore > 0 || item.proposta_exito_total > 0 ? (
        <div className='flex flex-wrap gap-2 text-xs'>
          {item.proposta_pro_labore > 0 && (
            <span className='bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100'>
              PL:{' '}
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(item.proposta_pro_labore)}
            </span>
          )}
          {item.proposta_exito_total > 0 && (
            <span className='bg-green-50 text-green-700 px-1.5 py-0.5 rounded border border-green-100'>
              Êxito:{' '}
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(item.proposta_exito_total)}
            </span>
          )}
        </div>
      ) : (
        <span className='text-xs text-gray-400 italic flex items-center gap-1'>
          <DollarSign size={10} /> Valores a definir
        </span>
      )}

      <div className='flex items-center justify-between pt-2 border-t border-gray-50 mt-2'>
        <span className='text-[10px] text-gray-400 flex items-center gap-1'>
          <Calendar size={10} />{' '}
          {new Date(item.created_at).toLocaleDateString('pt-BR')}
        </span>

        {/* Alerta de Assinatura */}
        {item.status.toLowerCase().includes('fechado') &&
          !item.contrato_assinado && (
            <span className='text-[10px] text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded flex items-center gap-1 font-bold'>
              <AlertCircle size={10} /> Assinar
            </span>
          )}
      </div>
    </div>
  </div>
)

export default Kanban
