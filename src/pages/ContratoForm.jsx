import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Save, ArrowLeft, Briefcase, DollarSign, Calendar, CheckCircle } from 'lucide-react';

const ContratoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
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

  useEffect(() => {
    fetchClientes();
    if (id) fetchContrato();
  }, [id]);

  const fetchClientes = async () => {
    const { data } = await supabase.from('clientes').select('id, razao_social').order('razao_social');
    setClientes(data || []);
  };

  const fetchContrato = async () => {
    const { data } = await supabase.from('contratos').select('*').eq('id', id).single();
    if (data) setFormData(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await supabase.from('contratos').update(formData).eq('id', id);
      } else {
        await supabase.from('contratos').insert([formData]);
      }
      navigate('/contratos');
    } catch (error) {
      alert("Erro ao salvar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/contratos')} className="flex items-center gap-2 text-gray-500 hover:text-[#0F2C4C] font-bold transition-colors">
          <ArrowLeft size={20} /> Voltar para Lista
        </button>
        <div className="text-right">
          <h1 className="text-2xl font-black text-[#0F2C4C] uppercase tracking-tighter">
            {id ? 'Edição de Contrato' : 'Abertura de Novo Caso'}
          </h1>
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Controladoria Salomão Advogados</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-blue-900/5 overflow-hidden">
        <div className="p-8 space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* COLUNA ESQUERDA: DADOS DO CONTRATO */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-[#0F2C4C] font-black uppercase text-xs tracking-widest border-b pb-2">
                <Briefcase size={16} className="text-blue-600"/> Informações Operacionais
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Cliente Solicitante</label>
                  <select required className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl p-4 text-sm font-bold outline-none focus:bg-white focus:border-[#0F2C4C] transition-all"
                    value={formData.cliente_id} onChange={(e) => setFormData({...formData, cliente_id: e.target.value})}>
                    <option value="">Selecione o Cliente...</option>
                    {clientes.map(cli => <option key={cli.id} value={cli.id}>{cli.razao_social}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Descrição do Contrato (HON)</label>
                  <textarea required className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl p-4 text-sm font-medium outline-none focus:bg-white focus:border-[#0F2C4C] transition-all"
                    rows="4" value={formData.descricao_contrato} onChange={(e) => setFormData({...formData, descricao_contrato: e.target.value})}
                    placeholder="Descreva o objeto do contrato ou honorários..." />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Status Atual</label>
                  <select className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl p-4 text-sm font-black text-[#0F2C4C] outline-none focus:bg-white focus:border-[#0F2C4C] transition-all uppercase"
                    value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                    <option value="Sob Análise">Sob Análise</option>
                    <option value="Proposta Enviada">Proposta Enviada</option>
                    <option value="Contrato Fechado">Contrato Fechado</option>
                    <option value="Rejeitada">Rejeitada</option>
                    <option value="Probono">Probono</option>
                  </select>
                </div>
              </div>
            </div>

            {/* COLUNA DIREITA: FINANCEIRO E DATAS */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-[#0F2C4C] font-black uppercase text-xs tracking-widest border-b pb-2">
                <DollarSign size={16} className="text-emerald-600"/> Detalhes Financeiros
              </div>

              <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Pró-Labore (R$)</label>
                  <input type="number" step="0.01" className="w-full p-3 rounded-xl border-2 border-white shadow-sm font-bold text-sm" 
                    value={formData.proposta_pro_labore} onChange={(e) => setFormData({...formData, proposta_pro_labore: e.target.value})} />
                </div>
                <div className="col-span-1">
                  <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Fixo Mensal (R$)</label>
                  <input type="number" step="0.01" className="w-full p-3 rounded-xl border-2 border-white shadow-sm font-bold text-sm" 
                    value={formData.proposta_fixo_mensal} onChange={(e) => setFormData({...formData, proposta_fixo_mensal: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Êxito Estimado (R$)</label>
                  <input type="number" step="0.01" className="w-full p-3 rounded-xl border-2 border-white shadow-sm font-bold text-sm" 
                    value={formData.proposta_exito_total} onChange={(e) => setFormData({...formData, proposta_exito_total: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1"><Calendar size={12} className="inline mr-1"/> Data Proposta</label>
                  <input type="date" className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl p-4 text-sm font-bold"
                    value={formData.data_proposta} onChange={(e) => setFormData({...formData, data_proposta: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1"><Calendar size={12} className="inline mr-1"/> Data Contrato</label>
                  <input type="date" className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl p-4 text-sm font-bold"
                    value={formData.data_contrato} onChange={(e) => setFormData({...formData, data_contrato: e.target.value})} />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">O Contrato já foi assinado?</span>
                <input type="checkbox" className="w-6 h-6 rounded-lg accent-emerald-600" 
                  checked={formData.contrato_assinado} onChange={(e) => setFormData({...formData, contrato_assinado: e.target.checked})} />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Observações Internas (Gerais)</label>
            <textarea className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl p-4 text-sm font-medium outline-none focus:bg-white focus:border-[#0F2C4C] transition-all"
              rows="3" value={formData.observacoes_gerais} onChange={(e) => setFormData({...formData, observacoes_gerais: e.target.value})}
              placeholder="Notas internas não visíveis no GED..." />
          </div>
        </div>

        <div className="p-8 bg-gray-50 flex justify-end gap-4">
          <button type="button" onClick={() => navigate('/contratos')} className="px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 hover:text-gray-600 transition-all">
            Descartar
          </button>
          <button type="submit" disabled={loading} className="bg-[#0F2C4C] text-white px-12 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-blue-900 shadow-xl shadow-blue-900/20 transition-all disabled:opacity-50">
            {loading ? 'Salvando...' : <><Save size={18} /> Confirmar Registro</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContratoForm;
