import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Save, ArrowLeft, Briefcase, DollarSign, Search, Loader2, FileText, Upload } from 'lucide-react';
import { formatCNPJ, aplicarMascaraMoeda, removerMascaraMoeda } from '../utils/formatters';
import { useClienteByCnpj } from '../hooks';
import PDFUpload from '../components/PDFUpload';

const ContratoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { searchClient, cliente, loading: buscandoCliente } = useClienteByCnpj();
  
  const [formData, setFormData] = useState({
    // Campos sempre visíveis
    cliente_id: '',
    cnpj_cliente: '',
    status: 'Sob Análise',
    contrario: '',
    processo: '',
    valor_causa: '',
    tribunal_turma: '',
    juiz_desembargador: '',
    uf: '',
    area: '',
    responsavel: '',
    
    // Sob Análise
    data_prospect: '',
    analisado_por: '',
    obs_prospect: '',
    
    // Proposta Enviada
    data_proposta: '',
    arquivo_proposta_url: '',
    proposta_pro_labore: '',
    proposta_honorario_fixo: '',
    proposta_exito_total: '',
    proposta_exito_percentual: '',
    proposta_timesheet: false,
    proposta_outros: '',
    descricao_proposta: '',
    observacoes_proposta: '',
    
    // Contrato Fechado
    data_contrato: '',
    numero_hon: '',
    arquivo_contrato_url: '',
    numero_proc: '',
    contrato_pro_labore: '',
    contrato_honorario_fixo: '',
    contrato_exito_total: '',
    contrato_exito_percentual: '',
    contrato_timesheet: false,
    contrato_outros: '',
    descricao_contrato: '',
    observacoes_contrato: '',
    
    // Rejeitada
    data_rejeicao: '',
    rejeitado_por: '',
    observacoes_rejeicao: '',
    
    // Probono
    data_probono: '',
    enviado_por: '',
    observacoes_probono: '',
  });

  useEffect(() => {
    if (id) fetchContrato();
  }, [id]);

  useEffect(() => {
    if (cliente) {
      setFormData(prev => ({ 
        ...prev, 
        cliente_id: cliente.id,
        cnpj_cliente: cliente.cnpj 
      }));
    }
  }, [cliente]);

  const fetchContrato = async () => {
    const { data } = await supabase
      .from('contratos')
      .select('*, clientes(razao_social, cnpj)')
      .eq('id', id)
      .single();
    
    if (data) {
      setFormData({
        ...data,
        cnpj_cliente: data.clientes?.cnpj || '',
        // Aplicar máscaras aos valores monetários
        proposta_pro_labore: data.proposta_pro_labore ? aplicarMascaraMoeda(data.proposta_pro_labore * 100) : '',
        proposta_honorario_fixo: data.proposta_honorario_fixo ? aplicarMascaraMoeda(data.proposta_honorario_fixo * 100) : '',
        proposta_exito_total: data.proposta_exito_total ? aplicarMascaraMoeda(data.proposta_exito_total * 100) : '',
        contrato_pro_labore: data.contrato_pro_labore ? aplicarMascaraMoeda(data.contrato_pro_labore * 100) : '',
        contrato_honorario_fixo: data.contrato_honorario_fixo ? aplicarMascaraMoeda(data.contrato_honorario_fixo * 100) : '',
        contrato_exito_total: data.contrato_exito_total ? aplicarMascaraMoeda(data.contrato_exito_total * 100) : '',
        valor_causa: data.valor_causa ? aplicarMascaraMoeda(data.valor_causa * 100) : '',
      });
    }
  };

  const handleCNPJBlur = () => {
    if (formData.cnpj_cliente) {
      searchClient(formData.cnpj_cliente);
    }
  };

  const handleMoneyChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: aplicarMascaraMoeda(value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.cliente_id) {
      alert("Por favor, localize um cliente válido pelo CNPJ antes de salvar.");
      return;
    }
    
    setLoading(true);
    try {
      // Preparar dados para salvar (remover máscaras)
      const { cnpj_cliente, ...dadosParaSalvar } = formData;
      
      // Converter valores monetários
      const dadosFinais = {
        ...dadosParaSalvar,
        proposta_pro_labore: dadosParaSalvar.proposta_pro_labore ? removerMascaraMoeda(dadosParaSalvar.proposta_pro_labore) : null,
        proposta_honorario_fixo: dadosParaSalvar.proposta_honorario_fixo ? removerMascaraMoeda(dadosParaSalvar.proposta_honorario_fixo) : null,
        proposta_exito_total: dadosParaSalvar.proposta_exito_total ? removerMascaraMoeda(dadosParaSalvar.proposta_exito_total) : null,
        contrato_pro_labore: dadosParaSalvar.contrato_pro_labore ? removerMascaraMoeda(dadosParaSalvar.contrato_pro_labore) : null,
        contrato_honorario_fixo: dadosParaSalvar.contrato_honorario_fixo ? removerMascaraMoeda(dadosParaSalvar.contrato_honorario_fixo) : null,
        contrato_exito_total: dadosParaSalvar.contrato_exito_total ? removerMascaraMoeda(dadosParaSalvar.contrato_exito_total) : null,
        valor_causa: dadosParaSalvar.valor_causa ? removerMascaraMoeda(dadosParaSalvar.valor_causa) : null,
      };
      
      if (id) {
        await supabase.from('contratos').update(dadosFinais).eq('id', id);
      } else {
        await supabase.from('contratos').insert([dadosFinais]);
      }
      
      navigate('/contratos');
    } catch (error) {
      alert("Erro ao salvar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Renderizar campos condicionais baseado no status
  const renderCamposStatus = () => {
    switch(formData.status) {
      case 'Sob Análise':
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-700 border-b pb-2">Dados de Prospecção</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Data Prospect</label>
                <input
                  type="date"
                  value={formData.data_prospect}
                  onChange={(e) => setFormData({...formData, data_prospect: e.target.value})}
                  className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Analisado por</label>
                <input
                  type="text"
                  value={formData.analisado_por}
                  onChange={(e) => setFormData({...formData, analisado_por: e.target.value})}
                  className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome do analista"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Obs Prospect</label>
              <textarea
                value={formData.obs_prospect}
                onChange={(e) => setFormData({...formData, obs_prospect: e.target.value})}
                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Observações sobre a prospecção..."
              />
            </div>
          </div>
        );
        
      case 'Proposta Enviada':
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-700 border-b pb-2">Dados da Proposta</h3>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Data Proposta *</label>
              <input
                type="date"
                value={formData.data_proposta}
                onChange={(e) => setFormData({...formData, data_proposta: e.target.value})}
                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Vincular Proposta (PDF)</label>
              <PDFUpload
                onUpload={async (file) => {
                  // Upload logic aqui
                  console.log('Upload proposta:', file);
                }}
                loading={loading}
                buttonText="Anexar PDF da Proposta"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Pró-labore (R$)</label>
                <input
                  type="text"
                  value={formData.proposta_pro_labore}
                  onChange={(e) => handleMoneyChange('proposta_pro_labore', e.target.value)}
                  className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="0,00"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Honorário Fixo (R$)</label>
                <input
                  type="text"
                  value={formData.proposta_honorario_fixo}
                  onChange={(e) => handleMoneyChange('proposta_honorario_fixo', e.target.value)}
                  className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="0,00"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Êxito Total (R$)</label>
                <input
                  type="text"
                  value={formData.proposta_exito_total}
                  onChange={(e) => handleMoneyChange('proposta_exito_total', e.target.value)}
                  className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="0,00"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Êxito %</label>
                <input
                  type="text"
                  value={formData.proposta_exito_percentual}
                  onChange={(e) => setFormData({...formData, proposta_exito_percentual: e.target.value})}
                  className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0%"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <input
                type="checkbox"
                checked={formData.proposta_timesheet}
                onChange={(e) => setFormData({...formData, proposta_timesheet: e.target.checked})}
                className="w-5 h-5 rounded accent-blue-600"
                id="proposta_timesheet"
              />
              <label htmlFor="proposta_timesheet" className="text-sm font-medium text-blue-900">
                Timesheet
              </label>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Outros</label>
              <input
                type="text"
                value={formData.proposta_outros}
                onChange={(e) => setFormData({...formData, proposta_outros: e.target.value})}
                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Informações adicionais..."
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Descrição da Proposta</label>
              <textarea
                value={formData.descricao_proposta}
                onChange={(e) => setFormData({...formData, descricao_proposta: e.target.value})}
                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Descreva os detalhes da proposta..."
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Observações</label>
              <textarea
                value={formData.observacoes_proposta}
                onChange={(e) => setFormData({...formData, observacoes_proposta: e.target.value})}
                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
              />
            </div>
          </div>
        );
        
      case 'Contrato Fechado':
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-700 border-b pb-2">Dados do Contrato</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Data Contrato *</label>
                <input
                  type="date"
                  value={formData.data_contrato}
                  onChange={(e) => setFormData({...formData, data_contrato: e.target.value})}
                  className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Número Hon</label>
                <input
                  type="text"
                  value={formData.numero_hon}
                  onChange={(e) => setFormData({...formData, numero_hon: e.target.value})}
                  className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="HON-XXXX"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Vincular Contrato (PDF)</label>
              <PDFUpload
                onUpload={async (file) => {
                  console.log('Upload contrato:', file);
                }}
                loading={loading}
                buttonText="Anexar PDF do Contrato"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Número PROC</label>
              <input
                type="text"
                value={formData.numero_proc}
                onChange={(e) => setFormData({...formData, numero_proc: e.target.value})}
                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Número do processo"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Pró-labore (R$)</label>
                <input
                  type="text"
                  value={formData.contrato_pro_labore}
                  onChange={(e) => handleMoneyChange('contrato_pro_labore', e.target.value)}
                  className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="0,00"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Honorário Fixo (R$)</label>
                <input
                  type="text"
                  value={formData.contrato_honorario_fixo}
                  onChange={(e) => handleMoneyChange('contrato_honorario_fixo', e.target.value)}
                  className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="0,00"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Êxito Total (R$)</label>
                <input
                  type="text"
                  value={formData.contrato_exito_total}
                  onChange={(e) => handleMoneyChange('contrato_exito_total', e.target.value)}
                  className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="0,00"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Êxito %</label>
                <input
                  type="text"
                  value={formData.contrato_exito_percentual}
                  onChange={(e) => setFormData({...formData, contrato_exito_percentual: e.target.value})}
                  className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0%"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <input
                type="checkbox"
                checked={formData.contrato_timesheet}
                onChange={(e) => setFormData({...formData, contrato_timesheet: e.target.checked})}
                className="w-5 h-5 rounded accent-green-600"
                id="contrato_timesheet"
              />
              <label htmlFor="contrato_timesheet" className="text-sm font-medium text-green-900">
                Timesheet
              </label>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Outros</label>
              <input
                type="text"
                value={formData.contrato_outros}
                onChange={(e) => setFormData({...formData, contrato_outros: e.target.value})}
                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Informações adicionais..."
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Descrição do Contrato</label>
              <textarea
                value={formData.descricao_contrato}
                onChange={(e) => setFormData({...formData, descricao_contrato: e.target.value})}
                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Descreva os detalhes do contrato..."
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Observações</label>
              <textarea
                value={formData.observacoes_contrato}
                onChange={(e) => setFormData({...formData, observacoes_contrato: e.target.value})}
                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
              />
            </div>
          </div>
        );
        
      case 'Rejeitada':
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-700 border-b pb-2">Dados da Rejeição</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Data Rejeição *</label>
                <input
                  type="date"
                  value={formData.data_rejeicao}
                  onChange={(e) => setFormData({...formData, data_rejeicao: e.target.value})}
                  className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Rejeitado por</label>
                <input
                  type="text"
                  value={formData.rejeitado_por}
                  onChange={(e) => setFormData({...formData, rejeitado_por: e.target.value})}
                  className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome do responsável"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Observações</label>
              <textarea
                value={formData.observacoes_rejeicao}
                onChange={(e) => setFormData({...formData, observacoes_rejeicao: e.target.value})}
                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Motivo da rejeição..."
              />
            </div>
          </div>
        );
        
      case 'Probono':
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-700 border-b pb-2">Dados Probono</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Data Probono *</label>
                <input
                  type="date"
                  value={formData.data_probono}
                  onChange={(e) => setFormData({...formData, data_probono: e.target.value})}
                  className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Enviado Por</label>
                <input
                  type="text"
                  value={formData.enviado_por}
                  onChange={(e) => setFormData({...formData, enviado_por: e.target.value})}
                  className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome do responsável"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Observações</label>
              <textarea
                value={formData.observacoes_probono}
                onChange={(e) => setFormData({...formData, observacoes_probono: e.target.value})}
                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Detalhes do caso probono..."
              />
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/contratos')} className="flex items-center gap-2 text-gray-500 hover:text-[#0F2C4C] font-bold">
          <ArrowLeft size={20} /> Voltar
        </button>
        <div className="text-right">
          <h1 className="text-2xl font-black text-[#0F2C4C] uppercase tracking-tighter">
            {id ? 'Edição de Contrato' : 'Abertura de Novo Caso'}
          </h1>
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Flow Metrics System v1.4.1</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-8 space-y-8">
          
          {/* SEÇÃO 1: STATUS E CLIENTE */}
          <div className="bg-gradient-to-r from-blue-50 to-transparent p-6 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-2 text-[#0F2C4C] font-black uppercase text-xs tracking-widest mb-4">
              <Briefcase size={16} className="text-blue-600"/> Informações Básicas
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Status do Caso *</label>
                <select 
                  className="w-full bg-white border-2 border-gray-200 rounded-xl p-3 text-sm font-bold text-[#0F2C4C] outline-none focus:border-blue-500 transition-all"
                  value={formData.status} 
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  required
                >
                  <option value="Sob Análise">Sob Análise</option>
                  <option value="Proposta Enviada">Proposta Enviada</option>
                  <option value="Contrato Fechado">Contrato Fechado</option>
                  <option value="Rejeitada">Rejeitada</option>
                  <option value="Probono">Probono</option>
                </select>
              </div>
              
              {/* CNPJ Cliente */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">CNPJ do Cliente *</label>
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="00.000.000/0000-00"
                    className="w-full bg-white border-2 border-gray-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-blue-500"
                    value={formatCNPJ(formData.cnpj_cliente)}
                    onChange={(e) => setFormData({...formData, cnpj_cliente: e.target.value})}
                    onBlur={handleCNPJBlur}
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {buscandoCliente ? <Loader2 size={18} className="animate-spin text-blue-500"/> : <Search size={18} className="text-gray-300"/>}
                  </div>
                </div>
                {cliente && (
                  <p className="text-xs text-green-600 font-bold mt-1">✓ {cliente.razao_social}</p>
                )}
              </div>
            </div>
          </div>

          {/* SEÇÃO 2: CAMPOS SEMPRE VISÍVEIS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Contrário</label>
              <input
                type="text"
                value={formData.contrario}
                onChange={(e) => setFormData({...formData, contrario: e.target.value})}
                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Parte contrária"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Processo</label>
              <input
                type="text"
                value={formData.processo}
                onChange={(e) => setFormData({...formData, processo: e.target.value})}
                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nº do processo"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Valor da Causa (R$)</label>
              <input
                type="text"
                value={formData.valor_causa}
                onChange={(e) => handleMoneyChange('valor_causa', e.target.value)}
                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="0,00"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tribunal/Turma</label>
              <input
                type="text"
                value={formData.tribunal_turma}
                onChange={(e) => setFormData({...formData, tribunal_turma: e.target.value})}
                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: TRT 2ª Região"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Juiz/Desembargador</label>
              <input
                type="text"
                value={formData.juiz_desembargador}
                onChange={(e) => setFormData({...formData, juiz_desembargador: e.target.value})}
                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome do magistrado"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">UF</label>
              <select
                value={formData.uf}
                onChange={(e) => setFormData({...formData, uf: e.target.value})}
                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione...</option>
                <option value="AC">AC</option>
                <option value="AL">AL</option>
                <option value="AP">AP</option>
                <option value="AM">AM</option>
                <option value="BA">BA</option>
                <option value="CE">CE</option>
                <option value="DF">DF</option>
                <option value="ES">ES</option>
                <option value="GO">GO</option>
                <option value="MA">MA</option>
                <option value="MT">MT</option>
                <option value="MS">MS</option>
                <option value="MG">MG</option>
                <option value="PA">PA</option>
                <option value="PB">PB</option>
                <option value="PR">PR</option>
                <option value="PE">PE</option>
                <option value="PI">PI</option>
                <option value="RJ">RJ</option>
                <option value="RN">RN</option>
                <option value="RS">RS</option>
                <option value="RO">RO</option>
                <option value="RR">RR</option>
                <option value="SC">SC</option>
                <option value="SP">SP</option>
                <option value="SE">SE</option>
                <option value="TO">TO</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Área</label>
              <input
                type="text"
                value={formData.area}
                onChange={(e) => setFormData({...formData, area: e.target.value})}
                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Trabalhista, Cível..."
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Responsável</label>
              <input
                type="text"
                value={formData.responsavel}
                onChange={(e) => setFormData({...formData, responsavel: e.target.value})}
                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Advogado responsável"
              />
            </div>
          </div>

          {/* SEÇÃO 3: CAMPOS CONDICIONAIS POR STATUS */}
          <div className="border-t pt-6">
            {renderCamposStatus()}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-8 bg-gray-50 flex justify-end gap-4 border-t">
          <button 
            type="button" 
            onClick={() => navigate('/contratos')} 
            className="px-8 py-3 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={loading} 
            className="bg-[#0F2C4C] text-white px-12 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-900 shadow-lg disabled:opacity-50 transition-all"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save size={18} />
                Salvar Contrato
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContratoForm;
