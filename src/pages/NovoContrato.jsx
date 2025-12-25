import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import {
  Save,
  ArrowLeft,
  Search,
  Plus,
  Trash2,
  Upload,
  CheckCircle2,
  Loader2
} from 'lucide-react'

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
    numero_processo: '',
    valor_causa: '',
    tribunal_turma: '',
    juiz_desembargador: '',
    uf: '',
    area: '',
    responsavel: '',
    
    // Campos Sob Análise
    data_prospect: '',
    analisado_por: '',
    obs_prospect: '',
    
    // Campos Proposta Enviada
    data_proposta: '',
    proposta_pro_labore: '',
    proposta_honorario_fixo: '',
    proposta_exito_total: '',
    proposta_exito_percentual: '',
    proposta_timesheet: false,
    proposta_outros: '',
    descricao_proposta: '',
    observacoes_proposta: '',
    
    // Campos Contrato Fechado
    data_contrato: '',
    numero_hon: '',
    numero_proc: '',
    contrato_pro_labore: '',
    contrato_honorario_fixo: '',
    contrato_exito_total: '',
    contrato_exito_percentual: '',
    contrato_timesheet: false,
    contrato_outros: '',
    descricao_contrato: '',
    observacoes_contrato: '',
    
    // Campos Rejeitada
    data_rejeicao: '',
    rejeitado_por: '',
    observacoes_rejeicao: '',
    
    // Campos Probono
    data_probono: '',
    enviado_por: '',
    observacoes_probono: '',
  })

  const formatCurrency = (value) => {
    if (!value) return ''
    const number = parseFloat(value)
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(number)
  }

  const formatPercentage = (value) => {
    if (!value) return ''
    return `${value}%`
  }

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
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const fileName = `ged_${Date.now()}_${file.name.replace(/\s/g, '_')}`
      const { data, error } = await supabase.storage
        .from('contratos_ged')
        .upload(fileName, file)

      if (error) throw error
      const { data: urlData } = supabase.storage
        .from('contratos_ged')
        .getPublicUrl(fileName)
      setPdfUrl(urlData.publicUrl)
    } catch (error) {
      alert(
        'Erro no Upload: Verifique as políticas RLS do Bucket no Supabase. ' +
          error.message
      )
    } finally {
      setUploading(false)
    }
  }

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
      const contratoData = {
        cliente_id: clienteId,
        status: formData.status,
        parte_contraria: formData.parte_contraria,
        numero_processo: formData.numero_processo,
        valor_causa: formData.valor_causa || null,
        tribunal_turma: formData.tribunal_turma,
        juiz_desembargador: formData.juiz_desembargador,
        uf: formData.uf,
        area: formData.area,
        responsavel: formData.responsavel,
        arquivo_pdf_url: pdfUrl,
        data_vinculo_pdf: pdfUrl ? new Date().toISOString() : null,
      }

      // Adiciona campos específicos por status
      if (formData.status === 'Sob Análise') {
        contratoData.data_prospect = formData.data_prospect || null
        contratoData.analisado_por = formData.analisado_por
        contratoData.obs_prospect = formData.obs_prospect
      }

      if (formData.status === 'Proposta Enviada') {
        contratoData.data_proposta = formData.data_proposta || null
        contratoData.proposta_pro_labore = formData.proposta_pro_labore || null
        contratoData.proposta_honorario_fixo = formData.proposta_honorario_fixo || null
        contratoData.proposta_exito_total = formData.proposta_exito_total || null
        contratoData.proposta_exito_percentual = formData.proposta_exito_percentual || null
        contratoData.proposta_timesheet = formData.proposta_timesheet
        contratoData.proposta_outros = formData.proposta_outros
        contratoData.descricao_proposta = formData.descricao_proposta
        contratoData.observacoes_proposta = formData.observacoes_proposta
      }

      if (formData.status === 'Contrato Fechado') {
        contratoData.data_contrato = formData.data_contrato || null
        contratoData.numero_hon = formData.numero_hon
        contratoData.numero_proc = formData.numero_proc
        contratoData.contrato_pro_labore = formData.contrato_pro_labore || null
        contratoData.contrato_honorario_fixo = formData.contrato_honorario_fixo || null
        contratoData.contrato_exito_total = formData.contrato_exito_total || null
        contratoData.contrato_exito_percentual = formData.contrato_exito_percentual || null
        contratoData.contrato_timesheet = formData.contrato_timesheet
        contratoData.contrato_outros = formData.contrato_outros
        contratoData.descricao_contrato = formData.descricao_contrato
        contratoData.observacoes_contrato = formData.observacoes_contrato
      }

      if (formData.status === 'Rejeitada') {
        contratoData.data_rejeicao = formData.data_rejeicao || null
        contratoData.rejeitado_por = formData.rejeitado_por
        contratoData.observacoes_rejeicao = formData.observacoes_rejeicao
      }

      if (formData.status === 'Probono') {
        contratoData.data_probono = formData.data_probono || null
        contratoData.enviado_por = formData.enviado_por
        contratoData.observacoes_probono = formData.observacoes_probono
      }

      const { data: novoContrato, error: errContrato } = await supabase
        .from('contratos')
        .insert([contratoData])
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
        {/* BLOCO 1: CAMPOS FIXOS (SEMPRE VISÍVEIS) */}
        <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4'>
          <h2 className='font-semibold text-gray-700 border-b pb-2'>
            Informações Básicas
          </h2>
          
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Status */}
            <div>
              <label className='block text-sm font-medium text-gray-600 mb-1'>
                Status <span className='text-red-500'>*</span>
              </label>
              <select
                name='status'
                value={formData.status}
                onChange={handleChange}
                required
                className='w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 font-bold text-[#0F2C4C]'
              >
                <option value='Sob Análise'>Sob Análise</option>
                <option value='Proposta Enviada'>Proposta Enviada</option>
                <option value='Contrato Fechado'>Contrato Fechado</option>
                <option value='Rejeitada'>Rejeitada</option>
                <option value='Probono'>Probono</option>
              </select>
            </div>

            {/* Responsável */}
            <div>
              <label className='block text-sm font-medium text-gray-600 mb-1'>
                Responsável <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                name='responsavel'
                value={formData.responsavel}
                onChange={handleChange}
                required
                className='w-full p-2.5 border rounded-lg'
                placeholder='Nome do Responsável'
              />
            </div>

            {/* Cliente - CNPJ */}
            <div>
              <label className='block text-sm font-medium text-gray-600 mb-1'>
                Cliente (CNPJ) <span className='text-red-500'>*</span>
              </label>
              <div className='flex gap-2'>
                <input
                  type='text'
                  name='cnpj'
                  value={formData.cnpj}
                  onChange={handleChange}
                  required
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

            {/* Razão Social */}
            <div>
              <label className='block text-sm font-medium text-gray-600 mb-1'>
                Razão Social
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

            {/* Parte Contrária */}
            <div>
              <label className='block text-sm font-medium text-gray-600 mb-1'>
                Contrário <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                name='parte_contraria'
                value={formData.parte_contraria}
                onChange={handleChange}
                required
                className='w-full p-2.5 border rounded-lg'
                placeholder='Parte contrária'
              />
            </div>

            {/* Número do Processo */}
            <div>
              <label className='block text-sm font-medium text-gray-600 mb-1'>
                Processo <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                name='numero_processo'
                value={formData.numero_processo}
                onChange={handleChange}
                required
                className='w-full p-2.5 border rounded-lg'
                placeholder='Número do processo'
              />
            </div>

            {/* Valor da Causa */}
            <div>
              <label className='block text-sm font-medium text-gray-600 mb-1'>
                Valor da Causa (R$)
              </label>
              <input
                type='number'
                step='0.01'
                name='valor_causa'
                value={formData.valor_causa}
                onChange={handleChange}
                className='w-full p-2.5 border rounded-lg'
                placeholder='0,00'
              />
            </div>

            {/* Tribunal/Turma */}
            <div>
              <label className='block text-sm font-medium text-gray-600 mb-1'>
                Tribunal/Turma <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                name='tribunal_turma'
                value={formData.tribunal_turma}
                onChange={handleChange}
                required
                className='w-full p-2.5 border rounded-lg'
                placeholder='Ex: TRT 1ª Região'
              />
            </div>

            {/* Juiz/Desembargador */}
            <div>
              <label className='block text-sm font-medium text-gray-600 mb-1'>
                Juiz/Desembargador
              </label>
              <input
                type='text'
                name='juiz_desembargador'
                value={formData.juiz_desembargador}
                onChange={handleChange}
                className='w-full p-2.5 border rounded-lg'
                placeholder='Nome do magistrado'
              />
            </div>

            {/* UF */}
            <div>
              <label className='block text-sm font-medium text-gray-600 mb-1'>
                UF <span className='text-red-500'>*</span>
              </label>
              <select
                name='uf'
                value={formData.uf}
                onChange={handleChange}
                required
                className='w-full p-2.5 border rounded-lg'
              >
                <option value=''>Selecione...</option>
                <option value='AC'>AC</option>
                <option value='AL'>AL</option>
                <option value='AP'>AP</option>
                <option value='AM'>AM</option>
                <option value='BA'>BA</option>
                <option value='CE'>CE</option>
                <option value='DF'>DF</option>
                <option value='ES'>ES</option>
                <option value='GO'>GO</option>
                <option value='MA'>MA</option>
                <option value='MT'>MT</option>
                <option value='MS'>MS</option>
                <option value='MG'>MG</option>
                <option value='PA'>PA</option>
                <option value='PB'>PB</option>
                <option value='PR'>PR</option>
                <option value='PE'>PE</option>
                <option value='PI'>PI</option>
                <option value='RJ'>RJ</option>
                <option value='RN'>RN</option>
                <option value='RS'>RS</option>
                <option value='RO'>RO</option>
                <option value='RR'>RR</option>
                <option value='SC'>SC</option>
                <option value='SP'>SP</option>
                <option value='SE'>SE</option>
                <option value='TO'>TO</option>
              </select>
            </div>

            {/* Área */}
            <div>
              <label className='block text-sm font-medium text-gray-600 mb-1'>
                Área <span className='text-red-500'>*</span>
              </label>
              <select
                name='area'
                value={formData.area}
                onChange={handleChange}
                required
                className='w-full p-2.5 border rounded-lg'
              >
                <option value=''>Selecione...</option>
                <option value='Cível'>Cível</option>
                <option value='Trabalhista'>Trabalhista</option>
                <option value='Tributário'>Tributário</option>
                <option value='Criminal'>Criminal</option>
                <option value='Empresarial'>Empresarial</option>
                <option value='Ambiental'>Ambiental</option>
                <option value='Família'>Família</option>
                <option value='Consumidor'>Consumidor</option>
                <option value='Administrativo'>Administrativo</option>
              </select>
            </div>
          </div>
        </div>

        {/* BLOCO 2: CAMPOS CONDICIONAIS POR STATUS */}
        <div className='bg-blue-50 p-6 rounded-xl border border-blue-100 space-y-4'>
          <h2 className='font-semibold text-[#0F2C4C] flex items-center gap-2'>
            Detalhes do Status:{' '}
            <span className='uppercase font-bold'>{formData.status}</span>
          </h2>

          {/* SOB ANÁLISE */}
          {formData.status === 'Sob Análise' && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300'>
              <div>
                <label className='block text-sm font-medium text-gray-600 mb-1'>
                  Data Prospect
                </label>
                <input
                  type='date'
                  name='data_prospect'
                  value={formData.data_prospect}
                  onChange={handleChange}
                  className='w-full p-2.5 border rounded-lg'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-600 mb-1'>
                  Analisado por
                </label>
                <input
                  type='text'
                  name='analisado_por'
                  value={formData.analisado_por}
                  onChange={handleChange}
                  className='w-full p-2.5 border rounded-lg'
                  placeholder='Nome do analista'
                />
              </div>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-600 mb-1'>
                  Obs Prospect
                </label>
                <textarea
                  name='obs_prospect'
                  value={formData.obs_prospect}
                  onChange={handleChange}
                  className='w-full p-2.5 border rounded-lg'
                  rows='3'
                  placeholder='Observações da análise...'
                ></textarea>
              </div>
            </div>
          )}

          {/* PROPOSTA ENVIADA */}
          {formData.status === 'Proposta Enviada' && (
            <div className='space-y-4 animate-in fade-in duration-300'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-600 mb-1'>
                    Data Proposta
                  </label>
                  <input
                    type='date'
                    name='data_proposta'
                    value={formData.data_proposta}
                    onChange={handleChange}
                    className='w-full p-2.5 border rounded-lg'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-600 mb-1'>
                    Vincular Proposta (PDF)
                  </label>
                  <div className='flex items-center gap-2'>
                    <label className='flex-1 cursor-pointer bg-white border-2 border-dashed border-blue-300 p-2 rounded-lg flex items-center justify-center hover:bg-blue-50 transition-all'>
                      {uploading ? (
                        <Loader2
                          size={18}
                          className='animate-spin text-blue-500 mr-2'
                        />
                      ) : (
                        <Upload size={18} className='text-blue-500 mr-2' />
                      )}
                      <span className='text-xs font-medium text-blue-800'>
                        {pdfUrl ? 'Alterar PDF' : 'Anexar PDF'}
                      </span>
                      <input
                        type='file'
                        accept='.pdf'
                        className='hidden'
                        onChange={handleFileUpload}
                      />
                    </label>
                    {pdfUrl && (
                      <div className='text-green-600 bg-white p-2 rounded-full border border-green-200'>
                        <CheckCircle2 size={18} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Valores Financeiros */}
              <div className='bg-white p-4 rounded-lg border border-gray-200'>
                <h3 className='font-semibold text-gray-700 mb-3 text-sm'>
                  Valores da Proposta
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Pró-labore (R$)
                    </label>
                    <input
                      type='number'
                      step='0.01'
                      name='proposta_pro_labore'
                      value={formData.proposta_pro_labore}
                      onChange={handleChange}
                      className='w-full p-2 border rounded-lg'
                      placeholder='0,00'
                    />
                  </div>
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Honorário Fixo (R$)
                    </label>
                    <input
                      type='number'
                      step='0.01'
                      name='proposta_honorario_fixo'
                      value={formData.proposta_honorario_fixo}
                      onChange={handleChange}
                      className='w-full p-2 border rounded-lg'
                      placeholder='0,00'
                    />
                  </div>
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Êxito Total (R$)
                    </label>
                    <input
                      type='number'
                      step='0.01'
                      name='proposta_exito_total'
                      value={formData.proposta_exito_total}
                      onChange={handleChange}
                      className='w-full p-2 border rounded-lg'
                      placeholder='0,00'
                    />
                  </div>
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Êxito % (%)
                    </label>
                    <input
                      type='number'
                      step='0.01'
                      name='proposta_exito_percentual'
                      value={formData.proposta_exito_percentual}
                      onChange={handleChange}
                      className='w-full p-2 border rounded-lg'
                      placeholder='0,00'
                    />
                  </div>
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Timesheet
                    </label>
                    <select
                      name='proposta_timesheet'
                      value={formData.proposta_timesheet.toString()}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          proposta_timesheet: e.target.value === 'true',
                        }))
                      }
                      className='w-full p-2 border rounded-lg'
                    >
                      <option value='false'>Não</option>
                      <option value='true'>Sim</option>
                    </select>
                  </div>
                  <div className='md:col-span-3'>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Outros
                    </label>
                    <input
                      type='text'
                      name='proposta_outros'
                      value={formData.proposta_outros}
                      onChange={handleChange}
                      className='w-full p-2 border rounded-lg'
                      placeholder='Outras informações financeiras...'
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-600 mb-1'>
                  Descrição da Proposta
                </label>
                <textarea
                  name='descricao_proposta'
                  value={formData.descricao_proposta}
                  onChange={handleChange}
                  className='w-full p-2.5 border rounded-lg'
                  rows='3'
                  placeholder='Detalhes da proposta...'
                ></textarea>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-600 mb-1'>
                  Observações
                </label>
                <textarea
                  name='observacoes_proposta'
                  value={formData.observacoes_proposta}
                  onChange={handleChange}
                  className='w-full p-2.5 border rounded-lg'
                  rows='2'
                  placeholder='Observações adicionais...'
                ></textarea>
              </div>
            </div>
          )}

          {/* CONTRATO FECHADO */}
          {formData.status === 'Contrato Fechado' && (
            <div className='space-y-4 animate-in fade-in duration-300'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-600 mb-1'>
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
                  <label className='block text-sm font-medium text-gray-600 mb-1'>
                    Número Hon
                  </label>
                  <input
                    type='text'
                    name='numero_hon'
                    value={formData.numero_hon}
                    onChange={handleChange}
                    className='w-full p-2.5 border rounded-lg'
                    placeholder='Número HON'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-600 mb-1'>
                    Vincular Contrato (PDF)
                  </label>
                  <div className='flex items-center gap-2'>
                    <label className='flex-1 cursor-pointer bg-white border-2 border-dashed border-emerald-300 p-2 rounded-lg flex items-center justify-center hover:bg-emerald-50 transition-all'>
                      {uploading ? (
                        <Loader2
                          size={18}
                          className='animate-spin text-emerald-500 mr-2'
                        />
                      ) : (
                        <Upload
                          size={18}
                          className='text-emerald-500 mr-2'
                        />
                      )}
                      <span className='text-xs font-medium text-emerald-800'>
                        {pdfUrl ? 'Alterar PDF' : 'Anexar PDF'}
                      </span>
                      <input
                        type='file'
                        accept='.pdf'
                        className='hidden'
                        onChange={handleFileUpload}
                      />
                    </label>
                    {pdfUrl && (
                      <div className='text-green-600 bg-white p-2 rounded-full border border-green-200'>
                        <CheckCircle2 size={18} />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-600 mb-1'>
                    Número PROC
                  </label>
                  <input
                    type='text'
                    name='numero_proc'
                    value={formData.numero_proc}
                    onChange={handleChange}
                    className='w-full p-2.5 border rounded-lg'
                    placeholder='Número PROC'
                  />
                </div>
              </div>

              {/* Valores Financeiros */}
              <div className='bg-white p-4 rounded-lg border border-gray-200'>
                <h3 className='font-semibold text-gray-700 mb-3 text-sm'>
                  Valores do Contrato
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Pró-labore (R$)
                    </label>
                    <input
                      type='number'
                      step='0.01'
                      name='contrato_pro_labore'
                      value={formData.contrato_pro_labore}
                      onChange={handleChange}
                      className='w-full p-2 border rounded-lg'
                      placeholder='0,00'
                    />
                  </div>
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Honorário Fixo (R$)
                    </label>
                    <input
                      type='number'
                      step='0.01'
                      name='contrato_honorario_fixo'
                      value={formData.contrato_honorario_fixo}
                      onChange={handleChange}
                      className='w-full p-2 border rounded-lg'
                      placeholder='0,00'
                    />
                  </div>
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Êxito Total (R$)
                    </label>
                    <input
                      type='number'
                      step='0.01'
                      name='contrato_exito_total'
                      value={formData.contrato_exito_total}
                      onChange={handleChange}
                      className='w-full p-2 border rounded-lg'
                      placeholder='0,00'
                    />
                  </div>
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Êxito % (%)
                    </label>
                    <input
                      type='number'
                      step='0.01'
                      name='contrato_exito_percentual'
                      value={formData.contrato_exito_percentual}
                      onChange={handleChange}
                      className='w-full p-2 border rounded-lg'
                      placeholder='0,00'
                    />
                  </div>
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Timesheet
                    </label>
                    <select
                      name='contrato_timesheet'
                      value={formData.contrato_timesheet.toString()}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          contrato_timesheet: e.target.value === 'true',
                        }))
                      }
                      className='w-full p-2 border rounded-lg'
                    >
                      <option value='false'>Não</option>
                      <option value='true'>Sim</option>
                    </select>
                  </div>
                  <div className='md:col-span-3'>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Outros
                    </label>
                    <input
                      type='text'
                      name='contrato_outros'
                      value={formData.contrato_outros}
                      onChange={handleChange}
                      className='w-full p-2 border rounded-lg'
                      placeholder='Outras informações financeiras...'
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-600 mb-1'>
                  Descrição do Contrato
                </label>
                <textarea
                  name='descricao_contrato'
                  value={formData.descricao_contrato}
                  onChange={handleChange}
                  className='w-full p-2.5 border rounded-lg'
                  rows='3'
                  placeholder='Detalhes do contrato...'
                ></textarea>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-600 mb-1'>
                  Observações
                </label>
                <textarea
                  name='observacoes_contrato'
                  value={formData.observacoes_contrato}
                  onChange={handleChange}
                  className='w-full p-2.5 border rounded-lg'
                  rows='2'
                  placeholder='Observações adicionais...'
                ></textarea>
              </div>
            </div>
          )}

          {/* REJEITADA */}
          {formData.status === 'Rejeitada' && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300'>
              <div>
                <label className='block text-sm font-medium text-gray-600 mb-1'>
                  Data Rejeição
                </label>
                <input
                  type='date'
                  name='data_rejeicao'
                  value={formData.data_rejeicao}
                  onChange={handleChange}
                  className='w-full p-2.5 border rounded-lg'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-600 mb-1'>
                  Rejeitado por
                </label>
                <input
                  type='text'
                  name='rejeitado_por'
                  value={formData.rejeitado_por}
                  onChange={handleChange}
                  className='w-full p-2.5 border rounded-lg'
                  placeholder='Nome de quem rejeitou'
                />
              </div>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-600 mb-1'>
                  Observações
                </label>
                <textarea
                  name='observacoes_rejeicao'
                  value={formData.observacoes_rejeicao}
                  onChange={handleChange}
                  className='w-full p-2.5 border rounded-lg'
                  rows='3'
                  placeholder='Motivos da rejeição...'
                ></textarea>
              </div>
            </div>
          )}

          {/* PROBONO */}
          {formData.status === 'Probono' && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300'>
              <div>
                <label className='block text-sm font-medium text-gray-600 mb-1'>
                  Data Probono
                </label>
                <input
                  type='date'
                  name='data_probono'
                  value={formData.data_probono}
                  onChange={handleChange}
                  className='w-full p-2.5 border rounded-lg'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-600 mb-1'>
                  Enviado Por
                </label>
                <input
                  type='text'
                  name='enviado_por'
                  value={formData.enviado_por}
                  onChange={handleChange}
                  className='w-full p-2.5 border rounded-lg'
                  placeholder='Nome de quem enviou'
                />
              </div>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-600 mb-1'>
                  Observações
                </label>
                <textarea
                  name='observacoes_probono'
                  value={formData.observacoes_probono}
                  onChange={handleChange}
                  className='w-full p-2.5 border rounded-lg'
                  rows='3'
                  placeholder='Informações sobre o caso probono...'
                ></textarea>
              </div>
            </div>
          )}
        </div>

        {/* BOTÃO SALVAR */}
        <div className='flex justify-end pt-4 pb-10'>
          <button
            type='submit'
            disabled={loading || uploading}
            className='flex items-center gap-2 bg-[#0F2C4C] text-white px-10 py-4 rounded-xl hover:bg-blue-900 transition-colors shadow-xl disabled:opacity-50 font-bold uppercase text-sm'
          >
            <Save size={20} />{' '}
            {loading ? 'Sincronizando...' : 'Confirmar e Salvar Contrato'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default NovoContrato
