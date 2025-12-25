/**
 * @file useClienteByCnpj.js
 * @description Hook para buscar cliente por CNPJ
 * @version 1.4.0
 * @author Marcio Gama - Flow Metrics
 */

import { useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { validateCNPJ } from '../utils/validators';

/**
 * Hook para buscar cliente pelo CNPJ
 * @returns {Object} { searchClient, cliente, loading, error, clear }
 * @example
 * const { searchClient, cliente, loading, error } = useClienteByCnpj();
 * searchClient('12.345.678/0001-90');
 */
export const useClienteByCnpj = () => {
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Busca cliente por CNPJ
   * @param {string} cnpj - CNPJ a ser buscado
   */
  const searchClient = useCallback(async (cnpj) => {
    // Limpa estado anterior
    setError(null);
    setCliente(null);

    // Remove formatação do CNPJ
    const cnpjLimpo = cnpj.replace(/\D/g, '');

    // Valida CNPJ
    if (cnpjLimpo.length < 14) {
      setError('CNPJ incompleto');
      return;
    }

    if (!validateCNPJ(cnpjLimpo)) {
      setError('CNPJ inválido');
      return;
    }

    setLoading(true);

    try {
      const { data, error: supabaseError } = await supabase
        .from('clientes')
        .select('id, razao_social, cnpj, email, telefone, nome_contato')
        .eq('cnpj', cnpj)
        .single();

      if (supabaseError) {
        if (supabaseError.code === 'PGRST116') {
          setError('Cliente não encontrado');
        } else {
          throw supabaseError;
        }
        return;
      }

      setCliente(data);
    } catch (err) {
      console.error('Erro ao buscar cliente:', err);
      setError('Erro ao buscar cliente. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Limpa estado do hook
   */
  const clear = useCallback(() => {
    setCliente(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    searchClient,
    cliente,
    loading,
    error,
    clear,
  };
};

export default useClienteByCnpj;
