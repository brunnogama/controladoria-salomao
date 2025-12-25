import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Save, ArrowLeft, Briefcase, DollarSign, Calendar, Search, Loader2 } from 'lucide-react';

const ContratoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchingCnpj, setSearchingCnpj] = useState(false);
  const [clienteNome, setClienteNome] = useState('');
  
  const [formData, setFormData] = useState({
    cliente_id: '',
    cnpj_cliente: '', // Campo auxiliar para busca
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
    if (id) fetchContrato();
  }, [id]);

  const fetchContrato = async () => {
    const { data } = await supabase
      .from('contratos')
      .select('*, clientes(razao_social, cnpj)')
      .eq('id', id)
      .single();
    
    if (data) {
      setFormData({
        ...data,
        cnpj_cliente: data.clientes?.cnpj || ''
      });
      setClienteNome(data.clientes?.razao_social || '');
    }
  };

  // Função para buscar cliente pelo CNPJ
  const buscarClientePorCnpj = async (cnpj) => {
    if (cnpj.length < 11) return;
    setSearchingCnpj(true);
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, razao_social')
        .eq('cnpj', cnpj)
        .single();

      if (data) {
        setFormData(prev => ({ ...prev, cliente_id: data.id }));
        setClienteNome(data.razao_social);
      } else {
        setClienteNome('Cliente não encontrado');
        setFormData(prev => ({ ...prev, cliente_id: '' }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingCnpj(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cliente_id) {
      alert("Por favor, localize um cliente válido pelo CNPJ antes de salvar.");
      return;
    }
    setLoading(true);
    try {
      // Removemos cnpj_cliente antes de enviar ao banco pois ele é apenas para busca
      const { cnpj_cliente, ...dadosParaSalvar } = formData;
      if (id) {
        await supabase.from('contratos').update(dadosParaSalvar).eq('id', id);
      } else {
        await supabase.from('contratos').insert([dadosParaSalvar]);
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
        <button onClick={() => navigate('/contratos')} className="flex items-center gap-2 text-gray-500 hover:text-[#0F2C4C] font-bold">
          <ArrowLeft size={20} /> Voltar
        </button>
        <div className="text-right">
          <h1 className="text-2xl font-black text-[#0F2C4C] uppercase tracking-tighter">
            {id ? 'Edição de Contrato' : 'Abertura de Novo Caso'}
          </h1>
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Flow Metrics System</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-8 space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* COLUNA ESQUERDA: STATUS E CLIENTE */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-[#0F2C4C] font-black uppercase text-xs tracking-widest border-b pb-2">
                <Briefcase size={16} className="text-blue-600"/> Triagem e Identificação
              </div>
              
              <div className="grid grid-cols-1 gap-5">
                {/* 1º LUGAR: STATUS DO CASO */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">1. Status do Caso</label>
                  <select className="w-full bg-blue-50 border-2 border-blue-50 rounded-2xl p-4 text-sm font-black text-[#0F2C4C] outline-none focus:bg-white focus:border-[#0F2C4C] transition-all uppercase"
                    value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                    <option value="Sob Análise">Sob Análise</option>
                    <option value="Proposta Enviada">Proposta Enviada</option>
                    <option value="Contrato Fechado">Contrato Fechado</option>
                    <option value="Rejeitada">Rejeitada</option>
                    <option value="Probono">Probono</option>
                  </select>
                </div>

                {/* 2º LUGAR: CNPJ E AUTO-PREENCHIMENTO */}
                <div className="grid grid-cols-1 gap-4 p-5 bg-gray-50 rounded-[2rem] border border-gray-100">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1 text-blue-600">2. Digite o CNPJ do Cliente</label>
                    <div className="relative">
                      <input 
                        type="text"
                        placeholder="00.000.000/0000-00"
                        className="w-full bg-white border-2 border-gray-100 rounded-xl p-3 text-sm font-bold outline-none focus:border-blue-500"
                        value={formData.cnpj_cliente}
                        onChange={(e) => setFormData({...formData, cnpj_cliente: e.target.value})}
                        onBlur={(e) => buscarClientePorCnpj(e.target.value)}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {searchingCnpj ? <Loader2 size={18} className="animate-spin text-blue-500"/> : <Search size={18} className="text-gray-300"/>}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Razão Social Identificada</label>
                    <input 
                      type="text" 
                      readOnly
                      className="w-full bg-transparent border-none p-1 text-sm font-black text-[#0F2C4C] outline-none"
                      value={clienteNome || 'Aguardando CNPJ...'}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Descrição do Contrato (HON)</label>
                  <textarea required className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl p-4 text-sm font-medium outline-none focus:bg-white focus:border-[#0F2C4C] transition-all"
                    rows="3" value={formData.descricao_contrato} onChange={(e) => setFormData({...formData, descricao_contrato: e.target.value})}
                    placeholder="Objeto da contratação..." />
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
                  <input type="number" step="0.01" className="w-full p-3 rounded-xl border-2 border-white shadow-sm font-bold text-sm outline-none" 
                    value={formData.proposta_pro_labore} onChange={(e) => setFormData({...formData, proposta_pro_labore: e.target.value})} />
                </div>
                <div className="col-span-1">
                  <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Fixo Mensal (R$)</label>
                  <input type="number" step="0.01" className="w-full p-3 rounded-xl border-2 border-white shadow-sm font-bold text-sm outline-none" 
                    value={formData.proposta_fixo_mensal} onChange={(e) => setFormData({...formData, proposta_fixo_mensal: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Expectativa de Êxito (R$)</label>
                  <input type="number" step="0.01" className="w-full p-3 rounded-xl border-2 border-white shadow-sm font-bold text-sm outline-none" 
                    value={formData.proposta_exito_total} onChange={(e) => setFormData({...formData, proposta_exito_total: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Data Proposta</label>
                  <input type="date" className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl p-4 text-sm font-bold outline-none"
                    value={formData.data_proposta} onChange={(e) => setFormData({...formData, data_proposta: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Data Contrato</label>
                  <input type="date" className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl p-4 text-sm font-bold outline-none"
                    value={formData.data_contrato} onChange={(e) => setFormData({...formData, data_contrato: e.target.value})} />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Contrato Assinado?</span>
                <input type="checkbox" className="w-6 h-6 rounded-lg accent-emerald-600" 
                  checked={formData.contrato_assinado} onChange={(e) => setFormData({...formData, contrato_assinado: e.target.checked})} />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Observações Gerais</label>
            <textarea className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl p-4 text-sm font-medium outline-none focus:bg-white focus:border-[#0F2C4C] transition-all"
              rows="2" value={formData.observacoes_gerais} onChange={(e) => setFormData({...formData, observacoes_gerais: e.target.value})} />
          </div>
        </div>

        <div className="p-8 bg-gray-50 flex justify-end gap-4">
          <button type="button" onClick={() => navigate('/contratos')} className="px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 hover:text-gray-600">
            Descartar
          </button>
          <button type="submit" disabled={loading} className="bg-[#0F2C4C] text-white px-12 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-blue-900 shadow-xl disabled:opacity-50">
            {loading ? 'Processando...' : <><Save size={18} /> Salvar Registro</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContratoForm;
