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

// --- COMPONENTE DE CAMPOS FINANCEIROS ---
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
            placeholder='Ex: 12'
          />
        </div>
      )}
      <div className='md:col-span-3'>
        <label className='block text-xs font-medium text-gray-600 mb-1'>Observações da Proposta</label>
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
    if (field === 'valor_causa') {
      novos[index][field] = aplicarMascaraMoeda(value)
    } else {
      novos[index][field] = value
    }
    setProcessos(novos)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Salva o Contrato
      const { data: contrato, error: errContrato } = await supabase
        .from('contratos')
        .insert([{
          cliente_id: formData.cliente_id,
          status: formData.status,
          responsavel_socio: formData.responsavel_socio,
          parte_contraria: formData.parte_contraria,
          proposta_pro_labore: removerMascaraMoeda(formData.proposta_pro_labore),
          proposta_exito_total: removerMascaraMoeda(formData.proposta_exito_total),
          proposta_exito_percentual: formData.proposta_exito_percentual || null,
          proposta_fixo_mensal: removerMascaraMoeda(formData.proposta_fixo_mensal),
          proposta_fixo_parcelas: formData.proposta_fixo_parcelas || null,
          proposta_obs: formData.proposta_obs,
        }])
        .select()
        .single()

      if (errContrato) throw errContrato

      // 2. Salva os Processos Vinculados
      const procsParaSalvar = processos
        .filter(p => p.numero)
        .map(p => ({
          contrato_id: contrato.id,
          numero_processo: p.numero,
          tribunal: p.tribunal,
          juiz: p.juiz,
          valor_causa: removerMascaraMoeda(p.valor_causa)
        }))

      if (procsParaSalvar.length > 0) {
        const { error: errProc } = await supabase.from('processos').insert(procsParaSalvar)
        if (errProc) throw errProc
      }

      // 3. Registra no Log do Sistema
      await supabase.from('logs_sistema').insert([{
        categoria: 'Contrato',
        acao: 'Criação',
        detalhes: `Novo contrato criado para o cliente ID: ${formData.cliente_id}`,
        referencia_id: contrato.id
      }])

      alert('Contrato cadastrado com sucesso!')
      navigate('/contratos')
    } catch (err) {
      console.error(err)
      alert('Erro ao salvar: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='w-full max-w-5xl mx-auto space-y-6 pb-20'>
      <div className='flex items-center gap-4 mb-6'>
        <button 
          onClick={() => navigate('/contratos')} 
          className='p-2 hover:bg-gray-200 rounded-full'
        >
          <ArrowLeft size={24} className='text-gray-600' />
        </button>
        <h1 className='text-2xl font-bold text-[#0F2C4C]'>Novo Contrato</h1>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Bloco 1: Cliente e Status */}
        <div className='bg-white p-6 rounded-xl border shadow-sm space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Cliente</label>
              <select 
                name='cliente_id' 
                required 
                value={formData.cliente_id} 
                onChange={handleChange} 
                className='w-full p-2.5 border rounded-lg'
              >
                <option value=''>Selecione um cliente...</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.razao_social}</option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Status Inicial</label>
              <select 
                name='status' 
                value={formData.status} 
                onChange={handleChange} 
                className='w-full p-2.5 border rounded-lg font-bold'
              >
                <option value='Sob Análise'>Sob Análise</option>
                <option value='Proposta Enviada'>Proposta Enviada</option>
                <option value='Contrato Fechado'>Contrato Fechado</option>
              </select>
            </div>
            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Sócio Responsável</label>
              <input 
                name='responsavel_socio' 
                value={formData.responsavel_socio} 
                onChange={handleChange} 
                className='w-full p-2.5 border rounded-lg'
                placeholder='Nome do sócio'
              />
            </div>
          </div>
        </div>

        {/* Bloco 2: Processos */}
        <div className='bg-white p-6 rounded-xl border shadow-sm space-y-4'>
          <h2 className='font-semibold border-b pb-2 text-gray-700'>Informações Jurídicas</h2>
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Parte Contrária</label>
            <input 
              name='parte_contraria' 
              value={formData.parte_contraria} 
              onChange={handleChange} 
              className='w-full p-2.5 border rounded-lg'
              placeholder='Ex: Banco X, Empresa Y...'
            />
          </div>
          
          <div className='flex justify-between items-center'>
            <h3 className='text-sm font-bold text-gray-600'>Processos</h3>
            <button 
              type='button' 
              onClick={() => setProcessos([...processos, { numero: '', tribunal: '', juiz: '', valor_causa: '' }])}
              className='text-xs text-blue-600 hover:underline'
            >
              + Adicionar Processo
            </button>
          </div>

          {processos.map((p, i) => (
            <div key={i} className='grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-50 p-3 rounded-lg border'>
              <input 
                placeholder='Nº Processo' 
                value={p.numero}
                onChange={e => handleProcessoChange(i, 'numero', e.target.value)} 
                className='p-2 border rounded' 
              />
              <input 
                placeholder='Tribunal' 
                value={p.tribunal}
                onChange={e => handleProcessoChange(i, 'tribunal', e.target.value)} 
                className='p-2 border rounded' 
              />
              <input 
                placeholder='Valor da Causa (R$)' 
                value={p.valor_causa}
                onChange={e => handleProcessoChange(i, 'valor_causa', e.target.value)} 
                className='p-2 border rounded font-mono' 
              />
            </div>
          ))}
        </div>

        {/* Bloco 3: Financeiro (Apenas se houver proposta ou contrato) */}
        {(formData.status === 'Proposta Enviada' || formData.status === 'Contrato Fechado') && (
          <div className='bg-blue-50 p-6 rounded-xl border border-blue-100'>
            <CamposFinanceiros values={formData} onChange={handleChange} />
          </div>
        )}

        <div className='pt-4'>
          <button 
            type='submit' 
            disabled={loading} 
            className='w-full bg-[#0F2C4C] text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-900 shadow-lg disabled:opacity-50 transition-all'
          >
            {loading ? 'Processando Cadastro...' : 'Cadastrar Novo Contrato'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default NovoContrato
