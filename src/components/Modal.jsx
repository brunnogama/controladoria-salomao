import React from 'react'
import { X, AlertCircle, AlertTriangle, CheckCircle, Info, Trash2 } from 'lucide-react'

/**
 * Modal padronizado do sistema
 * 
 * Tipos disponíveis:
 * - success: Verde - confirmações positivas
 * - error: Vermelho - erros críticos
 * - warning: Amarelo - avisos importantes
 * - info: Azul - informações gerais
 * - danger: Vermelho escuro - ações destrutivas (ex: deletar)
 */

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  message,
  type = 'info',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  showCancel = true,
  children,
  size = 'md' // sm, md, lg, xl
}) => {
  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose?.()
    }
  }

  const handleCancel = () => {
    onCancel?.()
    onClose?.()
  }

  const handleConfirm = () => {
    onConfirm?.()
    if (!onConfirm) onClose?.() // Fecha automaticamente se não tiver onConfirm customizado
  }

  // Configurações por tipo
  const config = {
    success: {
      icon: CheckCircle,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
      headerBg: 'bg-gradient-to-r from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      buttonColor: 'bg-green-600 hover:bg-green-700',
      buttonTextColor: 'text-white'
    },
    error: {
      icon: AlertCircle,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
      headerBg: 'bg-gradient-to-r from-red-50 to-rose-50',
      borderColor: 'border-red-200',
      buttonColor: 'bg-red-600 hover:bg-red-700',
      buttonTextColor: 'text-white'
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
      headerBg: 'bg-gradient-to-r from-yellow-50 to-amber-50',
      borderColor: 'border-yellow-200',
      buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
      buttonTextColor: 'text-white'
    },
    info: {
      icon: Info,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      headerBg: 'bg-gradient-to-r from-blue-50 to-sky-50',
      borderColor: 'border-blue-200',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      buttonTextColor: 'text-white'
    },
    danger: {
      icon: Trash2,
      iconColor: 'text-red-700',
      iconBg: 'bg-red-100',
      headerBg: 'bg-gradient-to-r from-red-100 to-rose-100',
      borderColor: 'border-red-300',
      buttonColor: 'bg-red-700 hover:bg-red-800',
      buttonTextColor: 'text-white'
    }
  }

  const currentConfig = config[type] || config.info
  const Icon = currentConfig.icon

  // Tamanhos
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div 
        className={`bg-white rounded-xl shadow-2xl w-full ${sizes[size]} animate-scaleIn`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`${currentConfig.headerBg} ${currentConfig.borderColor} border-b p-6 rounded-t-xl`}>
          <div className="flex items-start gap-4">
            {/* Ícone */}
            <div className={`${currentConfig.iconBg} p-3 rounded-full flex-shrink-0`}>
              <Icon size={24} className={currentConfig.iconColor} />
            </div>

            {/* Título */}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            </div>

            {/* Botão fechar */}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          {message && (
            <p className="text-gray-700 text-base leading-relaxed mb-4">
              {message}
            </p>
          )}
          
          {children}
        </div>

        {/* Footer com botões */}
        {(onConfirm || showCancel) && (
          <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end gap-3">
            {showCancel && (
              <button
                onClick={handleCancel}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                {cancelText}
              </button>
            )}
            
            {onConfirm && (
              <button
                onClick={handleConfirm}
                className={`px-5 py-2.5 ${currentConfig.buttonColor} ${currentConfig.buttonTextColor} rounded-lg transition-colors font-bold shadow-sm`}
              >
                {confirmText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// CSS para animações (adicionar ao index.css ou App.css)
export const modalStyles = `
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-out forwards;
}

.animate-scaleIn {
  animation: scaleIn 0.2s ease-out forwards;
}
`

export default Modal
