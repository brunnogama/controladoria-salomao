import React, { useState, useCallback, useEffect } from 'react'
import Modal from './Modal'
import { setModalRef } from '../utils/notifications'

/**
 * ModalManager - Gerencia modais globais da aplicação
 * Permite criar modais de qualquer lugar usando notify.confirm() ou notify.alert()
 */
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
    setModalRef({ show, hide })
    
    return () => {
      setModalRef(null)
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

export default ModalManager
