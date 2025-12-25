import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Search, Plus, FileText, Download, Upload, 
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
      const fileName = `${contratoId}_${Date.now()}.pdf`;
      const { error: uploadError } = await supabase.storage.from('contratos_ged').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('contratos_ged').getPublicUrl(fileName);
      await supabase.from('contratos').update({ 
        arquivo_pdf_url: urlData.publicUrl,
        data_vinculo_pdf: new Date().toISOString()
      }).eq('id', contratoId);
      alert('PDF vinculado com sucesso!');
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
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Financeiro</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">GED</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {contratos.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-800 text-sm">{c.clientes?.razao_social}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs max-w-xs truncate">{c.descricao_contrato || '---'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                      c.status === 'Contrato Fechado' ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[10px] font-bold text-gray-600">
                    <div>PL: R$ {c.proposta_pro_labore?.toLocaleString()}</div>
                    <div className="text-blue-500">Men: R$ {c.proposta_fixo_mensal?.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    {c.status === 'Contrato Fechado' && (
                      c.arquivo_pdf_url ? (
                        <a href={c.arquivo_pdf_url} target="_blank" rel="noreferrer" className="text-emerald-600 flex items-center gap-1 text-[10px] font-black">
                          <CheckCircle2 size={14} /> PDF OK
                        </a>
                      ) : (
                        <label className="cursor-pointer text-blue-600 text-[10px] font-black uppercase flex items-center gap-1">
                          <Upload size={14} /> Anexar
                          <input type="file" accept=".pdf" className="hidden" onChange={(e) => handleUploadPDF(e, c.id)} />
                        </label>
                      )
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
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

      {/* MODAL COMPLETO COM TODOS OS CAMPOS */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0F2C4C]/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 bg-[#0F2C4C] text-white flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Briefcase size={20} className="text-yellow-500" />
                {editingContrato ? 'Editar Caso' : 'Cadastrar Novo Caso'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-all"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* DADOS BÁSICOS */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Cliente</label>
                    <select 
                      required
                      className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm outline-none focus:border-[#0F2C4C]"
                      value={formData.cliente_id}
                      onChange={(e) => setFormData({...formData, cliente_id: e.target.value})}
                    >
                      <option value="">Selecione o Cliente</option>
                      {clientes.map(cli => <option key={cli.id} value={cli.id}>{cli.razao_social}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Status do Caso</label>
                    <select 
                      className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm outline-none focus:border-[#0F2C4C]"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="Sob Análise">Sob Análise</option>
                      <option value="Proposta Enviada">Proposta Enviada</option>
                      <option value="Contrato Fechado">Contrato Fechado</option>
                      <option value="Rejeitada">Rejeitada</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Descrição do Contrato (HON)</label>
                    <textarea 
                      required
                      className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm outline-none focus:border-[#0F2C4C]"
                      rows="3"
                      value={formData.descricao_contrato}
                      onChange={(e) => setFormData({...formData, descricao_contrato: e.target.value})}
                      placeholder="Ex: Consultoria em LGPD para RH"
                    />
                  </div>
                </div>

                {/* FINANCEIRO */}
                <div className="bg-gray-50 p-6 rounded-3xl space-y-4">
                  <h3 className="text-xs font-black text-[#0F2C4C] uppercase flex items-center gap-2 mb-2">
                    <DollarSign size={14} /> Valores da Proposta
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Pró-Labore (R$)</label>
                      <input type="number" className="w-full p-2.5 rounded-lg border border-gray-200 text-sm" 
                        value={formData.proposta_pro_labore} 
                        onChange={(e) => setFormData({...formData, proposta_pro_labore: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Fixo Mensal (R$)</label>
                      <input type="number" className="w-full p-2.5 rounded-lg border border-gray-200 text-sm" 
                        value={formData.proposta_fixo_mensal} 
                        onChange={(e) => setFormData({...formData, proposta_fixo_mensal: e.target.value})} />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Expectativa de Êxito (R$)</label>
                      <input type="number" className="w-full p-2.5 rounded-lg border border-gray-200 text-sm" 
                        value={formData.proposta_exito_total} 
                        onChange={(e) => setFormData({...formData, proposta_exito_total: e.target.value})} />
                    </div>
                  </div>
                </div>
              </div>

              {/* DATAS E OBSERVAÇÕES */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Data da Proposta</label>
                  <input type="date" className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm" 
                    value={formData.data_proposta} 
                    onChange={(e) => setFormData({...formData, data_proposta: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Data do Contrato</label>
                  <input type="date" className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm" 
                    value={formData.data_contrato} 
                    onChange={(e) => setFormData({...formData, data_contrato: e.target.value})} />
                </div>
                <div className="flex items-end pb-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 rounded accent-[#0F2C4C]" 
                      checked={formData.contrato_assinado} 
                      onChange={(e) => setFormData({...formData, contrato_assinado: e.target.checked})} />
                    <span className="text-[10px] font-black text-gray-600 uppercase">Contrato Assinado?</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Observações Gerais</label>
                <textarea 
                  className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm outline-none focus:border-[#0F2C4C]"
                  rows="2"
                  value={formData.observacoes_gerais}
                  onChange={(e) => setFormData({...formData, observacoes_gerais: e.target.value})}
                />
              </div>

              <div className="flex gap-4 pt-4 border-t sticky bottom-0 bg-white">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border-2 border-gray-100 rounded-2xl font-bold text-gray-400 uppercase text-xs hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-[#0F2C4C] text-white rounded-2xl font-bold uppercase text-xs flex items-center justify-center gap-2 hover:bg-blue-900 shadow-xl shadow-blue-900/20 transition-all">
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
