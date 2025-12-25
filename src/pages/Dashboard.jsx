import React from 'react';
import { BarChart3, Users, FileText, AlertCircle, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { label: 'Processos Ativos', value: '1.284', change: '+12%', icon: <FileText size={20} />, color: 'bg-blue-600' },
    { label: 'Novos Clientes', value: '48', change: '+5%', icon: <Users size={20} />, color: 'bg-emerald-600' },
    { label: 'Prazos 48h', value: '12', change: 'Urgente', icon: <AlertCircle size={20} />, color: 'bg-amber-500' },
    { label: 'Performance', value: '94%', change: '+2%', icon: <TrendingUp size={20} />, color: 'bg-indigo-600' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#0F2C4C] tracking-tight">Painel de Controle</h1>
          <p className="text-gray-500 text-sm font-medium">Bem-vindo à Controladoria Estratégica Salomão Advogados.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border shadow-sm text-xs font-bold text-gray-500">
          <Calendar size={16} /> {new Date().toLocaleDateString('pt-BR')}
        </div>
      </div>

      {/* GRID DE MÉTRICAS - Ajustado para laptops com zoom */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.color} p-2.5 rounded-xl text-white shadow-lg`}>
                {stat.icon}
              </div>
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-bold text-[#0F2C4C]">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* GRÁFICO DE VOLUMETRIA */}
        <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-[#0F2C4C] flex items-center gap-2">
              <BarChart3 size={20} className="text-blue-600" /> Movimentação Processual
            </h3>
            <select className="text-xs font-bold border-none bg-gray-50 rounded-lg p-1 outline-none text-gray-500">
              <option>Últimos 12 meses</option>
              <option>Este ano</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between px-2 gap-1 md:gap-3">
            {[45, 60, 40, 85, 55, 75, 90, 60, 45, 80, 50, 70].map((h, i) => (
              <div key={i} className="group relative flex-1">
                <div className="bg-[#0F2C4C]/10 w-full h-full absolute bottom-0 rounded-t-lg"></div>
                <div 
                  className="bg-[#0F2C4C] w-full absolute bottom-0 rounded-t-lg transition-all group-hover:bg-yellow-500 cursor-pointer" 
                  style={{ height: `${h}%` }}
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] py-1 px-2 rounded font-bold transition-all">
                    {h}%
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] font-bold text-gray-400 uppercase">
            <span>Jan</span><span>Mar</span><span>Mai</span><span>Jul</span><span>Set</span><span>Dez</span>
          </div>
        </div>
        
        {/* ALERTAS E ATIVIDADES */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <h3 className="font-bold text-[#0F2C4C] mb-6 flex items-center gap-2">
            <AlertCircle size={20} className="text-red-500" /> Alertas da Controladoria
          </h3>
          <div className="space-y-4 flex-1">
            {[
              { t: 'Vencimento de Prazo', d: 'Processo #829 - 24h restantes', c: 'text-red-600 bg-red-50' },
              { t: 'Novo Contrato', d: 'Aguardando assinatura digital', c: 'text-blue-600 bg-blue-50' },
              { t: 'Revisão Financeira', d: 'Faturamento mensal pendente', c: 'text-amber-600 bg-amber-50' }
            ].map((item, i) => (
              <div key={i} className={`p-4 rounded-2xl border-l-4 border-current ${item.c}`}>
                <p className="text-xs font-black uppercase tracking-tighter mb-1 opacity-70">{item.t}</p>
                <p className="text-sm font-bold leading-tight">{item.d}</p>
              </div>
            ))}
          </div>
          <button className="mt-6 w-full py-3 bg-gray-50 text-[#0F2C4C] rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-all">
            Ver todas as atividades
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
