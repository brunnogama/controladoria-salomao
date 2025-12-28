import React, { useState, useCallback, useEffect } from 'react'
import Modal from './Modal'

/**
 * ModalManager - Gerencia modais globais da aplicação
 * Permite criar modais de qualquer lugar
 */

// Referência global para modal
let globalModalRef = null

const ModalManager = () => {
  const [currentModal, setCurrentModal] = useState(null)

  const show = useCallback((config) => {
    setCurrentModal(config)
  }, [])

  const hide = useCallback(() => {
    setCurrentModal(null)
  }, [])

  // Registrar referência global
  useEffect(() => {
    globalModalRef = { show, hide }
    
    return () => {
      globalModalRef = null
    }
  }, [show, hide])

  if (!currentModal) return null

  return (
    <Modal
      isOpen={true}
      onClose={() => {
        currentModal.onClose?.()
        hide()
      }}
      {...currentModal}
    />
  )
}

// Função getTitleByType helper
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

// Exportar funções para uso global
export const modal = {
  confirm: (message, type = 'warning', options = {}) => {
    return new Promise((resolve) => {
      if (globalModalRef) {
        globalModalRef.show({
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

  alert: (message, type = 'info', options = {}) => {
    return new Promise((resolve) => {
      if (globalModalRef) {
        globalModalRef.show({
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
  }
}

export default ModalManager
