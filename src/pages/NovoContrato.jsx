import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import {
  Save,
  ArrowLeft,
  Search,
  Upload,
  CheckCircle2,
  Loader2,
  FileText
} from 'lucide-react'

// Componente para inputs financeiros com máscara simples (type number step 0.01)
const InputMoeda = ({ label, name, value, onChange, placeholder = "0,00" }) => (
  <div>
    <label className='block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1'>{label}</label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">R$</span>
      <input
        type='number'
        step="0.01"
        name={name}
        value={value}
        onChange={onChange}
        className='w-full pl-10 p-2.5 border-2 border-gray-100 rounded-xl focus:border-[#0F2C4C] outline-none font-bold text-[#0F2C4C]'
        placeholder={placeholder}
      />
    </div>
  </div>
)

const NovoContrato = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [pdfUrl, setPdfUrl] = useState(null)

  const [formData, setFormData] = useState({
    // Campos Fixos
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
    responsavel_socio: '',

    // Sob Análise
    data_prospect: '',
    analisado_por: '',
    obs_prospect: '',

    // Proposta Enviada / Contrato Fechado
    data_proposta: '',
    data_contrato: '',
    numero_hon: '',
    numero_proc: '',
    proposta_pro_labore: '',
    proposta_honorario_fixo: '',
    proposta_exito_total: '',
    proposta_exito_percentual: '',
    timesheet: false,
    outros_financeiro: '',
    descricao_contrato: '', // Descrição da Proposta ou do Contrato
    observacoes_gerais: '',

    // Rejeitada
    data_rejeicao: '',
    rejeitado_por: '',

    // Probono
    data_probono: '',
    enviado_por: '',
  })

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
      const { data: urlData } = supabase.storage.from('contratos_ged').getPublicUrl(fileName)
      setPdfUrl(urlData.publicUrl)
    } catch (error) {
      alert('Erro no Upload: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const buscarCNPJ = async () => {
    const cnpjLimpo = formData.cnpj.replace(/\D/g, '')
    if (cnpjLimpo.length !== 14) return alert('CNPJ inválido!')
    setLoading(true)
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`)
      const data = await response.json()
      if (data.razao_social) {
        setFormData(prev => ({ ...prev, razao_social: data.razao_social }))
      }
    } catch (error) {
      alert('Erro ao buscar CNPJ')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Lógica de Cliente (Busca ou Cria)
      let clienteId
      const { data: cli } = await supabase.from('clientes').select('id').eq('cnpj', formData.cnpj).single()
      if (cli) {
        clienteId = cli.id
      } else {
        const { data: nCli } = await supabase.from('clientes').insert([{ cnpj: formData.cnpj, razao_social: formData.razao_social }]).select().single()
        clienteId = nCli.id
      }

      const { error } = await supabase.from('contratos').insert([{
        cliente_id: clienteId,
        ...formData,
        arquivo_pdf_url: pdfUrl,
        data_vinculo_pdf: pdfUrl ? new Date() : null
      }])

      if (error) throw error
      navigate('/contratos')
    } catch (error) {
      alert('Erro ao salvar: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='w-full max-w-6xl mx-auto space-y-6 pb-20'>
      <div className='flex items-center justify-between pt-10 md:pt-0'>
        <div className='flex items-center gap-4'>
          <button onClick={() => navigate('/contratos')} className='p-2 hover:bg-gray-100 rounded-full transition-colors'>
            <ArrowLeft size={24} className='text-[#0F2C4C]' />
          </button>
          <h1 className='text-2xl font-black text-[#0F2C4C] uppercase tracking-tighter'>Abertura de Caso</h1>
        </div>
        <div className='bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100'>
          <span className='text-[10px] font-black text-blue-600 uppercase tracking-widest'>Status Atual: </span>
          <span className='text-sm font-black text-[#0F2C4C] uppercase'>{formData.status}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        
        {/* SEÇÃO 1: CAMPOS FIXOS */}
        <div className='bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6'>
          <h2 className='font-black text-[10px] text-gray-400 uppercase tracking-[0.2em] border-b pb-2'>Informações Obrigatórias</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div>
              <label className='block text-[10px] font-black text-blue-600 uppercase mb-1 ml-1'>1. Selecione o Status</label>
              <select name='status' value={formData.status} onChange={handleChange} className='w-full p-3 border-2 border-blue-100 bg-blue-50 rounded-xl font-black text-[#0F2C4C] outline-none focus:bg-white uppercase'>
                <option value='Sob Análise'>Sob Análise</option>
                <option value='Proposta Enviada'>Proposta Enviada</option>
                <option value='Contrato Fechado'>Contrato Fechado</option>
                <option value='Rejeitada'>Rejeitada</option>
                <option value='Probono'>Probono</option>
              </select>
            </div>
            <div>
              <label className='block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1'>CNPJ Cliente</label>
              <div className='flex gap-2'>
                <input type='text' name='cnpj' value={formData.cnpj} onChange={handleChange} onBlur={buscarCNPJ} className='flex-1 p-3 border-2 border-gray-100 rounded-xl font-bold' placeholder='00.000.000/0000-00' />
                <button type='button' onClick={buscarCNPJ} className='bg-[#0F2C4C] text-white p-3 rounded-xl'><Search size={18}/></button>
              </div>
            </div>
            <div>
              <label className='block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1'>Razão Social</label>
              <input type='text' name='razao_social' value={formData.razao_social} onChange={handleChange} className='w-full p-3 border-2 border-gray-100 rounded-xl bg-gray-50 font-bold' readOnly />
            </div>
            <div>
              <label className='block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1'>Contrário</label>
              <input type='text' name='parte_contraria' value={formData.parte_contraria} onChange={handleChange} className='w-full p-3 border-2 border-gray-100 rounded-xl' />
            </div>
            <div>
              <label className='block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1'>Processo</label>
              <input type='text' name='numero_processo' value={formData.numero_processo} onChange={handleChange} className='w-full p-3 border-2 border-gray-100 rounded-xl' />
            </div>
            <InputMoeda label="Valor da Causa" name="valor_causa" value={formData.valor_causa} onChange={handleChange} />
            <div>
              <label className='block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1'>Tribunal/Turma</label>
              <input type='text' name='tribunal_turma' value={formData.tribunal_turma} onChange={handleChange} className='w-full p-3 border-2 border-gray-100 rounded-xl' />
            </div>
            <div>
              <label className='block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1'>Juiz/Desembargador</label>
              <input type='text' name='juiz_desembargador' value={formData.juiz_desembargador} onChange={handleChange} className='w-full p-3 border-2 border-gray-100 rounded-xl' />
            </div>
            <div className='grid grid-cols-2 gap-2'>
              <div>
                <label className='block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1'>UF</label>
                <input type='text' name='uf' value={formData.uf} onChange={handleChange} className='w-full p-3 border-2 border-gray-100 rounded-xl uppercase' maxLength={2} />
              </div>
              <div>
                <label className='block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1'>Área</label>
                <input type='text' name='area' value={formData.area} onChange={handleChange} className='w-full p-3 border-2 border-gray-100 rounded-xl' />
              </div>
            </div>
            <div>
              <label className='block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1'>Responsável</label>
              <input type='text' name='responsavel_socio' value={formData.responsavel_socio} onChange={handleChange} className='w-full p-3 border-2 border-gray-100 rounded-xl' />
            </div>
          </div>
        </div>

        {/* SEÇÃO 2: CAMPOS DINÂMICOS (POR STATUS) */}
        
        {/* SOB ANÁLISE */}
        {formData.status === 'Sob Análise' && (
          <div className='bg-amber-50 p-8 rounded-[2rem] border border-amber-100 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in'>
            <div>
              <label className='block text-[10px] font-black text-amber-700 uppercase mb-1'>Data Prospect</label>
              <input type='date' name='data_prospect' value={formData.data_prospect} onChange={handleChange} className='w-full p-3 border-2 border-white rounded-xl' />
            </div>
            <div>
              <label className='block text-[10px] font-black text-amber-700 uppercase mb-1'>Analisado por</label>
              <input type='text' name='analisado_por' value={formData.analisado_por} onChange={handleChange} className='w-full p-3 border-2 border-white rounded-xl' />
            </div>
            <div>
              <label className='block text-[10px] font-black text-amber-700 uppercase mb-1'>Obs Prospect</label>
              <input type='text' name='obs_prospect' value={formData.obs_prospect} onChange={handleChange} className='w-full p-3 border-2 border-white rounded-xl' />
            </div>
          </div>
        )}

        {/* PROPOSTA ENVIADA / CONTRATO FECHADO */}
        {(formData.status === 'Proposta Enviada' || formData.status === 'Contrato Fechado') && (
          <div className='bg-blue-50 p-8 rounded-[2rem] border border-blue-100 space-y-6 animate-in fade-in'>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
              {formData.status === 'Proposta Enviada' ? (
                <div>
                  <label className='block text-[10px] font-black text-blue-700 uppercase mb-1'>Data Proposta</label>
                  <input type='date' name='data_proposta' value={formData.data_proposta} onChange={handleChange} className='w-full p-3 border-2 border-white rounded-xl' />
                </div>
              ) : (
                <>
                  <div>
                    <label className='block text-[10px] font-black text-blue-700 uppercase mb-1'>Data Contrato</label>
                    <input type='date' name='data_contrato' value={formData.data_contrato} onChange={handleChange} className='w-full p-3 border-2 border-white rounded-xl' />
                  </div>
                  <div>
                    <label className='block text-[10px] font-black text-blue-700 uppercase mb-1'>Número HON</label>
                    <input type='text' name='numero_hon' value={formData.numero_hon} onChange={handleChange} className='w-full p-3 border-2 border-white rounded-xl' />
                  </div>
                  <div>
                    <label className='block text-[10px] font-black text-blue-700 uppercase mb-1'>Número PROC</label>
                    <input type='text' name='numero_proc' value={formData.numero_proc} onChange={handleChange} className='w-full p-3 border-2 border-white rounded-xl' />
                  </div>
                </>
              )}

              {/* UPLOAD PDF */}
              <div className='md:col-span-2'>
                <label className='block text-[10px] font-black text-blue-700 uppercase mb-1'>
                  {formData.status === 'Proposta Enviada' ? 'Vincular Proposta (PDF)' : 'Vincular Contrato (PDF)'}
                </label>
                <div className="flex gap-2">
                  <label className="flex-1 cursor-pointer bg-white border-2 border-dashed border-blue-200 p-2.5 rounded-xl flex items-center justify-center hover:bg-blue-100 transition-all">
                    {uploading ? <Loader2 size={18} className="animate-spin text-blue-500 mr-2" /> : <Upload size={18} className="text-blue-500 mr-2" />}
                    <span className="text-[10px] font-black text-blue-800 uppercase">{pdfUrl ? 'PDF Pronto' : 'Selecionar Arquivo'}</span>
                    <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
                  </label>
                  {pdfUrl && <div className="bg-emerald-500 text-white p-2.5 rounded-xl"><CheckCircle2 size={18} /></div>}
                </div>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-4 gap-6 border-t border-blue-200 pt-6'>
              <InputMoeda label="Pró-labore" name="proposta_pro_labore" value={formData.proposta_pro_labore} onChange={handleChange} />
              <InputMoeda label="Honorário Fixo" name="proposta_honorario_fixo" value={formData.proposta_honorario_fixo} onChange={handleChange} />
              <InputMoeda label="Êxito Total" name="proposta_exito_total" value={formData.proposta_exito_total} onChange={handleChange} />
              <div>
                <label className='block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1'>Êxito (%)</label>
                <input type='number' name='proposta_exito_percentual' value={formData.proposta_exito_percentual} onChange={handleChange} className='w-full p-2.5 border-2 border-gray-100 rounded-xl font-bold text-[#0F2C4C]' placeholder='%' />
              </div>
              <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-blue-100">
                <span className='text-[10px] font-black text-gray-400 uppercase'>Timesheet?</span>
                <input type="checkbox" name="timesheet" checked={formData.timesheet} onChange={handleChange} className="w-5 h-5 accent-[#0F2C4C]" />
              </div>
              <div className='md:col-span-2'>
                <label className='block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1'>Outros</label>
                <input type='text' name='outros_financeiro' value={formData.outros_financeiro} onChange={handleChange} className='w-full p-2.5 border-2 border-gray-100 rounded-xl' />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
               <div>
                <label className='block text-[10px] font-black text-blue-700 uppercase mb-1'>{formData.status === 'Proposta Enviada' ? 'Descrição da Proposta' : 'Descrição do Contrato'}</label>
                <textarea name='descricao_contrato' value={formData.descricao_contrato} onChange={handleChange} className='w-full p-3 border-2 border-white rounded-xl' rows="3"></textarea>
              </div>
              <div>
                <label className='block text-[10px] font-black text-blue-700 uppercase mb-1'>Observações</label>
                <textarea name='observacoes_gerais' value={formData.observacoes_gerais} onChange={handleChange} className='w-full p-3 border-2 border-white rounded-xl' rows="3"></textarea>
              </div>
            </div>
          </div>
        )}

        {/* REJEITADA */}
        {formData.status === 'Rejeitada' && (
          <div className='bg-red-50 p-8 rounded-[2rem] border border-red-100 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in'>
            <div>
              <label className='block text-[10px] font-black text-red-700 uppercase mb-1'>Data Rejeição</label>
              <input type='date' name='data_rejeicao' value={formData.data_rejeicao} onChange={handleChange} className='w-full p-3 border-2 border-white rounded-xl' />
            </div>
            <div>
              <label className='block text-[10px] font-black text-red-700 uppercase mb-1'>Rejeitado por</label>
              <input type='text' name='rejeitado_por' value={formData.rejeitado_por} onChange={handleChange} className='w-full p-3 border-2 border-white rounded-xl' />
            </div>
            <div className='md:col-span-3'>
              <label className='block text-[10px] font-black text-red-700 uppercase mb-1'>Observações</label>
              <textarea name='observacoes_gerais' value={formData.observacoes_gerais} onChange={handleChange} className='w-full p-3 border-2 border-white rounded-xl' rows="2"></textarea>
            </div>
          </div>
        )}

        {/* PROBONO */}
        {formData.status === 'Probono' && (
          <div className='bg-purple-50 p-8 rounded-[2rem] border border-purple-100 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in'>
            <div>
              <label className='block text-[10px] font-black text-purple-700 uppercase mb-1'>Data Probono</label>
              <input type='date' name='data_probono' value={formData.data_probono} onChange={handleChange} className='w-full p-3 border-2 border-white rounded-xl' />
            </div>
            <div>
              <label className='block text-[10px] font-black text-purple-700 uppercase mb-1'>Enviado Por</label>
              <input type='text' name='enviado_por' value={formData.enviado_por} onChange={handleChange} className='w-full p-3 border-2 border-white rounded-xl' />
            </div>
            <div className='md:col-span-2'>
              <label className='block text-[10px] font-black text-purple-700 uppercase mb-1'>Observações</label>
              <textarea name='observacoes_gerais' value={formData.observacoes_gerais} onChange={handleChange} className='w-full p-3 border-2 border-white rounded-xl' rows="2"></textarea>
            </div>
          </div>
        )}

        {/* AÇÕES */}
        <div className='flex justify-end gap-4 pt-4'>
          <button type='button' onClick={() => navigate('/contratos')} className='px-10 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest'>Descartar</button>
          <button type='submit' disabled={loading || uploading} className='bg-[#0F2C4C] text-white px-16 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-900 transition-all disabled:opacity-50 flex items-center gap-3'>
            {loading ? <Loader2 size={18} className='animate-spin'/> : <Save size={20} />} Finalizar Registro
          </button>
        </div>
      </form>
    </div>
  )
}

export default NovoContrato
