import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { Save, ArrowLeft, Plus, Trash2, Loader2, History } from 'lucide-react'

// --- FUNÇÕES DE MASCARA ---
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

// --- COMPONENTE LOCAL (O segredo está aqui) ---
const CamposFinanceiros = ({ values, onChange }) => {
  const tratarMudancaMoeda = (e) => {
    const { name, value } = e.target
    onChange({ target: { name, value: aplicarMascaraMoeda(value) } })
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-lg border border-gray-200 mt-4'>
      <div className='md:col-span-3 font-semibold text-gray-700 border-b pb-2 mb-2'>
        Detalhamento da Proposta Financeira
      </div>
      <div>
        <label className='block text-xs font-medium text-gray-600 mb-1'>Pró-labore (R$)</label>
        <input type='text' name='proposta_pro_labore' value={values.proposta_pro_labore || ''} onChange={tratarMudancaMoeda} className='w-full p-2 border rounded font-mono' placeholder='0,00' />
      </div>
      <div>
        <label className='block text-xs font-medium text-gray-600 mb-1'>Êxito Total (R$)</label>
        <input type='text' name='proposta_exito_total' value={values.proposta_exito_total || ''} onChange={tratarMudancaMoeda} className='w-full p-2 border rounded font-mono' placeholder='0,00' />
      </div>
      <div>
        <label className='block text-xs font-medium text-gray-600 mb-1'>Fixo Mensal (R$)</label>
        <input type='text' name='proposta_fixo_mensal' value={values.proposta_fixo_mensal || ''} onChange={tratarMudancaMoeda} className='w-full p-2 border rounded font-mono' placeholder='0,00' />
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
    status: '', proposta_pro_labore: '', proposta_exito_total: '', proposta_fixo_mensal: '',
  })

  useEffect(() => {
    const carregar = async () => {
      const { data } = await supabase.from('contratos').select(`*, clientes(razao_social)`).eq('id', id).single()
      if (data) {
        setFormData({
          ...data,
          razao_social: data.clientes?.razao_social,
          proposta_pro_labore: aplicarMascaraMoeda(data.proposta_pro_labore * 100 || 0),
          proposta_exito_total: aplicarMascaraMoeda(data.proposta_exito_total * 100 || 0),
          proposta_fixo_mensal: aplicarMascaraMoeda(data.proposta_fixo_mensal * 100 || 0),
        })
      }
      setLoading(false)
    }
    carregar()
  }, [id])

  const handleUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...formData,
      proposta_pro_labore: removerMascaraMoeda(formData.proposta_pro_labore),
      proposta_exito_total: removerMascaraMoeda(formData.proposta_exito_total),
      proposta_fixo_mensal: removerMascaraMoeda(formData.proposta_fixo_mensal),
    }
    delete payload.clientes; delete payload.razao_social
    await supabase.from('contratos').update(payload).eq('id', id)
    navigate('/contratos')
  }

  if (loading) return <div className='p-10 text-center'>Carregando...</div>

  return (
    <div className='w-full max-w-5xl mx-auto p-6 space-y-6'>
      <div className='flex items-center gap-4'>
        <button onClick={() => navigate('/contratos')}><ArrowLeft /></button>
        <h1 className='text-2xl font-bold'>Editar: {formData.razao_social}</h1>
      </div>
      <form onSubmit={handleUpdate} className='space-y-6'>
        <div className='bg-white p-6 rounded-xl border'>
          <label className='block text-sm font-medium mb-1'>Status</label>
          <select name='status' value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className='w-full p-2 border rounded font-bold'>
            <option value='Sob Análise'>Sob Análise</option>
            <option value='Proposta Enviada'>Proposta Enviada</option>
            <option value='Contrato Fechado'>Contrato Fechado</option>
          </select>
        </div>
        {(formData.status === 'Proposta Enviada' || formData.status === 'Contrato Fechado') && (
          <CamposFinanceiros values={formData} onChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})} />
        )}
        <button type='submit' className='bg-[#0F2C4C] text-white px-6 py-2 rounded' disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </form>
    </div>
  )
}

export default EditarContrato
