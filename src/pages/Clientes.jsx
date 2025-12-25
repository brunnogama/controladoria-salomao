import React from 'react';
import { Users, UserPlus, Search, Mail, Phone, ExternalLink, MoreVertical } from 'lucide-react';

const Clientes = () => {
  const clientes = [
    { id: 1, nome: 'Logística Brasil S.A.', responsavel: 'Carlos Eduardo', email: 'contato@logbr.com.br', telefone: '(11) 99887-7665', status: 'Ativo' },
    { id: 2, nome: 'Indústria Sudeste Ltda', responsavel: 'Ana Paula Silva', email: 'financeiro@isudeste.com.br', telefone: '(21) 98765-4321', status: 'Ativo' },
    { id: 3, nome: 'Varejo Digital Eireli', responsavel: 'Ricardo Santos', email: 'adm@varejodigital.com', telefone: '(31) 97766-5544', status: 'Inativo' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0F2C4C]">Base de Clientes</h1>
          <p className="text-sm text-gray-500 font-medium">Gestão de contatos e informações corporativas.</p>
        </div>
        <button className="bg-[#0F2C4C] text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl hover:bg-blue-900 transition-all text-sm w-full sm:w-auto">
          <UserPlus size={20} /> Novo Cliente
        </button>
      </div>

      {/* BUSCA E FILTROS */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome, responsável ou e-mail..." 
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-[#0F2C4C] text-sm font-medium"
          />
        </div>
      </div>

      {/* LISTA DE CLIENTES (TABELA RESPONSIVA) */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente / Razão Social</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Responsável</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contato</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0F2C4C]/5 flex items-center justify-center text-[#0F2C4C] font-bold text-xs">
                        {cliente.nome.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-bold text-gray-800 text-sm">{cliente.nome}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-gray-600 text-sm font-medium">{cliente.responsavel}</td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Mail size={12} className="text-blue-500" /> {cliente.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Phone size={12} className="text-emerald-500" /> {cliente.telefone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      cliente.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {cliente.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-[#0F2C4C] hover:bg-white rounded-lg transition-all shadow-sm md:shadow-none">
                        <ExternalLink size={18} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-white rounded-lg transition-all shadow-sm md:shadow-none">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* RODAPÉ MOBILE */}
        <div className="md:hidden bg-[#0F2C4C] text-white p-2 text-[10px] text-center font-black uppercase tracking-[0.2em]">
          ← Deslize lateralmente para gerenciar →
        </div>
      </div>
    </div>
  );
};

export default Clientes;
