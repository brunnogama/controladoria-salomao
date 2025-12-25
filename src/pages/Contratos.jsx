import React from 'react';
import { Search, Plus, Filter, FileText, Download, MoreHorizontal } from 'lucide-react';

const Contratos = () => {
  const contratos = [
    { id: 'CNT-2025-01', cliente: 'Logística Brasil S.A.', tipo: 'Serviços Jurídicos', status: 'Ativo', valor: 'R$ 15.000' },
    { id: 'CNT-2025-02', cliente: 'Indústria Sudeste Ltda', tipo: 'Consultoria Mensal', status: 'Em Revisão', valor: 'R$ 42.800' },
    { id: 'CNT-2025-03', cliente: 'Varejo Digital', tipo: 'Licenciamento', status: 'Vencido', valor: 'R$ 8.500' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0F2C4C]">Gestão de Contratos</h1>
          <p className="text-sm text-gray-500 font-medium">Visualize e gerencie todos os documentos ativos.</p>
        </div>
        <button className="bg-[#0F2C4C] text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl hover:bg-blue-900 transition-all text-sm w-full sm:w-auto">
          <Plus size={20} /> Novo Contrato
        </button>
      </div>

      {/* FILTROS E BUSCA */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por cliente ou ID..." 
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-[#0F2C4C] text-sm font-medium"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 rounded-xl text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">
          <Filter size={18} /> Filtros Avançados
        </button>
      </div>

      {/* TABELA COM ROLAGEM LATERAL */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Código</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipo de Contrato</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {contratos.map((c) => (
                <tr key={c.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-5 font-bold text-blue-600 text-sm">{c.id}</td>
                  <td className="px-6 py-5 font-bold text-gray-800 text-sm">{c.cliente}</td>
                  <td className="px-6 py-5 text-gray-500 text-sm font-medium">{c.tipo}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      c.status === 'Ativo' ? 'bg-green-100 text-green-700' : 
                      c.status === 'Vencido' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg shadow-sm sm:shadow-none">
                        <Download size={18} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-white rounded-lg shadow-sm sm:shadow-none">
                        <FileText size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* INDICADOR PARA CELULAR */}
        <div className="md:hidden bg-[#0F2C4C] text-white p-2 text-[10px] text-center font-black uppercase tracking-[0.2em]">
          ← Deslize para os lados para ver mais →
        </div>
      </div>
    </div>
  );
};

export default Contratos;
