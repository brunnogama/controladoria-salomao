/**
 * @file version.js
 * @description Versão centralizada do sistema - FONTE ÚNICA DA VERDADE
 * @updated 28/12/2024
 * 
 * IMPORTANTE: Este é o ÚNICO lugar onde a versão deve ser atualizada.
 * Todos os componentes importam daqui.
 */

export const APP_VERSION = "1.9.0";
export const APP_NAME = "Flow Metrics System";
export const LAST_UPDATE = "28/12/2024";

// Changelog completo (usado em Configurações)
export const RECENT_CHANGES = [
  {
    versao: "1.9.0",
    data: "28/12/2024",
    tipo: "New Feature",
    mudancas: [
      "📊 Novo módulo: Volumetria Processual",
      "📈 Análise quantitativa de contratos",
      "🎯 4 cards de métricas principais",
      "💰 Indicadores financeiros em tempo real",
      "📉 Distribuição por status e clientes",
      "🔍 Filtros: Mês, Trimestre, Semestre, Ano"
    ]
  },
  {
    versao: "1.8.1",
    data: "28/12/2024",
    tipo: "Critical Fix",
    mudancas: [
      "🔧 CSS corrigido - Tailwind funcionando",
      "✅ Diretivas @tailwind adicionadas",
      "🎨 Sistema de estilos restaurado",
      "🚀 Build corrigido - ModalManager",
      "⚡ Arquitetura de notificações simplificada"
    ]
  },
  {
    versao: "1.6.2",
    data: "26/12/2024",
    tipo: "Business Intelligence",
    mudancas: [
      "📊 Análises Gerenciais no Dashboard",
      "💰 Resumo da Semana com insights",
      "📌 Insights da Carteira automáticos",
      "💼 Análise Financeira com MRR",
      "🎯 Visão Estratégica completa"
    ]
  },
  {
    versao: "1.6.1", 
    data: "26/12/2024",
    tipo: "UX Enhancement",
    mudancas: [
      "💡 Resumos Explicativos em status",
      "📊 Proposta: valores dinâmicos",
      "📈 Contrato: grid organizado",
      "⚠️ Rejeição: badges visuais",
      "🤝 Probono: contexto educativo"
    ]
  },
  {
    versao: "1.6.0",
    data: "26/12/2024",
    tipo: "UX Improvement",
    mudancas: [
      "📝 Campo Descrição Universal",
      "✅ Descrição em Informações Básicas",
      "🔄 Presente em todos os status",
      "❌ Campos duplicados removidos",
      "🎯 UX mais consistente"
    ]
  }
];

/**
 * Como usar:
 * 
 * import { APP_VERSION, RECENT_CHANGES } from '../version'
 * 
 * Login.jsx: <p>v{APP_VERSION}</p>
 * ContratoForm.jsx: <p>v{APP_VERSION}</p>
 * Configuracoes.jsx: const changelog = RECENT_CHANGES
 * 
 * ATUALIZAR VERSÃO:
 * 1. Altere APP_VERSION aqui
 * 2. Adicione entrada em RECENT_CHANGES
 * 3. Todos os componentes atualizam automaticamente
 */
