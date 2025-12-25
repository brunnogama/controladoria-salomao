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

// --- 1. FUNÇÕES DE MÁSCARA (NÃO ALTERAR) ---
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

// --- 2. COMPONENTE DE CAMPOS FINANCEIROS (CORRIGIDO) ---
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
        />
      </div>
    </div>
  )
}

// --- 3. PÁGINA PRINCIPAL ---
const EditarContrato = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [processos, setProcessos] = useState([])
  const [formData, setFormData] = useState({
    status: '', cnpj: '', razao_social: '', parte_contraria: '', responsavel_socio: '',
    data_prospect: '', analisado_por: '', obs_prospect: '', data_proposta: '',
    proposta_pro_labore: '', proposta_exito_total: '', proposta_exito_percentual: '',
    proposta_fixo_mensal: '', proposta_fixo_parcelas: '', proposta_obs: '',
    data_contrato: '', contrato_assinado: false, numero_hon: '',
    rejeitado_por: '', motivo_rejeicao_categoria: '', motivo_rejeicao: '',
    historico_negociacao: [],
  })

  useEffect(() => {
    const carregarDados = async () => {
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
          proposta_pro_labore: aplicarMascaraMoeda(data.proposta_pro_labore * 100 || 0),
          proposta_exito_total: aplicarMascaraMoeda(data.proposta_exito_total * 100 || 0),
          proposta_fixo_mensal: aplicarMascaraMoeda(data.proposta_fixo_mensal * 100 || 0),
        })

        if (data.processos) {
          setProcessos(data.processos.map(p => ({
            numero: p.numero_processo,
            tribunal: p.tribunal,
            juiz: p.juiz,
            valor_causa: aplicarMascaraMoeda(p.valor_causa * 100 || 0)
          })))
        }
      } catch (err) {
        console.error(err)
        navigate('/contratos')
      } finally {
        setLoading(false)
      }
    }
    carregarDados()
  }, [id, navigate])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...formData,
        proposta_pro_labore: removerMascaraMoeda(formData.proposta_pro_labore),
        proposta_exito_total: removerMascaraMoeda(formData.proposta_exito_total),
        proposta_fixo_mensal: removerMascaraMoeda(formData.proposta_fixo_mensal),
      }
      delete payload.clientes; delete payload.processos; delete payload.cnpj; delete payload.razao_social;

      const { error } = await supabase.from('contratos').update(payload).eq('id', id)
      if (error) throw error

      alert('Salvo com sucesso!')
      navigate('/contratos')
    } catch (err) {
      alert('Erro: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className='flex justify-center items-center h-screen'><Loader2 className='animate-spin' size={48} /></div>

  return (
    <div className='w-full max-w-5xl mx-auto space-y-6 pb-20'>
      <div className='flex items-center gap-4 mb-6'>
        <button onClick={() => navigate('/contratos')} className='p-2 hover:bg-gray-200 rounded-full'><ArrowLeft size={24} /></button>
        <h1 className='text-2xl font-bold text-[#0F2C4C]'>Editar Contrato: {formData.razao_social}</h1>
      </div>

      <form onSubmit={handleUpdate} className='space-y-6'>
        <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-600 mb-1'>Status</label>
              <select name='status' value={formData.status} onChange={handleChange} className='w-full p-2.5 border rounded-lg font-bold text-[#0F2C4C]'>
                <option value='Sob Análise'>Sob Análise</option>
                <option value='Proposta Enviada'>Proposta Enviada</option>
                <option value='Contrato Fechado'>Contrato Fechado</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-600 mb-1'>Responsável</label>
              <input type='text' name='responsavel_socio' value={formData.responsavel_socio || ''} onChange={handleChange} className='w-full p-2.5 border rounded-lg' />
            </div>
        </div>

        {(formData.status === 'Proposta Enviada' || formData.status === 'Contrato Fechado') && (
          <div className='bg-blue-50 p-6 rounded-xl border border-blue-100'>
            <CamposFinanceiros values={formData} onChange={handleChange} />
          </div>
        )}

        <div className='flex justify-end'>
          <button type='submit' disabled={saving} className='bg-[#0F2C4C] text-white px-8 py-3 rounded-lg flex items-center gap-2'>
            <Save size={20} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditarContrato
