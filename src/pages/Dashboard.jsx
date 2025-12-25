import React, { useEffect, useState, useRef } from 'react'
import { supabase } from '../supabaseClient'
import {
  CalendarDays,
  ArrowRight,
  Target,
  TrendingUp,
  Briefcase,
  CheckCircle2,
  Clock,
  XCircle,
  Filter,
  ArrowDown,
  History,
  PieChart,
  BarChart3,
  Camera,
  FileSignature,
  AlertCircle,
  Mail,
  Download,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [enviandoEmail, setEnviandoEmail] = useState(false)
  const dashboardRef = useRef(null)

  // Estado Unificado das Métricas
  const [metrics, setMetrics] = useState({
    semana: {
      novos: 0,
      propQtd: 0,
      propPL: 0,
      propExito: 0,
      fechQtd: 0,
      fechPL: 0,
      fechExito: 0,
      fechMensal: 0,
    },
    mes: {
      novos: 0,
      propQtd: 0,
      propPL: 0,
      propExito: 0,
      fechQtd: 0,
      fechPL: 0,
      fechExito: 0,
      fechMensal: 0,
    },
    geral: {
      totalCasos: 0,
      emAnalise: 0,
      propostasAtivas: 0,
      fechados: 0,
      rejeitados: 0,
      probono: 0,
      valorEmNegociacaoPL: 0,
      valorEmNegociacaoExito: 0,
      receitaRecorrenteAtiva: 0,
      totalFechadoPL: 0,
      totalFechadoExito: 0,
      // Novos contadores de assinatura
      assinados: 0,
      naoAssinados: 0,
    },
  })

  // Estado do Funil
  const [funil, setFunil] = useState({
    totalEntrada: 0,
    qualificadosProposta: 0,
    fechados: 0,
    perdaAnalise: 0,
    perdaNegociacao: 0,
    taxaConversaoProposta: 0,
    taxaConversaoFechamento: 0,
  })

  const [evolucaoMensal, setEvolucaoMensal] = useState([])
  const [recentes, setRecentes] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      const { data: contratos } = await supabase.from('contratos').select(`
          status, 
          proposta_pro_labore, 
          proposta_fixo_mensal, 
          proposta_exito_total,
          contrato_assinado,
          created_at, 
          data_proposta,
          data_contrato,
          clientes(razao_social)
        `)

      if (contratos) {
        processarDados(contratos)
      }
    } catch (error) {
      console.error('Erro dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const processarDados = (contratos) => {
    const hoje = new Date()

    // Configurações de Data
    const diaDaSemana = hoje.getDay() || 7
    const inicioSemana = new Date(hoje)
    inicioSemana.setHours(0, 0, 0, 0)
    inicioSemana.setDate(hoje.getDate() - diaDaSemana + 1)
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)

    // Acumuladores
    let mSemana = {
      novos: 0,
      propQtd: 0,
      propPL: 0,
      propExito: 0,
      fechQtd: 0,
      fechPL: 0,
      fechExito: 0,
      fechMensal: 0,
    }
    let mMes = {
      novos: 0,
      propQtd: 0,
      propPL: 0,
      propExito: 0,
      fechQtd: 0,
      fechPL: 0,
      fechExito: 0,
      fechMensal: 0,
    }
    let mGeral = {
      totalCasos: 0,
      emAnalise: 0,
      propostasAtivas: 0,
      fechados: 0,
      rejeitados: 0,
      probono: 0,
      valorEmNegociacaoPL: 0,
      valorEmNegociacaoExito: 0,
      receitaRecorrenteAtiva: 0,
      totalFechadoPL: 0,
      totalFechadoExito: 0,
      assinados: 0,
      naoAssinados: 0,
    }

    // Funil
    let fTotal = 0
    let fQualificados = 0
    let fFechados = 0
    let fPerdaAnalise = 0
    let fPerdaNegociacao = 0

    contratos.forEach((c) => {
      const dataCriacao = new Date(c.created_at)
      const dataProp = c.data_proposta ? new Date(c.data_proposta) : dataCriacao
      const dataFechamento = c.data_contrato
        ? new Date(c.data_contrato)
        : dataCriacao
      const pl = Number(c.proposta_pro_labore || 0)
      const exito = Number(c.proposta_exito_total || 0)
      const mensal = Number(c.proposta_fixo_mensal || 0)

      // --- FUNIL ---
      fTotal++
      const chegouEmProposta =
        c.status === 'Proposta Enviada' ||
        c.status === 'Contrato Fechado' ||
        (c.status === 'Rejeitada' && c.data_proposta)

      if (chegouEmProposta) fQualificados++

      if (c.status === 'Contrato Fechado') {
        fFechados++
      } else if (c.status === 'Rejeitada') {
        c.data_proposta ? fPerdaNegociacao++ : fPerdaAnalise++
      }

      // --- GERAL ---
      mGeral.totalCasos++
      
      // Normalizar status removendo espaços extras
      const statusNormalizado = c.status?.trim()
      
      if (statusNormalizado === 'Sob Análise') mGeral.emAnalise++
      if (statusNormalizado === 'Rejeitada') mGeral.rejeitados++
      if (statusNormalizado === 'Probono') mGeral.probono++
      if (statusNormalizado === 'Proposta Enviada') {
        mGeral.propostasAtivas++
        mGeral.valorEmNegociacaoPL += pl
        mGeral.valorEmNegociacaoExito += exito
      }
      if (statusNormalizado === 'Contrato Fechado') {
        mGeral.fechados++
        mGeral.receitaRecorrenteAtiva += mensal
        mGeral.totalFechadoPL += pl
        mGeral.totalFechadoExito += exito

        // CONTAGEM DE ASSINATURAS
        if (c.contrato_assinado) {
          mGeral.assinados++
        } else {
          mGeral.naoAssinados++
        }
      }

      // --- SEMANA ---
      if (dataCriacao >= inicioSemana) mSemana.novos++
      if (c.status === 'Proposta Enviada' && dataProp >= inicioSemana) {
        mSemana.propQtd++
        mSemana.propPL += pl
        mSemana.propExito += exito
      }
      if (c.status === 'Contrato Fechado' && dataFechamento >= inicioSemana) {
        mSemana.fechQtd++
        mSemana.fechPL += pl
        mSemana.fechExito += exito
        mSemana.fechMensal += mensal
      }

      // --- MÊS ---
      if (dataCriacao >= inicioMes) mMes.novos++
      if (c.status === 'Proposta Enviada' && dataProp >= inicioMes) {
        mMes.propQtd++
        mMes.propPL += pl
        mMes.propExito += exito
      }
      if (c.status === 'Contrato Fechado' && dataFechamento >= inicioMes) {
        mMes.fechQtd++
        mMes.fechPL += pl
        mMes.fechExito += exito
        mMes.fechMensal += mensal
      }
    })

    // Gráfico de Evolução Mensal (últimos 6 meses)
    // Reutilizar variável 'hoje' já declarada no início da função
    const ultimos6Meses = []
    
    // Gerar array dos últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
      const mesAno = data.toLocaleDateString('pt-BR', {
        month: 'short',
        year: '2-digit',
      })
      ultimos6Meses.push({
        mes: mesAno,
        qtd: 0,
        mesNumero: data.getMonth(),
        anoNumero: data.getFullYear()
      })
    }
    
    // Contar casos criados em cada mês
    contratos.forEach((c) => {
      const dataCriacao = new Date(c.created_at)
      const mesContrato = dataCriacao.getMonth()
      const anoContrato = dataCriacao.getFullYear()
      
      ultimos6Meses.forEach((item) => {
        if (item.mesNumero === mesContrato && item.anoNumero === anoContrato) {
          item.qtd++
        }
      })
    })
    
    // Calcular altura proporcional
    const maxQtd = Math.max(...ultimos6Meses.map((m) => m.qtd), 1)
    ultimos6Meses.forEach((m) => {
      m.altura = (m.qtd / maxQtd) * 100
    })

    // Taxas
    const txProp = fTotal > 0 ? ((fQualificados / fTotal) * 100).toFixed(1) : 0
    const txFech =
      fQualificados > 0 ? ((fFechados / fQualificados) * 100).toFixed(1) : 0

    setFunil({
      totalEntrada: fTotal,
      qualificadosProposta: fQualificados,
      fechados: fFechados,
      perdaAnalise: fPerdaAnalise,
      perdaNegociacao: fPerdaNegociacao,
      taxaConversaoProposta: txProp,
      taxaConversaoFechamento: txFech,
    })

    setMetrics({ semana: mSemana, mes: mMes, geral: mGeral })
    setEvolucaoMensal(ultimos6Meses)
    const sorted = [...contratos]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
    setRecentes(sorted)
  }

  const formatMoney = (val) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val)

  const FinItem = ({ label, value, colorClass = 'text-gray-700' }) => {
    if (!value || value === 0) return null
    return (
      <div className='flex justify-between items-end text-sm mt-1 border-b border-gray-100 pb-1 last:border-0 last:pb-0'>
        <span className='text-gray-500 text-xs'>{label}</span>
        <span className={`font-bold ${colorClass}`}>{formatMoney(value)}</span>
      </div>
    )
  }

  // Cálculos para o card final
  const totalNegociacao =
    metrics.geral.valorEmNegociacaoPL + metrics.geral.valorEmNegociacaoExito
  const totalCarteira =
    metrics.geral.totalFechadoPL +
    metrics.geral.totalFechadoExito +
    metrics.geral.receitaRecorrenteAtiva

  const enviarDashboardPorEmail = async () => {
    setEnviandoEmail(true)
    try {
      // Importar html2canvas dinamicamente
      const html2canvas = (await import('html2canvas')).default
      
      // Capturar o dashboard como canvas
      const canvas = await html2canvas(dashboardRef.current, {
        backgroundColor: '#f9fafb',
        scale: 2,
        logging: false,
        useCORS: true,
      })
      
      // Converter para blob
      canvas.toBlob(async (blob) => {
        // Converter blob para base64
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64data = reader.result
          
          // Preparar conteúdo do email
          const hoje = new Date().toLocaleDateString('pt-BR')
          const assunto = `Dashboard Controladoria Jurídica - ${hoje}`
          const corpo = `
Olá,

Segue em anexo o Dashboard completo da Controladoria Jurídica referente a ${hoje}.

Dashboard em formato de imagem anexo.

---
Flow Metrics System
Controladoria Jurídica
          `.trim()
          
          // Criar link mailto com a imagem como data URI
          const mailtoLink = `mailto:?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}%0A%0A[Dashboard em anexo - por favor, cole a imagem do clipboard]`
          
          // Copiar imagem para clipboard
          canvas.toBlob((blob) => {
            const item = new ClipboardItem({ 'image/png': blob })
            navigator.clipboard.write([item]).then(() => {
              alert('✅ Dashboard copiado para a área de transferência!\n\nO programa de email será aberto. Cole a imagem (Ctrl+V ou Cmd+V) no corpo do email.')
              window.location.href = mailtoLink
            }).catch(() => {
              // Se não conseguir copiar, fazer download da imagem
              const link = document.createElement('a')
              link.download = `dashboard-${hoje.replace(/\//g, '-')}.png`
              link.href = canvas.toDataURL()
              link.click()
              
              alert('📷 Dashboard salvo como imagem!\n\nAnexe o arquivo baixado ao seu email.')
              window.location.href = mailtoLink
            })
          })
        }
        reader.readAsDataURL(blob)
      })
    } catch (error) {
      console.error('Erro ao capturar dashboard:', error)
      alert('❌ Erro ao gerar imagem do dashboard. Tente novamente.')
    } finally {
      setEnviandoEmail(false)
    }
  }

  return (
    <div className='w-full space-y-8 pb-10' ref={dashboardRef}>
      {/* TÍTULO E SUBTÍTULO */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-[#0F2C4C]'>
            Controladoria Jurídica
          </h1>
          <p className='text-gray-500'>
            Visão estratégica de contratos e resultados.
          </p>
        </div>
        
        {/* Botão Enviar por Email */}
        <button
          onClick={enviarDashboardPorEmail}
          disabled={enviandoEmail}
          className='flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed'
          title='Enviar Dashboard por Email'
        >
          {enviandoEmail ? (
            <>
              <Download size={20} className='animate-bounce' />
              Capturando...
            </>
          ) : (
            <>
              <Mail size={20} />
              Enviar por Email
            </>
          )}
        </button>
      </div>

      {/* ================= 1. FUNIL ================= */}
      <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-200'>
        <div className='flex items-center gap-2 mb-6 border-b pb-4'>
          <Filter className='text-blue-600' size={24} />
          <div>
            <h2 className='text-xl font-bold text-gray-800'>
              Funil de Eficiência
            </h2>
            <p className='text-xs text-gray-500'>
              Taxa de conversão de Prospects até Contratos Fechados.
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-5 gap-4 items-center'>
          {/* ETAPA 1 */}
          <div className='md:col-span-1 bg-gray-50 p-4 rounded-xl border border-gray-200 text-center relative'>
            <p className='text-xs font-bold text-gray-500 uppercase'>
              1. Prospects (Entrada)
            </p>
            <p className='text-3xl font-bold text-gray-800 mt-2'>
              {funil.totalEntrada}
            </p>
            <span className='text-xs text-gray-400'>Total Analisado</span>
            <div className='hidden md:block absolute -right-6 top-1/2 -translate-y-1/2 z-10'>
              <ArrowRight className='text-gray-300' />
            </div>
          </div>
          {/* Conversão 1 */}
          <div className='md:col-span-1 flex flex-col items-center justify-center space-y-2'>
            <div className='bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full'>
              {funil.taxaConversaoProposta}% Avançam
            </div>
            <ArrowDown className='text-gray-300 md:hidden' />
            <div className='text-xs text-red-400 flex items-center gap-1 bg-red-50 px-2 py-1 rounded border border-red-100 mt-2'>
              <XCircle size={12} /> {funil.perdaAnalise} Rejeitados na Análise
            </div>
          </div>
          {/* ETAPA 2 */}
          <div className='md:col-span-1 bg-blue-50 p-4 rounded-xl border border-blue-100 text-center relative'>
            <p className='text-xs font-bold text-blue-600 uppercase'>
              2. Propostas Apresentadas
            </p>
            <p className='text-3xl font-bold text-blue-900 mt-2'>
              {funil.qualificadosProposta}
            </p>
            <span className='text-xs text-blue-400'>Oportunidades Reais</span>
            <div className='hidden md:block absolute -right-6 top-1/2 -translate-y-1/2 z-10'>
              <ArrowRight className='text-blue-200' />
            </div>
          </div>
          {/* Conversão 2 */}
          <div className='md:col-span-1 flex flex-col items-center justify-center space-y-2'>
            <div className='bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full'>
              {funil.taxaConversaoFechamento}% Fecham
            </div>
            <ArrowDown className='text-gray-300 md:hidden' />
            <div className='text-xs text-red-400 flex items-center gap-1 bg-red-50 px-2 py-1 rounded border border-red-100 mt-2'>
              <XCircle size={12} /> {funil.perdaNegociacao} Rejeitados na
              Proposta
            </div>
          </div>
          {/* ETAPA 3 */}
          <div className='md:col-span-1 bg-green-50 p-4 rounded-xl border border-green-100 text-center'>
            <p className='text-xs font-bold text-green-600 uppercase'>
              3. Contratos Fechados
            </p>
            <p className='text-3xl font-bold text-green-900 mt-2'>
              {funil.fechados}
            </p>
            <span className='text-xs text-green-500'>Sucesso</span>
          </div>
        </div>
      </div>

      {/* ================= 2. PULSO DA SEMANA ================= */}
      <div className='bg-blue-50/50 p-6 rounded-2xl border border-blue-100'>
        <div className='flex items-center gap-2 mb-4'>
          <CalendarDays className='text-blue-700' size={24} />
          <h2 className='text-xl font-bold text-blue-900'>Resumo da Semana</h2>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='bg-white p-5 rounded-xl shadow-sm border border-blue-100 flex flex-col justify-between'>
            <div>
              <p className='text-xs text-gray-500 font-bold uppercase tracking-wider'>
                Entrada de Casos
              </p>
              <p className='text-3xl font-bold text-gray-800 mt-2'>
                {metrics.semana.novos}
              </p>
            </div>
            <div className='mt-2 text-xs text-gray-400'>
              Novos leads cadastrados
            </div>
          </div>
          <div className='bg-white p-5 rounded-xl shadow-sm border border-blue-100'>
            <div className='mb-3'>
              <p className='text-xs text-blue-600 font-bold uppercase tracking-wider'>
                Propostas Enviadas
              </p>
              <div className='flex items-baseline gap-2'>
                <p className='text-3xl font-bold text-gray-800 mt-1'>
                  {metrics.semana.propQtd}
                </p>
                <span className='text-xs text-gray-400'>na semana</span>
              </div>
            </div>
            <div className='bg-blue-50/50 p-3 rounded-lg space-y-1'>
              <FinItem
                label='Pró-labore Total'
                value={metrics.semana.propPL}
                colorClass='text-blue-700'
              />
              <FinItem
                label='Êxito Total'
                value={metrics.semana.propExito}
                colorClass='text-blue-700'
              />
            </div>
          </div>
          <div className='bg-white p-5 rounded-xl shadow-sm border border-blue-100'>
            <div className='mb-3'>
              <p className='text-xs text-green-600 font-bold uppercase tracking-wider'>
                Contratos Fechados
              </p>
              <div className='flex items-baseline gap-2'>
                <p className='text-3xl font-bold text-gray-800 mt-1'>
                  {metrics.semana.fechQtd}
                </p>
                <span className='text-xs text-gray-400'>na semana</span>
              </div>
            </div>
            <div className='bg-green-50/50 p-3 rounded-lg space-y-1'>
              <FinItem
                label='Pró-labore Total'
                value={metrics.semana.fechPL}
                colorClass='text-green-700'
              />
              <FinItem
                label='Êxito Total'
                value={metrics.semana.fechExito}
                colorClass='text-green-700'
              />
              <FinItem
                label='Fixos Mensais Total'
                value={metrics.semana.fechMensal}
                colorClass='text-green-700'
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= 3. PERFORMANCE MENSAL vs TOTAL ================= */}
      <div>
        <h2 className='text-xl font-bold text-gray-800 mb-4 flex items-center gap-2'>
          <TrendingUp size={20} className='text-[#0F2C4C]' /> Performance
          Comercial
        </h2>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* CARD ESQUERDA: MENSAL */}
          <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 relative'>
            <div className='absolute top-0 right-0 bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg'>
              MÊS ATUAL
            </div>

            <div className='flex-1'>
              <p className='text-sm text-gray-500 font-medium mb-1'>
                Negociações do Mês
              </p>
              <h3 className='text-3xl font-bold text-blue-800'>
                {metrics.mes.propQtd}{' '}
                <span className='text-base font-normal text-gray-400'>
                  propostas
                </span>
              </h3>
              <div className='mt-4 space-y-2'>
                <FinItem label='Pró-labore Total' value={metrics.mes.propPL} />
                <FinItem label='Êxito Total' value={metrics.mes.propExito} />
              </div>
            </div>
            <div className='w-full md:w-px bg-gray-100 h-full'></div>

            <div className='flex-1'>
              <p className='text-sm text-gray-500 font-medium mb-1'>
                Realizado no Mês
              </p>
              <h3 className='text-3xl font-bold text-green-700'>
                {metrics.mes.fechQtd}{' '}
                <span className='text-base font-normal text-gray-400'>
                  fechamentos
                </span>
              </h3>
              <div className='mt-4 space-y-2'>
                <FinItem
                  label='Pró-labore Total'
                  value={metrics.mes.fechPL}
                  colorClass='text-green-700'
                />
                <FinItem
                  label='Fixos Mensais Total'
                  value={metrics.mes.fechMensal}
                  colorClass='text-green-700'
                />
                <FinItem label='Êxito Total' value={metrics.mes.fechExito} />
              </div>
            </div>
          </div>

          {/* CARD DIREITA: TOTAL HISTÓRICO/ATIVO */}
          <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 relative'>
            <div className='absolute top-0 right-0 bg-[#0F2C4C] text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg'>
              PERFORMANCE TOTAL
            </div>

            <div className='flex-1'>
              <p className='text-sm text-gray-500 font-medium mb-1'>
                Total em Negociação
              </p>
              <h3 className='text-3xl font-bold text-blue-900'>
                {metrics.geral.propostasAtivas}{' '}
                <span className='text-base font-normal text-gray-400'>
                  em mesa
                </span>
              </h3>
              <div className='mt-4 space-y-2'>
                <FinItem
                  label='Pró-labore Total'
                  value={metrics.geral.valorEmNegociacaoPL}
                />
                <FinItem
                  label='Êxito Total'
                  value={metrics.geral.valorEmNegociacaoExito}
                />
              </div>
            </div>
            <div className='w-full md:w-px bg-gray-100 h-full'></div>

            <div className='flex-1'>
              <div className='mb-2'>
                <p className='text-sm text-gray-500 font-medium mb-1'>
                  Total Histórico Fechado
                </p>
                <h3 className='text-3xl font-bold text-green-800'>
                  {metrics.geral.fechados}{' '}
                  <span className='text-base font-normal text-gray-400'>
                    contratos
                  </span>
                </h3>

                {/* NOVA ÁREA: STATUS DE ASSINATURA */}
                <div className='flex gap-2 mt-2'>
                  <span className='flex items-center gap-1 text-[10px] bg-green-50 text-green-700 border border-green-100 px-2 py-1 rounded-full font-bold'>
                    <FileSignature size={12} /> {metrics.geral.assinados}{' '}
                    Assinados
                  </span>
                  <span className='flex items-center gap-1 text-[10px] bg-red-50 text-red-700 border border-red-100 px-2 py-1 rounded-full font-bold'>
                    <AlertCircle size={12} /> {metrics.geral.naoAssinados}{' '}
                    Pendentes
                  </span>
                </div>
              </div>

              <div className='mt-4 space-y-2'>
                <FinItem
                  label='Pró-labore Total'
                  value={metrics.geral.totalFechadoPL}
                  colorClass='text-green-800'
                />
                <FinItem
                  label='Fixos Mensais Total'
                  value={metrics.geral.receitaRecorrenteAtiva}
                  colorClass='text-green-800'
                />
                <FinItem
                  label='Êxito Total'
                  value={metrics.geral.totalFechadoExito}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 4. DISTRIBUIÇÃO E GRÁFICO ================= */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Card Grande de Volumetria */}
        <div className='lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100'>
          <div className='flex items-center gap-2 mb-6 border-b pb-4'>
            <PieChart className='text-[#0F2C4C]' size={24} />
            <div>
              <h2 className='text-xl font-bold text-gray-800'>
                Distribuição da Carteira
              </h2>
              <p className='text-xs text-gray-500'>
                Visão consolidada por status.
              </p>
            </div>
          </div>
          <div className='grid grid-cols-2 md:grid-cols-6 gap-4'>
            <div className='col-span-2 md:col-span-1 bg-[#0F2C4C] text-white p-4 rounded-lg flex flex-col justify-center items-center text-center'>
              <span className='text-4xl font-bold'>
                {metrics.geral.totalCasos}
              </span>
              <span className='text-xs opacity-80 uppercase tracking-wider mt-1'>
                Total Analisado
              </span>
            </div>
            <div className='bg-orange-50 p-4 rounded-lg border border-orange-100 text-center'>
              <Clock className='mx-auto text-orange-600 mb-2' size={20} />
              <p className='text-2xl font-bold text-orange-800'>
                {metrics.geral.emAnalise}
              </p>
              <p className='text-xs text-orange-700 font-bold uppercase mt-1'>
                Sob Análise
              </p>
            </div>
            <div className='bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-center'>
              <Briefcase className='mx-auto text-yellow-600 mb-2' size={20} />
              <p className='text-2xl font-bold text-yellow-800'>
                {metrics.geral.propostasAtivas}
              </p>
              <p className='text-xs text-yellow-700 font-bold uppercase mt-1'>
                Propostas
              </p>
            </div>
            <div className='bg-green-50 p-4 rounded-lg border border-green-100 text-center'>
              <CheckCircle2 className='mx-auto text-green-600 mb-2' size={20} />
              <p className='text-2xl font-bold text-green-800'>
                {metrics.geral.fechados}
              </p>
              <p className='text-xs text-green-700 font-bold uppercase mt-1'>
                Fechados
              </p>
            </div>
            <div className='bg-red-50 p-4 rounded-lg border border-red-100 text-center'>
              <XCircle className='mx-auto text-red-600 mb-2' size={20} />
              <p className='text-2xl font-bold text-red-800'>
                {metrics.geral.rejeitados}
              </p>
              <p className='text-xs text-red-700 font-bold uppercase mt-1'>
                Rejeitados
              </p>
            </div>
            <div className='bg-blue-50 p-4 rounded-lg border border-blue-100 text-center'>
              <Target className='mx-auto text-blue-600 mb-2' size={20} />
              <p className='text-2xl font-bold text-blue-800'>
                {metrics.geral.probono}
              </p>
              <p className='text-xs text-blue-700 font-bold uppercase mt-1'>
                Probono
              </p>
            </div>
          </div>
        </div>

        {/* Gráfico */}
        <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100'>
          <h3 className='font-bold text-gray-800 mb-6 flex items-center gap-2'>
            <BarChart3 className='text-[#0F2C4C]' size={20} />
            Entrada de Casos (6 Meses)
          </h3>
          <div className='h-64 flex items-end justify-around gap-2 pb-6 border-b border-gray-100'>
            {evolucaoMensal.length === 0 ? (
              <p className='w-full text-center text-gray-400 self-center'>
                Sem dados
              </p>
            ) : (
              evolucaoMensal.map((item, index) => (
                <div
                  key={index}
                  className='flex flex-col items-center gap-2 w-full h-full justify-end group'
                >
                  <span className='text-xs font-bold text-blue-900 mb-1 opacity-100'>
                    {item.qtd}
                  </span>
                  <div
                    className='relative w-full max-w-[40px] bg-blue-100 rounded-t-md hover:bg-blue-200 transition-all cursor-pointer'
                    style={{ height: `${item.altura}%` }}
                  ></div>
                  <span className='text-xs text-gray-500 font-medium uppercase'>
                    {item.mes}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Financeiro Acumulado Ativo (Atualizado com Total Geral) */}
        <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center space-y-6 lg:col-span-3'>
          <h3 className='font-bold text-gray-700 border-b pb-2 flex items-center gap-2'>
            <Camera className='text-[#0F2C4C]' size={20} />
            Fotografia Financeira Total
          </h3>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <div>
              <p className='text-xs text-gray-500 font-medium uppercase mb-2'>
                Valores em Negociação (Ativo)
              </p>
              <div className='space-y-2'>
                <FinItem
                  label='Pró-labore Total'
                  value={metrics.geral.valorEmNegociacaoPL}
                />
                <FinItem
                  label='Êxito Total'
                  value={metrics.geral.valorEmNegociacaoExito}
                />

                {/* TOTAL GERAL NEGOCIAÇÃO */}
                <div className='flex justify-between items-end border-t border-gray-200 pt-2 mt-2'>
                  <span className='text-sm font-bold text-gray-700'>
                    TOTAL GERAL
                  </span>
                  <span className='text-xl font-bold text-[#0F2C4C]'>
                    {formatMoney(totalNegociacao)}
                  </span>
                </div>
              </div>
            </div>

            <div className='md:border-l md:pl-8 border-gray-100'>
              <p className='text-xs text-gray-500 font-medium uppercase mb-2'>
                Carteira Ativa (Receita)
              </p>
              <div className='space-y-2'>
                <FinItem
                  label='Pró-labore Total (Fechado)'
                  value={metrics.geral.totalFechadoPL}
                  colorClass='text-green-700'
                />
                <FinItem
                  label='Êxito Total (Fechado)'
                  value={metrics.geral.totalFechadoExito}
                  colorClass='text-green-700'
                />
                <FinItem
                  label='Fixos Mensais Total'
                  value={metrics.geral.receitaRecorrenteAtiva}
                  colorClass='text-green-700'
                />

                {/* TOTAL GERAL CARTEIRA */}
                <div className='flex justify-between items-end border-t border-gray-200 pt-2 mt-2'>
                  <span className='text-sm font-bold text-gray-700'>
                    TOTAL GERAL
                  </span>
                  <span className='text-xl font-bold text-green-700'>
                    {formatMoney(totalCarteira)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
