import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  History,
} from 'lucide-react'

// --- FUNÇÕES DE MÁSCARA E FORMATAÇÃO (COPIE INTEGRALMENTE) ---
const formatCurrencyInput = (value) => {
  if (!value && value !== 0) return ''
  // Remove tudo que não é número
  let stringValue = value.toString().replace(/\D/g, '')
  // Se estiver vazio após remover letras, retorna vazio
  if (!stringValue) return ''
  // Converte para decimal
  const options = { minimumFractionDigits: 2 }
  const result = (Number(stringValue) / 100).toLocaleString('pt-BR', options)
  return result
}

const cleanCurrency = (val) => {
  if (!val) return 0
  if (typeof val === 'number') return val
  // Remove pontos de milhar e troca vírgula por ponto
  const cleaned = val.replace(/\./g, '').replace(',', '.')
  return parseFloat(cleaned) || 0
}

// --- COMPONENTE DE CAMPOS FINANCEIROS ---
const CamposFinanceiros = ({ values, onChange }) => {
  const handleMoneyChange = (e) => {
    const { name, value } = e.target
    // Aplica a máscara enquanto o usuário digita
    const formatted = formatCurrencyInput(value)
    onChange({
      target: {
        name,
        value: formatted,
      },
    })
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-lg border border-gray-200 mt-4'>
      <div className='md:col-span-3 font-semibold text-gray-700 border-b pb-2 mb-2'>
        Detalhamento da Proposta Financeira
      </div>
      <div>
        <label className='block text-xs font-medium text-gray-600 mb-1'>
          Pró-labore (R$)
        </label>
        <input
          type='text'
          name='proposta_pro_labore'
          value={values.proposta_pro_labore || ''}
          onChange={handleMoneyChange}
          className='w-full p-2 border rounded font-mono'
          placeholder='0,00'
        />
      </div>
      <div>
        <label className='block text-xs font-medium text-gray-600 mb-1'>
          Êxito Total (R$)
        </label>
        <input
          type='text'
          name='proposta_exito_total'
          value={values.proposta_exito_total || ''}
          onChange={handleMoneyChange}
          className='w-full p-2 border rounded font-mono'
          placeholder='0,00'
        />
      </div>
      <div>
        <label className='block text-xs font-medium text-gray-600 mb-1'>
          Êxito Percentual (%)
        </label>
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
        <label className='block text-xs font-medium text-gray-600 mb-1'>
          Fixo Mensal (R$)
        </label>
        <input
          type='text'
          name='proposta_fixo_mensal'
          value={values.proposta_fixo_mensal || ''}
          onChange={handleMoneyChange}
          className='w-full p-2 border rounded font-mono'
          placeholder='0,00'
        />
      </div>
      {values.proposta_fixo_mensal && values.proposta_fixo_mensal !== '0,00' && (
        <div className='animate-fade-in'>
          <label className='block text-xs font-medium text-blue-600 mb-1'>
            Em quantas vezes?
          </label>
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
        <label className='block text-xs font-medium text-gray-600 mb-1'>
          Observações da Proposta
        </label>
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

const EditarContrato = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    status: '',
    cnpj: '',
    razao_social: '',
    parte_contraria: '',
    responsavel_socio: '',
    data_prospect: '',
    analisado_por: '',
    obs_prospect: '',
    data_proposta: '',
    proposta_pro_labore: '',
    proposta_exito_total: '',
    proposta_exito_percentual: '',
    proposta_fixo_mensal: '',
    proposta_fixo_parcelas: '',
    proposta_obs: '',
    data_contrato: '',
    contrato_assinado: false,
    numero_hon: '',
    rejeitado_por: '',
    motivo_rejeicao_categoria: '',
    motivo_rejeicao: '',
    historico_negociacao: [],
  })

  const [processos, setProcessos] = useState([])

  useEffect(() => {
    const fetchContrato = async () => {
      try {
        const { data, error } = await supabase
          .from('contratos')
          .select(`*, clientes (cnpj, razao_social), processos (*)`)
          .eq('id', id)
          .single()

        if (error) throw error

        setFormData({
          ...data,
          cnpj: data.clientes?.cnpj || '',
          razao_social: data.clientes?.razao_social || '',
          // Formata os valores vindos do banco para a máscara da tela
          proposta_pro_labore: formatCurrencyInput(data.proposta_pro_labore * 100 || 0),
          proposta_exito_total: formatCurrencyInput(data.proposta_exito_total * 100 || 0),
          proposta_fixo_mensal: formatCurrencyInput(data.proposta_fixo_mensal * 100 || 0),
        })

        if (data.processos) {
          setProcessos(
            data.processos.map((p) => ({
              numero: p.numero_processo,
              tribunal: p.tribunal,
              juiz: p.juiz,
              valor_causa: formatCurrencyInput(p.valor_causa * 100 || 0),
            }))
          )
        }
      } catch (error) {
        console.error('Erro ao carregar:', error)
        navigate('/contratos')
      } finally {
        setLoading(false)
      }
    }
    fetchContrato()
  }, [id, navigate])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleProcessoChange = (index, field, value) => {
    const novos = [...processos]
    if (field === 'valor_causa') {
      novos[index][field] = formatCurrencyInput(value)
    } else {
      novos[index][field] = value
    }
    setProcessos(novos)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: antigo } = await supabase
        .from('contratos')
        .select('status')
        .eq('id', id)
        .single()

      // Limpa os valores formatados para enviar como número ao banco
      const payload = {
        ...formData,
        proposta_pro_labore: cleanCurrency(formData.proposta_pro_labore),
        proposta_exito_total: cleanCurrency(formData.proposta_exito_total),
        proposta_fixo_mensal: cleanCurrency(formData.proposta_fixo_mensal),
        proposta_fixo_parcelas: formData.proposta_fixo_parcelas || null,
        data_prospect: formData.data_prospect || null,
        data_proposta: formData.data_proposta || null,
        data_contrato: formData.data_contrato || null,
      }

      // Remove campos que não pertencem à tabela contratos diretamente
      delete payload.clientes
      delete payload.processos
      delete payload.cnpj
      delete payload.razao_social

      const { error: errContrato } = await supabase
        .from('contratos')
        .update(payload)
        .eq('id', id)

      if (errContrato) throw errContrato

      // Processos
      await supabase.from('processos').delete().eq('contrato_id', id)
      const processosParaSalvar = processos
        .filter((p) => p.numero)
        .map((p) => ({
          contrato_id: id,
          numero_processo: p.numero,
          tribunal: p.tribunal,
          juiz: p.juiz,
          valor_causa: cleanCurrency(p.valor_causa) || null,
        }))
      
      if (processosParaSalvar.length > 0) {
        await supabase.from('processos').insert(processosParaSalvar)
      }

      // Log
      await supabase.from('logs_sistema').insert([{
        categoria: 'Contrato',
        acao: antigo.status !== formData.status ? 'Mudança de Status' : 'Edição',
        detalhes: `Contrato de ${formData.razao_social} atualizado.`,
        referencia_id: id
      }])

      alert('Contrato atualizado com sucesso!')
      navigate('/contratos')
    } catch (error) {
      console.error(error)
      alert('Erro ao atualizar: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className='flex justify-center items-center h-screen'><Loader2 className='animate-spin' size={48} /></div>

  return (
    <div className='w-full max-w-5xl mx-auto space-y-6 pb-20'>
      <div className='flex items-center gap-4 mb-6'>
        <button onClick={() => navigate('/contratos')} className='p-2 hover:bg-gray-200 rounded-full'>
          <ArrowLeft size={24} className='text-gray-600' />
        </button>
        <div>
          <h1 className='text-2xl font-bold text-[#0F2C4C]'>Editar Contrato</h1>
          <p className='text-sm text-gray-500'>Editando caso de: {formData.razao_social}</p>
        </div>
      </div>

      <form onSubmit={handleUpdate} className='space-y-6'>
        {/* BLOCO 1 */}
        <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4'>
          <h2 className='font-semibold text-gray-700 border-b pb-2'>Informações Iniciais</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-600 mb-1'>Status Atual</label>
              <select name='status' value={formData.status} onChange={handleChange} className='w-full p-2.5 border rounded-lg font-bold text-[#0F2C4C]'>
                <option value='Sob Análise'>Sob Análise</option>
                <option value='Proposta Enviada'>Proposta Enviada</option>
                <option value='Contrato Fechado'>Contrato Fechado</option>
                <option value='Rejeitada'>Rejeitada</option>
                <option value='Probono'>Probono</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-600 mb-1'>Responsável</label>
              <input type='text' name='responsavel_socio' value={formData.responsavel_socio || ''} onChange={handleChange} className='w-full p-2.5 border rounded-lg' />
            </div>
          </div>
        </div>

        {/* BLOCO 2: Processos */}
        <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4'>
          <div className='flex justify-between items-center border-b pb-2'>
            <h2 className='font-semibold text-gray-700'>Processos Vinculados</h2>
            <button type='button' onClick={() => setProcessos([...processos, { numero: '', tribunal: '', juiz: '', valor_causa: '' }])} className='text-sm text-blue-600 flex items-center gap-1 hover:underline'>
              <Plus size={16} /> Adicionar Processo
            </button>
          </div>
          {processos.map((proc, index) => (
            <div key={index} className='grid grid-cols-1 md:grid-cols-4 gap-3 items-end bg-gray-50 p-3 rounded-lg border border-gray-200'>
              <input placeholder='Número' type='text' value={proc.numero || ''} onChange={(e) => handleProcessoChange(index, 'numero', e.target.value)} className='p-2 border rounded col-span-1' />
              <input placeholder='Tribunal' type='text' value={proc.tribunal || ''} onChange={(e) => handleProcessoChange(index, 'tribunal', e.target.value)} className='p-2 border rounded' />
              <input placeholder='Valor Causa' type='text' value={proc.valor_causa || ''} onChange={(e) => handleProcessoChange(index, 'valor_causa', e.target.value)} className='p-2 border rounded font-mono' />
              <button type='button' onClick={() => setProcessos(processos.filter((_, i) => i !== index))} className='text-red-500 hover:bg-red-50 p-2 rounded w-fit'><Trash2 size={18} /></button>
            </div>
          ))}
        </div>

        {/* BLOCO 3: Financeiro */}
        <div className='bg-blue-50 p-6 rounded-xl border border-blue-100'>
           {(formData.status === 'Proposta Enviada' || formData.status === 'Contrato Fechado') && (
             <CamposFinanceiros values={formData} onChange={handleChange} />
           )}
           {formData.status === 'Rejeitada' && (
             <p className='text-gray-500 italic text-sm'>Preencha os motivos da rejeição nos campos acima (em desenvolvimento).</p>
           )}
        </div>

        <div className='flex justify-end'>
          <button type='submit' disabled={saving} className='bg-[#0F2C4C] text-white px-8 py-3 rounded-lg hover:bg-blue-900 disabled:opacity-50 flex items-center gap-2'>
            <Save size={20} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditarContrato
