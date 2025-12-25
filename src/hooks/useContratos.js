/**
 * @file useContratos.js
 * @description Hook para gerenciar operações com contratos
 * @version 1.4.0
 * @author Marcio Gama - Flow Metrics
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

/**
 * Hook para gerenciar contratos
 * @param {Object} options - Opções de configuração
 * @param {boolean} options.autoFetch - Se deve buscar automaticamente ao montar
 * @param {string} options.status - Filtrar por status específico
 * @returns {Object} Objeto com contratos e funções de gerenciamento
 */
export const useContratos = ({ autoFetch = true, status = null } = {}) => {
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Busca contratos do banco de dados
   */
  const fetchContratos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('contratos')
        .select(`
          *,
          clientes (
            id,
            razao_social,
            cnpj,
            email,
            telefone
          )
        `)
        .order('created_at', { ascending: false });

      // Aplica filtro de status se fornecido
      if (status) {
        query = query.eq('status', status);
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) throw supabaseError;

      setContratos(data || []);
    } catch (err) {
      console.error('Erro ao buscar contratos:', err);
      setError('Erro ao carregar contratos');
    } finally {
      setLoading(false);
    }
  }, [status]);

  /**
   * Busca um contrato específico por ID
   * @param {string} id - ID do contrato
   * @returns {Promise<Object>} Contrato encontrado
   */
  const fetchContratoById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('contratos')
        .select(`
          *,
          clientes (
            id,
            razao_social,
            cnpj
          )
        `)
        .eq('id', id)
        .single();

      if (supabaseError) throw supabaseError;

      return data;
    } catch (err) {
      console.error('Erro ao buscar contrato:', err);
      setError('Erro ao carregar contrato');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cria um novo contrato
   * @param {Object} contratoData - Dados do contrato
   * @returns {Promise<Object>} Contrato criado
   */
  const createContrato = useCallback(async (contratoData) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('contratos')
        .insert([contratoData])
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      // Registra log
      await supabase.from('logs_sistema').insert([
        {
          categoria: 'Contrato',
          acao: 'Criação',
          detalhes: `Novo contrato criado: ${contratoData.descricao_contrato || 'Sem descrição'}`,
          referencia_id: data.id,
        },
      ]);

      // Atualiza lista local
      await fetchContratos();

      return data;
    } catch (err) {
      console.error('Erro ao criar contrato:', err);
      setError('Erro ao criar contrato');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchContratos]);

  /**
   * Atualiza um contrato existente
   * @param {string} id - ID do contrato
   * @param {Object} contratoData - Dados atualizados
   * @returns {Promise<Object>} Contrato atualizado
   */
  const updateContrato = useCallback(async (id, contratoData) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('contratos')
        .update(contratoData)
        .eq('id', id)
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      // Registra log
      await supabase.from('logs_sistema').insert([
        {
          categoria: 'Contrato',
          acao: 'Edição',
          detalhes: `Contrato atualizado`,
          referencia_id: id,
        },
      ]);

      // Atualiza lista local
      await fetchContratos();

      return data;
    } catch (err) {
      console.error('Erro ao atualizar contrato:', err);
      setError('Erro ao atualizar contrato');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchContratos]);

  /**
   * Deleta um contrato
   * @param {string} id - ID do contrato
   */
  const deleteContrato = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const { error: supabaseError } = await supabase
        .from('contratos')
        .delete()
        .eq('id', id);

      if (supabaseError) throw supabaseError;

      // Registra log
      await supabase.from('logs_sistema').insert([
        {
          categoria: 'Contrato',
          acao: 'Exclusão',
          detalhes: `Contrato excluído`,
          referencia_id: id,
        },
      ]);

      // Atualiza lista local
      await fetchContratos();
    } catch (err) {
      console.error('Erro ao deletar contrato:', err);
      setError('Erro ao deletar contrato');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchContratos]);

  /**
   * Atualiza status de um contrato
   * @param {string} id - ID do contrato
   * @param {string} newStatus - Novo status
   * @param {string} descricao - Descrição para o log
   */
  const updateStatus = useCallback(async (id, newStatus, descricao = '') => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('contratos')
        .update({ status: newStatus })
        .eq('id', id)
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      // Registra log
      await supabase.from('logs_sistema').insert([
        {
          categoria: 'Contrato',
          acao: 'Mudança de Status',
          detalhes: `${descricao} movido para "${newStatus}"`,
          referencia_id: id,
        },
      ]);

      // Atualiza lista local
      await fetchContratos();

      return data;
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      setError('Erro ao atualizar status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchContratos]);

  /**
   * Upload de PDF para o GED
   * @param {string} contratoId - ID do contrato
   * @param {File} file - Arquivo PDF
   */
  const uploadPDF = useCallback(async (contratoId, file) => {
    try {
      setLoading(true);
      setError(null);

      const fileExt = file.name.split('.').pop();
      const fileName = `ged_${contratoId}_${Date.now()}.${fileExt}`;

      // Upload para o Storage
      const { error: uploadError } = await supabase.storage
        .from('contratos_ged')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Pega URL pública
      const { data: urlData } = supabase.storage
        .from('contratos_ged')
        .getPublicUrl(fileName);

      // Atualiza contrato com URL do PDF
      const { error: updateError } = await supabase
        .from('contratos')
        .update({
          arquivo_pdf_url: urlData.publicUrl,
          data_vinculo_pdf: new Date().toISOString(),
        })
        .eq('id', contratoId);

      if (updateError) throw updateError;

      // Registra log
      await supabase.from('logs_sistema').insert([
        {
          categoria: 'GED',
          acao: 'Upload de Documento',
          detalhes: `PDF vinculado ao contrato`,
          referencia_id: contratoId,
        },
      ]);

      // Atualiza lista local
      await fetchContratos();

      return urlData.publicUrl;
    } catch (err) {
      console.error('Erro no upload:', err);
      setError('Erro ao fazer upload do PDF');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchContratos]);

  // Auto-fetch ao montar o componente
  useEffect(() => {
    if (autoFetch) {
      fetchContratos();
    }
  }, [autoFetch, fetchContratos]);

  return {
    contratos,
    loading,
    error,
    fetchContratos,
    fetchContratoById,
    createContrato,
    updateContrato,
    deleteContrato,
    updateStatus,
    uploadPDF,
  };
};

export default useContratos;
