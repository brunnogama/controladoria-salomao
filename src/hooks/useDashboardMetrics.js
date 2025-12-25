/**
 * @file useDashboardMetrics.js
 * @description Hook para calcular métricas do dashboard
 * @version 1.4.0
 * @author Marcio Gama - Flow Metrics
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { STATUS_CONTRATO } from '../constants';

/**
 * Hook para calcular métricas do dashboard
 * @returns {Object} { metrics, funil, evolucaoMensal, recentes, loading, error, refresh }
 */
export const useDashboardMetrics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [metrics, setMetrics] = useState({
    semana: {
      novos: 0,
      propQtd: 0,
      propPL: 0,
      propExito: 0,
      fechQtd: 0,
      fechPL: 0,
      fechExito: 0,
      fechMensal: 0,
    },
    mes: {
      novos: 0,
      propQtd: 0,
      propPL: 0,
      propExito: 0,
      fechQtd: 0,
      fechPL: 0,
      fechExito: 0,
      fechMensal: 0,
    },
    geral: {
      totalCasos: 0,
      emAnalise: 0,
      propostasAtivas: 0,
      fechados: 0,
      rejeitados: 0,
      valorEmNegociacaoPL: 0,
      valorEmNegociacaoExito: 0,
      receitaRecorrenteAtiva: 0,
      totalFechadoPL: 0,
      totalFechadoExito: 0,
      assinados: 0,
      naoAssinados: 0,
    },
  });

  const [funil, setFunil] = useState({
    totalEntrada: 0,
    qualificadosProposta: 0,
    fechados: 0,
    perdaAnalise: 0,
    perdaNegociacao: 0,
    taxaConversaoProposta: 0,
    taxaConversaoFechamento: 0,
  });

  const [evolucaoMensal, setEvolucaoMensal] = useState([]);
  const [recentes, setRecentes] = useState([]);

  /**
   * Processa dados dos contratos e calcula métricas
   */
  const processarDados = useCallback((contratos) => {
    const hoje = new Date();

    // Configurações de Data
    const diaDaSemana = hoje.getDay() || 7;
    const inicioSemana = new Date(hoje);
    inicioSemana.setHours(0, 0, 0, 0);
    inicioSemana.setDate(hoje.getDate() - diaDaSemana + 1);
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    // Acumuladores
    let mSemana = {
      novos: 0,
      propQtd: 0,
      propPL: 0,
      propExito: 0,
      fechQtd: 0,
      fechPL: 0,
      fechExito: 0,
      fechMensal: 0,
    };
    let mMes = {
      novos: 0,
      propQtd: 0,
      propPL: 0,
      propExito: 0,
      fechQtd: 0,
      fechPL: 0,
      fechExito: 0,
      fechMensal: 0,
    };
    let mGeral = {
      totalCasos: 0,
      emAnalise: 0,
      propostasAtivas: 0,
      fechados: 0,
      rejeitados: 0,
      valorEmNegociacaoPL: 0,
      valorEmNegociacaoExito: 0,
      receitaRecorrenteAtiva: 0,
      totalFechadoPL: 0,
      totalFechadoExito: 0,
      assinados: 0,
      naoAssinados: 0,
    };

    // Funil
    let fTotal = 0;
    let fQualificados = 0;
    let fFechados = 0;
    let fPerdaAnalise = 0;
    let fPerdaNegociacao = 0;

    const mapaMeses = {};

    contratos.forEach((c) => {
      const dataCriacao = new Date(c.created_at);
      const dataProp = c.data_proposta ? new Date(c.data_proposta) : dataCriacao;
      const dataFechamento = c.data_contrato ? new Date(c.data_contrato) : dataCriacao;
      const pl = Number(c.proposta_pro_labore || 0);
      const exito = Number(c.proposta_exito_total || 0);
      const mensal = Number(c.proposta_fixo_mensal || 0);

      // Evolução Mensal
      const mesAno = `${dataCriacao.getMonth() + 1}/${dataCriacao.getFullYear().toString().substring(2)}`;
      mapaMeses[mesAno] = (mapaMeses[mesAno] || 0) + 1;

      // FUNIL
      fTotal++;
      const chegouEmProposta =
        c.status === STATUS_CONTRATO.PROPOSTA_ENVIADA ||
        c.status === STATUS_CONTRATO.CONTRATO_FECHADO ||
        (c.status === STATUS_CONTRATO.REJEITADA && c.data_proposta);

      if (chegouEmProposta) fQualificados++;

      if (c.status === STATUS_CONTRATO.CONTRATO_FECHADO) {
        fFechados++;
      } else if (c.status === STATUS_CONTRATO.REJEITADA) {
        c.data_proposta ? fPerdaNegociacao++ : fPerdaAnalise++;
      }

      // GERAL
      mGeral.totalCasos++;
      if (c.status === STATUS_CONTRATO.SOB_ANALISE) mGeral.emAnalise++;
      if (c.status === STATUS_CONTRATO.REJEITADA) mGeral.rejeitados++;
      if (c.status === STATUS_CONTRATO.PROPOSTA_ENVIADA) {
        mGeral.propostasAtivas++;
        mGeral.valorEmNegociacaoPL += pl;
        mGeral.valorEmNegociacaoExito += exito;
      }
      if (c.status === STATUS_CONTRATO.CONTRATO_FECHADO) {
        mGeral.fechados++;
        mGeral.receitaRecorrenteAtiva += mensal;
        mGeral.totalFechadoPL += pl;
        mGeral.totalFechadoExito += exito;

        if (c.contrato_assinado) {
          mGeral.assinados++;
        } else {
          mGeral.naoAssinados++;
        }
      }

      // SEMANA
      if (dataCriacao >= inicioSemana) mSemana.novos++;
      if (c.status === STATUS_CONTRATO.PROPOSTA_ENVIADA && dataProp >= inicioSemana) {
        mSemana.propQtd++;
        mSemana.propPL += pl;
        mSemana.propExito += exito;
      }
      if (c.status === STATUS_CONTRATO.CONTRATO_FECHADO && dataFechamento >= inicioSemana) {
        mSemana.fechQtd++;
        mSemana.fechPL += pl;
        mSemana.fechExito += exito;
        mSemana.fechMensal += mensal;
      }

      // MÊS
      if (dataCriacao >= inicioMes) mMes.novos++;
      if (c.status === STATUS_CONTRATO.PROPOSTA_ENVIADA && dataProp >= inicioMes) {
        mMes.propQtd++;
        mMes.propPL += pl;
        mMes.propExito += exito;
      }
      if (c.status === STATUS_CONTRATO.CONTRATO_FECHADO && dataFechamento >= inicioMes) {
        mMes.fechQtd++;
        mMes.fechPL += pl;
        mMes.fechExito += exito;
        mMes.fechMensal += mensal;
      }
    });

    // Taxas de Conversão
    const txProp = fTotal > 0 ? ((fQualificados / fTotal) * 100).toFixed(1) : 0;
    const txFech = fQualificados > 0 ? ((fFechados / fQualificados) * 100).toFixed(1) : 0;

    setFunil({
      totalEntrada: fTotal,
      qualificadosProposta: fQualificados,
      fechados: fFechados,
      perdaAnalise: fPerdaAnalise,
      perdaNegociacao: fPerdaNegociacao,
      taxaConversaoProposta: txProp,
      taxaConversaoFechamento: txFech,
    });

    // Gráfico de Evolução
    const mesesGrafico = Object.keys(mapaMeses).map((key) => ({
      mes: key,
      qtd: mapaMeses[key],
      altura: 0,
    }));
    const maxQtd = Math.max(...mesesGrafico.map((m) => m.qtd), 1);
    mesesGrafico.forEach((m) => (m.altura = (m.qtd / maxQtd) * 100));

    setMetrics({ semana: mSemana, mes: mMes, geral: mGeral });
    setEvolucaoMensal(mesesGrafico.reverse().slice(0, 6).reverse());

    // Contratos Recentes
    const sorted = [...contratos]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
    setRecentes(sorted);
  }, []);

  /**
   * Busca dados do dashboard
   */
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: contratos, error: supabaseError } = await supabase
        .from('contratos')
        .select(`
          status, 
          proposta_pro_labore, 
          proposta_fixo_mensal, 
          proposta_exito_total,
          contrato_assinado,
          created_at, 
          data_proposta,
          data_contrato,
          clientes(razao_social)
        `);

      if (supabaseError) throw supabaseError;

      if (contratos) {
        processarDados(contratos);
      }
    } catch (err) {
      console.error('Erro ao buscar dados do dashboard:', err);
      setError('Erro ao carregar métricas');
    } finally {
      setLoading(false);
    }
  }, [processarDados]);

  // Busca dados ao montar
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    metrics,
    funil,
    evolucaoMensal,
    recentes,
    loading,
    error,
    refresh: fetchDashboardData,
  };
};

export default useDashboardMetrics;
