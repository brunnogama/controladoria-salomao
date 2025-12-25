import React, { useState, useEffect } from 'react';
import { 
  Save, Monitor, Lock, RefreshCw, History, 
  Code, CheckCircle, User, Building2, Copyright 
} from 'lucide-react';

const Configuracoes = () => {
  const [logoInterno, setLogoInterno] = useState('');
  const [logoLogin, setLogoLogin] = useState('');
  const [status, setStatus] = useState('');

  // Versão Atual do Sistema
  const versaoAtual = "1.2.1"; 

  useEffect(() => {
    const si = localStorage.getItem('app_logo_path');
    const sl = localStorage.getItem('app_login_logo_path');
    if (si) setLogoInterno(si.replace('/', ''));
    if (sl) setLogoLogin(sl.replace('/', ''));
  }, []);

  const salvar = (tipo, valor) => {
    const path = valor.startsWith('/') ? valor : `/${valor}`;
    if (tipo === 'interno') {
      localStorage.setItem('app_logo_path', path);
    } else {
      localStorage.setItem('app_login_logo_path', path);
    }
    setStatus('Configuração salva com sucesso!');
    setTimeout(() => setStatus(''), 3000);
  };

  // Dados do Changelog seguindo sua regra de versionamento
  const changelog = [
    {
      versao: "1.2.1",
      data: "24/12/2025",
      tipo: "Correção de Bug",
      mudancas: ["Ajuste na persistência das logos ao realizar logout."]
    },
    {
      versao: "1.2.0",
      data: "23/12/2025",
      tipo: "Nova Funcionalidade",
      mudancas: ["Implementação de logos dinâmicas via painel de configuração.", "Adição de suporte a Favicon personalizado."]
    },
    {
      versao: "1.1.0",
      data: "20/12/2025",
      tipo: "Nova Funcionalidade",
      mudancas: ["Reestruturação do Dashboard para visão estratégica de volumetria."]
    },
    {
      versao: "1.0.0",
      data: "15/12/2025",
      tipo: "Mudança Grande",
      mudancas: ["Lançamento oficial do sistema Controladoria Jurídica Salomão Advogados."]
    }
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-[#0F2C4C] tracking-tight">Configurações</h1>
          <p className="text-gray-500 font-medium text-sm">Gerencie a identidade visual e acompanhe o versionamento.</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Versão Estável</p>
          <p className="text-2xl font-black text-[#0F2C4C]">{versaoAtual}</p>
        </div>
      </div>

      <hr className="border-gray-100" />

      {status && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl border border-emerald-100 flex items-center gap-2 font-bold animate-bounce">
          <CheckCircle size={20} /> {status}
        </div>
      )}

      {/* SEÇÃO DE LOGOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[#0F2C4C] font-black uppercase text-xs tracking-widest">
            <Monitor size={18} /> Logo Sidebar
          </div>
          <input 
            type="text"
            className="w-full bg-gray-50 border-2 border-gray-50 p-3 rounded-2xl outline-none focus:bg-white focus:border-[#0F2C4C] transition-all font-medium text-sm"
            value={logoInterno} 
            onChange={(e) => setLogoInterno(e.target.value)}
            placeholder="ex: logo.png"
          />
          <button onClick={() => salvar('interno', logoInterno)} className="w-full bg-[#0F2C4C] text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-900 transition-all shadow-lg shadow-blue-900/10">
            <Save size={18} /> Salvar Logo Interna
          </button>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[#0F2C4C] font-black uppercase text-xs tracking-widest">
            <Lock size={18} /> Logo Login
          </div>
          <input 
            type="text"
            className="w-full bg-gray-50 border-2 border-gray-50 p-3 rounded-2xl outline-none focus:bg-white focus:border-[#0F2C4C] transition-all font-medium text-sm"
            value={logoLogin} 
            onChange={(e) => setLogoLogin(e.target.value)}
            placeholder="ex: login.png"
          />
          <button onClick={() => salvar('login', logoLogin)} className="w-full bg-[#0F2C4C] text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-900 transition-all shadow-lg shadow-blue-900/10">
            <Save size={18} /> Salvar Logo Login
          </button>
        </div>
      </div>

      {/* SEÇÃO DE CRÉDITOS E CHANGELOG */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CRÉDITOS OFICIAIS */}
        <div className="lg:col-span-1 bg-[#0F2C4C] text-white rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
          
          <div className="space-y-6 relative z-10">
            <div className="bg-blue-500 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Code size={24} />
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black text-blue-300 uppercase tracking-[0.2em] mb-1">Desenvolvido por</p>
                <h3 className="text-xl font-bold flex items-center gap-2"><User size={18} className="text-yellow-500"/> Marcio Gama</h3>
              </div>

              <div>
                <p className="text-[10px] font-black text-blue-300 uppercase tracking-[0.2em] mb-1">Empresa Responsável</p>
                <h3 className="text-xl font-bold flex items-center gap-2"><Building2 size={18} className="text-yellow-500"/> Flow Metrics</h3>
              </div>

              <div>
                <p className="text-[10px] font-black text-blue-300 uppercase tracking-[0.2em] mb-2">Tecnologias</p>
                <div className="flex flex-wrap gap-2">
                  {['React', 'Tailwind', 'Supabase', 'Lucide'].map(tech => (
                    <span key={tech} className="bg-white/10 px-2 py-1 rounded-md text-[10px] font-bold border border-white/5">{tech}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 mt-8 flex items-center gap-2 text-[10px] font-medium text-gray-400 tracking-wider relative z-10">
            <Copyright size={12} /> {new Date().getFullYear()} Flow Metrics. Todos os direitos reservados.
          </div>
        </div>

        {/* CHANGELOG DINÂMICO */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <h3 className="text-lg font-bold text-[#0F2C4C] mb-6 flex items-center gap-2 uppercase tracking-tight">
            <History size={20} className="text-blue-600" /> Registro de Alterações (Changelog)
          </h3>
          
          <div className="space-y-6">
            {changelog.map((item, idx) => (
              <div key={idx} className="relative pl-6 border-l-2 border-gray-100 last:border-0 pb-2">
                <div className={`absolute left-[-9px] top-0 w-4 h-4 rounded-full border-4 border-white shadow-sm ${idx === 0 ? 'bg-blue-600 scale-125' : 'bg-gray-200'}`}></div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-black text-[#0F2C4C] text-sm">v{item.versao}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 uppercase">{item.tipo}</span>
                  <span className="text-[10px] font-bold text-gray-400 ml-auto">{item.data}</span>
                </div>
                <ul className="space-y-1">
                  {item.mudancas.map((mudanca, mIdx) => (
                    <li key={mIdx} className="text-xs text-gray-500 font-medium flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span> {mudanca}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button 
        onClick={() => window.location.reload()} 
        className="w-full py-4 bg-gray-50 text-gray-400 font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:bg-[#0F2C4C] hover:text-white transition-all duration-500 border-2 border-dashed border-gray-200 hover:border-solid hover:border-[#0F2C4C]"
      >
        <RefreshCw size={16} className="inline mr-2" /> Sincronizar Sistema e Aplicar Atualizações
      </button>
    </div>
  );
};

export default Configuracoes;
