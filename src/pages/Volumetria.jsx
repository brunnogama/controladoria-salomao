/**
 * @file Volumetria.jsx
 * @description Módulo de Volumetria Processual - Análise quantitativa de contratos e processos
 * @version 1.9.0
 * @author Bruno Gama - Sistema Controladoria
 */

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, TrendingDown, FileText, 
  Calendar, DollarSign, Users, Target, ArrowUpRight,
  ArrowDownRight, Activity, PieChart, Filter
} from 'lucide-react';
import { supabase } from '../supabaseClient';

const Volumetria = () => {
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('mes_atual');
  const [dados, setDados] = useState({
    totalContratos: 0,
    totalPropostas: 0,
    valorTotal: 0,
    taxaConversao: 0,
    tendencia: 0,
    distribuicaoPorStatus: [],
    distribuicaoPorCliente: [],
    evolucaoMensal: []
  });

  useEffect(() => {
    carregarDados();
  }, [periodo]);

  const carregarDados = async () => {
    try {
      setLoading(true);

      // Calcular intervalo de datas baseado no período
      const hoje = new Date();
      let dataInicio, dataFim;

      switch (periodo) {
        case 'mes_atual':
          dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
          dataFim = hoje;
          break;
        case 'mes_anterior':
          dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
          dataFim = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
          break;
        case 'trimestre':
          dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 3, 1);
          dataFim = hoje;
          break;
        case 'semestre':
          dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 6, 1);
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
      const { data: contratos, error: errorContratos } = await supabase
        .from('contratos')
        .select('*')
        .gte('created_at', dataInicio.toISOString())
        .lte('created_at', dataFim.toISOString());

      if (errorContratos) throw errorContratos;

      // Calcular métricas
      const totalContratos = contratos?.length || 0;
      const contratosFechados = contratos?.filter(c => c.status === 'Contrato Fechado').length || 0;
      const valorTotal = contratos?.reduce((sum, c) => sum + (parseFloat(c.valor) || 0), 0) || 0;

      // Distribuição por status
      const statusCount = {};
      contratos?.forEach(c => {
        statusCount[c.status] = (statusCount[c.status] || 0) + 1;
      });

      const distribuicaoPorStatus = Object.entries(statusCount).map(([status, count]) => ({
        status,
        count,
        percentual: ((count / totalContratos) * 100).toFixed(1)
      }));

      // Distribuição por cliente (top 10)
      const clienteCount = {};
      contratos?.forEach(c => {
        if (c.cliente) {
          clienteCount[c.cliente] = (clienteCount[c.cliente] || 0) + 1;
        }
      });

      const distribuicaoPorCliente = Object.entries(clienteCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([cliente, count]) => ({
          cliente,
          count,
          percentual: ((count / totalContratos) * 100).toFixed(1)
        }));

      // Calcular taxa de conversão (exemplo: propostas enviadas vs contratos fechados)
      const propostas = contratos?.filter(c => c.status === 'Proposta Enviada').length || 0;
      const taxaConversao = totalContratos > 0 
        ? ((contratosFechados / (contratosFechados + propostas)) * 100).toFixed(1)
        : 0;

      setDados({
        totalContratos,
        totalPropostas: propostas,
        valorTotal,
        taxaConversao: parseFloat(taxaConversao),
        tendencia: 5.2, // Exemplo - calcular com base em período anterior
        distribuicaoPorStatus,
        distribuicaoPorCliente,
        evolucaoMensal: [] // Implementar evolução mensal se necessário
      });

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
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

  const CardMetrica = ({ titulo, valor, icone: Icone, cor, tendencia, sufixo = '' }) => (
    <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
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
            <BarChart3 size={32} className="text-blue-600" />
            Volumetria Processual
          </h1>
          <p className="text-gray-600 mt-1">
            Análise quantitativa de contratos e processos
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
            <option value="mes_anterior">Mês Anterior</option>
            <option value="trimestre">Último Trimestre</option>
            <option value="semestre">Último Semestre</option>
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
        />
        <CardMetrica
          titulo="Propostas em Aberto"
          valor={dados.totalPropostas}
          icone={Target}
          cor="bg-yellow-600"
        />
        <CardMetrica
          titulo="Valor Total"
          valor={formatarMoeda(dados.valorTotal)}
          icone={DollarSign}
          cor="bg-green-600"
          tendencia={dados.tendencia}
        />
        <CardMetrica
          titulo="Taxa de Conversão"
          valor={dados.taxaConversao}
          icone={TrendingUp}
          cor="bg-purple-600"
          sufixo="%"
        />
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
                    <span className="text-sm font-medium text-gray-700">{item.status}</span>
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

        {/* Top 10 Clientes */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users size={24} className="text-green-600" />
            Top 10 Clientes
          </h2>
          <div className="space-y-3">
            {dados.distribuicaoPorCliente.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {item.cliente}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">{item.count}</span>
                  <span className="text-xs font-semibold text-gray-500">
                    ({item.percentual}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Indicadores de Performance */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-sm p-6 text-white">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Activity size={28} />
          Indicadores de Performance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-blue-100 text-sm mb-1">Ticket Médio</p>
            <p className="text-3xl font-bold">
              {formatarMoeda(dados.totalContratos > 0 ? dados.valorTotal / dados.totalContratos : 0)}
            </p>
          </div>
          <div>
            <p className="text-blue-100 text-sm mb-1">Contratos por Dia (Média)</p>
            <p className="text-3xl font-bold">
              {(dados.totalContratos / 30).toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-blue-100 text-sm mb-1">Taxa de Sucesso</p>
            <p className="text-3xl font-bold">{dados.taxaConversao}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Volumetria;
