/**
 * @file logService.js
 * @description Serviço para registrar logs de auditoria no sistema
 * @version 1.4.3
 * @author Marcio Gama - Flow Metrics
 */

import { supabase } from '../supabaseClient';

/**
 * Obtém o IP do usuário via API externa
 * @returns {Promise<string>} Endereço IP
 */
const obterIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.warn('Não foi possível obter IP:', error);
    return 'IP não disponível';
  }
};

/**
 * Obtém informações do navegador
 * @returns {string} User agent
 */
const obterUserAgent = () => {
  return navigator.userAgent;
};

/**
 * Obtém dados do usuário autenticado
 * @returns {Promise<Object>} Dados do usuário
 */
const obterUsuario = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      return {
        email: user.email,
        nome: user.user_metadata?.full_name || user.email.split('@')[0],
        id: user.id
      };
    }
    
    // Fallback se não houver usuário autenticado
    return {
      email: 'sistema@salomaoadv.com.br',
      nome: 'Sistema',
      id: null
    };
  } catch (error) {
    console.warn('Erro ao obter usuário:', error);
    return {
      email: 'desconhecido@salomaoadv.com.br',
      nome: 'Usuário Desconhecido',
      id: null
    };
  }
};

/**
 * Registra um log de auditoria no sistema
 * @param {Object} params - Parâmetros do log
 * @param {string} params.acao - Tipo de ação: "Criação", "Edição", "Exclusão", "Visualização", etc
 * @param {string} params.categoria - Categoria: "Cliente", "Contrato", "GED", "Sistema", etc
 * @param {string} params.detalhes - Descrição detalhada da ação
 * @param {string} [params.referenciaId] - ID do registro afetado
 * @param {string} [params.tabelaAfetada] - Nome da tabela afetada
 * @param {Object} [params.dadosAnteriores] - Dados antes da alteração
 * @param {Object} [params.dadosNovos] - Dados depois da alteração
 * @param {Object} [params.metadados] - Informações adicionais
 * @returns {Promise<Object>} Log criado
 */
export const registrarLog = async ({
  acao,
  categoria,
  detalhes,
  referenciaId = null,
  tabelaAfetada = null,
  dadosAnteriores = null,
  dadosNovos = null,
  metadados = null
}) => {
  try {
    // Obter informações do contexto
    const [usuario, ipAddress] = await Promise.all([
      obterUsuario(),
      obterIP()
    ]);
    
    const userAgent = obterUserAgent();
    
    // Preparar dados do log
    const logData = {
      usuario_email: usuario.email,
      usuario_nome: usuario.nome,
      usuario_id: usuario.id,
      ip_address: ipAddress,
      user_agent: userAgent,
      acao,
      categoria,
      detalhes,
      referencia_id: referenciaId,
      tabela_afetada: tabelaAfetada,
      dados_anteriores: dadosAnteriores,
      dados_novos: dadosNovos,
      metadados
    };
    
    // Inserir no banco de dados
    const { data, error } = await supabase
      .from('logs_sistema')
      .insert([logData])
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao registrar log:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Falha ao registrar log de auditoria:', error);
    // Não lançar erro para não interromper fluxo principal
    return null;
  }
};

/**
 * Atalhos para tipos comuns de log
 */

export const logCriacao = (categoria, detalhes, referenciaId, dadosNovos) => 
  registrarLog({
    acao: 'Criação',
    categoria,
    detalhes,
    referenciaId,
    tabelaAfetada: categoria.toLowerCase() + 's',
    dadosNovos
  });

export const logEdicao = (categoria, detalhes, referenciaId, dadosAnteriores, dadosNovos) => 
  registrarLog({
    acao: 'Edição',
    categoria,
    detalhes,
    referenciaId,
    tabelaAfetada: categoria.toLowerCase() + 's',
    dadosAnteriores,
    dadosNovos
  });

export const logExclusao = (categoria, detalhes, referenciaId, dadosAnteriores) => 
  registrarLog({
    acao: 'Exclusão',
    categoria,
    detalhes,
    referenciaId,
    tabelaAfetada: categoria.toLowerCase() + 's',
    dadosAnteriores
  });

export const logMudancaStatus = (categoria, detalhes, referenciaId, statusAntigo, statusNovo) => 
  registrarLog({
    acao: 'Mudança de Status',
    categoria,
    detalhes,
    referenciaId,
    tabelaAfetada: categoria.toLowerCase() + 's',
    dadosAnteriores: { status: statusAntigo },
    dadosNovos: { status: statusNovo }
  });

export const logUpload = (categoria, detalhes, referenciaId, nomeArquivo) => 
  registrarLog({
    acao: 'Upload de Documento',
    categoria,
    detalhes,
    referenciaId,
    tabelaAfetada: 'arquivos',
    metadados: { nome_arquivo: nomeArquivo }
  });

export const logLogin = () => 
  registrarLog({
    acao: 'Login',
    categoria: 'Autenticação',
    detalhes: 'Usuário realizou login no sistema'
  });

export const logLogout = () => 
  registrarLog({
    acao: 'Logout',
    categoria: 'Autenticação',
    detalhes: 'Usuário saiu do sistema'
  });

export default registrarLog;
