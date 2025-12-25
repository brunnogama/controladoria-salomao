/**
 * @file formatters.js
 * @description Funções utilitárias para formatação de dados
 * @version 1.4.0
 * @author Marcio Gama - Flow Metrics
 */

/**
 * Formata um valor numérico para moeda brasileira (R$)
 * @param {number|string} value - Valor a ser formatado
 * @returns {string} Valor formatado em R$
 * @example
 * formatMoney(1234.56) // "R$ 1.234,56"
 * formatMoney(0) // "R$ 0,00"
 * formatMoney(null) // "R$ 0,00"
 */
export const formatMoney = (value) => {
  const numericValue = Number(value) || 0;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numericValue);
};

/**
 * Aplica máscara de moeda a um valor (com separadores)
 * @param {number|string} value - Valor a ser mascarado
 * @returns {string} Valor com máscara (ex: "1.234,56")
 * @example
 * aplicarMascaraMoeda(123456) // "1.234,56"
 */
export const aplicarMascaraMoeda = (value) => {
  if (!value && value !== 0) return '';
  const apenasNumeros = value.toString().replace(/\D/g, '');
  if (!apenasNumeros) return '';
  const valorDecimal = (Number(apenasNumeros) / 100).toFixed(2);
  return valorDecimal.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * Remove máscara de moeda e retorna número
 * @param {string} value - Valor mascarado
 * @returns {number} Valor numérico
 * @example
 * removerMascaraMoeda("1.234,56") // 1234.56
 */
export const removerMascaraMoeda = (value) => {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  const formatado = value.replace(/\./g, '').replace(',', '.');
  return parseFloat(formatado) || 0;
};

/**
 * Formata telefone brasileiro
 * @param {string} value - Número de telefone
 * @returns {string} Telefone formatado
 * @example
 * formatPhone("11987654321") // "(11) 98765-4321"
 */
export const formatPhone = (value) => {
  if (!value) return '';
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/g, '($1) $2')
    .replace(/(\d)(\d{4})$/, '$1-$2')
    .substring(0, 15);
};

/**
 * Formata CNPJ
 * @param {string} value - Número do CNPJ
 * @returns {string} CNPJ formatado
 * @example
 * formatCNPJ("12345678000190") // "12.345.678/0001-90"
 */
export const formatCNPJ = (value) => {
  if (!value) return '';
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .substring(0, 18);
};

/**
 * Formata CPF
 * @param {string} value - Número do CPF
 * @returns {string} CPF formatado
 * @example
 * formatCPF("12345678900") // "123.456.789-00"
 */
export const formatCPF = (value) => {
  if (!value) return '';
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .substring(0, 14);
};

/**
 * Formata data para padrão brasileiro
 * @param {string|Date} date - Data a ser formatada
 * @param {boolean} includeTime - Se deve incluir horário
 * @returns {string} Data formatada
 * @example
 * formatDate("2024-12-25") // "25/12/2024"
 * formatDate("2024-12-25T10:30:00", true) // "25/12/2024 10:30"
 */
export const formatDate = (date, includeTime = false) => {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '-';
  
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...(includeTime && {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
  
  return new Intl.DateTimeFormat('pt-BR', options).format(dateObj);
};

/**
 * Formata data para formato ISO (YYYY-MM-DD)
 * @param {Date} date - Data a ser formatada
 * @returns {string} Data em formato ISO
 */
export const formatDateISO = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString().split('T')[0];
};

/**
 * Calcula diferença em dias entre duas datas
 * @param {Date|string} date1 - Data inicial
 * @param {Date|string} date2 - Data final (padrão: hoje)
 * @returns {number} Diferença em dias
 */
export const daysDifference = (date1, date2 = new Date()) => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Formata número com separador de milhares
 * @param {number} value - Valor numérico
 * @returns {string} Número formatado
 * @example
 * formatNumber(1234567) // "1.234.567"
 */
export const formatNumber = (value) => {
  if (!value && value !== 0) return '0';
  return new Intl.NumberFormat('pt-BR').format(value);
};

/**
 * Trunca texto com reticências
 * @param {string} text - Texto a ser truncado
 * @param {number} maxLength - Tamanho máximo
 * @returns {string} Texto truncado
 * @example
 * truncate("Texto muito longo", 10) // "Texto muit..."
 */
export const truncate = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Capitaliza primeira letra de cada palavra
 * @param {string} text - Texto a ser capitalizado
 * @returns {string} Texto capitalizado
 * @example
 * capitalize("josé da silva") // "José Da Silva"
 */
export const capitalize = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Extrai iniciais de um nome
 * @param {string} name - Nome completo
 * @param {number} maxInitials - Número máximo de iniciais
 * @returns {string} Iniciais
 * @example
 * getInitials("José da Silva") // "JS"
 */
export const getInitials = (name, maxInitials = 2) => {
  if (!name) return '??';
  return name
    .split(' ')
    .filter(word => word.length > 2) // Ignora preposições
    .slice(0, maxInitials)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
};

/**
 * Calcula porcentagem
 * @param {number} value - Valor parcial
 * @param {number} total - Valor total
 * @param {number} decimals - Casas decimais
 * @returns {number} Porcentagem
 */
export const calculatePercentage = (value, total, decimals = 1) => {
  if (!total || total === 0) return 0;
  return parseFloat(((value / total) * 100).toFixed(decimals));
};
