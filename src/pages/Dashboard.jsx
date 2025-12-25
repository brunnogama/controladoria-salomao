import React from 'react';
import { BarChart3, Users, FileText, AlertCircle, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { label: 'Processos Ativos', value: '1.284', icon: <FileText size={24} />, color: 'bg-blue-600' },
    { label: 'Novos Clientes', value: '+48', icon: <Users size={24} />, color: 'bg-emerald-600' },
    { label: 'Prazos Próximos', value: '12', icon: <AlertCircle size={24} />, color: 'bg-amber-500' },
    { label: 'Performance', value: '94%', icon: <TrendingUp size={24} />, color: 'bg-indigo-600' },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-[#0F2C4C] tracking-tight">Painel de Controle</h1>
        <p className="text-gray-500 text-sm md:text-base font-medium">Resumo das atividades da controladoria hoje.</p>
      </div>

      {/* CARTÕES DE MÉTRICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`${stat.color} p-3 rounded-xl text-white shadow-lg`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl md:text-2xl font-bold text-[#0F2C4C]">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GRÁFICO SIMULADO */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-[#0F2C4C] mb-6 flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-600" /> Volume Mensal de Processos
          </h3>
          <div className="h-48 md:h-64 bg-gray-50 rounded-2xl flex items-end justify-around p-4 gap-2">
            {[45, 60, 40, 85, 55, 75, 90].map((h, i) => (
              <div key={i} className="bg-[#0F2C4C] w-full max-w-[35px] rounded-t-lg transition-all hover:bg-yellow-500 cursor-help" style={{ height: `${h}%` }}></div>
            ))}
          </div>
        </div>
        
        {/* ALERTAS */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-[#0F2C4C] mb-6 flex items-center gap-2">
            <AlertCircle size={20} className="text-red-500" /> Alertas Urgentes
          </h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-red-50 rounded-2xl border-l-4 border-red-500">
                <p className="text-xs md:text-sm text-red-800 font-bold leading-tight">
                  Contrato #{i}584 exige revisão imediata por prazo de vencimento.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
