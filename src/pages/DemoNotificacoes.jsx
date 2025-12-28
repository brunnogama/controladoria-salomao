import React from 'react'
import { notify } from '../components/Toast'
import { modal } from '../components/ModalManager'

/**
 * Página de Demonstração do Sistema de Notificações
 * 
 * Use esta página para testar todas as notificações
 * Acesse em: /demo-notificacoes
 */

const DemoNotificacoes = () => {
  
  const handleToastSuccess = () => {
    notify.success('✅ Operação realizada com sucesso!')
  }

  const handleToastError = () => {
    notify.error('❌ Erro ao processar a solicitação. Tente novamente.')
  }

  const handleToastWarning = () => {
    notify.warning('⚠️ Atenção: Alguns campos estão incompletos.')
  }

  const handleToastInfo = () => {
    notify.info('ℹ️ Processamento iniciado. Aguarde alguns instantes...')
  }

  const handleModalSuccess = async () => {
    await notify.alert(
      'Seu contrato foi salvo e está disponível para visualização.',
      'success',
      {
        title: '✅ Contrato Salvo'
      }
    )
  }

  const handleModalError = async () => {
    await notify.alert(
      'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.',
      'error',
      {
        title: '❌ Erro de Conexão'
      }
    )
  }

  const handleModalWarning = async () => {
    await notify.alert(
      'Você tem alterações não salvas. Lembre-se de salvar antes de sair.',
      'warning',
      {
        title: '⚠️ Alterações Pendentes'
      }
    )
  }

  const handleModalInfo = async () => {
    await notify.alert(
      'Esta funcionalidade estará disponível na próxima atualização do sistema.',
      'info',
      {
        title: 'ℹ️ Em Breve'
      }
    )
  }

  const handleConfirmDanger = async () => {
    const confirmado = await notify.confirm(
      'Tem certeza que deseja excluir este contrato? Esta ação não pode ser desfeita.',
      'danger',
      {
        title: '🗑️ Confirmar Exclusão',
        confirmText: 'Sim, excluir',
        cancelText: 'Cancelar'
      }
    )

    if (confirmado) {
      notify.success('Contrato excluído com sucesso!')
    } else {
      notify.info('Operação cancelada')
    }
  }

  const handleConfirmWarning = async () => {
    const confirmado = await notify.confirm(
      'Deseja realmente sair? Suas alterações não salvas serão perdidas.',
      'warning',
      {
        title: '⚠️ Confirmar Saída',
        confirmText: 'Sim, sair',
        cancelText: 'Continuar editando'
      }
    )

    if (confirmado) {
      notify.info('Saindo...')
    }
  }

  const handleHelpersSuccess = () => {
    notify.success('✅ Salvo com sucesso!')
  }

  const handleHelpersError = () => {
    notify.error('❌ Erro ao salvar. Tente novamente.')
  }

  const handleHelpersWarning = () => {
    notify.warning('⚠️ O campo "Cliente" é obrigatório.')
  }

  const handleHelpersConfirm = async () => {
    const confirmado = await modal.confirm(
      'Tem certeza que deseja excluir este contrato? Esta ação não pode ser desfeita.',
      'danger',
      {
        title: '🗑️ Confirmar Exclusão',
        confirmText: 'Sim, excluir',
        cancelText: 'Cancelar'
      }
    )
    if (confirmado) {
      notify.success('Excluído!')
    }
    }
  }

  return (
    <div className='min-h-screen bg-gray-50 p-8'>
      <div className='max-w-4xl mx-auto space-y-8'>
        
        {/* Header */}
        <div className='bg-white rounded-xl shadow-sm border p-6'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            🎨 Sistema de Notificações
          </h1>
          <p className='text-gray-600'>
            Demonstração de todos os tipos de notificações disponíveis no sistema
          </p>
        </div>

        {/* Toasts */}
        <div className='bg-white rounded-xl shadow-sm border p-6'>
          <h2 className='text-xl font-bold text-gray-900 mb-4'>
            📬 Notificações Toast
          </h2>
          <p className='text-gray-600 mb-6'>
            Aparecem no canto superior direito, desaparecem automaticamente
          </p>
          
          <div className='grid grid-cols-2 gap-4'>
            <button
              onClick={handleToastSuccess}
              className='p-4 bg-green-50 border-2 border-green-500 rounded-lg hover:bg-green-100 transition-colors'
            >
              <div className='font-bold text-green-900 mb-1'>✅ Sucesso</div>
              <div className='text-sm text-green-700'>Ações concluídas</div>
            </button>

            <button
              onClick={handleToastError}
              className='p-4 bg-red-50 border-2 border-red-500 rounded-lg hover:bg-red-100 transition-colors'
            >
              <div className='font-bold text-red-900 mb-1'>❌ Erro</div>
              <div className='text-sm text-red-700'>Falhas e problemas</div>
            </button>

            <button
              onClick={handleToastWarning}
              className='p-4 bg-yellow-50 border-2 border-yellow-500 rounded-lg hover:bg-yellow-100 transition-colors'
            >
              <div className='font-bold text-yellow-900 mb-1'>⚠️ Aviso</div>
              <div className='text-sm text-yellow-700'>Atenção necessária</div>
            </button>

            <button
              onClick={handleToastInfo}
              className='p-4 bg-blue-50 border-2 border-blue-500 rounded-lg hover:bg-blue-100 transition-colors'
            >
              <div className='font-bold text-blue-900 mb-1'>ℹ️ Informação</div>
              <div className='text-sm text-blue-700'>Mensagens gerais</div>
            </button>
          </div>
        </div>

        {/* Modais de Alerta */}
        <div className='bg-white rounded-xl shadow-sm border p-6'>
          <h2 className='text-xl font-bold text-gray-900 mb-4'>
            📢 Modais de Alerta
          </h2>
          <p className='text-gray-600 mb-6'>
            Bloqueiam a tela, exigem confirmação do usuário
          </p>
          
          <div className='grid grid-cols-2 gap-4'>
            <button
              onClick={handleModalSuccess}
              className='p-4 bg-green-100 border-2 border-green-600 rounded-lg hover:bg-green-200 transition-colors'
            >
              <div className='font-bold text-green-900 mb-1'>✅ Modal Sucesso</div>
              <div className='text-sm text-green-800'>Confirmação positiva</div>
            </button>

            <button
              onClick={handleModalError}
              className='p-4 bg-red-100 border-2 border-red-600 rounded-lg hover:bg-red-200 transition-colors'
            >
              <div className='font-bold text-red-900 mb-1'>❌ Modal Erro</div>
              <div className='text-sm text-red-800'>Erro crítico</div>
            </button>

            <button
              onClick={handleModalWarning}
              className='p-4 bg-yellow-100 border-2 border-yellow-600 rounded-lg hover:bg-yellow-200 transition-colors'
            >
              <div className='font-bold text-yellow-900 mb-1'>⚠️ Modal Aviso</div>
              <div className='text-sm text-yellow-800'>Atenção importante</div>
            </button>

            <button
              onClick={handleModalInfo}
              className='p-4 bg-blue-100 border-2 border-blue-600 rounded-lg hover:bg-blue-200 transition-colors'
            >
              <div className='font-bold text-blue-900 mb-1'>ℹ️ Modal Info</div>
              <div className='text-sm text-blue-800'>Informação geral</div>
            </button>
          </div>
        </div>

        {/* Modais de Confirmação */}
        <div className='bg-white rounded-xl shadow-sm border p-6'>
          <h2 className='text-xl font-bold text-gray-900 mb-4'>
            ❓ Modais de Confirmação
          </h2>
          <p className='text-gray-600 mb-6'>
            Perguntam antes de executar ação, retornam true/false
          </p>
          
          <div className='grid grid-cols-2 gap-4'>
            <button
              onClick={handleConfirmDanger}
              className='p-4 bg-red-100 border-2 border-red-700 rounded-lg hover:bg-red-200 transition-colors'
            >
              <div className='font-bold text-red-900 mb-1'>🗑️ Ação Destrutiva</div>
              <div className='text-sm text-red-800'>Deletar, resetar</div>
            </button>

            <button
              onClick={handleConfirmWarning}
              className='p-4 bg-yellow-100 border-2 border-yellow-600 rounded-lg hover:bg-yellow-200 transition-colors'
            >
              <div className='font-bold text-yellow-900 mb-1'>⚠️ Confirmação</div>
              <div className='text-sm text-yellow-800'>Sair, cancelar</div>
            </button>
          </div>
        </div>

        {/* Helpers */}
        <div className='bg-white rounded-xl shadow-sm border p-6'>
          <h2 className='text-xl font-bold text-gray-900 mb-4'>
            🚀 Exemplos Diretos
          </h2>
          <p className='text-gray-600 mb-6'>
            Uso direto de notify e modal
          </p>
          
          <div className='grid grid-cols-2 gap-4'>
            <button
              onClick={handleHelpersSuccess}
              className='p-4 bg-green-50 border border-green-300 rounded-lg hover:bg-green-100 transition-colors text-left'
            >
              <div className='font-mono text-sm text-green-700 mb-2'>
                notify.success('...')
              </div>
              <div className='text-xs text-gray-600'>
                "✅ Salvo com sucesso!"
              </div>
            </button>

            <button
              onClick={handleHelpersError}
              className='p-4 bg-red-50 border border-red-300 rounded-lg hover:bg-red-100 transition-colors text-left'
            >
              <div className='font-mono text-sm text-red-700 mb-2'>
                notify.error('...')
              </div>
              <div className='text-xs text-gray-600'>
                "❌ Erro ao salvar"
              </div>
            </button>

            <button
              onClick={handleHelpersWarning}
              className='p-4 bg-yellow-50 border border-yellow-300 rounded-lg hover:bg-yellow-100 transition-colors text-left'
            >
              <div className='font-mono text-sm text-yellow-700 mb-2'>
                notify.warning('...')
              </div>
              <div className='text-xs text-gray-600'>
                "⚠️ O campo Cliente é obrigatório"
              </div>
            </button>

            <button
              onClick={handleHelpersConfirm}
              className='p-4 bg-red-50 border border-red-300 rounded-lg hover:bg-red-100 transition-colors text-left'
            >
              <div className='font-mono text-sm text-red-700 mb-2'>
                modal.confirm('...')
              </div>
              <div className='text-xs text-gray-600'>
                Modal de confirmação
              </div>
            </button>
          </div>
        </div>

        {/* Código de Exemplo */}
        <div className='bg-gray-900 rounded-xl shadow-sm p-6 text-white'>
          <h2 className='text-xl font-bold mb-4'>💻 Exemplo de Código</h2>
          <pre className='text-sm overflow-x-auto'>
            <code>{`import { notify } from '../components/Toast'
import { modal } from '../components/ModalManager'

// Toast rápido
notify.success('Salvo!')
notify.error('Erro ao salvar')
notify.warning('Atenção!')
notify.info('Processando...')

// Modal de confirmação
const confirmado = await modal.confirm(
  'Deseja excluir?',
  'danger'
)

if (confirmado) {
  // executar ação
}`}</code>
          </pre>
        </div>

      </div>
    </div>
  )
}

export default DemoNotificacoes
