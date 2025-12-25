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
  CheckCircle2,
  Loader2
} from 'lucide-react'

// Componente de Campos Financeiros (Extraído)
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
      <div className='md:col-span-3 font-semibold text-gray-700 border-b pb-2 mb-2'>
        Detalhamento da Proposta Financeira
      </div>
      <div>
        <label className='block text-xs font-medium text-gray-600 mb-1'>
          Pró-labore (R$)
        </label>
        <input
          type='number'
          step="0.01"
          name='proposta_pro_labore'
          value={values.proposta_pro_labore}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          className='w-full p-2 border rounded'
          placeholder='0,00'
        />
      </div>
      <div>
        <label className='block text-xs font-medium text-gray-600 mb-1'>
          Êxito Total (R$)
        </label>
        <input
          type='number'
          step="0.01"
          name='proposta_exito_total'
          value={values.proposta_exito_total}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          className='w-full p-2 border rounded'
          placeholder='Valor fixo'
        />
      </div>
      <div>
        <label className='block text-xs font-medium text-gray-600 mb-1'>
          Êxito Percentual (%)
        </label>
        <input
          type='number'
          name='proposta_exito_percentual'
          value={values.proposta_exito_percentual}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          className='w-full p-2 border rounded'
          placeholder='%'
        />
      </div>
      <div>
        <label className='block text-xs font-medium text-gray-600 mb-1'>
          Fixo Mensal (R$)
        </label>
        <input
          type='number'
          step="0.01"
          name='proposta_fixo_mensal'
          value={values.proposta_fixo_mensal}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          className='w-full p-2 border rounded'
          placeholder='Manutenção'
        />
      </div>
      {values.proposta_fixo_mensal && values.proposta_fixo_mensal > 0 && (
        <div className='animate-fade-in'>
          <label className='block text-xs font-medium text-blue-600 mb-1'>
            Em quantas vezes?
          </label>
          <input
            type='number'
            name='proposta_fixo_parcelas'
            value={values.proposta_fixo_parcelas}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            className='w-full p-2 border border-blue-300 rounded bg-blue-50'
            placeholder='Ex: 12'
          />
        </div>
      )}
      <div className='md:col-span-3'>
        <label className='block text-xs font-medium text-gray-600 mb-1'>
          Descrição do Contrato (HON)
        </label>
        <input
          type='text'
          name='proposta_obs'
          value={values.proposta_obs}
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
    proposta_obs: '',
    data_contrato: '',
    contrato_assinado: false,
    numero_hon: '',
    rejeitado_por: '',
    motivo_rejeicao_categoria: '',
    motivo_rejeicao: '',
    observacoes_gerais: '',
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
      const fileName = `ged_${Date.now()}_${file.name.replace(/\s/g, '_')}`;
      const { data, error } = await supabase.storage
        .from('contratos_ged')
        .upload(fileName, file);

      if (error) throw error;
      const { data: urlData } = supabase.storage.from('contratos_ged').getPublicUrl(fileName);
      setPdfUrl(urlData.publicUrl);
    } catch (error) {
      alert('Erro no Upload: Verifique as políticas RLS do Bucket no Supabase. ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const buscarCNPJ = async () => {
    const cnpjLimpo = formData.cnpj.replace(/\D/g, '')
    if (cnpjLimpo.length !== 14) return alert('CNPJ inválido!')

    try {
      setLoading(true)
      const response = await fetch(
        `https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`
      )
      if (!response.ok) throw new Error('CNPJ não encontrado')

      const data = await response.json()
      setFormData((prev) => ({
        ...prev,
        razao_social: toTitleCase(data.razao_social),
      }))
    } catch (error) {
      alert('Erro ao buscar empresa: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const addProcesso = () => {
    setProcessos([
      ...processos,
      { numero: '', tribunal: '', juiz: '', valor_causa: '' },
    ])
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
      // 1. Lógica Inteligente de Clientes
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
          .insert([
            {
              cnpj: formData.cnpj,
              razao_social: formData.razao_social,
              observacoes: 'Criado automaticamente via Novo Contrato',
            },
          ])
          .select()
          .single()

        if (errCliente) throw errCliente
        clienteId = novoCliente.id
      }

      // 2. Salva o Contrato
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
            proposta_exito_percentual:
              formData.proposta_exito_percentual || null,
            proposta_fixo_mensal: formData.proposta_fixo_mensal || null,
            proposta_fixo_parcelas: formData.proposta_fixo_parcelas || null,
            descricao_contrato: formData.proposta_obs, // Mapeado para o GED
            observacoes_gerais: formData.observacoes_gerais,
            arquivo_pdf_url: pdfUrl,
            data_vinculo_pdf: pdfUrl ? new Date().toISOString() : null,
            data_contrato: formData.data_contrato || null,
            contrato_assinado: formData.contrato_assinado,
            numero_hon: formData.numero_hon,
            rejeitado_por: formData.rejeitado_por || null,
            motivo_rejeicao_categoria:
              formData.motivo_rejeicao_categoria || null,
            motivo_rejeicao: formData.motivo_rejeicao,
            historico_negociacao: [],
          },
        ])
        .select()
        .single()

      if (errContrato) throw errContrato

      alert('Contrato salvo com sucesso!')
      navigate('/contratos')
    } catch (error) {
      console.error(error)
      alert('Erro ao salvar: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='w-full max-w-5xl mx-auto space-y-6 pb-20'>
      <div className='flex items-center gap-4 mb-6 pt-10 md:pt-0'>
        <button
          onClick={() => navigate('/contratos')}
          className='p-2 hover:bg-gray-200 rounded-full'
        >
          <ArrowLeft size={24} className='text-gray-600' />
        </button>
        <h1 className='text-2xl font-bold text-[#0F2C4C] uppercase tracking-tighter'>
          Novo Caso / Contrato
        </h1>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* BLOCO 1: IDENTIFICAÇÃO (STATUS EM PRIMEIRO) */}
        <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4'>
          <h2 className='font-semibold text-gray-700 border-b pb-2'>
            1. Triagem e Identificação
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-600 mb-1'>
                Status Atual
              </label>
              <select
                name='status'
                value={formData.status}
                onChange={handleChange}
                className='w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 font-bold text-[#0F2C4C]'
              >
                <option value='Sob Análise'>Sob Análise</option>
                <option value='Proposta Enviada'>Proposta Enviada</option>
                <option value='Contrato Fechado'>Contrato Fechado</option>
                <option value='Rejeitada'>Rejeitada</option>
                <option value='Probono'>Probono</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-600 mb-1'>
                Responsável
              </label>
              <input
                type='text'
                name='responsavel_socio'
                value={formData.responsavel_socio}
                onChange={handleChange}
                className='w-full p-2.5 border rounded-lg'
                placeholder='Nome do Sócio'
              />
            </div>
            <div className='col-span-2 md:col-span-1'>
              <label className='block text-sm font-medium text-gray-600 mb-1'>
                CNPJ do Cliente
              </label>
              <div className='flex gap-2'>
                <input
                  type='text'
                  name='cnpj'
                  value={formData.cnpj}
                  onChange={handleChange}
                  className='flex-1 p-2.5 border rounded-lg'
                  placeholder='00.000.000/0000-00'
                />
                <button
                  type='button'
                  onClick={buscarCNPJ}
                  className='bg-blue-100 text-blue-700 p-2.5 rounded-lg hover:bg-blue-200'
                >
                  <Search size={20} />
                </button>
              </div>
            </div>
            <div className='col-span-2 md:col-span-1'>
              <label className='block text-sm font-medium text-gray-600 mb-1'>
                Nome do Cliente (Razão Social)
              </label>
              <input
                type='text'
                name='razao_social'
                value={formData.razao_social}
                onChange={handleChange}
                className='w-full p-2.5 border rounded-lg bg-gray-50'
                placeholder='Nome da Empresa'
              />
            </div>
          </div>
        </div>

        {/* BLOCO 2: PROCESSOS */}
        <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4'>
          <div className='flex justify-between items-center border-b pb-2'>
            <h2 className='font-semibold text-gray-700'>
              Processos Vinculados
            </h2>
            <button
              type='button'
              onClick={addProcesso}
              className='text-sm text-blue-600 flex items-center gap-1 hover:underline'
            >
              <Plus size={16} /> Adicionar Processo
            </button>
          </div>
          <div className='pb-2'>
            <label className='block text-sm font-medium text-gray-600 mb-1'>
              Parte Contrária (Réu/Autor)
            </label>
            <input
              type='text'
              name='parte_contraria'
              value={formData.parte_contraria}
              onChange={handleChange}
              className='w-full p-2.5 border rounded-lg'
              placeholder='Nome da pessoa ou empresa adversa'
            />
          </div>
          {processos.map((proc, index) => (
            <div
              key={index}
              className='grid grid-cols-1 md:grid-cols-5 gap-3 items-end bg-gray-50 p-3 rounded-lg border border-gray-200'
            >
              <div className='md:col-span-2'>
                <label className='text-xs text-gray-500 font-medium'>
                  Número do Processo
                </label>
                <input
                  type='text'
                  value={proc.numero}
                  onChange={(e) =>
                    handleProcessoChange(index, 'numero', e.target.value)
                  }
                  className='w-full p-2 border rounded'
                />
              </div>
              <div>
                <label className='text-xs text-gray-500 font-medium'>
                  Tribunal
                </label>
                <input
                  type='text'
                  value={proc.tribunal}
                  onChange={(e) =>
                    handleProcessoChange(index, 'tribunal', e.target.value)
                  }
                  className='w-full p-2 border rounded'
                />
              </div>
              <div>
                <label className='text-xs text-gray-500 font-medium'>
                  Valor da Causa
                </label>
                <input
                  type='number'
                  value={proc.valor_causa}
                  onChange={(e) =>
                    handleProcessoChange(index, 'valor_causa', e.target.value)
                  }
                  className='w-full p-2 border rounded'
                />
              </div>
              <button
                type='button'
                onClick={() => removeProcesso(index)}
                className='text-red-500 p-2 hover:bg-red-50 rounded transition-colors'
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* BLOCO 3: VISÕES CONDICIONAIS POR STATUS */}
        <div className='bg-blue-50 p-6 rounded-xl border border-blue-100 space-y-4'>
          <h2 className='font-semibold text-[#0F2C4C] flex items-center gap-2'>
            Detalhes da Fase:{' '}
            <span className='uppercase'>{formData.status}</span>
          </h2>

          {/* VISÃO: SOB ANÁLISE */}
          {formData.status === 'Sob Análise' && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300'>
              <div>
                <label className='block text-sm text-gray-600'>
                  Data do Prospect
                </label>
                <input
                  type='date'
                  name='data_prospect'
                  value={formData.data_prospect}
                  onChange={handleChange}
                  className='w-full p-2 border rounded'
                />
              </div>
              <div>
                <label className='block text-sm text-gray-600'>
                  Analisado por
                </label>
                <input
                  type='text'
                  name='analisado_por'
                  value={formData.analisado_por}
                  onChange={handleChange}
                  className='w-full p-2 border rounded'
                />
              </div>
              <div className='col-span-2'>
                <label className='block text-sm text-gray-600'>
                  Obs Prospect
                </label>
                <textarea
                  name='obs_prospect'
                  value={formData.obs_prospect}
                  onChange={handleChange}
                  className='w-full p-2 border rounded h-24'
                ></textarea>
              </div>
            </div>
          )}

          {/* VISÃO: PROPOSTA ENVIADA */}
          {formData.status === 'Proposta Enviada' && (
            <div className='space-y-4 animate-in fade-in duration-300'>
              <div>
                <label className='block text-sm text-gray-600 mb-1'>
                  Data da Proposta
                </label>
                <input
                  type='date'
                  name='data_proposta'
                  value={formData.data_proposta}
                  onChange={handleChange}
                  className='w-full md:w-1/3 p-2 border rounded'
                />
              </div>
              <CamposFinanceiros values={formData} onChange={handleChange} />
            </div>
          )}

          {/* VISÃO: CONTRATO FECHADO (COM PDF/GED) */}
          {formData.status === 'Contrato Fechado' && (
            <div className='space-y-4 animate-in fade-in duration-300'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='bg-white p-4 rounded-lg border border-blue-200 shadow-sm'>
                  <label className='block text-sm font-bold text-[#0F2C4C] mb-1'>
                    Número HON (LegalOne)
                  </label>
                  <input
                    type='text'
                    name='numero_hon'
                    value={formData.numero_hon}
                    onChange={handleChange}
                    className='w-full p-2.5 border-2 border-blue-100 rounded-lg'
                    placeholder='Insira o número...'
                  />
                </div>

                {/* BLOCO GED: UPLOAD PDF */}
                <div className='bg-emerald-50 p-4 rounded-lg border border-emerald-200'>
                   <label className='block text-sm font-bold text-emerald-800 mb-2'>
                     Documento PDF (GED)
                   </label>
                   <div className="flex items-center gap-3">
                      <label className="flex-1 cursor-pointer bg-white border-2 border-dashed border-emerald-300 p-2 rounded-lg flex items-center justify-center hover:bg-emerald-100 transition-all">
                        {uploading ? <Loader2 size={18} className="animate-spin text-emerald-500 mr-2" /> : <Upload size={18} className="text-emerald-500 mr-2" />}
                        <span className="text-xs font-bold text-emerald-800 uppercase">
                          {pdfUrl ? 'Alterar PDF' : 'Anexar PDF'}
                        </span>
                        <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
                      </label>
                      {pdfUrl && <div className="text-emerald-600 bg-white p-2 rounded-full border border-emerald-200"><CheckCircle2 size={18} /></div>}
                   </div>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm text-gray-600 mb-1'>
                    Data Contrato
                  </label>
                  <input
                    type='date'
                    name='data_contrato'
                    value={formData.data_contrato}
                    onChange={handleChange}
                    className='w-full p-2.5 border rounded-lg'
                  />
                </div>
                <div>
                  <label className='block text-sm text-gray-600 mb-1'>
                    Status da Assinatura
                  </label>
                  <select
                    name='contrato_assinado'
                    value={formData.contrato_assinado.toString()}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        contrato_assinado: e.target.value === 'true',
                      }))
                    }
                    className={`w-full p-2.5 border rounded-lg font-bold ${
                      formData.contrato_assinado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    <option value='false'>❌ Não Assinado</option>
                    <option value='true'>✅ Assinado</option>
                  </select>
                </div>
              </div>
              <CamposFinanceiros values={formData} onChange={handleChange} />
            </div>
          )}

          {/* VISÃO: REJEITADA */}
          {formData.status === 'Rejeitada' && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300'>
              <div>
                <label className='block text-sm text-gray-600 mb-1'>
                  Rejeitado Por
                </label>
                <select
                  name='rejeitado_por'
                  value={formData.rejeitado_por}
                  onChange={handleChange}
                  className='w-full p-2.5 border rounded-lg'
                >
                  <option value=''>Selecione...</option>
                  <option value='Cliente'>Cliente</option>
                  <option value='Escritório'>Escritório</option>
                </select>
              </div>
              <div>
                <label className='block text-sm text-gray-600 mb-1'>
                  Motivo Principal
                </label>
                <select
                  name='motivo_rejeicao_categoria'
                  value={formData.motivo_rejeicao_categoria}
                  onChange={handleChange}
                  className='w-full p-2.5 border rounded-lg'
                >
                  <option value=''>Selecione...</option>
                  <option value='Caso Ruim/Sem Êxito'>Caso Ruim / Sem Êxito</option>
                  <option value='Cliente Declinou'>Cliente Declinou / Não Retornou</option>
                  <option value='Conflito de Interesses'>Conflito de Interesses</option>
                </select>
              </div>
              <div className='col-span-2'>
                <label className='block text-sm text-gray-600'>
                  Observações Adicionais
                </label>
                <textarea
                  name='motivo_rejeicao'
                  value={formData.motivo_rejeicao}
                  onChange={handleChange}
                  className='w-full p-2 border rounded h-24'
                  placeholder='Detalhes do motivo...'
                ></textarea>
              </div>
            </div>
          )}
        </div>

        {/* OBSERVAÇÕES GERAIS */}
        <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100'>
           <label className='block text-sm font-bold text-gray-600 mb-2 uppercase tracking-tighter'>
             Observações Internas (Escritório)
           </label>
           <textarea 
             name="observacoes_gerais" 
             value={formData.observacoes_gerais}
             onChange={handleChange}
             className="w-full p-3 bg-gray-50 border rounded-lg outline-none focus:ring-2 focus:ring-[#0F2C4C]"
             rows="3"
             placeholder="Notas internas que não aparecem no GED..."
           />
        </div>

        <div className='flex justify-end pt-4 pb-10'>
          <button
            type='submit'
            disabled={loading || uploading}
            className='flex items-center gap-2 bg-[#0F2C4C] text-white px-10 py-4 rounded-xl hover:bg-blue-900 transition-colors shadow-xl disabled:opacity-50 font-bold uppercase text-sm'
          >
            <Save size={20} /> {loading ? 'Sincronizando...' : 'Confirmar e Salvar Caso'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default NovoContrato
