import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { FileText, Upload, Download, Edit, Trash2, Plus, FileCheck, AlertCircle } from 'lucide-react'

export default function Propostas() {
  const [templates, setTemplates] = useState([])
  const [propostas, setPropostas] = useState([])
  const [clientes, setClientes] = useState([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showGerarModal, setShowGerarModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [loading, setLoading] = useState(false)
  
  // Upload de template
  const [nomeTemplate, setNomeTemplate] = useState('')
  const [descricaoTemplate, setDescricaoTemplate] = useState('')
  const [arquivoTemplate, setArquivoTemplate] = useState(null)
  const [placeholders, setPlaceholders] = useState('')
  
  // Geração de proposta
  const [clienteSelecionado, setClienteSelecionado] = useState('')
  const [valoresCampos, setValoresCampos] = useState({})
  const [tituloProposta, setTituloProposta] = useState('')

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      // Carregar templates
      const { data: templatesData } = await supabase
        .from('proposta_templates')
        .select('*')
        .order('created_at', { ascending: false })
      
      setTemplates(templatesData || [])

      // Carregar propostas geradas
      const { data: propostasData } = await supabase
        .from('propostas_geradas')
        .select(`
          *,
          cliente:clientes(razao_social),
          template:proposta_templates(nome)
        `)
        .order('created_at', { ascending: false })
      
      setPropostas(propostasData || [])

      // Carregar clientes
      const { data: clientesData } = await supabase
        .from('clientes')
        .select('id, razao_social, cnpj')
        .order('razao_social')
      
      setClientes(clientesData || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  const handleUploadTemplate = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Upload do arquivo para Supabase Storage
      const fileName = `template_${Date.now()}_${arquivoTemplate.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('propostas')
        .upload(fileName, arquivoTemplate)

      if (uploadError) throw uploadError

      // 2. Criar registro do template
      const placeholdersArray = placeholders
        .split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0)

      const { error: insertError } = await supabase
        .from('proposta_templates')
        .insert({
          nome: nomeTemplate,
          descricao: descricaoTemplate,
          arquivo_path: uploadData.path,
          placeholders: placeholdersArray
        })

      if (insertError) throw insertError

      alert('Template enviado com sucesso!')
      setShowUploadModal(false)
      limparFormUpload()
      carregarDados()
    } catch (error) {
      console.error('Erro ao enviar template:', error)
      alert('Erro ao enviar template: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGerarProposta = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Aqui vamos processar o DOCX com os valores
      // Por enquanto, apenas salvar os dados
      const { error } = await supabase
        .from('propostas_geradas')
        .insert({
          template_id: selectedTemplate.id,
          cliente_id: clienteSelecionado,
          titulo: tituloProposta,
          valores_preenchidos: valoresCampos,
          status: 'gerada'
        })

      if (error) throw error

      alert('Proposta gerada com sucesso!')
      setShowGerarModal(false)
      limparFormGerar()
      carregarDados()
    } catch (error) {
      console.error('Erro ao gerar proposta:', error)
      alert('Erro ao gerar proposta: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const abrirModalGerar = (template) => {
    setSelectedTemplate(template)
    setShowGerarModal(true)
    
    // Inicializar valores dos campos
    const valores = {}
    template.placeholders?.forEach(placeholder => {
      valores[placeholder] = ''
    })
    setValoresCampos(valores)
  }

  const limparFormUpload = () => {
    setNomeTemplate('')
    setDescricaoTemplate('')
    setArquivoTemplate(null)
    setPlaceholders('')
  }

  const limparFormGerar = () => {
    setSelectedTemplate(null)
    setClienteSelecionado('')
    setValoresCampos({})
    setTituloProposta('')
  }

  const excluirTemplate = async (id) => {
    if (!confirm('Deseja realmente excluir este template?')) return

    try {
      const { error } = await supabase
        .from('proposta_templates')
        .delete()
        .eq('id', id)

      if (error) throw error

      alert('Template excluído com sucesso!')
      carregarDados()
    } catch (error) {
      console.error('Erro ao excluir template:', error)
      alert('Erro ao excluir template: ' + error.message)
    }
  }

  const downloadProposta = async (proposta) => {
    try {
      // Aqui vamos implementar o download do DOCX gerado
      alert('Funcionalidade de download será implementada em breve!')
    } catch (error) {
      console.error('Erro ao baixar proposta:', error)
      alert('Erro ao baixar proposta: ' + error.message)
    }
  }

  return (
    <div className='p-6 max-w-7xl mx-auto'>
      {/* Cabeçalho */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-800 mb-2'>Propostas</h1>
        <p className='text-gray-600'>Gerencie templates e crie propostas personalizadas</p>
      </div>

      {/* Seção de Templates */}
      <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-2'>
            <FileText className='text-blue-600' size={24} />
            <h2 className='text-xl font-bold text-gray-800'>Templates de Proposta</h2>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className='flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition'
          >
            <Plus size={20} />
            Novo Template
          </button>
        </div>

        {templates.length === 0 ? (
          <div className='text-center py-12 text-gray-400'>
            <FileText size={48} className='mx-auto mb-4 opacity-20' />
            <p>Nenhum template cadastrado</p>
            <p className='text-sm'>Clique em "Novo Template" para começar</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {templates.map((template) => (
              <div key={template.id} className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition'>
                <div className='flex items-start justify-between mb-3'>
                  <div className='flex-1'>
                    <h3 className='font-bold text-gray-800 mb-1'>{template.nome}</h3>
                    <p className='text-xs text-gray-500'>{template.descricao}</p>
                  </div>
                </div>

                <div className='mb-3'>
                  <p className='text-xs font-semibold text-gray-600 mb-1'>Campos:</p>
                  <div className='flex flex-wrap gap-1'>
                    {template.placeholders?.slice(0, 3).map((ph, idx) => (
                      <span key={idx} className='text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded'>
                        {ph}
                      </span>
                    ))}
                    {template.placeholders?.length > 3 && (
                      <span className='text-xs text-gray-500'>
                        +{template.placeholders.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className='flex gap-2'>
                  <button
                    onClick={() => abrirModalGerar(template)}
                    className='flex-1 flex items-center justify-center gap-1 bg-green-50 text-green-700 px-3 py-2 rounded text-sm font-semibold hover:bg-green-100 transition'
                  >
                    <FileCheck size={16} />
                    Gerar Proposta
                  </button>
                  <button
                    onClick={() => excluirTemplate(template.id)}
                    className='bg-red-50 text-red-700 p-2 rounded hover:bg-red-100 transition'
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Seção de Propostas Geradas */}
      <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6'>
        <div className='flex items-center gap-2 mb-6 border-b pb-4'>
          <FileCheck className='text-blue-600' size={24} />
          <h2 className='text-xl font-bold text-gray-800'>Propostas Geradas</h2>
        </div>

        {propostas.length === 0 ? (
          <div className='text-center py-12 text-gray-400'>
            <FileCheck size={48} className='mx-auto mb-4 opacity-20' />
            <p>Nenhuma proposta gerada ainda</p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-gray-200'>
                  <th className='text-left py-3 px-4 text-sm font-bold text-gray-700'>Título</th>
                  <th className='text-left py-3 px-4 text-sm font-bold text-gray-700'>Cliente</th>
                  <th className='text-left py-3 px-4 text-sm font-bold text-gray-700'>Template</th>
                  <th className='text-left py-3 px-4 text-sm font-bold text-gray-700'>Data</th>
                  <th className='text-left py-3 px-4 text-sm font-bold text-gray-700'>Status</th>
                  <th className='text-center py-3 px-4 text-sm font-bold text-gray-700'>Ações</th>
                </tr>
              </thead>
              <tbody>
                {propostas.map((proposta) => (
                  <tr key={proposta.id} className='border-b border-gray-100 hover:bg-gray-50'>
                    <td className='py-3 px-4 text-sm'>{proposta.titulo}</td>
                    <td className='py-3 px-4 text-sm'>{proposta.cliente?.razao_social}</td>
                    <td className='py-3 px-4 text-sm text-gray-600'>{proposta.template?.nome}</td>
                    <td className='py-3 px-4 text-sm text-gray-600'>
                      {new Date(proposta.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className='py-3 px-4'>
                      <span className='text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-semibold'>
                        {proposta.status}
                      </span>
                    </td>
                    <td className='py-3 px-4'>
                      <div className='flex justify-center gap-2'>
                        <button
                          onClick={() => downloadProposta(proposta)}
                          className='bg-blue-50 text-blue-700 p-2 rounded hover:bg-blue-100 transition'
                          title='Baixar proposta'
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Upload Template */}
      {showUploadModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='p-6 border-b border-gray-200'>
              <h3 className='text-xl font-bold text-gray-800'>Novo Template de Proposta</h3>
            </div>

            <form onSubmit={handleUploadTemplate} className='p-6'>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Nome do Template *
                  </label>
                  <input
                    type='text'
                    value={nomeTemplate}
                    onChange={(e) => setNomeTemplate(e.target.value)}
                    className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder='Ex: Proposta Padrão - Cível'
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Descrição
                  </label>
                  <textarea
                    value={descricaoTemplate}
                    onChange={(e) => setDescricaoTemplate(e.target.value)}
                    className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    rows='3'
                    placeholder='Descreva o template e quando utilizá-lo'
                  />
                </div>

                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Arquivo DOCX *
                  </label>
                  <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition'>
                    <input
                      type='file'
                      accept='.docx'
                      onChange={(e) => setArquivoTemplate(e.target.files[0])}
                      className='hidden'
                      id='file-upload'
                      required
                    />
                    <label
                      htmlFor='file-upload'
                      className='cursor-pointer flex flex-col items-center'
                    >
                      <Upload className='text-gray-400 mb-2' size={32} />
                      {arquivoTemplate ? (
                        <p className='text-sm text-green-600 font-semibold'>{arquivoTemplate.name}</p>
                      ) : (
                        <>
                          <p className='text-sm text-gray-600'>Clique para selecionar arquivo</p>
                          <p className='text-xs text-gray-400 mt-1'>Formato: .docx</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Placeholders (separados por vírgula) *
                  </label>
                  <input
                    type='text'
                    value={placeholders}
                    onChange={(e) => setPlaceholders(e.target.value)}
                    className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder='Ex: CLIENTE, CNPJ, VALOR, DATA, ADVOGADO'
                    required
                  />
                  <p className='text-xs text-gray-500 mt-1'>
                    Digite os campos que serão substituídos no documento (use MAIÚSCULAS)
                  </p>
                </div>

                <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
                  <div className='flex gap-2'>
                    <AlertCircle className='text-yellow-600 flex-shrink-0' size={20} />
                    <div>
                      <p className='text-sm font-semibold text-yellow-800 mb-1'>Como criar o template:</p>
                      <ul className='text-xs text-yellow-700 space-y-1'>
                        <li>• No Word, use os placeholders entre chaves: {'{{CLIENTE}}'}, {'{{CNPJ}}'}</li>
                        <li>• Use MAIÚSCULAS para os nomes dos campos</li>
                        <li>• Exemplo: "Proposta para {'{{CLIENTE}}'} (CNPJ: {'{{CNPJ}}'})"</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className='flex gap-3 mt-6'>
                <button
                  type='button'
                  onClick={() => {
                    setShowUploadModal(false)
                    limparFormUpload()
                  }}
                  className='flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition'
                >
                  Cancelar
                </button>
                <button
                  type='submit'
                  disabled={loading}
                  className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50'
                >
                  {loading ? 'Enviando...' : 'Salvar Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Gerar Proposta */}
      {showGerarModal && selectedTemplate && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='p-6 border-b border-gray-200'>
              <h3 className='text-xl font-bold text-gray-800'>Gerar Proposta</h3>
              <p className='text-sm text-gray-600 mt-1'>Template: {selectedTemplate.nome}</p>
            </div>

            <form onSubmit={handleGerarProposta} className='p-6'>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Título da Proposta *
                  </label>
                  <input
                    type='text'
                    value={tituloProposta}
                    onChange={(e) => setTituloProposta(e.target.value)}
                    className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder='Ex: Proposta 001/2025 - Processo Trabalhista'
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Cliente *
                  </label>
                  <select
                    value={clienteSelecionado}
                    onChange={(e) => setClienteSelecionado(e.target.value)}
                    className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    required
                  >
                    <option value=''>Selecione um cliente</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.razao_social} - {cliente.cnpj}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='border-t pt-4'>
                  <h4 className='font-semibold text-gray-700 mb-3'>Preencha os campos:</h4>
                  <div className='space-y-3'>
                    {selectedTemplate.placeholders?.map((placeholder) => (
                      <div key={placeholder}>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          {placeholder}
                        </label>
                        <input
                          type='text'
                          value={valoresCampos[placeholder] || ''}
                          onChange={(e) =>
                            setValoresCampos({ ...valoresCampos, [placeholder]: e.target.value })
                          }
                          className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                          placeholder={`Digite o valor para ${placeholder}`}
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className='flex gap-3 mt-6'>
                <button
                  type='button'
                  onClick={() => {
                    setShowGerarModal(false)
                    limparFormGerar()
                  }}
                  className='flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition'
                >
                  Cancelar
                </button>
                <button
                  type='submit'
                  disabled={loading}
                  className='flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50'
                >
                  {loading ? 'Gerando...' : 'Gerar Proposta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
