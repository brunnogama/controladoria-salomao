import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  History,
} from 'lucide-react'

const CamposFinanceiros = ({ values, onChange }) => {
  const handleKeyDown = (e) => {
    if (
      [46, 8, 9, 27, 13, 110, 190, 188].indexOf(e.keyCode) !== -1 ||
      (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
      (e.keyCode >= 35 && e.keyCode <= 40)
    ) {
      return
    }
    if (
      (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
      (e.keyCode < 96 || e.keyCode > 105)
    ) {
      e.preventDefault()
    }
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-lg border border-gray-200 mt-4'>
      <div className='md:col-span-3 font-semibold text-gray-700 border-b pb-2 mb-2'>
        Detalhamento da Proposta Financeira
      </div>
      <div>
        <label className='block text-xs font-medium text-gray-600 mb-1'>
          Pró-labore (R$)
        </label>
        <input
          type='number'
          name='proposta_pro_labore'
          value={values.proposta_pro_labore}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          className='w-full p-2 border rounded'
          placeholder='0,00'
        />
      </div>
      <div>
        <label className='block text-xs font-medium text-gray-600 mb-1'>
          Êxito Total (R$)
        </label>
        <input
          type='number'
          name='proposta_exito_total'
          value={values.proposta_exito_total}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          className='w-full p-2 border rounded'
          placeholder='Valor fixo'
        />
      </div>
      <div>
        <label className='block text-xs font-medium text-gray-600 mb-1'>
          Êxito Percentual (%)
        </label>
        <input
          type='number'
          name='proposta_exito_percentual'
          value={values.proposta_exito_percentual}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          className='w-full p-2 border rounded'
          placeholder='%'
        />
      </div>
      <div>
        <label className='block text-xs font-medium text-gray-600 mb-1'>
          Fixo Mensal (R$)
        </label>
        <input
          type='number'
          name='proposta_fixo_mensal'
          value={values.proposta_fixo_mensal}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          className='w-full p-2 border rounded'
          placeholder='Manutenção'
        />
      </div>
      {values.proposta_fixo_mensal && values.proposta_fixo_mensal > 0 && (
        <div className='animate-fade-in'>
          <label className='block text-xs font-medium text-blue-600 mb-1'>
            Em quantas vezes?
          </label>
          <input
            type='number'
            name='proposta_fixo_parcelas'
            value={values.proposta_fixo_parcelas}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            className='w-full p-2 border border-blue-300 rounded bg-blue-50'
            placeholder='Ex: 12'
          />
        </div>
      )}
      <div className='md:col-span-3'>
        <label className='block text-xs font-medium text-gray-600 mb-1'>
          Observações da Proposta
        </label>
        <input
          type='text'
          name='proposta_obs'
          value={values.proposta_obs}
          onChange={onChange}
          className='w-full p-2 border rounded'
          placeholder='Detalhes de pagamento...'
        />
      </div>
    </div>
  )
}

const EditarContrato = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    status: '',
    cnpj: '',
    razao_social: '',
    parte_contraria: '',
    responsavel_socio: '',
    data_prospect: '',
    analisado_por: '',
    obs_prospect: '',
    data_proposta: '',
    proposta_pro_labore: '',
    proposta_exito_total: '',
    proposta_exito_percentual: '',
    proposta_fixo_mensal: '',
    proposta_fixo_parcelas: '',
    proposta_obs: '',
    data_contrato: '',
    contrato_assinado: false,
    numero_hon: '',
    rejeitado_por: '',
    motivo_rejeicao_categoria: '',
    motivo_rejeicao: '',
    historico_negociacao: [],
  })

  const [processos, setProcessos] = useState([])

  const toTitleCase = (str) => {
    if (!str) return ''
    const exceptions = ['de', 'da', 'do', 'das', 'dos', 'e', 'em']
    return str
      .toLowerCase()
      .split(' ')
      .map((word, index) => {
        if (index === 0 || !exceptions.includes(word)) {
          return word.charAt(0).toUpperCase() + word.slice(1)
        }
        return word
      })
      .join(' ')
  }

  useEffect(() => {
    const fetchContrato = async () => {
      try {
        const { data, error } = await supabase
          .from('contratos')
          .select(`*, clientes (cnpj, razao_social), processos (*)`)
          .eq('id', id)
          .single()

        if (error) throw error

        setFormData({
          status: data.status,
          cnpj: data.clientes?.cnpj || '',
          razao_social: data.clientes?.razao_social || '',
          parte_contraria: data.parte_contraria || '',
          responsavel_socio: data.responsavel_socio || '',
          data_prospect: data.data_prospect || '',
          analisado_por: data.analisado_por || '',
          obs_prospect: data.obs_prospect || '',
          data_proposta: data.data_proposta || '',
          proposta_pro_labore: data.proposta_pro_labore || '',
          proposta_exito_total: data.proposta_exito_total || '',
          proposta_exito_percentual: data.proposta_exito_percentual || '',
          proposta_fixo_mensal: data.proposta_fixo_mensal || '',
          proposta_fixo_parcelas: data.proposta_fixo_parcelas || '',
          proposta_obs: data.proposta_obs || '',
          data_contrato: data.data_contrato || '',
          contrato_assinado: data.contrato_assinado || false,
          numero_hon: data.numero_hon || '',
          rejeitado_por: data.rejeitado_por || '',
          motivo_rejeicao_categoria: data.motivo_rejeicao_categoria || '',
          motivo_rejeicao: data.motivo_rejeicao || '',
          historico_negociacao: data.historico_negociacao || [],
        })

        if (data.processos && data.processos.length > 0) {
          setProcessos(
            data.processos.map((p) => ({
              numero: p.numero_processo,
              tribunal: p.tribunal,
              juiz: p.juiz,
              valor_causa: p.valor_causa,
            }))
          )
        }
      } catch (error) {
        console.error('Erro ao carregar:', error)
        navigate('/contratos')
      } finally {
        setLoading(false)
      }
    }
    fetchContrato()
  }, [id, navigate])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const addProcesso = () =>
    setProcessos([
      ...processos,
      { numero: '', tribunal: '', juiz: '', valor_causa: '' },
    ])
  const removeProcesso = (index) =>
    setProcessos(processos.filter((_, i) => i !== index))
  const handleProcessoChange = (index, field, value) => {
    const novos = [...processos]
    novos[index][field] = value
    setProcessos(novos)
  }

  const formatMoney = (val) => {
    if (!val) return 'R$ 0,00'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: antigo } = await supabase
        .from('contratos')
        .select('status')
        .eq('id', id)
        .single()

      let novoHistorico = [...(formData.historico_negociacao || [])]

      if (
        formData.status === 'Proposta Enviada' ||
        formData.status === 'Contrato Fechado'
      ) {
        const snapshot = {
          data_registro: new Date().toISOString(),
          pro_labore: formData.proposta_pro_labore,
          exito_total: formData.proposta_exito_total,
          exito_percentual: formData.proposta_exito_percentual,
          fixo_mensal: formData.proposta_fixo_mensal,
          obs: formData.proposta_obs || 'Atualização de valores',
        }
        novoHistorico.unshift(snapshot)
      }

      const { error: errContrato } = await supabase
        .from('contratos')
        .update({
          status: formData.status,
          parte_contraria: formData.parte_contraria,
          responsavel_socio: formData.responsavel_socio,
          data_prospect: formData.data_prospect || null,
          analisado_por: formData.analisado_por,
          obs_prospect: formData.obs_prospect,
          data_proposta: formData.data_proposta || null,
          proposta_pro_labore: formData.proposta_pro_labore || null,
          proposta_exito_total: formData.proposta_exito_total || null,
          proposta_exito_percentual: formData.proposta_exito_percentual || null,
          proposta_fixo_mensal: formData.proposta_fixo_mensal || null,
          proposta_fixo_parcelas: formData.proposta_fixo_parcelas || null,
          proposta_obs: formData.proposta_obs,
          data_contrato: formData.data_contrato || null,
          contrato_assinado: formData.contrato_assinado,
          numero_hon: formData.numero_hon,
          rejeitado_por: formData.rejeitado_por,
          motivo_rejeicao_categoria: formData.motivo_rejeicao_categoria,
          motivo_rejeicao: formData.motivo_rejeicao,
          historico_negociacao: novoHistorico,
        })
        .eq('id', id)

      if (errContrato) throw errContrato

      await supabase.from('processos').delete().eq('contrato_id', id)
      const processosParaSalvar = processos
        .filter((p) => p.numero)
        .map((p) => ({
          contrato_id: id,
          numero_processo: p.numero,
          tribunal: p.tribunal,
          juiz: p.juiz,
          valor_causa: p.valor_causa || null,
        }))
      if (processosParaSalvar.length > 0) {
        await supabase.from('processos').insert(processosParaSalvar)
      }

      // --- LOG AUTOMÁTICO ---
      let msgLog = `Contrato de ${formData.razao_social} atualizado.`
      if (antigo && antigo.status !== formData.status) {
        msgLog = `Mudança de Status: De "${antigo.status}" para "${formData.status}" - Cliente: ${formData.razao_social}`
      }

      await supabase.from('logs_sistema').insert([
        {
          categoria: 'Contrato',
          acao:
            antigo && antigo.status !== formData.status
              ? 'Mudança de Status'
              : 'Edição',
          detalhes: msgLog,
          referencia_id: id,
        },
      ])

      alert('Contrato atualizado com sucesso!')
      navigate('/contratos')
    } catch (error) {
      console.error(error)
      alert('Erro ao atualizar: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading)
    return (
      <div className='flex justify-center items-center h-screen'>
        <Loader2 className='animate-spin text-blue-900' size={48} />
      </div>
    )

  return (
    <div className='w-full max-w-5xl mx-auto space-y-6 pb-20'>
      <div className='flex items-center gap-4 mb-6'>
        <button
          onClick={() => navigate('/contratos')}
          className='p-2 hover:bg-gray-200 rounded-full'
        >
          <ArrowLeft size={24} className='text-gray-600' />
        </button>
        <div>
          <h1 className='text-2xl font-bold text-[#0F2C4C]'>Editar Contrato</h1>
          <p className='text-sm text-gray-500'>
            Editando caso de: {formData.razao_social}
          </p>
        </div>
      </div>

      <form onSubmit={handleUpdate} className='space-y-6'>
        {/* BLOCO 1 */}
        <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4'>
          <h2 className='font-semibold text-gray-700 border-b pb-2'>
            Informações Iniciais
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-600 mb-1'>
                Status Atual
              </label>
              <select
                name='status'
                value={formData.status}
                onChange={handleChange}
                className='w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 font-bold text-[#0F2C4C]'
              >
                <option value='Sob Análise'>Sob Análise</option>
                <option value='Proposta Enviada'>Proposta Enviada</option>
                <option value='Contrato Fechado'>Contrato Fechado</option>
                <option value='Rejeitada'>Rejeitada</option>
                <option value='Probono'>Probono</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-600 mb-1'>
                Responsável
              </label>
              <input
                type='text'
                name='responsavel_socio'
                value={formData.responsavel_socio}
                onChange={handleChange}
                className='w-full p-2.5 border rounded-lg'
              />
            </div>
            <div className='col-span-2 md:col-span-1'>
              <label className='block text-sm font-medium text-gray-600 mb-1'>
                CNPJ do Cliente
              </label>
              <input
                type='text'
                name='cnpj'
                value={formData.cnpj}
                readOnly
                className='w-full p-2.5 border rounded-lg bg-gray-50'
              />
            </div>
            <div className='col-span-2 md:col-span-1'>
              <label className='block text-sm font-medium text-gray-600 mb-1'>
                Nome do Cliente
              </label>
              <input
                type='text'
                name='razao_social'
                value={formData.razao_social}
                readOnly
                className='w-full p-2.5 border rounded-lg bg-gray-50'
              />
            </div>
          </div>
        </div>

        {/* BLOCO 2: Processos */}
        <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4'>
          <div className='flex justify-between items-center border-b pb-2'>
            <h2 className='font-semibold text-gray-700'>
              Processos Vinculados
            </h2>
            <button
              type='button'
              onClick={addProcesso}
              className='text-sm text-blue-600 flex items-center gap-1 hover:underline'
            >
              <Plus size={16} /> Adicionar Processo
            </button>
          </div>
          <div className='pb-2'>
            <label className='block text-sm font-medium text-gray-600 mb-1'>
              Parte Contrária
            </label>
            <input
              type='text'
              name='parte_contraria'
              value={formData.parte_contraria}
              onChange={handleChange}
              className='w-full p-2.5 border rounded-lg bg-gray-50 focus:bg-white'
            />
          </div>
          {processos.map((proc, index) => (
            <div
              key={index}
              className='grid grid-cols-1 md:grid-cols-5 gap-3 items-end bg-gray-50 p-3 rounded-lg border border-gray-200'
            >
              <div className='md:col-span-2'>
                <input
                  type='text'
                  value={proc.numero}
                  onChange={(e) =>
                    handleProcessoChange(index, 'numero', e.target.value)
                  }
                  className='w-full p-2 border rounded'
                />
              </div>
              <div>
                <input
                  type='text'
                  value={proc.tribunal}
                  onChange={(e) =>
                    handleProcessoChange(index, 'tribunal', e.target.value)
                  }
                  className='w-full p-2 border rounded'
                />
              </div>
              <div>
                <input
                  type='number'
                  value={proc.valor_causa}
                  onChange={(e) =>
                    handleProcessoChange(index, 'valor_causa', e.target.value)
                  }
                  className='w-full p-2 border rounded'
                />
              </div>
              <button
                type='button'
                onClick={() => removeProcesso(index)}
                className='text-red-500 p-2 hover:bg-red-50 rounded'
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* BLOCO 3: Condicionais e Financeiro */}
        <div className='bg-blue-50 p-6 rounded-xl border border-blue-100 space-y-4'>
          <h2 className='font-semibold text-[#0F2C4C] flex items-center gap-2'>
            Detalhes da Fase:{' '}
            <span className='uppercase'>{formData.status}</span>
          </h2>

          {formData.status === 'Sob Análise' && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm text-gray-600'>
                  Data do Prospect
                </label>
                <input
                  type='date'
                  name='data_prospect'
                  value={formData.data_prospect}
                  onChange={handleChange}
                  className='w-full p-2 border rounded'
                />
              </div>
              <div>
                <label className='block text-sm text-gray-600'>
                  Analisado por
                </label>
                <input
                  type='text'
                  name='analisado_por'
                  value={formData.analisado_por}
                  onChange={handleChange}
                  className='w-full p-2 border rounded'
                />
              </div>
              <div className='col-span-2'>
                <label className='block text-sm text-gray-600'>
                  Obs Prospect
                </label>
                <textarea
                  name='obs_prospect'
                  value={formData.obs_prospect}
                  onChange={handleChange}
                  className='w-full p-2 border rounded h-24'
                ></textarea>
              </div>
            </div>
          )}

          {formData.status === 'Proposta Enviada' && (
            <div className='space-y-4'>
              <div>
                <label className='block text-sm text-gray-600 mb-1'>
                  Data da Proposta
                </label>
                <input
                  type='date'
                  name='data_proposta'
                  value={formData.data_proposta}
                  onChange={handleChange}
                  className='w-full md:w-1/3 p-2 border rounded'
                />
              </div>
              <CamposFinanceiros values={formData} onChange={handleChange} />
            </div>
          )}

          {formData.status === 'Contrato Fechado' && (
            <div className='space-y-4'>
              {/* CAMPO HON */}
              <div className='bg-white p-4 rounded-lg border border-blue-200 shadow-sm mb-4'>
                <label className='block text-sm font-bold text-[#0F2C4C] mb-1'>
                  Número HON (LegalOne)
                </label>
                <input
                  type='text'
                  name='numero_hon'
                  value={formData.numero_hon}
                  onChange={handleChange}
                  className='w-full p-2.5 border-2 border-blue-100 rounded-lg focus:border-blue-500 focus:outline-none'
                  placeholder='Insira o número de cadastro...'
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm text-gray-600 mb-1'>
                    Data Contrato
                  </label>
                  <input
                    type='date'
                    name='data_contrato'
                    value={formData.data_contrato}
                    onChange={handleChange}
                    className='w-full p-2.5 border rounded-lg'
                  />
                </div>
                <div>
                  <label className='block text-sm text-gray-600 mb-1'>
                    Status da Assinatura
                  </label>
                  <select
                    name='contrato_assinado'
                    value={formData.contrato_assinado.toString()}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        contrato_assinado: e.target.value === 'true',
                      }))
                    }
                    className={`w-full p-2.5 border rounded-lg font-bold focus:outline-none transition-colors ${
                      formData.contrato_assinado
                        ? 'bg-green-100 border-green-300 text-green-800'
                        : 'bg-red-100 border-red-300 text-red-800'
                    }`}
                  >
                    <option value='false'>❌ Não Assinado</option>
                    <option value='true'>✅ Assinado</option>
                  </select>
                </div>
              </div>
              {!formData.contrato_assinado && (
                <div className='bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-sm text-yellow-800 flex items-start gap-3'>
                  <AlertCircle size={20} className='shrink-0 mt-0.5' />
                  <div>
                    <p className='font-bold'>Atenção: Assinatura Pendente</p>
                    <p>
                      O sistema enviará alertas automáticos de cobrança 5 dias
                      após a data do fechamento.
                    </p>
                  </div>
                </div>
              )}
              <CamposFinanceiros values={formData} onChange={handleChange} />
            </div>
          )}

          {formData.status === 'Rejeitada' && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm text-gray-600 mb-1'>
                  Rejeitado Por
                </label>
                <select
                  name='rejeitado_por'
                  value={formData.rejeitado_por}
                  onChange={handleChange}
                  className='w-full p-2.5 border rounded-lg'
                >
                  <option value=''>Selecione...</option>
                  <option value='Cliente'>Cliente</option>
                  <option value='Escritório'>Escritório</option>
                </select>
              </div>
              <div>
                <label className='block text-sm text-gray-600 mb-1'>
                  Motivo Principal
                </label>
                <select
                  name='motivo_rejeicao_categoria'
                  value={formData.motivo_rejeicao_categoria}
                  onChange={handleChange}
                  className='w-full p-2.5 border rounded-lg'
                >
                  <option value=''>Selecione...</option>
                  <option value='Caso Ruim/Sem Êxito'>
                    Caso Ruim / Sem Êxito
                  </option>
                  <option value='Cliente Declinou'>
                    Cliente Declinou / Não Retornou
                  </option>
                  <option value='Conflito de Interesses'>
                    Conflito de Interesses
                  </option>
                </select>
              </div>
              <div className='col-span-2'>
                <label className='block text-sm text-gray-600'>
                  Observações Adicionais
                </label>
                <textarea
                  name='motivo_rejeicao'
                  value={formData.motivo_rejeicao}
                  onChange={handleChange}
                  className='w-full p-2 border rounded h-24'
                ></textarea>
              </div>
            </div>
          )}
        </div>

        {/* BLOCO 4: Histórico de Negociação */}
        {formData.historico_negociacao &&
          formData.historico_negociacao.length > 0 && (
            <div className='bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4'>
              <h2 className='font-semibold text-gray-700 flex items-center gap-2'>
                <History size={20} /> Histórico de Negociações
              </h2>
              <div className='space-y-3'>
                {formData.historico_negociacao.map((item, index) => (
                  <div
                    key={index}
                    className='bg-white p-3 rounded border border-gray-200 text-sm'
                  >
                    <div className='flex justify-between text-gray-500 mb-2'>
                      <span>
                        {new Date(item.data_registro).toLocaleString('pt-BR')}
                      </span>
                      <span className='font-medium text-xs bg-gray-100 px-2 py-0.5 rounded'>
                        Versão anterior
                      </span>
                    </div>
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-gray-700'>
                      <div>
                        <span className='block text-xs text-gray-400'>
                          Pró-labore
                        </span>
                        {formatMoney(item.pro_labore)}
                      </div>
                      <div>
                        <span className='block text-xs text-gray-400'>
                          Êxito
                        </span>
                        {formatMoney(item.exito_total)} ({item.exito_percentual}
                        %)
                      </div>
                      <div>
                        <span className='block text-xs text-gray-400'>
                          Mensal
                        </span>
                        {formatMoney(item.fixo_mensal)}
                      </div>
                      <div className='col-span-2 md:col-span-1'>
                        <span className='block text-xs text-gray-400'>Obs</span>
                        {item.obs || '-'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        <div className='flex justify-end pt-4'>
          <button
            type='submit'
            disabled={saving}
            className='flex items-center gap-2 bg-[#0F2C4C] text-white px-8 py-3 rounded-lg hover:bg-blue-900 transition-colors shadow-lg disabled:opacity-50'
          >
            <Save size={20} /> {saving ? 'Atualizando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditarContrato
