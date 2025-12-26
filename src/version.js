/**
 * @file version.js
 * @description Versão centralizada do sistema - FONTE ÚNICA DA VERDADE
 * @updated 26/12/2025
 * 
 * IMPORTANTE: Este é o ÚNICO lugar onde a versão deve ser atualizada.
 * Todos os componentes importam daqui.
 */

export const APP_VERSION = "1.6.2";
export const APP_NAME = "Flow Metrics System";
export const LAST_UPDATE = "26/12/2025";

// Changelog completo (usado em Configurações)
export const RECENT_CHANGES = [
  {
    version: "1.6.2",
    data: "26/12/2025",
    tipo: "Business Intelligence",
    mudancas: [
      "📊 Análises Gerenciais no Dashboard",
      "💰 Resumo da Semana com insights de conversão",
      "📌 Insights da Carteira com alertas automáticos",
      "💼 Análise Financeira com pipeline e MRR",
      "🎯 Visão Estratégica com potencial de crescimento",
      "⚠️ Alertas inteligentes de performance"
    ]
  },
  {
    version: "1.6.1", 
    date: "26/12/2025",
    tipo: "UX Enhancement",
    mudancas: [
      "💡 Resumos Explicativos em cada bloco de status",
      "📊 Proposta: valores dinâmicos e totalizações",
      "📈 Contrato: grid organizado com valores",
      "⚠️ Rejeição: badges visuais condicionais",
      "🤝 Probono: contexto educativo completo"
    ]
  },
  {
    version: "1.6.0",
    date: "26/12/2025",
    tipo: "Melhoria de UX",
    mudancas: [
      "📝 Campo Descrição Universal criado",
      "Descrição agora em Informações Básicas",
      "Presente em todos os status",
      "Removidos campos duplicados",
      "UX mais consistente e organizada"
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
