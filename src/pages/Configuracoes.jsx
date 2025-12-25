import React, { useState, useEffect } from 'react';
import { 
  Save, Monitor, Lock, RefreshCw, History, 
  Code, CheckCircle, User, Building2, Copyright, Trash2, AlertTriangle
} from 'lucide-react';
import { supabase } from '../supabaseClient';

const Configuracoes = () => {
  const [logoInterno, setLogoInterno] = useState('');
  const [logoLogin, setLogoLogin] = useState('');
  const [status, setStatus] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetando, setResetando] = useState(false);

  // VERSIONAMENTO SEMÂNTICO: 1.5.0
  const versaoAtual = "1.5.0"; 

  useEffect(() => {
    const si = localStorage.getItem('app_logo_path');
    const sl = localStorage.getItem('app_login_logo_path');
    if (si) setLogoInterno(si.replace('/', ''));
    if (sl) setLogoLogin(sl.replace('/', ''));
  }, []);

  const salvar = (tipo, valor) => {
    const path = valor.startsWith('/') ? valor : `/${valor}`;
    localStorage.setItem(tipo === 'interno' ? 'app_logo_path' : 'app_login_logo_path', path);
    setStatus('Configuração salva com sucesso!');
    setTimeout(() => setStatus(''), 3000);
  };

  const resetarDados = async () => {
    setResetando(true);
    try {
      // Deletar contratos primeiro (dependência de clientes)
      const { error: errorContratos } = await supabase
        .from('contratos')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Deletar todos
      
      if (errorContratos) throw errorContratos;

      // Deletar clientes
      const { error: errorClientes } = await supabase
        .from('clientes')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Deletar todos
      
      if (errorClientes) throw errorClientes;

      // Deletar logs
      const { error: errorLogs } = await supabase
        .from('logs_sistema')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Deletar todos
      
      if (errorLogs) throw errorLogs;

      alert('✅ Todos os dados foram resetados com sucesso!');
      setShowResetModal(false);
      window.location.reload();
    } catch (error) {
      console.error('Erro ao resetar dados:', error);
      alert('❌ Erro ao resetar dados: ' + error.message);
    } finally {
      setResetando(false);
    }
  };

  // Changelog estruturado conforme a regra: X (Grande), X.X (Funcionalidade), X.X.X (Bug/Ajuste)
  const changelog = [
    {
      versao: "1.5.0",
      data: "25/12/2025",
      tipo: "Nova Funcionalidade",
      mudancas: [
        "Dashboard completamente reorganizado com nova estrutura otimizada para relatório executivo.",
        "Nova ordem: (1) Resumo da Semana, (2) Distribuição + Entrada de Casos (lado a lado), (3) Funil, (4) Valores, (5) Fotografia Financeira.",
        "Resumo da Semana: contador de rejeitados e texto explicativo automático.",
        "Entrada de Casos (6 Meses): CORRIGIDO para usar datas corretas de cada fase (data_prospect, data_proposta, data_contrato, data_rejeicao).",
        "Entrada de Casos: agora exibe 4 métricas por mês (Prospects, Propostas, Fechados, Rejeitados) com visual detalhado.",
        "Seção 'Valores' (renomeada): detalhamento completo com Pro Labore, Êxito e Recorrente separados.",
        "Valores: 3 cards (Mês Atual, Em Negociação, Carteira Total) com breakdowns financeiros.",
        "Fotografia Financeira Total: Pipeline Total consolidado, Contratos Assinados vs Não Assinados.",
        "Fotografia Financeira: valores detalhados por tipo com visual destacado (gradiente purple/indigo).",
        "Informações mais claras e objetivas para envio semanal ao sócio.",
        "Visual aprimorado com gradientes, ícones representativos e hierarquização de informações.",
        "Botão 'Enviar por Email' para capturar dashboard como imagem e enviar."
      ]
    },
    {
      versao: "1.4.5",
      data: "25/12/2025",
      tipo: "Nova Funcionalidade",
      mudancas: [
        "Módulo Clientes: modal de visualização completo ao clicar no card.",
        "Modal exibe todas as informações do cliente e contratos vinculados.",
        "Botão para desvincular contrato do cliente (move para cliente genérico 'Sem Cliente').",
        "Botões de editar e excluir no modal de visualização.",
        "Impede exclusão de cliente com contratos vinculados (validação robusta).",
        "Tratamento de race conditions na criação do cliente genérico.",
        "Verificação de duplicate key com fallback automático."
      ]
    },
    {
      versao: "1.4.4",
      data: "25/12/2025",
      tipo: "Correção de Bug",
      mudancas: [
        "CNPJ opcional (obrigatório apenas para Contrato Fechado).",
        "Campo Cliente manual adicionado (preenchimento independente do CNPJ).",
        "Correção da busca automática por CNPJ (estava sempre pedindo cliente válido).",
        "Reorganização lógica dos campos: Status, Cliente, Área, Responsável no topo.",
        "Campos do processo agrupados em seção separada: Contrário, Processo, Valor da Causa, Tribunal, Juiz, UF.",
        "Módulo Contratos: botão 'Ver Detalhes' substituído por ícone de Editar.",
        "Módulo Contratos: clique na linha abre modal de visualização com todos os detalhes.",
        "Modal de visualização com botão de editar e informações organizadas por seção.",
        "Dashboard: correção do gráfico 'Entrada de Casos (6 Meses)' - agora atualiza corretamente com novos casos.",
        "Dashboard: adicionado card 'Probono' na Distribuição da Carteira.",
        "Dashboard: padronização de cores - Sob Análise (laranja), Propostas (amarelo), Fechados (verde), Rejeitados (vermelho), Probono (azul).",
        "Dashboard: correção na contagem de status com normalização de strings.",
        "Módulo Contratos: cores das tags de status atualizadas seguindo o mesmo padrão do Dashboard.",
        "ContratoForm: campos vazios agora salvam como NULL (datas, numéricos, texto).",
        "ContratoForm: Cliente sempre obrigatório com criação automática se apenas nome fornecido.",
        "Configurações: botão 'Resetar Todos os Dados' com modal de confirmação em duas etapas."
      ]
    },
    {
      versao: "1.4.3",
      data: "25/12/2025",
      tipo: "Correção de Bug",
      mudancas: [
        "Implementação completa do sistema de logs/auditoria no módulo Histórico.",
        "Rastreamento detalhado: Quem (usuário + email), Quando (data/hora), Onde (IP + navegador).",
        "Registro automático de todas as ações: Criação, Edição, Exclusão, Mudança de Status, Upload.",
        "Visualização de dados Antes/Depois em alterações (diff visual).",
        "Filtros por ação, categoria, usuário e período.",
        "Estatísticas em tempo real: total de logs, criações, edições e exclusões.",
        "Hook useLogs() para facilitar integração em qualquer componente.",
        "Serviço logService.js com funções auxiliares para todos os tipos de log."
      ]
    },
    {
      versao: "1.4.2",
      data: "25/12/2025",
      tipo: "Correção de Bug",
      mudancas: [
        "Melhoria no tratamento de erro ao excluir cliente com contratos vinculados.",
        "Modal visual amigável substituindo alert genérico de erro de foreign key.",
        "Mensagem clara: 'Não é possível excluir este cliente pois existem contratos vinculados a ele.'",
        "Adição de dica visual para orientar o usuário sobre como proceder."
      ]
    },
    {
      versao: "1.4.1",
      data: "25/12/2025",
      tipo: "Correção de Bug",
      mudancas: [
        "Restauração completa dos campos condicionais por Status no formulário de Novo Contrato.",
        "Implementação de todos os campos específicos: Sob Análise, Proposta Enviada, Contrato Fechado, Rejeitada e Probono.",
        "Adição de campos obrigatórios: Contrário, Processo, Valor da Causa, Tribunal, Juiz, UF, Área e Responsável.",
        "Integração do PDFUpload nos status Proposta Enviada e Contrato Fechado.",
        "Máscaras monetárias aplicadas em todos os campos financeiros com formatação automática.",
        "Validação de CNPJ com busca automática de cliente via hook useClienteByCnpj."
      ]
    },
    {
      versao: "1.4.0",
      data: "25/12/2025",
      tipo: "Nova Funcionalidade",
      mudancas: [
        "Criação da arquitetura de utilitários: /utils/formatters.js e /utils/validators.js",
        "Implementação de hooks customizados: useClienteByCnpj, useContratos, useDashboardMetrics",
        "Desenvolvimento do componente reutilizável PDFUpload com drag & drop",
        "Centralização de constantes do sistema em /constants/index.js",
        "Exportação modular facilitando imports: import { formatMoney } from '@/utils'",
        "Validação robusta de CNPJ/CPF com algoritmos oficiais da Receita Federal",
        "Sanitização automática de nomes de arquivo no upload para prevenir vulnerabilidades"
      ]
    },
    {
      versao: "1.3.6",
      data: "25/12/2025",
      tipo: "Correção de Bug",
      mudancas: [
        "Otimização da função formatMoney no Dashboard para tratamento de valores nulos.",
        "Validação preventiva de cálculos financeiros nos totais gerais.",
        "Correção de encoding UTF-8 em caracteres especiais do português em todos os componentes."
      ]
    },
    {
      versao: "1.3.5",
      data: "25/12/2025",
      tipo: "Refatoração e GED",
      mudancas: [
        "Restauração das visões condicionais por Status no formulário de Novo Contrato.",
        "Integração do módulo GED (Upload de PDF) diretamente no fluxo de criação.",
        "Implementação de lógica de segurança no upload para evitar caracteres especiais.",
        "Padronização dos campos financeiros com máscaras decimais (step 0.01)."
      ]
    },
    {
      versao: "1.3.2",
      data: "25/12/2025",
      tipo: "Melhoria de UX",
      mudancas: [
        "Alteração da ordem de preenchimento: Status do Caso definido como prioridade.",
        "Busca automática de cliente via API de CNPJ integrada ao banco de dados.",
        "Otimização da busca para preenchimento automático de Razão Social."
      ]
    },
    {
      versao: "1.3.1",
      data: "25/12/2025",
      tipo: "Correção de Bug",
      mudancas: [
        "Resolução de falha crítica no build: criação do componente ContratoForm.jsx.",
        "Correção de redirecionamento indevido para o Dashboard ao editar contratos."
      ]
    },
    {
      versao: "1.3.0",
      data: "25/12/2025",
      tipo: "Mudança Grande",
      mudancas: [
        "Lançamento do Módulo GED (Gestão Eletrônica de Documentos).",
        "Criação de Bucket de Storage para armazenamento centralizado de PDFs.",
        "Agrupamento de documentos por Cliente no novo painel de arquivos."
      ]
    },
    {
      versao: "1.0.0",
      data: "15/12/2025",
      tipo: "Mudança Grande",
      mudancas: ["Lançamento oficial da Controladoria Jurídica Salomão Advogados."]
    }
  ];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* CABEÇALHO */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-[#0F2C4C] tracking-tight uppercase italic">Configurações</h1>
          <p className="text-gray-500 font-medium text-sm">Gestão de Identidade Visual e Histórico de Desenvolvimento.</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Versão Estável</p>
          <p className="text-2xl font-black text-[#0F2C4C]">{versaoAtual}</p>
        </div>
      </div>

      <hr className="border-gray-100" />

      {status && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl border border-emerald-100 flex items-center gap-2 font-bold animate-bounce shadow-sm">
          <CheckCircle size={20} /> {status}
        </div>
      )}

      {/* INPUTS DE LOGO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[#0F2C4C] font-black uppercase text-[10px] tracking-widest">
            <Monitor size={18} /> Logo da Área Interna (Sidebar)
          </div>
          <input 
            className="w-full bg-gray-50 border-2 border-gray-50 p-4 rounded-2xl outline-none focus:bg-white focus:border-[#0F2C4C] transition-all font-bold text-sm"
            value={logoInterno} 
            onChange={(e) => setLogoInterno(e.target.value)}
            placeholder="ex: logo.png"
          />
          <button onClick={() => salvar('interno', logoInterno)} className="w-full bg-[#0F2C4C] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-900 transition-all shadow-xl shadow-blue-900/10">
            <Save size={18} className="inline mr-2" /> Salvar Logo Sidebar
          </button>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[#0F2C4C] font-black uppercase text-[10px] tracking-widest">
            <Lock size={18} /> Logo da Tela de Login
          </div>
          <input 
            className="w-full bg-gray-50 border-2 border-gray-50 p-4 rounded-2xl outline-none focus:bg-white focus:border-[#0F2C4C] transition-all font-bold text-sm"
            value={logoLogin} 
            onChange={(e) => setLogoLogin(e.target.value)}
            placeholder="ex: login_logo.png"
          />
          <button onClick={() => salvar('login', logoLogin)} className="w-full bg-[#0F2C4C] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-900 transition-all shadow-xl shadow-blue-900/10">
            <Save size={18} className="inline mr-2" /> Salvar Logo Login
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CRÉDITOS OFICIAIS */}
        <div className="lg:col-span-1 bg-[#0F2C4C] text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
          <div className="space-y-8 relative z-10">
            <div className="bg-blue-500 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Code size={28} />
            </div>
            
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-blue-300 uppercase tracking-[0.2em] mb-1">Developer & Architect</p>
                <h3 className="text-xl font-black flex items-center gap-2">
                  <User size={18} className="text-yellow-500"/> Marcio Gama
                </h3>
              </div>

              <div>
                <p className="text-[10px] font-black text-blue-300 uppercase tracking-[0.2em] mb-1">Empresa Responsável</p>
                <h3 className="text-xl font-black flex items-center gap-2 italic">
                  <Building2 size={18} className="text-yellow-500"/> Flow Metrics
                </h3>
              </div>

              <div className="pt-4">
                <p className="text-[10px] font-black text-blue-300 uppercase tracking-[0.2em] mb-2">Stack Tecnológica</p>
                <div className="flex flex-wrap gap-2">
                  {['React 18', 'Tailwind', 'Supabase', 'Lucide'].map(tech => (
                    <span key={tech} className="bg-white/10 px-2 py-1 rounded text-[9px] font-bold border border-white/5">{tech}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10 flex items-center gap-2 text-[10px] font-black text-gray-400 tracking-widest uppercase">
              <Copyright size={12} /> {new Date().getFullYear()} Flow Metrics. All Rights Reserved.
            </div>
          </div>
        </div>

        {/* CHANGELOG DINÂMICO */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 overflow-hidden">
          <h3 className="text-xs font-black text-[#0F2C4C] mb-8 flex items-center gap-2 uppercase tracking-widest border-b pb-4">
            <History size={18} className="text-blue-600" /> Registro de Alterações (Changelog)
          </h3>
          
          <div className="space-y-8 max-h-[500px] overflow-y-auto pr-4">
            {changelog.map((item, idx) => (
              <div key={idx} className="relative pl-8 border-l-2 border-gray-50 last:border-0 pb-4">
                <div className={`absolute left-[-9px] top-0 w-4 h-4 rounded-full border-4 border-white shadow-sm ${idx === 0 ? 'bg-blue-600 scale-125' : 'bg-gray-200'}`}></div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-black text-[#0F2C4C] text-sm tracking-tighter">v{item.versao}</span>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase ${
                    item.tipo === 'Mudança Grande' ? 'bg-orange-100 text-orange-600' : 
                    item.tipo === 'Nova Funcionalidade' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>{item.tipo}</span>
                  <span className="text-[9px] font-bold text-gray-400 ml-auto tracking-widest">{item.data}</span>
                </div>
                <ul className="space-y-2">
                  {item.mudancas.map((mudanca, mIdx) => (
                    <li key={mIdx} className="text-xs text-gray-500 font-medium flex items-start gap-2 leading-relaxed italic">
                      <span className="text-blue-500 mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" /> {mudanca}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <button onClick={() => window.location.reload()} className="w-full py-5 bg-gray-50 border-2 border-dashed border-gray-100 rounded-[2rem] text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] hover:bg-[#0F2C4C] hover:text-white hover:border-[#0F2C4C] transition-all duration-300">
        <RefreshCw size={18} className="inline mr-2" /> Sincronizar Painel e Aplicar Modificações
      </button>

      {/* Botão Resetar Dados */}
      <button 
        onClick={() => setShowResetModal(true)} 
        className="w-full py-5 bg-red-50 border-2 border-red-200 rounded-[2rem] text-[10px] font-black text-red-600 uppercase tracking-[0.3em] hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300 mt-4"
      >
        <Trash2 size={18} className="inline mr-2" /> Resetar Todos os Dados (Perigo!)
      </button>

      {/* Modal de Confirmação de Reset */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setShowResetModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-red-600 p-6 rounded-t-2xl flex items-center gap-3 text-white">
              <AlertTriangle size={32} />
              <div>
                <h2 className="text-xl font-bold">⚠️ ATENÇÃO - AÇÃO IRREVERSÍVEL</h2>
                <p className="text-sm text-red-100">Esta ação não pode ser desfeita!</p>
              </div>
            </div>
            
            <div className="p-6">
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm font-bold text-red-800 mb-2">Esta ação irá DELETAR PERMANENTEMENTE:</p>
                <ul className="space-y-1 text-sm text-red-700">
                  <li>✗ Todos os contratos cadastrados</li>
                  <li>✗ Todos os clientes cadastrados</li>
                  <li>✗ Todo o histórico de logs</li>
                </ul>
              </div>

              <p className="text-sm font-bold text-gray-700 mb-4">
                Você tem certeza ABSOLUTA que deseja resetar TODOS os dados do sistema?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetModal(false)}
                  disabled={resetando}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={resetarDados}
                  disabled={resetando}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {resetando ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      Resetando...
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} />
                      Sim, Resetar Tudo
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Configuracoes;
