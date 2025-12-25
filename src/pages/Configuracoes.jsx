import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Search, Plus, FileText, Upload, 
  CheckCircle2, Edit3, X, Save, DollarSign, Briefcase
} from 'lucide-react';

const Contratos = () => {
  const [contratos, setContratos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContrato, setEditingContrato] = useState(null);
  
  const [formData, setFormData] = useState({
    cliente_id: '',
    status: 'Sob Análise',
    descricao_contrato: '',
    observacoes_gerais: '',
    proposta_pro_labore: 0,
    proposta_exito_total: 0,
    proposta_fixo_mensal: 0,
    data_proposta: '',
    data_contrato: '',
    contrato_assinado: false
  });

  useEffect(() => {
    fetchContratos();
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    const { data } = await supabase.from('clientes').select('id, razao_social').order('razao_social');
    setClientes(data || []);
  };

  const fetchContratos = async () => {
    try {
      const { data } = await supabase
        .from('contratos')
        .select('*, clientes(razao_social)')
        .order('created_at', { ascending: false });
      setContratos(data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (contrato = null) => {
    if (contrato) {
      setEditingContrato(contrato);
      setFormData({
        cliente_id: contrato.cliente_id,
        status: contrato.status,
        descricao_contrato: contrato.descricao_contrato || '',
        observacoes_gerais: contrato.observacoes_gerais || '',
        proposta_pro_labore: contrato.proposta_pro_labore || 0,
        proposta_exito_total: contrato.proposta_exito_total || 0,
        proposta_fixo_mensal: contrato.proposta_fixo_mensal || 0,
        data_proposta: contrato.data_proposta || '',
        data_contrato: contrato.data_contrato || '',
        contrato_assinado: contrato.contrato_assinado || false
      });
    } else {
      setEditingContrato(null);
      setFormData({
        cliente_id: '',
        status: 'Sob Análise',
        descricao_contrato: '',
        observacoes_gerais: '',
        proposta_pro_labore: 0,
        proposta_exito_total: 0,
        proposta_fixo_mensal: 0,
        data_proposta: new Date().toISOString().split('T')[0],
        data_contrato: '',
        contrato_assinado: false
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingContrato) {
        await supabase.from('contratos').update(formData).eq('id', editingContrato.id);
      } else {
        await supabase.from('contratos').insert([formData]);
      }
      setIsModalOpen(false);
      fetchContratos();
    } catch (error) {
      alert("Erro ao salvar: " + error.message);
    }
  };

  const handleUploadPDF = async (event, contratoId) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const fileName = `ged_${contratoId}_${Date.now()}.pdf`;
      const { error: uploadError } = await supabase.storage.from('contratos_ged').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('contratos_ged').getPublicUrl(fileName);
      await supabase.from('contratos').update({ 
        arquivo_pdf_url: urlData.publicUrl,
        data_vinculo_pdf: new Date().toISOString()
      }).eq('id', contratoId);
      alert('Contrato PDF vinculado ao GED!');
      fetchContratos();
    } catch (error) {
      alert('Erro no upload: ' + error.message);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-[#0F2C4C]">Gestão de Contratos</h1>
        <button onClick={() => handleOpenModal()} className="bg-[#0F2C4C] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-900 transition-all shadow-lg">
          <Plus size={20} /> Novo Caso
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Descrição</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {contratos.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-800">{c.clientes?.razao_social}</td>
                  <td className="px-6 py-4 text-gray-500 italic">{c.descricao_contrato || '---'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                      c.status === 'Contrato Fechado' ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-3">
                    {c.status === 'Contrato Fechado' && (
                      <div className="flex items-center">
                        {c.arquivo_pdf_url ? (
                          <div className="text-emerald-600 flex items-center gap-1 text-[10px] font-black px-2 py-1 bg-emerald-50 rounded-lg">
                            <CheckCircle2 size={14} /> GED OK
                          </div>
                        ) : (
                          <label className="cursor-pointer bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 hover:bg-blue-100 transition-all">
                            <Upload size={14} /> Vincular PDF
                            <input type="file" accept=".pdf" className="hidden" onChange={(e) => handleUploadPDF(e, c.id)} />
                          </label>
                        )}
                      </div>
                    )}
                    <button onClick={() => handleOpenModal(c)} className="p-2 text-gray-400 hover:text-[#0F2C4C] hover:bg-gray-100 rounded-lg">
                      <Edit3 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0F2C4C]/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 bg-[#0F2C4C] text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingContrato ? 'Editar Caso' : 'Cadastrar Novo Caso'}</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={24}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Cliente</label>
                    <select required className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm outline-none"
                      value={formData.cliente_id} onChange={(e) => setFormData({...formData, cliente_id: e.target.value})}>
                      <option value="">Selecione o Cliente</option>
                      {clientes.map(cli => <option key={cli.id} value={cli.id}>{cli.razao_social}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Descrição do Contrato (HON)</label>
                    <textarea required className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm outline-none focus:border-[#0F2C4C]"
                      rows="3" value={formData.descricao_contrato} onChange={(e) => setFormData({...formData, descricao_contrato: e.target.value})} />
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-3xl space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Pró-Labore (R$)</label>
                      <input type="number" className="w-full p-2.5 rounded-lg border border-gray-200" 
                        value={formData.proposta_pro_labore} onChange={(e) => setFormData({...formData, proposta_pro_labore: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Fixo Mensal (R$)</label>
                      <input type="number" className="w-full p-2.5 rounded-lg border border-gray-200" 
                        value={formData.proposta_fixo_mensal} onChange={(e) => setFormData({...formData, proposta_fixo_mensal: e.target.value})} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t sticky bottom-0 bg-white">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border-2 border-gray-100 rounded-2xl font-bold text-gray-400 uppercase text-xs">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-[#0F2C4C] text-white rounded-2xl font-bold uppercase text-xs flex items-center justify-center gap-2">
                  <Save size={18}/> Salvar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contratos;
