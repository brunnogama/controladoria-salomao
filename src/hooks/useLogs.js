/**
 * @file useLogs.js
 * @description Hook para gerenciar logs de auditoria
 * @version 1.4.3
 * @author Marcio Gama - Flow Metrics
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

/**
 * Hook para gerenciar logs do sistema
 * @param {Object} options - Opções de configuração
 * @param {boolean} options.autoFetch - Se deve buscar automaticamente ao montar
 * @param {number} options.limit - Limite de logs a buscar
 * @param {string} options.categoria - Filtrar por categoria específica
 * @returns {Object} Objeto com logs e funções de gerenciamento
 */
export const useLogs = ({ 
  autoFetch = true, 
  limit = 50,
  categoria = null 
} = {}) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Busca logs do banco de dados
   */
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('logs_sistema')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      // Aplica filtro de categoria se fornecido
      if (categoria) {
        query = query.eq('categoria', categoria);
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) throw supabaseError;

      setLogs(data || []);
    } catch (err) {
      console.error('Erro ao buscar logs:', err);
      setError('Erro ao carregar histórico');
    } finally {
      setLoading(false);
    }
  }, [categoria, limit]);

  /**
   * Busca logs por data
   * @param {Date} dataInicio - Data inicial
   * @param {Date} dataFim - Data final
   */
  const fetchLogsPorPeriodo = useCallback(async (dataInicio, dataFim) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('logs_sistema')
        .select('*')
        .gte('created_at', dataInicio.toISOString())
        .lte('created_at', dataFim.toISOString())
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;

      setLogs(data || []);
    } catch (err) {
      console.error('Erro ao buscar logs por período:', err);
      setError('Erro ao filtrar logs por período');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Busca logs de um usuário específico
   * @param {string} email - Email do usuário
   */
  const fetchLogsPorUsuario = useCallback(async (email) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('logs_sistema')
        .select('*')
        .eq('usuario_email', email)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (supabaseError) throw supabaseError;

      setLogs(data || []);
    } catch (err) {
      console.error('Erro ao buscar logs por usuário:', err);
      setError('Erro ao filtrar logs por usuário');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  /**
   * Busca logs de uma ação específica
   * @param {string} acao - Tipo de ação
   */
  const fetchLogsPorAcao = useCallback(async (acao) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('logs_sistema')
        .select('*')
        .eq('acao', acao)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (supabaseError) throw supabaseError;

      setLogs(data || []);
    } catch (err) {
      console.error('Erro ao buscar logs por ação:', err);
      setError('Erro ao filtrar logs por ação');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  /**
   * Busca logs relacionados a um registro específico
   * @param {string} referenciaId - ID do registro
   */
  const fetchLogsPorReferencia = useCallback(async (referenciaId) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('logs_sistema')
        .select('*')
        .eq('referencia_id', referenciaId)
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;

      setLogs(data || []);
    } catch (err) {
      console.error('Erro ao buscar logs por referência:', err);
      setError('Erro ao filtrar logs por referência');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Limpa logs (apenas admin)
   * @param {number} diasAntigos - Deletar logs com mais de X dias
   */
  const limparLogsAntigos = useCallback(async (diasAntigos = 90) => {
    try {
      setLoading(true);
      setError(null);

      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - diasAntigos);

      const { error: supabaseError } = await supabase
        .from('logs_sistema')
        .delete()
        .lt('created_at', dataLimite.toISOString());

      if (supabaseError) throw supabaseError;

      await fetchLogs();
    } catch (err) {
      console.error('Erro ao limpar logs antigos:', err);
      setError('Erro ao limpar logs antigos');
    } finally {
      setLoading(false);
    }
  }, [fetchLogs]);

  /**
   * Estatísticas dos logs
   */
  const getEstatisticas = useCallback(() => {
    if (!logs.length) return null;

    const estatisticas = {
      total: logs.length,
      porAcao: {},
      porCategoria: {},
      porUsuario: {},
      ultimaAcao: logs[0]?.created_at
    };

    logs.forEach(log => {
      // Contar por ação
      estatisticas.porAcao[log.acao] = (estatisticas.porAcao[log.acao] || 0) + 1;
      
      // Contar por categoria
      estatisticas.porCategoria[log.categoria] = (estatisticas.porCategoria[log.categoria] || 0) + 1;
      
      // Contar por usuário
      estatisticas.porUsuario[log.usuario_email] = (estatisticas.porUsuario[log.usuario_email] || 0) + 1;
    });

    return estatisticas;
  }, [logs]);

  // Auto-fetch ao montar o componente
  useEffect(() => {
    if (autoFetch) {
      fetchLogs();
    }
  }, [autoFetch, fetchLogs]);

  return {
    logs,
    loading,
    error,
    fetchLogs,
    fetchLogsPorPeriodo,
    fetchLogsPorUsuario,
    fetchLogsPorAcao,
    fetchLogsPorReferencia,
    limparLogsAntigos,
    getEstatisticas
  };
};

export default useLogs;
