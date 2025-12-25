import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import {
  Save,
  ArrowLeft,
  Search,
  Plus,
  Trash2,
  AlertCircle,
  Upload,
  CheckCircle2
} from 'lucide-react'

// Componente de Campos Financeiros com Máscara e Lógica
const CamposFinanceiros = ({ values, onChange }) => {
  const handleKeyDown = (e) => {
    if (
      [46, 8, 9, 27, 13, 110, 190, 188].indexOf(e.keyCode) !== -1 ||
      (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
      (e.keyCode >= 35 && e.keyCode <= 40)
    ) {
      return
    }
    if (
      (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
      (e.keyCode < 96 || e.keyCode > 105)
    ) {
      e.preventDefault()
    }
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-lg border border-gray-200 mt-4'>
      <div className='md:col-span-3 font-semibold text-gray-700 border-b pb-2 mb-2 uppercase text-[10px] tracking-widest'>
        Detalhamento da Proposta Financeira
      </div>
      <div>
        <label className='block text-xs font-bold text-gray-600 mb-1 uppercase'>
          Pró-labore (R$)
        </label>
        <input
          type='number'
          step="0.01"
          name='proposta_pro_labore'
          value={values.proposta_pro_labore}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          className='w-full p-2 border rounded font-bold text-[#0F2C4C]'
          placeholder='0.00'
        />
      </div>
      <div>
        <label className='block text-xs font-bold text-gray-600 mb-1 uppercase'>
          Êxito Total (R$)
        </label>
        <input
          type='number'
          step="0.01"
          name='proposta_exito_total'
          value={values.proposta_exito_total}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          className='w-full p-2 border rounded font-bold text-[#0F2C4C]'
          placeholder='Valor fixo'
        />
      </div>
      <div>
        <label className='block text-xs font-bold text-gray-600 mb-1 uppercase'>
          Êxito Percentual (%)
        </label>
        <input
          type='number'
          name='proposta_exito_percentual'
          value={values.proposta_exito_percentual}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          className='w-full p-2 border rounded font-bold'
          placeholder='%'
        />
      </div>
      <div>
        <label className='block text-xs font-bold text-gray-600 mb-1 uppercase'>
          Fixo Mensal (R$)
        </label>
        <input
          type='number'
          step="0.01"
          name='proposta_fixo_mensal'
          value={values.proposta_fixo_mensal}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          className='w-full p-2 border rounded font-bold text-blue-600'
          placeholder='Manutenção'
        />
      </div>
      {values.proposta_fixo_mensal && values.proposta_fixo_mensal > 0 && (
        <div className='animate-fade-in'>
          <label className='block text-xs font-bold text-blue-600 mb-1 uppercase'>
            Parcelas
          </label>
          <input
            type='number'
            name='proposta_fixo_parcelas'
            value={values.proposta_fixo_parcelas}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            className='w-full p-2 border border-blue-300 rounded bg-blue-50 font-bold'
            placeholder='Ex: 12'
          />
        </div>
      )}
      <div className='md:col-span-3'>
        <label className='block text-xs font-bold text-gray-600 mb-1 uppercase'>
          Descrição do Contrato (HON)
        </label>
        <input
          type='text'
          name='proposta_obs'
          value={values.proposta_obs}
          onChange={onChange}
          className='w-full p-2 border rounded'
          placeholder='Detalhes do contrato...'
        />
      </div>
    </div>
  )
}

const NovoContrato = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [pdfUrl, setPdfUrl] = useState(null)

  const [formData, setFormData] = useState({
    status: 'Sob Análise',
    cnpj: '',
    razao_social: '',
    parte_contraria: '',
    responsavel_socio: '',
    data_prospect: '',
    analisado_por: '',
    obs_prospect: '',
    data_proposta: '',
    proposta_honorario_fixo: '',
    proposta_pro_labore: '',
    proposta_exito_total: '',
    proposta_exito_percentual: '',
    proposta_fixo_mensal: '',
    proposta_fixo_parcelas: '',
    proposta_obs: '', // Será salvo como descricao_contrato
    observacoes_gerais: '', 
    data_contrato: '',
    contrato_assinado: false,
    numero_hon: '',
    rejeitado_por: '',
    motivo_rejeicao_categoria: '',
    motivo_rejeicao: '',
    historico_negociacao: [],
  })

  const [processos, setProcessos] = useState([
    { numero: '', tribunal: '', juiz: '', valor_causa: '' },
  ])

  const toTitleCase = (str) => {
    if (!str) return ''
    const exceptions = ['de', 'da', 'do', 'das', 'dos', 'e', 'em']
    return str
      .toLowerCase()
      .split(' ')
      .map((word, index) => {
        if (index === 0 || !exceptions.includes(word)) {
          return word.charAt(0).toUpperCase() + word.slice(1)
        }
        return word
      })
      .join(' ')
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileName = `ged_${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('contratos_ged')
        .upload(fileName, file);

      if (error) throw error;
      const { data: urlData } = supabase.storage.from('contratos_ged').getPublicUrl(fileName);
      setPdfUrl(urlData.publicUrl);
    } catch (error) {
      alert('Erro upload PDF: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const buscarCNPJ = async () => {
    const cnpjLimpo = formData.cnpj.replace(/\D/g, '')
    if (cnpjLimpo.length !== 14) return alert('CNPJ inválido!')

    try {
      setLoading(true)
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`)
      if (!response.ok) throw new Error('CNPJ não encontrado')
      const data = await response.json()
      setFormData((prev) => ({ ...prev, razao_social: toTitleCase(data.razao_social) }))
    } catch (error) {
      alert('Erro: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const addProcesso = () => {
    setProcessos([...processos, { numero: '', tribunal: '', juiz: '', valor_causa: '' }])
  }

  const removeProcesso = (index) => {
    setProcessos(processos.filter((_, i) => i !== index))
  }

  const handleProcessoChange = (index, field, value) => {
    const novosProcessos = [...processos]
    novosProcessos[index][field] = value
    setProcessos(novosProcessos)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let clienteId
      const { data: clienteExistente } = await supabase
        .from('clientes')
        .select('id')
        .eq('cnpj', formData.cnpj)
        .single()

      if (clienteExistente) {
        clienteId = clienteExistente.id
      } else {
        const { data: novoCliente, error: errCliente } = await supabase
          .from('clientes')
          .insert([{ cnpj: formData.cnpj, razao_social: formData.razao_social }])
          .select().single()
        if (errCliente) throw errCliente
        clienteId = novoCliente.id
      }

      const { data: novoContrato, error: errContrato } = await supabase
        .from('contratos')
        .insert([
          {
            cliente_id: clienteId,
            status: formData.status,
            parte_contraria: formData.parte_contraria,
            responsavel_socio: formData.responsavel_socio,
            data_prospect: formData.data_prospect || null,
            analisado_por: formData.analisado_por,
            obs_prospect: formData.obs_prospect,
            data_proposta: formData.data_proposta || null,
            proposta_pro_labore: formData.proposta_pro_labore || null,
            proposta_exito_total: formData.proposta_exito_total || null,
            proposta_exito_percentual: formData.proposta_exito_percentual || null,
            proposta_fixo_mensal: formData.proposta_fixo_mensal || null,
            proposta_fixo_parcelas: formData.proposta_fixo_parcelas || null,
            descricao_contrato: formData.proposta_obs, // Mapeado para o novo campo GED
            observacoes_gerais: formData.observacoes_gerais,
            arquivo_pdf_url: pdfUrl,
            data_vinculo_pdf: pdfUrl ? new Date().toISOString() : null,
            data_contrato: formData.data_contrato || null,
            contrato_assinado: formData.contrato_assinado,
            numero_hon: formData.numero_hon,
            rejeitado_por: formData.rejeitado_por || null,
            motivo_rejeicao_categoria: formData.motivo_rejeicao_categoria || null,
            motivo_rejeicao: formData.motivo_rejeicao,
          },
        ])
        .select().single()

      if (errContrato) throw errContrato

      alert('Caso registrado com sucesso!')
      navigate('/contratos')
    } catch (error) {
      alert('Erro: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='w-full max-w-5xl mx-auto space-y-6 pb-20'>
      <div className='flex items-center gap-4 mb-6 pt-10 md:pt-0'>
        <button onClick={() => navigate('/contratos')} className='p-2 hover:bg-gray-200 rounded-full'>
          <ArrowLeft size={24} className='text-gray-600' />
        </button>
        <h1 className='text-2xl font-black text-[#0F2C4C] uppercase tracking-tighter'>
          Abertura de Novo Caso Jurídico
        </h1>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* BLOCO 1: STATUS E CLIENTE */}
        <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4'>
          <h2 className='font-black text-[10px] text-blue-600 uppercase tracking-[0.2em] border-b pb-2'>
            1. Triagem e Identificação
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-xs font-black text-gray-400 uppercase mb-1 ml-1'>Status Atual</label>
              <select
                name='status'
                value={formData.status}
                onChange={handleChange}
                className='w-full p-3 border-2 border-gray-100 rounded-xl focus:border-[#0F2C4C] font-black text-[#0F2C4C] outline-none'
              >
                <option value='Sob Análise'>Sob Análise</option>
                <option value='Proposta Enviada'>Proposta Enviada</option>
                <option value='Contrato Fechado'>Contrato Fechado</option>
                <option value='Rejeitada'>Rejeitada</option>
                <option value='Probono'>Probono</option>
              </select>
            </div>
            <div>
              <label className='block text-xs font-black text-gray-400 uppercase mb-1 ml-1'>CNPJ do Cliente</label>
              <div className='flex gap-2'>
                <input
                  type='text'
                  name='cnpj'
                  value={formData.cnpj}
                  onChange={handleChange}
                  className='flex-1 p-3 border-2 border-gray-100 rounded-xl font-bold'
                  placeholder='00.000.000/0000-00'
                />
                <button type='button' onClick={buscarCNPJ} className='bg-[#0F2C4C] text-white p-3 rounded-xl hover:bg-blue-900'>
                  <Search size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BLOCO CONDICIONAL: GED / PDF */}
        {formData.status === 'Contrato Fechado' && (
          <div className='bg-emerald-50 p-6 rounded-xl border border-emerald-100 space-y-4 animate-in fade-in duration-500'>
            <h2 className='font-black text-[10px] text-emerald-700 uppercase tracking-[0.2em] border-b border-emerald-200 pb-2'>
              Módulo GED: Vínculo de Documento
            </h2>
            <div className="flex items-center gap-4">
              <label className="flex-1 cursor-pointer bg-white border-2 border-dashed border-emerald-300 p-4 rounded-2xl flex flex-col items-center justify-center hover:bg-emerald-100 transition-all">
                <Upload size={24} className="text-emerald-500 mb-2" />
                <span className="text-xs font-black text-emerald-800 uppercase">
                  {pdfUrl ? 'PDF Selecionado!' : 'Clique para anexar o Contrato em PDF'}
                </span>
                <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
              </label>
              {pdfUrl && (
                <div className="text-emerald-600 flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 size={24} /> Documento Vinculado
                </div>
              )}
            </div>
          </div>
        )}

        <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4'>
           <CamposFinanceiros values={formData} onChange={handleChange} />
        </div>

        <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4'>
          <h2 className='font-black text-[10px] text-gray-400 uppercase tracking-[0.2em] border-b pb-2'>Observações Gerais</h2>
          <textarea 
            name="observacoes_gerais" 
            className="w-full p-4 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#0F2C4C] text-sm"
            rows="3"
            value={formData.observacoes_gerais}
            onChange={handleChange}
            placeholder="Observações internas do escritório..."
          />
        </div>

        <div className='flex justify-end gap-4 pt-4'>
          <button type='button' onClick={() => navigate('/contratos')} className='px-8 py-3 font-bold text-gray-400 uppercase text-xs'>Cancelar</button>
          <button
            type='submit'
            disabled={loading || uploading}
            className='flex items-center gap-2 bg-[#0F2C4C] text-white px-10 py-4 rounded-2xl font-black uppercase text-xs hover:bg-blue-900 transition-all shadow-xl disabled:opacity-50'
          >
            <Save size={20} /> {loading ? 'Sincronizando...' : 'Finalizar Registro'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default NovoContrato
