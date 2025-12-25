import React, { useState, useEffect } from 'react';
import { 
  Save, Monitor, Lock, RefreshCw, History, 
  Code, CheckCircle, User, Building2, Copyright 
} from 'lucide-react';

const Configuracoes = () => {
  const [logoInterno, setLogoInterno] = useState('');
  const [logoLogin, setLogoLogin] = useState('');
  const [status, setStatus] = useState('');

  // VERSIONAMENTO SEMÂNTICO: 1.3.6
  const versaoAtual = "1.3.6"; 

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

  // Changelog estruturado conforme a regra: X (Grande), X.X (Funcionalidade), X.X.X (Bug/Ajuste)
  const changelog = [
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
    </div>
  );
};

export default Configuracoes;
