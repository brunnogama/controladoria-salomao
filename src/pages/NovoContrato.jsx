import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import {
  Save, ArrowLeft, Search, Upload, CheckCircle2, Loader2, FileText, Trash2
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
    responsavel_socio: '',
    data_prospect: '',
    analisado_por: '',
    obs_prospect: '',
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
    descricao_contrato: '',
    observacoes_gerais: '',
    data_rejeicao: '',
    rejeitado_por: '',
    data_probono: '',
    enviado_por: ''
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
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
      const { data, error } = await supabase.storage.from('contratos_ged').upload(fileName, file)
      if (error) throw error
      const { data: urlData } = supabase.storage.from('contratos_ged').getPublicUrl(fileName)
      setPdfUrl(urlData.publicUrl)
    } catch (error) {
      alert('Erro no Upload: ' + error.message)
    } finally { setUploading(false) }
  }

  const buscarCNPJ = async () => {
    const cnpjLimpo = formData.cnpj.replace(/\D/g, '')
    if (cnpjLimpo.length !== 14) return alert('CNPJ inválido!')
    setLoading(true)
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`)
      const data = await response.json()
      if (data.razao_social) setFormData(prev => ({ ...prev, razao_social: data.razao_social }))
    } catch (error) { alert('Erro ao buscar CNPJ') } 
    finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      let clienteId
      const { data: cli } = await supabase.from('clientes').select('id').eq('cnpj', formData.cnpj).single()
      if (cli) { clienteId = cli.id } 
      else {
        const { data: nCli } = await supabase.from('clientes').insert([{ cnpj: formData.cnpj, razao_social: formData.razao_social }]).select().single()
        clienteId = nCli.id
      }
      const { error } = await supabase.from('contratos').insert([{
        cliente_id: clienteId, ...formData, arquivo_pdf_url: pdfUrl, data_vinculo_pdf: pdfUrl ? new Date() : null
      }])
      if (error) throw error
      navigate('/contratos')
    } catch (error) { alert('Erro ao salvar: ' + error.message) } 
    finally { setLoading(false) }
  }

  return (
    <div className='w-full max-w-6xl mx-auto space-y-6 pb-20 p-4'>
      <div className='flex items-center gap-4 mb-6'>
        <button onClick={() => navigate('/contratos')} className='p-2 hover:bg-gray-100 rounded-full'><ArrowLeft size={24} /></button>
        <h1 className='text-2xl font-black text-[#0F2C4C] uppercase tracking-tighter'>Novo Registro de Caso</h1>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        
        {/* BLOCO FIXO: ESTES CAMPOS NÃO MUDAM NUNCA */}
        <div className='bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6'>
          <h2 className='font-black text-[10px] text-gray-400 uppercase tracking-widest border-b pb-2'>Campos Obrigatórios Gerais</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
              <label className='block text-[10px] font-black text-blue-600 uppercase mb-2'>Status do Caso (Gatilho de Campos)</label>
              <select name='status' value={formData.status} onChange={handleChange} className='w-full p-3 border-2 border-white rounded-xl font-black text-[#0F2C4C] outline-none focus:ring-2 focus:ring-blue-400 uppercase'>
                <option value='Sob Análise'>Sob Análise</option>
                <option value='Proposta Enviada'>Proposta Enviada</option>
                <option value='Contrato Fechado'>Contrato Fechado</option>
                <option value='Rejeitada'>Rejeitada</option>
                <option value='Probono'>Probono</option>
              </select>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <label className='block text-[10px] font-black text-gray-400 uppercase mb-2'>CNPJ / Razão Social</label>
              <div className='flex gap-2 mb-2'>
                <input type='text' name='cnpj' value={formData.cnpj} onChange={handleChange} className='flex-1 p-2 border rounded-lg font-bold' placeholder='CNPJ' />
                <button type='button' onClick={buscarCNPJ} className='bg-[#0F2C4C] text-white p-2 rounded-lg'><Search size={18}/></button>
              </div>
              <input type="text" name="razao_social" value={formData.razao_social} readOnly className="w-full p-2 bg-white/50 border rounded-lg font-bold text-[#0F2C4C]" placeholder="Razão Social Automática" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="text-[10px] font-bold text-gray-500 uppercase">Contrário</label><input type="text" name="parte_contraria" value={formData.parte_contraria} onChange={handleChange} className="w-full p-2 border rounded-lg" /></div>
            <div><label className="text-[10px] font-bold text-gray-500 uppercase">Processo</label><input type="text" name="numero_processo" value={formData.numero_processo} onChange={handleChange} className="w-full p-2 border rounded-lg" /></div>
            <div><label className="text-[10px] font-bold text-gray-500 uppercase">Valor da Causa (R$)</label><input type="number" step="0.01" name="valor_causa" value={formData.valor_causa} onChange={handleChange} className="w-full p-2 border rounded-lg font-bold" /></div>
            <div><label className="text-[10px] font-bold text-gray-500 uppercase">Tribunal/Turma</label><input type="text" name="tribunal_turma" value={formData.tribunal_turma} onChange={handleChange} className="w-full p-2 border rounded-lg" /></div>
            <div><label className="text-[10px] font-bold text-gray-500 uppercase">Juiz/Desembargador</label><input type="text" name="juiz_desembargador" value={formData.juiz_desembargador} onChange={handleChange} className="w-full p-2 border rounded-lg" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-[10px] font-bold text-gray-500 uppercase">UF</label><input type="text" name="uf" value={formData.uf} onChange={handleChange} className="w-full p-2 border rounded-lg uppercase" maxLength={2} /></div>
              <div><label className="text-[10px] font-bold text-gray-500 uppercase">Área</label><input type="text" name="area" value={formData.area} onChange={handleChange} className="w-full p-2 border rounded-lg" /></div>
            </div>
            <div className="md:col-span-3"><label className="text-[10px] font-bold text-gray-500 uppercase">Responsável</label><input type="text" name="responsavel_socio" value={formData.responsavel_socio} onChange={handleChange} className="w-full p-2 border rounded-lg" /></div>
          </div>
        </div>

        {/* --- BLOCO DINÂMICO USANDO CHAVE DE STATUS PARA FORÇAR RE-RENDER --- */}
        <div key={formData.status} className="transition-all duration-500">
          
          {/* VISÃO: SOB ANÁLISE */}
          {formData.status === 'Sob Análise' && (
            <div className='bg-amber-50 p-8 rounded-[2rem] border border-amber-100 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in'>
              <div><label className="text-[10px] font-black text-amber-700 uppercase">Data Prospect</label><input type="date" name="data_prospect" value={formData.data_prospect} onChange={handleChange} className="w-full p-3 border-white border-2 rounded-xl" /></div>
              <div><label className="text-[10px] font-black text-amber-700 uppercase">Analisado por</label><input type="text" name="analisado_por" value={formData.analisado_por} onChange={handleChange} className="w-full p-3 border-white border-2 rounded-xl" /></div>
              <div className="md:col-span-2"><label className="text-[10px] font-black text-amber-700 uppercase">Obs Prospect</label><textarea name="obs_prospect" value={formData.obs_prospect} onChange={handleChange} className="w-full p-3 border-white border-2 rounded-xl" rows="3"></textarea></div>
            </div>
          )}

          {/* VISÃO: PROPOSTA ENVIADA */}
          {formData.status === 'Proposta Enviada' && (
            <div className='bg-blue-50 p-8 rounded-[2rem] border border-blue-100 space-y-6 animate-in fade-in'>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="text-[10px] font-black text-blue-700 uppercase">Data Proposta</label><input type="date" name="data_proposta" value={formData.data_proposta} onChange={handleChange} className="w-full p-3 border-white border-2 rounded-xl" /></div>
                <div>
                  <label className="text-[10px] font-black text-blue-700 uppercase mb-2 block">Vincular Proposta (PDF)</label>
                  <label className="cursor-pointer bg-white border-2 border-dashed border-blue-200 p-3 rounded-xl flex items-center justify-center hover:bg-blue-100 transition-all font-black text-[10px] text-blue-600">
                    <Upload size={16} className="mr-2" /> {pdfUrl ? 'PDF CARREGADO' : 'BUSCAR PDF NO COMPUTADOR'}
                    <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white/40 p-6 rounded-2xl">
                <div><label className="text-[9px] font-black text-gray-500 uppercase">Pró-labore (R$)</label><input type="number" step="0.01" name="proposta_pro_labore" value={formData.proposta_pro_labore} onChange={handleChange} className="w-full p-2 border rounded-lg font-bold" /></div>
                <div><label className="text-[9px] font-black text-gray-500 uppercase">Honorário Fixo (R$)</label><input type="number" step="0.01" name="proposta_honorario_fixo" value={formData.proposta_honorario_fixo} onChange={handleChange} className="w-full p-2 border rounded-lg font-bold" /></div>
                <div><label className="text-[9px] font-black text-gray-500 uppercase">Êxito Total (R$)</label><input type="number" step="0.01" name="proposta_exito_total" value={formData.proposta_exito_total} onChange={handleChange} className="w-full p-2 border rounded-lg font-bold" /></div>
                <div><label className="text-[9px] font-black text-gray-500 uppercase">Êxito %</label><input type="number" name="proposta_exito_percentual" value={formData.proposta_exito_percentual} onChange={handleChange} className="w-full p-2 border rounded-lg font-bold" placeholder="%" /></div>
                <div className="flex items-center gap-3 bg-white p-3 rounded-xl col-span-1"><span className="text-[10px] font-black text-gray-400 uppercase">Timesheet?</span><input type="checkbox" name="timesheet" checked={formData.timesheet} onChange={handleChange} className="w-5 h-5" /></div>
                <div className="md:col-span-3"><label className="text-[10px] font-black text-gray-400 uppercase">Outros</label><input type="text" name="outros_financeiro" value={formData.outros_financeiro} onChange={handleChange} className="w-full p-2 border rounded-lg" /></div>
              </div>
              <div className="space-y-4">
                <div><label className="text-[10px] font-black text-blue-700 uppercase">Descrição da Proposta</label><textarea name="descricao_contrato" value={formData.descricao_contrato} onChange={handleChange} className="w-full p-3 border-white border-2 rounded-xl" rows="2"></textarea></div>
                <div><label className="text-[10px] font-black text-blue-700 uppercase">Observações</label><textarea name="observacoes_gerais" value={formData.observacoes_gerais} onChange={handleChange} className="w-full p-3 border-white border-2 rounded-xl" rows="2"></textarea></div>
              </div>
            </div>
          )}

          {/* VISÃO: CONTRATO FECHADO */}
          {formData.status === 'Contrato Fechado' && (
            <div className='bg-emerald-50 p-8 rounded-[2rem] border border-emerald-100 space-y-6 animate-in fade-in'>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div><label className="text-[10px] font-black text-emerald-700 uppercase">Data Contrato</label><input type="date" name="data_contrato" value={formData.data_contrato} onChange={handleChange} className="w-full p-3 border-white border-2 rounded-xl" /></div>
                <div><label className="text-[10px] font-black text-emerald-700 uppercase">Número Hon</label><input type="text" name="numero_hon" value={formData.numero_hon} onChange={handleChange} className="w-full p-3 border-white border-2 rounded-xl" /></div>
                <div><label className="text-[10px] font-black text-emerald-700 uppercase">Número PROC</label><input type="text" name="numero_proc" value={formData.numero_proc} onChange={handleChange} className="w-full p-3 border-white border-2 rounded-xl" /></div>
                <div>
                  <label className="text-[10px] font-black text-emerald-700 uppercase mb-2 block">Vincular Contrato (PDF)</label>
                  <label className="cursor-pointer bg-white border-2 border-dashed border-emerald-200 p-3 rounded-xl flex items-center justify-center hover:bg-emerald-100 font-black text-[10px] text-emerald-700">
                    <Upload size={16} className="mr-2" /> {pdfUrl ? 'ARQUIVO PRONTO' : 'ANEXAR PDF'}
                    <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white/40 p-6 rounded-2xl">
                <div><label className="text-[9px] font-black text-gray-500 uppercase">Pró-labore (R$)</label><input type="number" step="0.01" name="proposta_pro_labore" value={formData.proposta_pro_labore} onChange={handleChange} className="w-full p-2 border rounded-lg font-bold" /></div>
                <div><label className="text-[9px] font-black text-gray-500 uppercase">Honorário Fixo (R$)</label><input type="number" step="0.01" name="proposta_honorario_fixo" value={formData.proposta_honorario_fixo} onChange={handleChange} className="w-full p-2 border rounded-lg font-bold" /></div>
                <div><label className="text-[9px] font-black text-gray-500 uppercase">Êxito Total (R$)</label><input type="number" step="0.01" name="proposta_exito_total" value={formData.proposta_exito_total} onChange={handleChange} className="w-full p-2 border rounded-lg font-bold" /></div>
                <div><label className="text-[9px] font-black text-gray-500 uppercase">Êxito %</label><input type="number" name="proposta_exito_percentual" value={formData.proposta_exito_percentual} onChange={handleChange} className="w-full p-2 border rounded-lg font-bold" /></div>
                <div className="flex items-center gap-3 bg-white p-3 rounded-xl col-span-1"><span className="text-[10px] font-black text-gray-400 uppercase">Timesheet?</span><input type="checkbox" name="timesheet" checked={formData.timesheet} onChange={handleChange} className="w-5 h-5" /></div>
                <div className="md:col-span-3"><label className="text-[10px] font-black text-gray-400 uppercase">Outros</label><input type="text" name="outros_financeiro" value={formData.outros_financeiro} onChange={handleChange} className="w-full p-2 border rounded-lg" /></div>
              </div>
              <div className="space-y-4">
                <div><label className="text-[10px] font-black text-emerald-700 uppercase">Descrição do Contrato</label><textarea name="descricao_contrato" value={formData.descricao_contrato} onChange={handleChange} className="w-full p-3 border-white border-2 rounded-xl" rows="2"></textarea></div>
                <div><label className="text-[10px] font-black text-emerald-700 uppercase">Observações</label><textarea name="observacoes_gerais" value={formData.observacoes_gerais} onChange={handleChange} className="w-full p-3 border-white border-2 rounded-xl" rows="2"></textarea></div>
              </div>
            </div>
          )}

          {/* VISÃO: REJEITADA */}
          {formData.status === 'Rejeitada' && (
            <div className='bg-red-50 p-8 rounded-[2rem] border border-red-100 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in'>
              <div><label className="text-[10px] font-black text-red-700 uppercase">Data Rejeição</label><input type="date" name="data_rejeicao" value={formData.data_rejeicao} onChange={handleChange} className="w-full p-3 border-white border-2 rounded-xl" /></div>
              <div><label className="text-[10px] font-black text-red-700 uppercase">Rejeitado por</label><input type="text" name="rejeitado_por" value={formData.rejeitado_por} onChange={handleChange} className="w-full p-3 border-white border-2 rounded-xl" /></div>
              <div className="md:col-span-2"><label className="text-[10px] font-black text-red-700 uppercase">Observações</label><textarea name="observacoes_gerais" value={formData.observacoes_gerais} onChange={handleChange} className="w-full p-3 border-white border-2 rounded-xl" rows="3"></textarea></div>
            </div>
          )}

          {/* VISÃO: PROBONO */}
          {formData.status === 'Probono' && (
            <div className='bg-purple-50 p-8 rounded-[2rem] border border-purple-100 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in'>
              <div><label className="text-[10px] font-black text-purple-700 uppercase">Data Probono</label><input type="date" name="data_probono" value={formData.data_probono} onChange={handleChange} className="w-full p-3 border-white border-2 rounded-xl" /></div>
              <div><label className="text-[10px] font-black text-purple-700 uppercase">Enviado Por</label><input type="text" name="enviado_por" value={formData.enviado_por} onChange={handleChange} className="w-full p-3 border-white border-2 rounded-xl" /></div>
              <div className="md:col-span-2"><label className="text-[10px] font-black text-purple-700 uppercase">Observações</label><textarea name="observacoes_gerais" value={formData.observacoes_gerais} onChange={handleChange} className="w-full p-3 border-white border-2 rounded-xl" rows="3"></textarea></div>
            </div>
          )}
        </div>

        <div className='flex justify-end pt-6'>
          <button type='submit' disabled={loading || uploading} className='bg-[#0F2C4C] text-white px-20 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-900 transition-all disabled:opacity-50 flex items-center gap-3'>
            {loading ? <Loader2 size={18} className='animate-spin'/> : <Save size={20} />} Finalizar e Salvar
          </button>
        </div>
      </form>
    </div>
  )
}

export default NovoContrato
