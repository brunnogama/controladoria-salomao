import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import {
  CalendarDays, ArrowRight, TrendingUp, Briefcase, CheckCircle2,
  Clock, XCircle, Filter, ArrowDown, PieChart, BarChart3,
  Camera, FileSignature, AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ semana: {}, mes: {}, geral: {} });
  const [funil, setFunil] = useState({});
  const [evolucaoMensal, setEvolucaoMensal] = useState([]);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data: contratos } = await supabase.from('contratos').select('*');
      if (contratos) processarDados(contratos);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  // ... (Mantenha a sua lógica original de processarDados aqui) ...

  const formatMoney = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="w-full space-y-8 pb-10">
      <div className="pt-10 md:pt-0">
        <h1 className="text-3xl font-bold text-[#0F2C4C]">Controladoria Jurídica</h1>
        <p className="text-gray-500">Visão estratégica de contratos e resultados.</p>
      </div>

      {/* FUNIL COM SCROLL HORIZONTAL NO MOBILE */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="flex items-center gap-2 mb-6 border-b pb-4">
            <Filter className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold text-gray-800">Funil de Eficiência</h2>
          </div>
          <div className="grid grid-cols-5 gap-4 items-center">
            {/* ETAPA 1 */}
            <div className="bg-gray-50 p-4 rounded-xl text-center relative">
              <p className="text-xs font-bold text-gray-500">1. PROSPECTS</p>
              <p className="text-3xl font-bold mt-2">{funil.totalEntrada || 0}</p>
            </div>
            {/* CONVERSÃO 1 */}
            <div className="flex flex-col items-center text-[10px] font-bold">
               <span className="text-blue-600">{funil.taxaConversaoProposta}% Avançam</span>
               <ArrowRight size={16} className="text-gray-300" />
            </div>
            {/* ETAPA 2 */}
            <div className="bg-blue-50 p-4 rounded-xl text-center relative">
              <p className="text-xs font-bold text-blue-600">2. PROPOSTAS</p>
              <p className="text-3xl font-bold mt-2">{funil.qualificadosProposta || 0}</p>
            </div>
            {/* CONVERSÃO 2 */}
            <div className="flex flex-col items-center text-[10px] font-bold">
               <span className="text-green-600">{funil.taxaConversaoFechamento}% Fecham</span>
               <ArrowRight size={16} className="text-gray-300" />
            </div>
            {/* ETAPA 3 */}
            <div className="bg-green-50 p-4 rounded-xl text-center">
              <p className="text-xs font-bold text-green-600">3. FECHADOS</p>
              <p className="text-3xl font-bold mt-2">{funil.fechados || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* MÉTRICAS DA SEMANA - 3 Colunas no Laptop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm">
           <p className="text-xs font-bold text-gray-500 uppercase">Entrada Semanal</p>
           <p className="text-3xl font-bold mt-2">{metrics.semana?.novos || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm">
           <p className="text-xs font-bold text-blue-600 uppercase">Propostas (Semana)</p>
           <p className="text-3xl font-bold mt-2">{metrics.semana?.propQtd || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-green-100 shadow-sm">
           <p className="text-xs font-bold text-green-600 uppercase">Fechados (Semana)</p>
           <p className="text-3xl font-bold mt-2">{metrics.semana?.fechQtd || 0}</p>
        </div>
      </div>

      {/* PERFORMANCE E GRÁFICOS (Mantenha o restante como estava no seu código original) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Suas tabelas financeiras e gráficos aqui... */}
      </div>
    </div>
  );
};

export default Dashboard;
