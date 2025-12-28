/**
 * @file Dashboard.jsx
 * @description Dashboard principal com visão executiva do sistema
 * @version 2.0.0
 * @author Marcio Gama - Flow Metrics
 */

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, TrendingDown, FileText, 
  DollarSign, Users, Target, ArrowUpRight, ArrowDownRight,
  Activity, PieChart, Filter, CheckCircle2, Clock,
  XCircle, AlertCircle, FileSignature, Briefcase
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('mes_atual');
  const [dados, setDados] = useState({
    totalContratos: 0,
    propostasAbertas: 0,
    contratosFechados: 0,
    valorTotal: 0,
    valorFechado: 0,
    taxaConversao: 0,
    tendencia: 0,
    distribuicaoPorStatus: [],
    ultimosContratos: [],
    contratosPendentes: []
  });

  useEffect(() => {
    carregarDados();
  }, [periodo]);

  const carregarDados = async () => {
    try {
      setLoading(true);

      // Calcular intervalo de datas
      const hoje = new Date();
      let dataInicio, dataFim;

      switch (periodo) {
        case 'mes_atual':
          dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
          dataFim = hoje;
          break;
        case 'trimestre':
          dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 3, 1);
          dataFim = hoje;
          break;
        case 'ano':
          dataInicio = new Date(hoje.getFullYear(), 0, 1);
          dataFim = hoje;
          break;
        default:
          dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
          dataFim = hoje;
      }

      // Buscar contratos
      const { data: contratos, error } = await supabase
        .from('contratos')
        .select('*')
        .gte('created_at', dataInicio.toISOString())
        .lte('created_at', dataFim.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calcular métricas
      const totalContratos = contratos?.length || 0;
      const propostasAbertas = contratos?.filter(c => 
        c.status === 'Proposta Enviada' || c.status === 'Em Análise'
      ).length || 0;
      const contratosFechados = contratos?.filter(c => 
        c.status === 'Contrato Fechado'
      ).length || 0;
      const valorTotal = contratos?.reduce((sum, c) => 
        sum + (parseFloat(c.valor) || 0), 0
      ) || 0;
      const valorFechado = contratos?.filter(c => 
        c.status === 'Contrato Fechado'
      ).reduce((sum, c) => sum + (parseFloat(c.valor) || 0), 0) || 0;

      // Taxa de conversão
      const taxaConversao = totalContratos > 0 
        ? ((contratosFechados / totalContratos) * 100).toFixed(1)
        : 0;

      // Distribuição por status
      const statusCount = {};
      contratos?.forEach(c => {
        statusCount[c.status] = (statusCount[c.status] || 0) + 1;
      });

      const distribuicaoPorStatus = Object.entries(statusCount)
        .map(([status, count]) => ({
          status,
          count,
          percentual: ((count / totalContratos) * 100).toFixed(1)
        }))
        .sort((a, b) => b.count - a.count);

      // Últimos contratos (5 mais recentes)
      const ultimosContratos = contratos?.slice(0, 5) || [];

      // Contratos pendentes de assinatura
      const contratosPendentes = contratos?.filter(c => 
        c.status === 'Contrato Fechado' && !c.assinatura
      ) || [];

      setDados({
        totalContratos,
        propostasAbertas,
        contratosFechados,
        valorTotal,
        valorFechado,
        taxaConversao: parseFloat(taxaConversao),
        tendencia: 8.5, // Exemplo - calcular real com período anterior
        distribuicaoPorStatus,
        ultimosContratos,
        contratosPendentes
      });

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status) => {
    const cores = {
      'Contrato Fechado': 'bg-green-100 text-green-700',
      'Proposta Enviada': 'bg-blue-100 text-blue-700',
      'Em Análise': 'bg-yellow-100 text-yellow-700',
      'Rejeitado': 'bg-red-100 text-red-700',
      'Pro Bono': 'bg-purple-100 text-purple-700'
    };
    return cores[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status) => {
    const icones = {
      'Contrato Fechado': CheckCircle2,
      'Proposta Enviada': Clock,
      'Em Análise': AlertCircle,
      'Rejeitado': XCircle,
      'Pro Bono': Briefcase
    };
    const Icone = icones[status] || FileText;
    return <Icone size={16} />;
  };

  const CardMetrica = ({ titulo, valor, icone: Icone, cor, tendencia, sufixo = '', link = null }) => {
    const conteudo = (
      <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg ${cor}`}>
            <Icone size={24} className="text-white" />
          </div>
          {tendencia !== undefined && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
              tendencia >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {tendencia >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {Math.abs(tendencia)}%
            </div>
          )}
        </div>
        <h3 className="text-gray-600 text-sm font-medium mb-1">{titulo}</h3>
        <p className="text-3xl font-bold text-gray-900">
          {valor}{sufixo}
        </p>
      </div>
    );

    return link ? <Link to={link}>{conteudo}</Link> : conteudo;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Activity size={32} className="text-blue-600" />
            Controladoria Jurídica
          </h1>
          <p className="text-gray-600 mt-1">
            Visão estratégica de contratos e resultados
          </p>
        </div>

        {/* Filtro de Período */}
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-400" />
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="mes_atual">Mês Atual</option>
            <option value="trimestre">Último Trimestre</option>
            <option value="ano">Ano Atual</option>
          </select>
        </div>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CardMetrica
          titulo="Total de Contratos"
          valor={dados.totalContratos}
          icone={FileText}
          cor="bg-blue-600"
          tendencia={dados.tendencia}
          link="/contratos"
        />
        <CardMetrica
          titulo="Propostas Abertas"
          valor={dados.propostasAbertas}
          icone={Clock}
          cor="bg-yellow-600"
          link="/propostas"
        />
        <CardMetrica
          titulo="Contratos Fechados"
          valor={dados.contratosFechados}
          icone={CheckCircle2}
          cor="bg-green-600"
          tendencia={dados.tendencia}
        />
        <CardMetrica
          titulo="Taxa de Conversão"
          valor={dados.taxaConversao}
          icone={Target}
          cor="bg-purple-600"
          sufixo="%"
        />
      </div>

      {/* Métricas Financeiras */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign size={28} />
            <h2 className="text-2xl font-bold">Valor Total</h2>
          </div>
          <p className="text-4xl font-bold mb-2">
            {formatarMoeda(dados.valorTotal)}
          </p>
          <div className="flex items-center gap-2 text-green-100">
            <TrendingUp size={16} />
            <span className="text-sm">+{dados.tendencia}% vs período anterior</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Briefcase size={28} />
            <h2 className="text-2xl font-bold">Valor Fechado</h2>
          </div>
          <p className="text-4xl font-bold mb-2">
            {formatarMoeda(dados.valorFechado)}
          </p>
          <div className="flex items-center gap-2 text-blue-100">
            <CheckCircle2 size={16} />
            <span className="text-sm">{dados.contratosFechados} contratos finalizados</span>
          </div>
        </div>
      </div>

      {/* Gráficos e Tabelas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por Status */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart size={24} className="text-blue-600" />
            Distribuição por Status
          </h2>
          <div className="space-y-3">
            {dados.distribuicaoPorStatus.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <span className="text-sm font-medium text-gray-700">{item.status}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${item.percentual}%` }}
                    ></div>
                  </div>
                </div>
                <span className="ml-3 text-xs font-semibold text-gray-500 w-12 text-right">
                  {item.percentual}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Últimos Contratos */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 size={24} className="text-green-600" />
              Últimos Contratos
            </h2>
            <Link 
              to="/contratos" 
              className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1"
            >
              Ver todos
              <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="space-y-3">
            {dados.ultimosContratos.map((contrato, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {contrato.cliente}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatarData(contrato.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(contrato.status)}`}>
                    {contrato.status}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatarMoeda(contrato.valor || 0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alertas e Pendências */}
      {dados.contratosPendentes.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FileSignature size={24} className="text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-yellow-900 mb-2">
                Contratos Pendentes de Assinatura
              </h3>
              <p className="text-yellow-700 mb-4">
                {dados.contratosPendentes.length} contrato(s) fechado(s) aguardando assinatura
              </p>
              <div className="space-y-2">
                {dados.contratosPendentes.slice(0, 3).map((contrato, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-yellow-900 font-medium">{contrato.cliente}</span>
                    <span className="text-yellow-700">{formatarMoeda(contrato.valor || 0)}</span>
                  </div>
                ))}
              </div>
              {dados.contratosPendentes.length > 3 && (
                <Link 
                  to="/contratos" 
                  className="text-yellow-700 hover:text-yellow-800 text-sm font-semibold mt-3 inline-flex items-center gap-1"
                >
                  Ver todos ({dados.contratosPendentes.length})
                  <ArrowUpRight size={14} />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Indicadores de Performance */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl shadow-sm p-6 text-white">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp size={28} />
          Indicadores de Performance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-purple-100 text-sm mb-1">Ticket Médio</p>
            <p className="text-3xl font-bold">
              {formatarMoeda(dados.totalContratos > 0 ? dados.valorTotal / dados.totalContratos : 0)}
            </p>
          </div>
          <div>
            <p className="text-purple-100 text-sm mb-1">Contratos/Dia (Média)</p>
            <p className="text-3xl font-bold">
              {(dados.totalContratos / 30).toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-purple-100 text-sm mb-1">Taxa de Sucesso</p>
            <p className="text-3xl font-bold">{dados.taxaConversao}%</p>
          </div>
          <div>
            <p className="text-purple-100 text-sm mb-1">Receita Média Mensal</p>
            <p className="text-3xl font-bold">
              {formatarMoeda(dados.valorFechado / 30 * 30)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
