import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Save, ArrowLeft, Briefcase, Search, Loader2 } from 'lucide-react';
import { formatCNPJ, aplicarMascaraMoeda, removerMascaraMoeda } from '../utils/formatters';
import PDFUpload from '../components/PDFUpload';

const ContratoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [buscandoCNPJ, setBuscandoCNPJ] = useState(false);
  const [clienteEncontrado, setClienteEncontrado] = useState(null);
  const [cnpjNaoDisponivel, setCnpjNaoDisponivel] = useState(false);
  const [statusAnterior, setStatusAnterior] = useState(null); // Para rastrear mudanças
  
  const [formData, setFormData] = useState({
    cliente_id: '',
    cliente_nome: '',
    cnpj_cliente: '',
    status: 'Sob Análise',
    area: '',
    responsavel: '',
    contrario: '',
    processo: '',
    valor_causa: '',
    tribunal_turma: '',
    juiz_desembargador: '',
    uf: '',
    data_prospect: '',
    analisado_por: '',
    obs_prospect: '',
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
    contrato_assinado: '', // NOVO CAMPO
    data_rejeicao: '',
    motivo_rejeicao: '',
    iniciativa_rejeicao: '',
    rejeitado_por: '',
    observacoes_rejeicao: '',
    data_probono: '',
    enviado_por: '',
    observacoes_probono: '',
  });

  useEffect(() => {
    if (id) fetchContrato();
  }, [id]);

  const fetchContrato = async () => {
    // Buscar contrato primeiro
    const { data: contratoData, error: contratoError } = await supabase
      .from('contratos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (contratoError) {
      console.error('Erro ao buscar contrato:', contratoError);
      return;
    }
    
    if (contratoData) {
      // Buscar cliente separadamente se houver cliente_id
      let clienteData = null;
      if (contratoData.cliente_id) {
        const { data: cliente } = await supabase
          .from('clientes')
          .select('razao_social, cnpj')
          .eq('id', contratoData.cliente_id)
          .single();
        clienteData = cliente;
      }
      
      setFormData({
        ...contratoData,
        cliente_nome: clienteData?.razao_social || '',
        cnpj_cliente: clienteData?.cnpj || '',
        proposta_pro_labore: contratoData.proposta_pro_labore ? aplicarMascaraMoeda(contratoData.proposta_pro_labore * 100) : '',
        proposta_honorario_fixo: contratoData.proposta_honorario_fixo ? aplicarMascaraMoeda(contratoData.proposta_honorario_fixo * 100) : '',
        proposta_exito_total: contratoData.proposta_exito_total ? aplicarMascaraMoeda(contratoData.proposta_exito_total * 100) : '',
        contrato_pro_labore: contratoData.contrato_pro_labore ? aplicarMascaraMoeda(contratoData.contrato_pro_labore * 100) : '',
        contrato_honorario_fixo: contratoData.contrato_honorario_fixo ? aplicarMascaraMoeda(contratoData.contrato_honorario_fixo * 100) : '',
        contrato_exito_total: contratoData.contrato_exito_total ? aplicarMascaraMoeda(contratoData.contrato_exito_total * 100) : '',
        valor_causa: contratoData.valor_causa ? aplicarMascaraMoeda(contratoData.valor_causa * 100) : '',
      });
      setClienteEncontrado(clienteData);
      setStatusAnterior(contratoData.status); // Guardar status inicial
    }
  };

  const buscarClientePorCNPJ = async (cnpj) => {
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    
    if (!cnpjLimpo || cnpjLimpo.length !== 14) {
      alert('⚠️ CNPJ inválido! Digite 14 dígitos.');
      return;
    }
    
    setBuscandoCNPJ(true);
    try {
      console.log('🔍 Buscando CNPJ na Receita Federal:', cnpjLimpo);
      
      // 1. Buscar na BrasilAPI (Receita Federal)
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);
      
      if (!response.ok) {
        throw new Error('CNPJ não encontrado na Receita Federal');
      }
      
      const dadosReceita = await response.json();
      console.log('✅ Dados da Receita Federal:', dadosReceita);
      
      // Função para converter para Title Case
      const toTitleCase = (str) => {
        if (!str) return '';
        return str.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
      };
      
      const razaoSocial = toTitleCase(dadosReceita.razao_social || dadosReceita.nome_fantasia || '');
      
      // 2. Verificar se já existe no banco local
      const { data: clienteExistente } = await supabase
        .from('clientes')
        .select('id, razao_social, cnpj')
        .eq('cnpj', cnpjLimpo)
        .maybeSingle();
      
      if (clienteExistente) {
        // Cliente já cadastrado
        console.log('✅ Cliente já existe no banco:', clienteExistente);
        setClienteEncontrado(clienteExistente);
        setFormData(prev => ({ 
          ...prev, 
          cliente_id: clienteExistente.id,
          cliente_nome: clienteExistente.razao_social,
          cnpj_cliente: cnpjLimpo
        }));
        alert(`✅ Cliente encontrado!\n\n${clienteExistente.razao_social}\nCNPJ: ${cnpjLimpo}`);
      } else {
        // Cliente não cadastrado - preencher com dados da Receita
        console.log('⚠️ Cliente não cadastrado. Preenchendo com dados da Receita...');
        setClienteEncontrado(null);
        setFormData(prev => ({ 
          ...prev, 
          cliente_id: '',
          cliente_nome: razaoSocial,
          cnpj_cliente: cnpjLimpo
        }));
        alert(`✅ Dados encontrados na Receita Federal!\n\n${razaoSocial}\nCNPJ: ${cnpjLimpo}\n\n💡 Cliente será criado automaticamente ao salvar.`);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar CNPJ:', error);
      setClienteEncontrado(null);
      
      // Mesmo com erro, permitir preencher manualmente
      setFormData(prev => ({ 
        ...prev, 
        cliente_id: '',
        cnpj_cliente: cnpjLimpo
      }));
      
      alert(`❌ ${error.message}\n\n💡 Você pode:\n1. Verificar se o CNPJ está correto\n2. Digitar o nome manualmente\n3. Marcar "CNPJ não disponível"`);
    } finally {
      setBuscandoCNPJ(false);
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
    
    // Validação: Cliente sempre obrigatório
    if (!formData.cliente_nome) {
      alert("Por favor, informe o nome do cliente.");
      return;
    }

    // Validação: CNPJ obrigatório se checkbox não estiver marcado
    if (!cnpjNaoDisponivel && !formData.cnpj_cliente) {
      alert("Por favor, informe o CNPJ ou marque 'CNPJ não disponível'.");
      return;
    }

    // Validação: Data obrigatória para o status atual
    const validacoesPorStatus = {
      'Sob Análise': {
        data: 'data_prospect',
        nome: 'Data do Prospect'
      },
      'Proposta Enviada': {
        data: 'data_proposta',
        nome: 'Data da Proposta'
      },
      'Contrato Fechado': {
        data: 'data_contrato',
        nome: 'Data do Contrato',
        extras: ['contrato_assinado'] // Campo extra obrigatório
      },
      'Rejeitada': {
        data: 'data_rejeicao',
        nome: 'Data da Rejeição',
        extras: ['motivo_rejeicao', 'iniciativa_rejeicao']
      },
      'Probono': {
        data: 'data_probono',
        nome: 'Data do Probono'
      }
    };

    const validacao = validacoesPorStatus[formData.status];
    if (validacao) {
      // Validar data do status
      if (!formData[validacao.data]) {
        alert(`❌ O status "${formData.status}" requer o preenchimento de: ${validacao.nome}`);
        return;
      }

      // Validar campos extras (se existirem)
      if (validacao.extras) {
        for (const campo of validacao.extras) {
          if (!formData[campo]) {
            const nomeCampo = campo === 'motivo_rejeicao' ? 'Motivo da Rejeição' :
                             campo === 'iniciativa_rejeicao' ? 'Iniciativa da Rejeição' :
                             campo === 'contrato_assinado' ? 'Status de Assinatura do Contrato' : campo;
            alert(`❌ O status "${formData.status}" requer o preenchimento de: ${nomeCampo}`);
            return;
          }
        }
      }
    }
    
    setLoading(true);
    try {
      let clienteIdFinal = formData.cliente_id;
      
      // Se tem nome mas não tem ID, criar cliente rapidamente
      if (!clienteIdFinal && formData.cliente_nome) {
        let cnpjParaSalvar = formData.cnpj_cliente;
        
        // Se CNPJ não disponível, gerar um único baseado em timestamp
        if (cnpjNaoDisponivel || !cnpjParaSalvar) {
          cnpjParaSalvar = `SEM${Date.now()}`;
        }
        
        const { data: novoCliente, error: erroCliente } = await supabase
          .from('clientes')
          .insert([{ 
            razao_social: formData.cliente_nome,
            cnpj: cnpjParaSalvar.replace(/\D/g, ''), // Remove formatação
            email: 'nao-informado@cliente.com',
            nome_contato: formData.cliente_nome
          }])
          .select()
          .single();
        
        if (erroCliente) {
          alert("Erro ao criar cliente: " + erroCliente.message);
          setLoading(false);
          return;
        }
        
        clienteIdFinal = novoCliente.id;
      }
      
      const { cnpj_cliente, cliente_nome, ...dadosParaSalvar } = formData;
      
      const dadosFinais = {
        ...dadosParaSalvar,
        cliente_id: clienteIdFinal,
        
        // Converter datas vazias para null
        data_prospect: dadosParaSalvar.data_prospect || null,
        data_proposta: dadosParaSalvar.data_proposta || null,
        data_contrato: dadosParaSalvar.data_contrato || null,
        data_rejeicao: dadosParaSalvar.data_rejeicao || null,
        data_probono: dadosParaSalvar.data_probono || null,
        
        // Converter valores monetários
        proposta_pro_labore: dadosParaSalvar.proposta_pro_labore ? removerMascaraMoeda(dadosParaSalvar.proposta_pro_labore) : null,
        proposta_honorario_fixo: dadosParaSalvar.proposta_honorario_fixo ? removerMascaraMoeda(dadosParaSalvar.proposta_honorario_fixo) : null,
        proposta_exito_total: dadosParaSalvar.proposta_exito_total ? removerMascaraMoeda(dadosParaSalvar.proposta_exito_total) : null,
        proposta_exito_percentual: dadosParaSalvar.proposta_exito_percentual || null,
        
        contrato_pro_labore: dadosParaSalvar.contrato_pro_labore ? removerMascaraMoeda(dadosParaSalvar.contrato_pro_labore) : null,
        contrato_honorario_fixo: dadosParaSalvar.contrato_honorario_fixo ? removerMascaraMoeda(dadosParaSalvar.contrato_honorario_fixo) : null,
        contrato_exito_total: dadosParaSalvar.contrato_exito_total ? removerMascaraMoeda(dadosParaSalvar.contrato_exito_total) : null,
        contrato_exito_percentual: dadosParaSalvar.contrato_exito_percentual || null,
        
        valor_causa: dadosParaSalvar.valor_causa ? removerMascaraMoeda(dadosParaSalvar.valor_causa) : null,
        
        // Converter strings vazias para null em campos de texto
        area: dadosParaSalvar.area || null,
        responsavel: dadosParaSalvar.responsavel || null,
        contrario: dadosParaSalvar.contrario || null,
        processo: dadosParaSalvar.processo || null,
        tribunal_turma: dadosParaSalvar.tribunal_turma || null,
        juiz_desembargador: dadosParaSalvar.juiz_desembargador || null,
        uf: dadosParaSalvar.uf || null,
        analisado_por: dadosParaSalvar.analisado_por || null,
        obs_prospect: dadosParaSalvar.obs_prospect || null,
        arquivo_proposta_url: dadosParaSalvar.arquivo_proposta_url || null,
        proposta_outros: dadosParaSalvar.proposta_outros || null,
        descricao_proposta: dadosParaSalvar.descricao_proposta || null,
        observacoes_proposta: dadosParaSalvar.observacoes_proposta || null,
        numero_hon: dadosParaSalvar.numero_hon || null,
        arquivo_contrato_url: dadosParaSalvar.arquivo_contrato_url || null,
        numero_proc: dadosParaSalvar.numero_proc || null,
        contrato_outros: dadosParaSalvar.contrato_outros || null,
        descricao_contrato: dadosParaSalvar.descricao_contrato || null,
        observacoes_contrato: dadosParaSalvar.observacoes_contrato || null,
        rejeitado_por: dadosParaSalvar.rejeitado_por || null,
        observacoes_rejeicao: dadosParaSalvar.observacoes_rejeicao || null,
        enviado_por: dadosParaSalvar.enviado_por || null,
        observacoes_probono: dadosParaSalvar.observacoes_probono || null,
      };
      
      console.log('Dados a salvar:', dadosFinais);
      
      let contratoId = id;
      
      if (id) {
        const { error } = await supabase
          .from('contratos')
          .update(dadosFinais)
          .eq('id', id);
        if (error) throw error;
        console.log('Contrato atualizado com sucesso');
        
        // Registrar mudança de status se houver
        if (statusAnterior && statusAnterior !== formData.status) {
          console.log(`📝 Status mudou de "${statusAnterior}" para "${formData.status}"`);
          
          const { error: historicoError } = await supabase
            .from('historico_status_contratos')
            .insert([{
              contrato_id: id,
              status_anterior: statusAnterior,
              status_novo: formData.status,
              data_mudanca: new Date().toISOString(),
              observacao: `Mudança de status: ${statusAnterior} → ${formData.status}`
            }]);
          
          if (historicoError) {
            console.error('Erro ao registrar histórico:', historicoError);
            // Não bloqueia o salvamento
          } else {
            console.log('✅ Histórico de status registrado');
          }
        }
      } else {
        const { data, error } = await supabase
          .from('contratos')
          .insert([dadosFinais])
          .select('id')
          .single();
        if (error) throw error;
        console.log('Contrato criado:', data);
        contratoId = data?.id;
        
        // Registrar criação no histórico
        const { error: historicoError } = await supabase
          .from('historico_status_contratos')
          .insert([{
            contrato_id: data.id,
            status_anterior: null,
            status_novo: formData.status,
            data_mudanca: new Date().toISOString(),
            observacao: `Contrato criado com status: ${formData.status}`
          }]);
        
        if (historicoError) {
          console.error('Erro ao registrar histórico:', historicoError);
        } else {
          console.log('✅ Histórico de criação registrado');
        }
      }

      // Se status é Contrato Fechado e não está assinado, criar tarefa no Kanban
      if (formData.status === 'Contrato Fechado' && formData.contrato_assinado === 'nao') {
        const dataCobranca = new Date();
        dataCobranca.setDate(dataCobranca.getDate() + 5); // 5 dias após hoje

        const tarefaTitulo = `Cobrar assinatura do contrato - ${formData.cliente_nome || 'Cliente'}`;
        const tarefaDescricao = `Contrato cadastrado em ${new Date().toLocaleDateString('pt-BR')} sem assinatura.
        
Cliente: ${formData.cliente_nome}
Número HON: ${formData.numero_hon || 'Não informado'}
Data de cobrança: ${dataCobranca.toLocaleDateString('pt-BR')}

⚠️ IMPORTANTE: Verificar e cobrar assinatura do contrato!`;

        try {
          await supabase
            .from('tarefas_kanban')
            .insert([{
              titulo: tarefaTitulo,
              descricao: tarefaDescricao,
              status: 'a_fazer',
              prioridade: 'alta',
              responsavel: formData.responsavel || 'Equipe Jurídica',
              ordem: 0
            }]);
          
          console.log('✅ Tarefa de cobrança criada no Kanban');
        } catch (kanbanError) {
          console.error('Erro ao criar tarefa no Kanban:', kanbanError);
          // Não bloqueia o salvamento do contrato
        }
      }
      
      alert('Contrato salvo com sucesso!');
      navigate('/contratos');
    } catch (error) {
      console.error('Erro completo:', error);
      alert("Erro ao salvar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderCamposStatus = () => {
    switch(formData.status) {
      case 'Sob Análise':
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-700 border-b pb-2">Dados de Prospecção</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Data Prospect *</label>
                <input type="date" value={formData.data_prospect} onChange={(e) => setFormData({...formData, data_prospect: e.target.value})} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Analisado por</label>
                <input type="text" value={formData.analisado_por} onChange={(e) => setFormData({...formData, analisado_por: e.target.value})} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nome do analista" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Observações do Prospect</label>
              <textarea value={formData.obs_prospect} onChange={(e) => setFormData({...formData, obs_prospect: e.target.value})} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" rows="3" placeholder="Observações sobre a prospecção..." />
            </div>
          </div>
        );
        
      case 'Proposta Enviada':
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-700 border-b pb-2">Dados da Proposta</h3>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Data Proposta *</label>
              <input type="date" value={formData.data_proposta} onChange={(e) => setFormData({...formData, data_proposta: e.target.value})} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Vincular Proposta (PDF)</label>
              <PDFUpload onUpload={async (file) => { console.log('Upload proposta:', file); }} loading={loading} buttonText="Anexar PDF da Proposta" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Pró-labore (R$)</label>
                <input type="text" value={formData.proposta_pro_labore} onChange={(e) => handleMoneyChange('proposta_pro_labore', e.target.value)} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono" placeholder="0,00" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Honorário Fixo (R$)</label>
                <input type="text" value={formData.proposta_honorario_fixo} onChange={(e) => handleMoneyChange('proposta_honorario_fixo', e.target.value)} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono" placeholder="0,00" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Êxito Total (R$)</label>
                <input type="text" value={formData.proposta_exito_total} onChange={(e) => handleMoneyChange('proposta_exito_total', e.target.value)} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono" placeholder="0,00" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Êxito %</label>
                <input type="text" value={formData.proposta_exito_percentual} onChange={(e) => setFormData({...formData, proposta_exito_percentual: e.target.value})} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="0%" />
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <input type="checkbox" checked={formData.proposta_timesheet} onChange={(e) => setFormData({...formData, proposta_timesheet: e.target.checked})} className="w-5 h-5 rounded accent-blue-600" id="proposta_timesheet" />
              <label htmlFor="proposta_timesheet" className="text-sm font-medium text-blue-900">Timesheet</label>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Outros</label>
              <input type="text" value={formData.proposta_outros} onChange={(e) => setFormData({...formData, proposta_outros: e.target.value})} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Informações adicionais..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Descrição da Proposta</label>
              <textarea value={formData.descricao_proposta} onChange={(e) => setFormData({...formData, descricao_proposta: e.target.value})} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" rows="3" placeholder="Descreva os detalhes da proposta..." />
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
                <input type="date" value={formData.data_contrato} onChange={(e) => setFormData({...formData, data_contrato: e.target.value})} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Número Hon</label>
                <input type="text" value={formData.numero_hon} onChange={(e) => setFormData({...formData, numero_hon: e.target.value})} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="HON-XXXX" />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Vincular Contrato (PDF)</label>
              <PDFUpload onUpload={async (file) => { console.log('Upload contrato:', file); }} loading={loading} buttonText="Anexar PDF do Contrato" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Número PROC</label>
              <input type="text" value={formData.numero_proc} onChange={(e) => setFormData({...formData, numero_proc: e.target.value})} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Número LegalOne" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Pró-labore (R$)</label>
                <input type="text" value={formData.contrato_pro_labore} onChange={(e) => handleMoneyChange('contrato_pro_labore', e.target.value)} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono" placeholder="0,00" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Honorário Fixo (R$)</label>
                <input type="text" value={formData.contrato_honorario_fixo} onChange={(e) => handleMoneyChange('contrato_honorario_fixo', e.target.value)} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono" placeholder="0,00" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Êxito Total (R$)</label>
                <input type="text" value={formData.contrato_exito_total} onChange={(e) => handleMoneyChange('contrato_exito_total', e.target.value)} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono" placeholder="0,00" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Êxito %</label>
                <input type="text" value={formData.contrato_exito_percentual} onChange={(e) => setFormData({...formData, contrato_exito_percentual: e.target.value})} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="0%" />
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <input type="checkbox" checked={formData.contrato_timesheet} onChange={(e) => setFormData({...formData, contrato_timesheet: e.target.checked})} className="w-5 h-5 rounded accent-green-600" id="contrato_timesheet" />
              <label htmlFor="contrato_timesheet" className="text-sm font-medium text-green-900">Timesheet</label>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Outros</label>
              <input type="text" value={formData.contrato_outros} onChange={(e) => setFormData({...formData, contrato_outros: e.target.value})} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Informações adicionais..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Observações</label>
              <textarea value={formData.observacoes_contrato} onChange={(e) => setFormData({...formData, observacoes_contrato: e.target.value})} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" rows="2" />
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
                <input type="date" value={formData.data_rejeicao} onChange={(e) => setFormData({...formData, data_rejeicao: e.target.value})} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Rejeitado por</label>
                <input type="text" value={formData.rejeitado_por} onChange={(e) => setFormData({...formData, rejeitado_por: e.target.value})} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nome do responsável" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Motivo da Rejeição *</label>
                {!formData.motivo_rejeicao ? (
                  <select 
                    value={formData.motivo_rejeicao} 
                    onChange={(e) => setFormData({...formData, motivo_rejeicao: e.target.value})} 
                    className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Selecione o motivo</option>
                    <option value="Caso ruim">Caso ruim</option>
                    <option value="Conflito">Conflito</option>
                    <option value="Cliente Declinou">Cliente Declinou</option>
                    <option value="Cliente não respondeu">Cliente não respondeu</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="flex-1 px-4 py-2 rounded-lg font-medium text-sm bg-red-100 text-red-800 border-2 border-red-300">
                      {formData.motivo_rejeicao}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, motivo_rejeicao: ''})}
                      className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                      title="Alterar"
                    >
                      ✎
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Iniciativa da Rejeição *</label>
                {!formData.iniciativa_rejeicao ? (
                  <select 
                    value={formData.iniciativa_rejeicao} 
                    onChange={(e) => setFormData({...formData, iniciativa_rejeicao: e.target.value})} 
                    className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Selecione quem rejeitou</option>
                    <option value="Cliente">Cliente</option>
                    <option value="Escritório">Escritório</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm border-2 ${
                      formData.iniciativa_rejeicao === 'Cliente' 
                        ? 'bg-blue-100 text-blue-800 border-blue-300' 
                        : 'bg-orange-100 text-orange-800 border-orange-300'
                    }`}>
                      {formData.iniciativa_rejeicao}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, iniciativa_rejeicao: ''})}
                      className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                      title="Alterar"
                    >
                      ✎
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Observações da Rejeição</label>
              <textarea value={formData.observacoes_rejeicao} onChange={(e) => setFormData({...formData, observacoes_rejeicao: e.target.value})} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" rows="3" placeholder="Detalhes adicionais sobre a rejeição..." />
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
                <input type="date" value={formData.data_probono} onChange={(e) => setFormData({...formData, data_probono: e.target.value})} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Enviado Por</label>
                <input type="text" value={formData.enviado_por} onChange={(e) => setFormData({...formData, enviado_por: e.target.value})} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nome do responsável" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Observações do Probono</label>
              <textarea value={formData.observacoes_probono} onChange={(e) => setFormData({...formData, observacoes_probono: e.target.value})} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" rows="3" placeholder="Detalhes do caso probono..." />
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
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Flow Metrics System v1.4.4</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-8 space-y-8">
          
          <div className="bg-gradient-to-r from-blue-50 to-transparent p-6 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-2 text-[#0F2C4C] font-black uppercase text-xs tracking-widest mb-4">
              <Briefcase size={16} className="text-blue-600"/> Informações Básicas
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {/* Grid com 2 colunas quando Contrato Fechado, 1 coluna caso contrário */}
              <div className={`grid gap-4 items-start ${formData.status === 'Contrato Fechado' ? 'grid-cols-3' : 'grid-cols-1'}`}>
                {/* Coluna 1 e 2: Status do Caso (sempre à esquerda, ocupa 2 colunas se Contrato Fechado) */}
                <div className={formData.status === 'Contrato Fechado' ? 'col-span-2' : 'col-span-1'}>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Status do Caso *</label>
                  <select className="w-full bg-white border-2 border-gray-200 rounded-xl p-3 text-sm font-bold text-[#0F2C4C] outline-none focus:border-blue-500 transition-all" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} required>
                    <option value="Sob Análise">Sob Análise</option>
                    <option value="Proposta Enviada">Proposta Enviada</option>
                    <option value="Contrato Fechado">Contrato Fechado</option>
                    <option value="Rejeitada">Rejeitada</option>
                    <option value="Probono">Probono</option>
                  </select>
                </div>
                
                {/* Coluna 3: Status de Assinatura (só aparece se status for Contrato Fechado, sempre à direita) */}
                {formData.status === 'Contrato Fechado' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Contrato Assinado? *</label>
                    {!formData.contrato_assinado ? (
                      <select 
                        value={formData.contrato_assinado} 
                        onChange={(e) => setFormData({...formData, contrato_assinado: e.target.value})} 
                        className="w-full bg-white border-2 border-gray-300 rounded-xl p-3 text-sm font-bold outline-none focus:border-blue-500 transition-all"
                        required
                      >
                        <option value="">Selecione...</option>
                        <option value="sim">✓ Assinado</option>
                        <option value="nao">✗ Não Assinado</option>
                      </select>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span 
                          className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm text-center ${
                            formData.contrato_assinado === 'sim' 
                              ? 'bg-green-100 text-green-800 border-2 border-green-300' 
                              : 'bg-red-100 text-red-800 border-2 border-red-300'
                          }`}
                        >
                          {formData.contrato_assinado === 'sim' ? '✓ Assinado' : '✗ Não Assinado'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, contrato_assinado: ''})}
                          className="px-3 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                          title="Alterar"
                        >
                          ✎
                        </button>
                      </div>
                    )}
                    {formData.contrato_assinado === 'nao' && (
                      <p className="mt-2 text-xs text-orange-600 font-bold">
                        ⚠️ Tarefa será criada no Kanban
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  CNPJ {!cnpjNaoDisponivel && '*'}
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="00.000.000/0000-00" 
                    className={`w-full border-2 rounded-xl p-3 pr-12 text-sm font-bold outline-none focus:border-blue-500 ${cnpjNaoDisponivel ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border-gray-200'}`}
                    value={formatCNPJ(formData.cnpj_cliente)} 
                    onChange={(e) => setFormData({...formData, cnpj_cliente: e.target.value})}
                    disabled={cnpjNaoDisponivel}
                    required={!cnpjNaoDisponivel}
                  />
                  <button
                    type="button"
                    onClick={() => buscarClientePorCNPJ(formData.cnpj_cliente)}
                    disabled={buscandoCNPJ || cnpjNaoDisponivel}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    title="Buscar cliente por CNPJ"
                  >
                    {buscandoCNPJ ? (
                      <Loader2 size={18} className="animate-spin"/>
                    ) : (
                      <Search size={18}/>
                    )}
                  </button>
                </div>
                {clienteEncontrado && !cnpjNaoDisponivel && (
                  <p className="text-xs text-green-600 font-bold mt-1">✓ Cliente encontrado: {clienteEncontrado.razao_social}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <input 
                    type="checkbox" 
                    id="cnpj-nao-disponivel"
                    checked={cnpjNaoDisponivel}
                    onChange={(e) => {
                      setCnpjNaoDisponivel(e.target.checked)
                      if (e.target.checked) {
                        setFormData({...formData, cnpj_cliente: ''})
                        setClienteEncontrado(null)
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="cnpj-nao-disponivel" className="text-xs text-gray-600 font-medium cursor-pointer">
                    CNPJ não disponível
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Nome do Cliente *
                </label>
                <input 
                  type="text" 
                  placeholder="Razão social ou nome do cliente" 
                  className="w-full bg-white border-2 border-gray-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-blue-500" 
                  value={formData.cliente_nome} 
                  onChange={(e) => setFormData({...formData, cliente_nome: e.target.value})} 
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Área</label>
                <input type="text" value={formData.area} onChange={(e) => setFormData({...formData, area: e.target.value})} className="w-full bg-white border-2 border-gray-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-blue-500" placeholder="Ex: Trabalhista, Cível..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Responsável</label>
                <input type="text" value={formData.responsavel} onChange={(e) => setFormData({...formData, responsavel: e.target.value})} className="w-full bg-white border-2 border-gray-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-blue-500" placeholder="Advogado responsável" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-700 border-b pb-2 mb-4">Dados do Processo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Contrário</label>
                <input type="text" value={formData.contrario} onChange={(e) => setFormData({...formData, contrario: e.target.value})} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Parte contrária" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Processo</label>
                <input type="text" value={formData.processo} onChange={(e) => setFormData({...formData, processo: e.target.value})} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nº do processo" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Valor da Causa (R$)</label>
                <input type="text" value={formData.valor_causa} onChange={(e) => handleMoneyChange('valor_causa', e.target.value)} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono" placeholder="0,00" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tribunal/Turma</label>
                <input type="text" value={formData.tribunal_turma} onChange={(e) => setFormData({...formData, tribunal_turma: e.target.value})} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: TRT 2ª Região" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Juiz/Desembargador</label>
                <input type="text" value={formData.juiz_desembargador} onChange={(e) => setFormData({...formData, juiz_desembargador: e.target.value})} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nome do magistrado" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">UF</label>
                <select value={formData.uf} onChange={(e) => setFormData({...formData, uf: e.target.value})} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Selecione...</option>
                  <option value="AC">AC</option><option value="AL">AL</option><option value="AP">AP</option><option value="AM">AM</option><option value="BA">BA</option><option value="CE">CE</option><option value="DF">DF</option><option value="ES">ES</option><option value="GO">GO</option><option value="MA">MA</option><option value="MT">MT</option><option value="MS">MS</option><option value="MG">MG</option><option value="PA">PA</option><option value="PB">PB</option><option value="PR">PR</option><option value="PE">PE</option><option value="PI">PI</option><option value="RJ">RJ</option><option value="RN">RN</option><option value="RS">RS</option><option value="RO">RO</option><option value="RR">RR</option><option value="SC">SC</option><option value="SP">SP</option><option value="SE">SE</option><option value="TO">TO</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            {renderCamposStatus()}
          </div>
        </div>

        <div className="p-8 bg-gray-50 flex justify-end gap-4 border-t">
          <button type="button" onClick={() => navigate('/contratos')} className="px-8 py-3 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-200 transition-colors">Cancelar</button>
          <button type="submit" disabled={loading} className="bg-[#0F2C4C] text-white px-12 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-900 shadow-lg disabled:opacity-50 transition-all">
            {loading ? (<><Loader2 size={18} className="animate-spin" />Salvando...</>) : (<><Save size={18} />Salvar Contrato</>)}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContratoForm;
