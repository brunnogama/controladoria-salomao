import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import {
  History,
  FileText,
  User,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

const Historico = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('logs_sistema')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50) // Pega os últimos 50 eventos

      if (error) throw error
      setLogs(data || [])
    } catch (error) {
      console.error('Erro ao buscar logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (categoria, acao) => {
    if (acao === 'Mudança de Status')
      return <ArrowRight className='text-blue-500' />
    if (categoria === 'Cliente') return <User className='text-purple-500' />
    if (acao === 'Criação') return <CheckCircle2 className='text-green-500' />
    return <FileText className='text-gray-500' />
  }

  return (
    <div className='w-full space-y-6'>
      <div className='flex items-center gap-3'>
        <div className='bg-[#0F2C4C] p-2 rounded-lg text-white'>
          <History size={24} />
        </div>
        <div>
          <h1 className='text-3xl font-bold text-[#0F2C4C]'>
            Histórico de Atividades
          </h1>
          <p className='text-gray-500'>
            Linha do tempo das operações do escritório.
          </p>
        </div>
      </div>

      <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
        {loading ? (
          <div className='p-10 text-center text-gray-500'>
            Carregando histórico...
          </div>
        ) : logs.length === 0 ? (
          <div className='p-16 flex flex-col items-center justify-center text-gray-400'>
            <Clock size={48} className='mb-4 opacity-20' />
            <p>Nenhuma atividade registrada ainda.</p>
            <p className='text-xs mt-2'>
              As ações aparecerão aqui conforme você usar o sistema.
            </p>
          </div>
        ) : (
          <div className='divide-y divide-gray-100'>
            {logs.map((log) => (
              <div
                key={log.id}
                className='p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors'
              >
                <div className='mt-1 p-2 bg-gray-50 rounded-full border border-gray-200'>
                  {getIcon(log.categoria, log.acao)}
                </div>

                <div className='flex-1'>
                  <div className='flex justify-between items-start'>
                    <h4 className='font-bold text-gray-800 text-sm'>
                      {log.acao}
                    </h4>
                    <span className='text-xs text-gray-400 whitespace-nowrap'>
                      {new Date(log.created_at).toLocaleString('pt-BR')}
                    </span>
                  </div>

                  <p className='text-sm text-gray-600 mt-1'>{log.detalhes}</p>

                  <div className='mt-2 flex gap-2'>
                    <span className='text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-gray-100 text-gray-500 rounded'>
                      {log.categoria}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Historico
