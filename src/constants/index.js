/**
 * @file constants.js
 * @description Constantes globais do sistema
 * @version 1.4.0
 * @author Marcio Gama - Flow Metrics
 */

// ========== STATUS DE CONTRATOS ==========
export const STATUS_CONTRATO = {
  SOB_ANALISE: 'Sob Análise',
  PROPOSTA_ENVIADA: 'Proposta Enviada',
  CONTRATO_FECHADO: 'Contrato Fechado',
  REJEITADA: 'Rejeitada',
  PROBONO: 'Probono',
};

// ========== CORES POR STATUS ==========
export const STATUS_COLORS = {
  [STATUS_CONTRATO.SOB_ANALISE]: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-500',
    dot: 'bg-yellow-500',
  },
  [STATUS_CONTRATO.PROPOSTA_ENVIADA]: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-500',
    dot: 'bg-blue-500',
  },
  [STATUS_CONTRATO.CONTRATO_FECHADO]: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-500',
    dot: 'bg-green-600',
  },
  [STATUS_CONTRATO.REJEITADA]: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-500',
    dot: 'bg-red-600',
  },
  [STATUS_CONTRATO.PROBONO]: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-500',
    dot: 'bg-blue-500',
  },
};

// ========== CONFIGURAÇÕES DE KANBAN ==========
export const KANBAN_COLUMNS = [
  {
    id: STATUS_CONTRATO.SOB_ANALISE,
    titulo: 'Sob Análise',
    cor: 'bg-orange-500',
    border: 'border-orange-500',
  },
  {
    id: STATUS_CONTRATO.PROPOSTA_ENVIADA,
    titulo: 'Proposta Enviada',
    cor: 'bg-yellow-400',
    border: 'border-yellow-400',
  },
  {
    id: STATUS_CONTRATO.CONTRATO_FECHADO,
    titulo: 'Contrato Fechado',
    cor: 'bg-green-600',
    border: 'border-green-600',
  },
  {
    id: STATUS_CONTRATO.PROBONO,
    titulo: 'Probono',
    cor: 'bg-blue-500',
    border: 'border-blue-500',
  },
  {
    id: STATUS_CONTRATO.REJEITADA,
    titulo: 'Rejeitados',
    cor: 'bg-red-600',
    border: 'border-red-600',
  },
];

// ========== CATEGORIAS DE LOGS ==========
export const LOG_CATEGORIES = {
  CONTRATO: 'Contrato',
  CLIENTE: 'Cliente',
  KANBAN: 'Kanban',
  SISTEMA: 'Sistema',
  GED: 'GED',
};

// ========== AÇÕES DE LOGS ==========
export const LOG_ACTIONS = {
  CRIACAO: 'Criação',
  EDICAO: 'Edição',
  EXCLUSAO: 'Exclusão',
  MUDANCA_STATUS: 'Mudança de Status',
  MOVIMENTACAO: 'Movimentação',
  UPLOAD: 'Upload de Documento',
};

// ========== VALIDAÇÕES DE ARQUIVO ==========
export const FILE_VALIDATION = {
  MAX_SIZE_MB: 10,
  ALLOWED_EXTENSIONS: ['pdf'],
  ALLOWED_MIME_TYPES: ['application/pdf'],
};

// ========== MÁSCARAS DE INPUT ==========
export const INPUT_MASKS = {
  CNPJ: '99.999.999/9999-99',
  CPF: '999.999.999-99',
  PHONE: '(99) 99999-9999',
  CEP: '99999-999',
  DATE: 'DD/MM/YYYY',
};

// ========== LIMITES DE PAGINAÇÃO ==========
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  MAX_RECENT_ITEMS: 5,
};

// ========== MENSAGENS DE FEEDBACK ==========
export const MESSAGES = {
  SUCCESS: {
    SAVE: 'Registro salvo com sucesso!',
    DELETE: 'Registro excluído com sucesso!',
    UPDATE: 'Registro atualizado com sucesso!',
    UPLOAD: 'Arquivo enviado com sucesso!',
  },
  ERROR: {
    GENERIC: 'Ocorreu um erro. Tente novamente.',
    SAVE: 'Erro ao salvar registro.',
    DELETE: 'Erro ao excluir registro.',
    UPDATE: 'Erro ao atualizar registro.',
    UPLOAD: 'Erro ao enviar arquivo.',
    NETWORK: 'Erro de conexão. Verifique sua internet.',
    NOT_FOUND: 'Registro não encontrado.',
  },
  VALIDATION: {
    REQUIRED: 'Este campo é obrigatório.',
    INVALID_EMAIL: 'Email inválido.',
    INVALID_CNPJ: 'CNPJ inválido.',
    INVALID_CPF: 'CPF inválido.',
    INVALID_PHONE: 'Telefone inválido.',
    FILE_TOO_LARGE: 'Arquivo muito grande. Máximo: 10MB',
    INVALID_FILE_TYPE: 'Tipo de arquivo não permitido. Use PDF.',
  },
  CONFIRMATION: {
    DELETE: 'Tem certeza que deseja excluir?',
    CANCEL: 'Deseja cancelar? As alterações serão perdidas.',
  },
};

// ========== ROTAS DO SISTEMA ==========
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/',
  CONTRATOS: '/contratos',
  NOVO_CONTRATO: '/contratos/novo',
  EDITAR_CONTRATO: '/contratos/editar/:id',
  CLIENTES: '/clientes',
  GED: '/ged',
  HISTORICO: '/historico',
  CONFIGURACOES: '/configuracoes',
};

// ========== CONFIGURAÇÕES DE DATA ==========
export const DATE_CONFIG = {
  LOCALE: 'pt-BR',
  TIMEZONE: 'America/Sao_Paulo',
  FORMAT: {
    SHORT: 'DD/MM/YYYY',
    LONG: 'DD/MM/YYYY HH:mm',
    ISO: 'YYYY-MM-DD',
  },
};

// ========== CORES DO TEMA ==========
export const THEME_COLORS = {
  PRIMARY: '#0F2C4C',
  SECONDARY: '#1E40AF',
  SUCCESS: '#059669',
  WARNING: '#F59E0B',
  DANGER: '#DC2626',
  INFO: '#3B82F6',
};

// ========== LIMITES DE DASHBOARD ==========
export const DASHBOARD_CONFIG = {
  MESES_GRAFICO: 6,
  CONTRATOS_RECENTES: 5,
};

// ========== STORAGE KEYS (localStorage) ==========
export const STORAGE_KEYS = {
  USER_NAME: 'user_name',
  LOGO_PATH: 'app_logo_path',
  LOGIN_LOGO_PATH: 'app_login_logo_path',
  THEME: 'app_theme',
};

// ========== TIPOS DE CAMPO FINANCEIRO ==========
export const FINANCIAL_FIELDS = {
  PRO_LABORE: 'proposta_pro_labore',
  EXITO_TOTAL: 'proposta_exito_total',
  FIXO_MENSAL: 'proposta_fixo_mensal',
};

// ========== REGEX PATTERNS ==========
export const REGEX = {
  ONLY_NUMBERS: /\D/g,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/.+/,
  SPECIAL_CHARS: /[^a-zA-Z0-9._-]/g,
};
