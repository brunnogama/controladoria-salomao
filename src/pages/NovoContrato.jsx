import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import {
  Save, ArrowLeft, Search, Plus, Trash2, AlertCircle, Upload, CheckCircle2, Loader2
} from 'lucide-react'

const CamposFinanceiros = ({ values, onChange }) => {
  const handleKeyDown = (e) => {
    if ([46, 8, 9, 27, 13, 110, 190, 188].indexOf(e.keyCode) !== -1 ||
      (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
      (e.keyCode >= 35 && e.keyCode <= 40)) return;
    if ((e.shiftKey || e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) e.preventDefault();
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-[2rem] border border-gray-100 mt-4 shadow-sm'>
      <div className='md:col-span-3 font-black text-[10px] text-[#0F2C4C] uppercase tracking-[0.2em] border-b pb-2 mb-2'>
        Detalhamento da Proposta Financeira
      </div>
      <div>
        <label className='block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1'>Pró-labore (R$)</label>
        <input type='number' step='0.01' name='proposta_pro_labore' value={values.proposta_pro_labore} onChange={onChange} onKeyDown={handleKeyDown}
          className='w-full p-3 border-2 border-gray-50 bg-gray-50 rounded-xl font-bold text-[#0F2C4C] outline-none focus:bg-white focus:border-[#0F2C4C]' placeholder='0.00' />
      </div>
      <div>
        <label className='block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1'>Êxito Total (R$)</label>
        <input type='number' step='0.01' name='proposta_exito_total' value={values.proposta_exito_total} onChange={onChange} onKeyDown={handleKeyDown}
          className='w-full p-3 border-2 border-gray-50 bg-gray-50 rounded-xl font-bold text-[#0F2C4C] outline-none focus:bg-white focus:border-[#0F2C4C]' placeholder='0.00' />
      </div>
      <div>
        <label className='block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1'>Fixo Mensal (R$)</label>
        <input type='number' step='0.01' name='proposta_fixo_mensal' value={values.proposta_fixo_mensal} onChange={onChange} onKeyDown={handleKeyDown}
          className='w-full p-3 border-2 border-gray-50 bg-gray-50 rounded-xl font-bold text-blue-600 outline-none focus:bg-white focus:border-blue-600' placeholder='0.00' />
      </div>
      <div className='md:col-span-3'>
        <label className='block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1'>Descrição do Contrato (HON)</label>
        <textarea name='proposta_obs' value={values.proposta_obs} onChange={onChange} className='w-full p-3 border-2 border-gray-50 bg-gray-50 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-[#0F2C4C]' rows="2" placeholder='Detalhes do objeto contratual...' />
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
    status: 'Sob Análise', cnpj: '', razao_social: '', parte_contraria: '', responsavel_socio: '',
    data_prospect: '', analisado_por: '', obs_prospect: '', data_proposta: new Date().toISOString().split('T')[0],
    proposta_pro_labore: '', proposta_exito_total: '', proposta_exito_percentual: '',
    proposta_fixo_mensal: '', proposta_fixo_parcelas: '', proposta_obs: '',
    observacoes_gerais: '', data_contrato: '', contrato_assinado: false, numero_hon: '',
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileName = `ged_${Date.now()}_${file.name.replace(/\s/g, '_')}`;
      const { data, error } = await supabase.storage.from('contratos_ged').upload(fileName, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('contratos_ged').getPublicUrl(fileName);
      setPdfUrl(urlData.publicUrl);
    } catch (error) {
      alert('Erro no Upload (RLS): Verifique as políticas do Bucket no Supabase. ' + error.message);
    } finally { setUploading(false); }
  };

  const buscarCNPJ = async () => {
    const cnpjLimpo = formData.cnpj.replace(/\D/g, '')
    if (cnpjLimpo.length !== 14) return alert('CNPJ inválido!')
    setLoading(true)
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`)
      const data = await response.json()
      if (data.razao_social) setFormData(prev => ({ ...prev, razao_social: data.razao_social }));
    } catch (error) { alert('Erro ao buscar CNPJ'); }
    finally { setLoading(false); }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let clienteId;
      const { data: cli } = await supabase.from('clientes').select('id').eq('cnpj', formData.cnpj).single();
      if (cli) { clienteId = cli.id; } 
      else {
        const { data: nCli } = await supabase.from('clientes').insert([{ cnpj: formData.cnpj, razao_social: formData.razao_social }]).select().single();
        clienteId = nCli.id;
      }

      await supabase.from('contratos').insert([{
        cliente_id: clienteId, status: formData.status, responsavel_socio: formData.responsavel_socio,
        data_proposta: formData.data_proposta, proposta_pro_labore: formData.proposta_pro_labore,
        proposta_exito_total: formData.proposta_exito_total, proposta_fixo_mensal: formData.proposta_fixo_mensal,
        descricao_contrato: formData.proposta_obs, observacoes_gerais: formData.observacoes_gerais,
        arquivo_pdf_url: pdfUrl, data_vinculo_pdf: pdfUrl ? new Date() : null,
        data_contrato: formData.data_contrato || null, contrato_assinado: formData.contrato_assinado
      }]);
      navigate('/contratos');
    } catch (error) { alert('Erro ao salvar: ' + error.message); }
    finally { setLoading(false); }
  }

  return (
    <div className='w-full max-w-5xl mx-auto space-y-6 pb-20 animate-in fade-in'>
      <div className='flex items-center gap-4 mb-8'>
        <button onClick={() => navigate('/contratos')} className='p-2 hover:bg-gray-100 rounded-full transition-colors'>
          <ArrowLeft size={24} className='text-[#0F2C4C]' />
        </button>
        <h1 className='text-3xl font-black text-[#0F2C4C] tracking-tighter uppercase italic'>Novo Contrato</h1>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-6'>
          <h2 className='font-black text-[10px] text-blue-600 uppercase tracking-[0.2em] border-b pb-2'>1. Status e Cliente</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1'>Status do Caso</label>
              <select name='status' value={formData.status} onChange={handleChange} className='w-full p-4 border-2 border-gray-50 bg-gray-50 rounded-2xl font-black text-[#0F2C4C] outline-none focus:bg-white focus:border-[#0F2C4C] uppercase'>
                <option value='Sob Análise'>Sob Análise</option>
                <option value='Proposta Enviada'>Proposta Enviada</option>
                <option value='Contrato Fechado'>Contrato Fechado</option>
                <option value='Rejeitada'>Rejeitada</option>
              </select>
            </div>
            <div>
              <label className='block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1'>CNPJ</label>
              <div className='flex gap-2'>
                <input type='text' name='cnpj' value={formData.cnpj} onChange={handleChange} className='flex-1 p-4 border-2 border-gray-50 bg-gray-50 rounded-2xl font-bold outline-none focus:bg-white focus:border-[#0F2C4C]' placeholder='00.000.000/0000-00' />
                <button type='button' onClick={buscarCNPJ} className='bg-[#0F2C4C] text-white p-4 rounded-2xl hover:bg-blue-900 transition-colors shadow-lg'><Search size={20} /></button>
              </div>
            </div>
          </div>
        </div>

        {formData.status === 'Contrato Fechado' && (
          <div className='bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100 space-y-4 animate-in slide-in-from-top-4'>
            <h2 className='font-black text-[10px] text-emerald-700 uppercase tracking-[0.2em] border-b border-emerald-200 pb-2'>Módulo GED: Vínculo de PDF</h2>
            <div className="flex items-center gap-6">
              <label className="flex-1 cursor-pointer bg-white border-2 border-dashed border-emerald-300 p-8 rounded-[2rem] flex flex-col items-center justify-center hover:bg-emerald-100 transition-all group">
                {uploading ? <Loader2 size={32} className="animate-spin text-emerald-500" /> : <Upload size={32} className="text-emerald-500 group-hover:scale-110 transition-transform" />}
                <span className="text-xs font-black text-emerald-800 uppercase mt-4">{pdfUrl ? 'PDF Vinculado com Sucesso!' : 'Clique para selecionar o Contrato em PDF'}</span>
                <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
              </label>
              {pdfUrl && <div className="bg-white p-4 rounded-2xl shadow-sm text-emerald-600"><CheckCircle2 size={32} /></div>}
            </div>
          </div>
        )}

        <CamposFinanceiros values={formData} onChange={handleChange} />

        <div className='flex justify-end gap-4'>
          <button type='button' onClick={() => navigate('/contratos')} className='px-10 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest'>Cancelar</button>
          <button type='submit' disabled={loading || uploading} className='bg-[#0F2C4C] text-white px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-900 transition-all disabled:opacity-50 flex items-center gap-3'>
            <Save size={20} /> {loading ? 'Sincronizando...' : 'Finalizar Registro'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default NovoContrato
