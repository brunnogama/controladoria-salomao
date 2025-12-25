import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Save, ArrowLeft, Briefcase, DollarSign } from 'lucide-react';

const ContratoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [formData, setFormData] = useState({
    cliente_id: '',
    status: 'Sob Análise',
    descricao_contrato: '', // Antigo observacoes_proposta
    observacoes_gerais: '', // Novo campo
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
    try {
      if (id) {
        await supabase.from('contratos').update(formData).eq('id', id);
      } else {
        await supabase.from('contratos').insert([formData]);
      }
      navigate('/contratos');
    } catch (error) {
      alert("Erro ao salvar: " + error.message);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/contratos')} className="flex items-center gap-2 text-gray-500 hover:text-[#0F2C4C] font-bold">
          <ArrowLeft size={20} /> Voltar
        </button>
        <h1 className="text-2xl font-black text-[#0F2C4C] uppercase tracking-tighter">
          {id ? 'Editar Contrato' : 'Novo Contrato'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Cliente</label>
                <select required className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm"
                  value={formData.cliente_id} onChange={(e) => setFormData({...formData, cliente_id: e.target.value})}>
                  <option value="">Selecione o Cliente</option>
                  {clientes.map(cli => <option key={cli.id} value={cli.id}>{cli.razao_social}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Descrição do Contrato (HON)</label>
                <textarea required className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm"
                  rows="3" value={formData.descricao_contrato} onChange={(e) => setFormData({...formData, descricao_contrato: e.target.value})} />
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-3xl space-y-4">
              <h3 className="text-[10px] font-black text-[#0F2C4C] uppercase mb-2">Financeiro</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase">Pró-Labore</label>
                  <input type="number" className="w-full p-2 border rounded-lg" value={formData.proposta_pro_labore} 
                    onChange={(e) => setFormData({...formData, proposta_pro_labore: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase">Mensal</label>
                  <input type="number" className="w-full p-2 border rounded-lg" value={formData.proposta_fixo_mensal} 
                    onChange={(e) => setFormData({...formData, proposta_fixo_mensal: e.target.value})} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Status</label>
              <select className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm font-bold"
                value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                <option value="Sob Análise">Sob Análise</option>
                <option value="Proposta Enviada">Proposta Enviada</option>
                <option value="Contrato Fechado">Contrato Fechado</option>
                <option value="Rejeitada">Rejeitada</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Observações Gerais</label>
              <textarea className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm"
                rows="2" value={formData.observacoes_gerais} onChange={(e) => setFormData({...formData, observacoes_gerais: e.target.value})} />
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 flex justify-end">
          <button type="submit" className="bg-[#0F2C4C] text-white px-10 py-4 rounded-2xl font-black uppercase text-xs flex items-center gap-2 hover:bg-blue-900 shadow-xl transition-all">
            <Save size={18} /> Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContratoForm;
