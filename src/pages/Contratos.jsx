import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Search, Plus, FileText, Download, Upload, 
  CheckCircle2, Edit3, X, Save, AlertCircle 
} from 'lucide-react';

const Contratos = () => {
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContrato, setEditingContrato] = useState(null);
  
  // Estado para o formulário (Novo ou Edição)
  const [formData, setFormData] = useState({
    cliente_id: '',
    status: 'Sob Análise',
    descricao_contrato: '',
    observacoes_gerais: ''
  });

  useEffect(() => {
    fetchContratos();
  }, []);

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
        observacoes_gerais: contrato.observacoes_gerais || ''
      });
    } else {
      setEditingContrato(null);
      setFormData({ cliente_id: '', status: 'Sob Análise', descricao_contrato: '', observacoes_gerais: '' });
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
      const fileExt = file.name.split('.').pop();
      const fileName = `${contratoId}_${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('contratos_ged')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('contratos_ged').getPublicUrl(fileName);

      await supabase
        .from('contratos')
        .update({ 
          arquivo_pdf_url: urlData.publicUrl,
          data_vinculo_pdf: new Date().toISOString()
        })
        .eq('id', contratoId);

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
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#0F2C4C] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-900 transition-all"
        >
          <Plus size={20} /> Novo Caso
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Descrição do Contrato</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">GED (PDF)</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {contratos.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-800 text-sm">{c.clientes?.razao_social}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm italic">{c.descricao_contrato || 'Sem descrição'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                      c.status === 'Contrato Fechado' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {c.status === 'Contrato Fechado' && (
                      <div className="flex items-center gap-2">
                        {c.arquivo_pdf_url ? (
                          <a href={c.arquivo_pdf_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-xs font-bold">
                            <CheckCircle2 size={16} /> Ver PDF
                          </a>
                        ) : (
                          <label className="cursor-pointer bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 hover:bg-blue-100">
                            <Upload size={14} /> Vincular PDF
                            <input type="file" accept=".pdf" className="hidden" onChange={(e) => handleUploadPDF(e, c.id)} />
                          </label>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleOpenModal(c)}
                      className="p-2 text-gray-400 hover:text-[#0F2C4C] hover:bg-gray-100 rounded-lg transition-all"
                    >
                      <Edit3 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE CADASTRO/EDIÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 bg-[#0F2C4C] text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingContrato ? 'Editar Caso' : 'Novo Caso'}</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={24}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-1">Descrição do Contrato</label>
                <textarea 
                  className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm outline-none focus:border-[#0F2C4C]"
                  rows="3"
                  value={formData.descricao_contrato}
                  onChange={(e) => setFormData({...formData, descricao_contrato: e.target.value})}
                  placeholder="Ex: Contrato de Prestação de Serviços de Assessoria Jurídica Mensal"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-1">Observações Gerais</label>
                <textarea 
                  className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm outline-none focus:border-[#0F2C4C]"
                  rows="2"
                  value={formData.observacoes_gerais}
                  onChange={(e) => setFormData({...formData, observacoes_gerais: e.target.value})}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border-2 border-gray-100 rounded-2xl font-bold text-gray-400 uppercase text-xs">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-[#0F2C4C] text-white rounded-2xl font-bold uppercase text-xs flex items-center justify-center gap-2">
                  <Save size={18}/> Salvar Dados
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
