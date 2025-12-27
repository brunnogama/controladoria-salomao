import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'

// Context para gerenciar notificações globalmente
const ToastContext = createContext()

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider')
  }
  return context
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random()
    const toast = { id, message, type, duration }
    
    setToasts(prev => [...prev, toast])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // Funções auxiliares para diferentes tipos
  const success = useCallback((message, duration) => addToast(message, 'success', duration), [addToast])
  const error = useCallback((message, duration) => addToast(message, 'error', duration), [addToast])
  const warning = useCallback((message, duration) => addToast(message, 'warning', duration), [addToast])
  const info = useCallback((message, duration) => addToast(message, 'info', duration), [addToast])

  return (
    <ToastContext.Provider value={{ success, error, warning, info, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

// Container de Toasts (posicionamento fixo)
const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3 pointer-events-none">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

// Componente Toast individual
const Toast = ({ toast, onClose }) => {
  const { message, type } = toast

  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-gradient-to-r from-green-50 to-emerald-50',
      borderColor: 'border-green-500',
      iconColor: 'text-green-600',
      textColor: 'text-green-900',
      progressBar: 'bg-green-500'
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-gradient-to-r from-red-50 to-rose-50',
      borderColor: 'border-red-500',
      iconColor: 'text-red-600',
      textColor: 'text-red-900',
      progressBar: 'bg-red-500'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-gradient-to-r from-yellow-50 to-amber-50',
      borderColor: 'border-yellow-500',
      iconColor: 'text-yellow-600',
      textColor: 'text-yellow-900',
      progressBar: 'bg-yellow-500'
    },
    info: {
      icon: Info,
      bgColor: 'bg-gradient-to-r from-blue-50 to-sky-50',
      borderColor: 'border-blue-500',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-900',
      progressBar: 'bg-blue-500'
    }
  }

  const currentConfig = config[type] || config.info
  const Icon = currentConfig.icon

  return (
    <div 
      className={`
        ${currentConfig.bgColor} ${currentConfig.borderColor}
        border-l-4 rounded-lg shadow-xl
        p-4 pr-12 min-w-[320px] max-w-md
        pointer-events-auto
        animate-slideInRight
        relative overflow-hidden
      `}
    >
      {/* Barra de progresso */}
      {toast.duration > 0 && (
        <div 
          className={`absolute bottom-0 left-0 h-1 ${currentConfig.progressBar} animate-shrink`}
          style={{ animationDuration: `${toast.duration}ms` }}
        />
      )}

      <div className="flex items-start gap-3">
        {/* Ícone */}
        <Icon size={24} className={`${currentConfig.iconColor} flex-shrink-0 mt-0.5`} />
        
        {/* Mensagem */}
        <div className={`flex-1 ${currentConfig.textColor} font-medium text-sm leading-relaxed`}>
          {message}
        </div>

        {/* Botão fechar */}
        <button
          onClick={onClose}
          className={`${currentConfig.iconColor} hover:opacity-70 transition-opacity flex-shrink-0`}
        >
          <X size={20} />
        </button>
      </div>
    </div>
  )
}

// CSS para animações (adicionar ao index.css ou App.css)
export const toastStyles = `
@keyframes slideInRight {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes shrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

.animate-slideInRight {
  animation: slideInRight 0.3s ease-out forwards;
}

.animate-shrink {
  animation: shrink linear forwards;
}
`

export default ToastProvider
