import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
} from 'lucide-react'

// --- FUNÇÕES DE MÁSCARA E FORMATAÇÃO ---
const aplicarMascaraMoeda = (valor) => {
  if (!valor && valor !== 0) return ''
  const apenasNumeros = valor.toString().replace(/\D/g, '')
  if (!apenasNumeros) return ''
  const valorDecimal = (Number(apenasNumeros) / 100).toFixed(2)
  return valorDecimal.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

const removerMascaraMoeda = (valor) => {
  if (!valor) return 0
  if (typeof valor === 'number') return valor
  const formatado = valor.replace(/\./g, '').replace(',', '.')
  return parseFloat(formatado) || 0
}

const CamposFinanceiros = ({ values, onChange }) => {
  const tratarMudancaMoeda = (e) => {
    const { name, value } = e.target
    const valorComMascara = aplicarMascaraMoeda(value)
    onChange({
      target: { name, value: valorComMascara }
    })
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-lg border border-gray-200 mt-4'>
      <div className='md:col-span-3 font-semibold text-gray-700 border-b pb-2 mb-2'>
        Detalhamento da Proposta Financeira
      </div>
      <div>
        <label className='block text-xs font-medium text-gray-600 mb-1'>Pró-labore (R$)</label>
        <input
          type='text'
          name='proposta_pro_labore'
          value={values.proposta_pro_labore || ''}
          onChange={tratarMudancaMoeda}
          className='w-full p-2 border rounded font-mono'
          placeholder='0,00'
        />
      </div>
      <div>
        <label className='block text-xs font-medium text-gray-600 mb-1'>Êxito Total (R$)</label>
        <input
          type='text'
          name='proposta_exito_total'
          value={values.proposta_exito_total || ''}
          onChange={tratarMudancaMoeda}
          className='w-full p-2 border rounded font-mono'
          placeholder='0,00'
        />
      </div>
      <div>
        <label className='block text-xs font-medium text-gray-600 mb-1'>Êxito (%)</label>
        <input
          type='number'
          name='proposta_exito_percentual'
          value={values.proposta_exito_percentual || ''}
          onChange={onChange}
          className='w-full p-2 border rounded'
          placeholder='%'
        />
      </div>
      <div>
        <label className='block text-xs font-medium text-gray-600 mb-1'>Fixo Mensal (R$)</label>
        <input
          type='text'
          name='proposta_fixo_mensal'
          value={values.proposta_fixo_mensal || ''}
          onChange={tratarMudancaMoeda}
          className='w-full p-2 border rounded font-mono'
          placeholder='0,00' 
        />
      </div>
      {values.proposta_fixo_mensal && values.proposta_fixo_mensal !== '0,00' && (
        <div>
          <label className='block text-xs font-medium text-blue-600 mb-1'>Parcelas</label>
          <input
            type='number'
            name='proposta_fixo_parcelas'
            value={values.proposta_fixo_parcelas || ''}
            onChange={onChange}
            className='w-full p-2 border border-blue-300 rounded bg-blue-50'
          />
        </div>
      )}
      <div className='md:col-span-3'>
        <label className='block text-xs font-medium text-gray-600 mb-1'>Observações</label>
        <input
          type='text'
          name='proposta_obs'
          value={values.proposta_obs || ''}
          onChange={onChange}
          className='w-full p-2 border rounded'
          placeholder='Detalhes de pagamento...'
        />
      </div>
    </div>
  )
}

const NovoContrato = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [clientes, setClientes] = useState([])
  const [processos, setProcessos] = useState([{ numero: '', tribunal: '', juiz: '', valor_causa: '' }])
  
  const [formData, setFormData] = useState({
    cliente_id: '',
    status: 'Sob Análise',
    responsavel_socio: '',
    parte_contraria: '',
    proposta_pro_labore: '',
    proposta_exito_total: '',
    proposta_exito_percentual: '',
    proposta_fixo_mensal: '',
    proposta_fixo_parcelas: '',
    proposta_obs: '',
  })

  useEffect(() => {
    const fetchClientes = async () => {
      const { data } = await supabase.from('clientes').select('id, razao_social').order('razao_social')
      setClientes(data || [])
    }
    fetchClientes()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleProcessoChange = (index, field, value) => {
    const novos = [...processos]
    novos[index][field] = field === 'valor_causa' ? aplicarMascaraMoeda(value) : value
    setProcessos(novos)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Salva Contrato
      const { data: contrato, error: errContrato } = await supabase
        .from('contratos')
        .insert([{
          ...formData,
          proposta_pro_labore: removerMascaraMoeda(formData.proposta_pro_labore),
          proposta_exito_total: removerMascaraMoeda(formData.proposta_exito_total),
          proposta_fixo_mensal: removerMascaraMoeda(formData.proposta_fixo_mensal),
        }])
        .select()
        .single()

      if (errContrato) throw errContrato

      // Salva Processos
      const procs = processos.filter(p => p.numero).map(p => ({
        contrato_id: contrato.id,
        numero_processo: p.numero,
        tribunal: p.tribunal,
        juiz: p.juiz,
        valor_causa: removerMascaraMoeda(p.valor_causa)
      }))

      if (procs.length > 0) await supabase.from('processos').insert(procs)

      // Log
      await supabase.from('logs_sistema').insert([{
        categoria: 'Contrato',
        acao: 'Criação',
        detalhes: `Novo contrato criado para ID de cliente: ${formData.cliente_id}`,
        referencia_id: contrato.id
      }])

      alert('Contrato criado com sucesso!')
      navigate('/contratos')
    } catch (err) {
      alert('Erro: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='w-full max-w-5xl mx-auto space-y-6 pb-20'>
      <div className='flex items-center gap-4 mb-6'>
        <button onClick={() => navigate('/contratos')} className='p-2 hover:bg-gray-200 rounded-full'><ArrowLeft size={24} /></button>
        <h1 className='text-2xl font-bold text-[#0F2C4C]'>Novo Contrato</h1>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='bg-white p-6 rounded-xl border shadow-sm space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Cliente</label>
              <select name='cliente_id' required value={formData.cliente_id} onChange={handleChange} className='w-full p-2.5 border rounded-lg'>
                <option value=''>Selecione um cliente...</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.razao_social}</option>)}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Status Inicial</label>
              <select name='status' value={formData.status} onChange={handleChange} className='w-full p-2.5 border rounded-lg font-bold'>
                <option value='Sob Análise'>Sob Análise</option>
                <option value='Proposta Enviada'>Proposta Enviada</option>
                <option value='Contrato Fechado'>Contrato Fechado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Processos */}
        <div className='bg-white p-6 rounded-xl border shadow-sm space-y-4'>
          <h2 className='font-semibold border-b pb-2'>Dados do Processo</h2>
          <input name='parte_contraria' placeholder='Parte Contrária' onChange={handleChange} className='w-full p-2 border rounded' />
          {processos.map((p, i) => (
            <div key={i} className='grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-50 p-3 rounded'>
              <input placeholder='Nº Processo' onChange={e => handleProcessoChange(i, 'numero', e.target.value)} className='p-2 border rounded' />
              <input placeholder='Tribunal' onChange={e => handleProcessoChange(i, 'tribunal', e.target.value)} className='p-2 border rounded' />
              <input placeholder='Valor Causa' onChange={e => handleProcessoChange(i, 'valor_causa', e.target.value)} className='p-2 border rounded font-mono' />
            </div>
          ))}
        </div>

        {/* Financeiro */}
        {(formData.status === 'Proposta Enviada' || formData.status === 'Contrato Fechado') && (
          <div className='bg-blue-50 p-6 rounded-xl border border-blue-100'>
            <CamposFinanceiros values={formData} onChange={handleChange} />
          </div>
        )}

        <button type='submit' disabled={loading} className='w-full bg-[#0F2C4C] text-white py-3 rounded-lg font-bold disabled:opacity-50'>
          {loading ? 'Criando...' : 'Cadastrar Contrato'}
        </button>
      </form>
    </div>
  )
}

export default NovoContrato
