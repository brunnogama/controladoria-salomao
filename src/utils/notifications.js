/**
 * Utilitários de Notificação
 * 
 * Substitui alert(), confirm() e console por notificações estilizadas
 * 
 * USO:
 * 
 * import { notify } from '../utils/notifications'
 * 
 * // Toast rápido
 * notify.success('Salvo com sucesso!')
 * notify.error('Erro ao salvar')
 * notify.warning('Atenção: dados incompletos')
 * notify.info('Processando...')
 * 
 * // Modal de confirmação
 * const confirmado = await notify.confirm('Deseja realmente deletar?', 'danger')
 * if (confirmado) {
 *   // fazer ação
 * }
 * 
 * // Modal de alerta
 * await notify.alert('Operação concluída!', 'success')
 */

// Referência global para o toast (será definido pelo ToastProvider)
let toastRef = null

export const setToastRef = (ref) => {
  toastRef = ref
}

// Referência global para modais
let modalRef = null

export const setModalRef = (ref) => {
  modalRef = ref
}

/**
 * Notificações Toast (rápidas, não bloqueiam)
 */
export const notify = {
  success: (message, duration = 5000) => {
    if (toastRef) {
      toastRef.success(message, duration)
    } else {
      console.log('✅', message)
    }
  },

  error: (message, duration = 7000) => {
    if (toastRef) {
      toastRef.error(message, duration)
    } else {
      console.error('❌', message)
    }
  },

  warning: (message, duration = 6000) => {
    if (toastRef) {
      toastRef.warning(message, duration)
    } else {
      console.warn('⚠️', message)
    }
  },

  info: (message, duration = 5000) => {
    if (toastRef) {
      toastRef.info(message, duration)
    } else {
      console.info('ℹ️', message)
    }
  },

  /**
   * Modal de confirmação (retorna Promise)
   */
  confirm: (message, type = 'warning', options = {}) => {
    return new Promise((resolve) => {
      if (modalRef) {
        modalRef.show({
          type,
          title: options.title || 'Confirmação',
          message,
          confirmText: options.confirmText || 'Confirmar',
          cancelText: options.cancelText || 'Cancelar',
          showCancel: true,
          onConfirm: () => resolve(true),
          onCancel: () => resolve(false),
          onClose: () => resolve(false)
        })
      } else {
        resolve(window.confirm(message))
      }
    })
  },

  /**
   * Modal de alerta (retorna Promise quando fechado)
   */
  alert: (message, type = 'info', options = {}) => {
    return new Promise((resolve) => {
      if (modalRef) {
        modalRef.show({
          type,
          title: options.title || getTitleByType(type),
          message,
          confirmText: options.confirmText || 'OK',
          showCancel: false,
          onConfirm: () => resolve(),
          onClose: () => resolve()
        })
      } else {
        window.alert(message)
        resolve()
      }
    })
  },

  /**
   * Modal customizado
   */
  custom: (config) => {
    if (modalRef) {
      modalRef.show(config)
    }
  }
}

// Títulos padrão por tipo
const getTitleByType = (type) => {
  const titles = {
    success: '✅ Sucesso',
    error: '❌ Erro',
    warning: '⚠️ Atenção',
    info: 'ℹ️ Informação',
    danger: '🗑️ Ação Destrutiva'
  }
  return titles[type] || 'Aviso'
}

/**
 * Helpers para casos de uso comuns
 */
export const notifications = {
  // Sucesso
  saved: () => notify.success('✅ Salvo com sucesso!'),
  updated: () => notify.success('✅ Atualizado com sucesso!'),
  deleted: () => notify.success('✅ Excluído com sucesso!'),
  created: () => notify.success('✅ Criado com sucesso!'),
  uploaded: () => notify.success('✅ Upload concluído!'),
  sent: () => notify.success('✅ Enviado com sucesso!'),

  // Erros
  saveFailed: () => notify.error('❌ Erro ao salvar. Tente novamente.'),
  loadFailed: () => notify.error('❌ Erro ao carregar dados.'),
  deleteFailed: () => notify.error('❌ Erro ao excluir.'),
  uploadFailed: () => notify.error('❌ Erro no upload.'),
  networkError: () => notify.error('❌ Erro de conexão. Verifique sua internet.'),

  // Avisos
  unsavedChanges: () => notify.warning('⚠️ Você tem alterações não salvas.'),
  required: (field) => notify.warning(`⚠️ O campo "${field}" é obrigatório.`),
  invalidFormat: (field) => notify.warning(`⚠️ Formato inválido em "${field}".`),
  
  // Info
  processing: () => notify.info('⏳ Processando...'),
  loading: () => notify.info('⏳ Carregando...'),
  
  // Confirmações comuns
  confirmDelete: (itemName = 'este item') => {
    return notify.confirm(
      `Tem certeza que deseja excluir ${itemName}? Esta ação não pode ser desfeita.`,
      'danger',
      {
        title: '🗑️ Confirmar Exclusão',
        confirmText: 'Sim, excluir',
        cancelText: 'Cancelar'
      }
    )
  },

  confirmLogout: () => {
    return notify.confirm(
      'Deseja realmente sair do sistema?',
      'warning',
      {
        title: '🚪 Sair',
        confirmText: 'Sim, sair',
        cancelText: 'Cancelar'
      }
    )
  },

  confirmReset: () => {
    return notify.confirm(
      'Isso irá apagar todos os dados. Tem certeza?',
      'danger',
      {
        title: '⚠️ Resetar Sistema',
        confirmText: 'Sim, resetar tudo',
        cancelText: 'Cancelar'
      }
    )
  }
}

export default notify
