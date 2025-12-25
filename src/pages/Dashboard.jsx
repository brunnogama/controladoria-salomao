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
  Mail,
  Download,
  DollarSign,
  Users,
  FileText,
  TrendingDown,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [enviandoEmail, setEnviandoEmail] = useState(false)
  const dashboardRef = useRef(null)

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
      rejeitados: 0,
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
      rejeitados: 0,
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
      assinados: 0,
      naoAssinados: 0,
    },
  })

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
          proposta_exito_percentual,
          contrato_pro_labore,
          contrato_fixo_mensal,
          contrato_exito_total,
          contrato_exito_percentual,
          contrato_assinado,
          created_at, 
          data_prospect,
          data_proposta,
          data_contrato,
          data_rejeicao
        `)

      if (!contratos) return

      const hoje = new Date()
      const inicioSemana = new Date(hoje)
      inicioSemana.setDate(hoje.getDate() - hoje.getDay())
      inicioSemana.setHours(0, 0, 0, 0)

      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)

      const mSemana = { novos: 0, propQtd: 0, propPL: 0, propExito: 0, fechQtd: 0, fechPL: 0, fechExito: 0, fechMensal: 0, rejeitados: 0 }
      const mMes = { novos: 0, propQtd: 0, propPL: 0, propExito: 0, fechQtd: 0, fechPL: 0, fechExito: 0, fechMensal: 0, rejeitados: 0 }
      const mGeral = {
        totalCasos: contratos.length,
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

      let funilTemp = {
        totalEntrada: contratos.length,
        qualificadosProposta: 0,
        fechados: 0,
        perdaAnalise: 0,
        perdaNegociacao: 0,
      }

      contratos.forEach((c) => {
        const statusNormalizado = c.status?.trim()
        const dataCriacao = new Date(c.created_at)
        const dataProspect = c.data_prospect ? new Date(c.data_prospect) : null
        const dataProposta = c.data_proposta ? new Date(c.data_proposta) : null
        const dataFechamento = c.data_contrato ? new Date(c.data_contrato) : null
        const dataRejeicao = c.data_rejeicao ? new Date(c.data_rejeicao) : null

        const pl = parseFloat(c.proposta_pro_labore || 0)
        const exito = parseFloat(c.proposta_exito_total || 0)
        const mensal = parseFloat(c.proposta_fixo_mensal || 0)

        const contratoAssinado = c.contrato_assinado === true || c.contrato_assinado === 'true'

        // Contadores Gerais
        if (statusNormalizado === 'Sob Análise') mGeral.emAnalise++
        if (statusNormalizado === 'Proposta Enviada') {
          mGeral.propostasAtivas++
          mGeral.valorEmNegociacaoPL += pl
          mGeral.valorEmNegociacaoExito += exito
        }
        if (statusNormalizado === 'Contrato Fechado') {
          mGeral.fechados++
          const plFechado = parseFloat(c.contrato_pro_labore || 0)
          const exitoFechado = parseFloat(c.contrato_exito_total || 0)
          const mensalFechado = parseFloat(c.contrato_fixo_mensal || 0)
          mGeral.totalFechadoPL += plFechado
          mGeral.totalFechadoExito += exitoFechado
          mGeral.receitaRecorrenteAtiva += mensalFechado

          if (contratoAssinado) {
            mGeral.assinados++
          } else {
            mGeral.naoAssinados++
          }
        }
        if (statusNormalizado === 'Rejeitada') mGeral.rejeitados++
        if (statusNormalizado === 'Probono') mGeral.probono++

        // Funil
        if (statusNormalizado === 'Proposta Enviada' || statusNormalizado === 'Contrato Fechado') {
          funilTemp.qualificadosProposta++
        }
        if (statusNormalizado === 'Contrato Fechado') {
          funilTemp.fechados++
        }
        if (statusNormalizado === 'Rejeitada') {
          if (dataProposta) {
            funilTemp.perdaNegociacao++
          } else {
            funilTemp.perdaAnalise++
          }
        }

        // Semana - baseado em data_prospect ou created_at
        const dataReferenciaSemana = dataProspect || dataCriacao
        if (dataReferenciaSemana >= inicioSemana) {
          mSemana.novos++
        }
        if (statusNormalizado === 'Proposta Enviada' && dataProposta && dataProposta >= inicioSemana) {
          mSemana.propQtd++
          mSemana.propPL += pl
          mSemana.propExito += exito
        }
        if (statusNormalizado === 'Contrato Fechado' && dataFechamento && dataFechamento >= inicioSemana) {
          mSemana.fechQtd++
          mSemana.fechPL += parseFloat(c.contrato_pro_labore || 0)
          mSemana.fechExito += parseFloat(c.contrato_exito_total || 0)
          mSemana.fechMensal += parseFloat(c.contrato_fixo_mensal || 0)
        }
        if (statusNormalizado === 'Rejeitada' && dataRejeicao && dataRejeicao >= inicioSemana) {
          mSemana.rejeitados++
        }

        // Mês - baseado em data_prospect ou created_at
        const dataReferenciaMes = dataProspect || dataCriacao
        if (dataReferenciaMes >= inicioMes) {
          mMes.novos++
        }
        if (statusNormalizado === 'Proposta Enviada' && dataProposta && dataProposta >= inicioMes) {
          mMes.propQtd++
          mMes.propPL += pl
          mMes.propExito += exito
        }
        if (statusNormalizado === 'Contrato Fechado' && dataFechamento && dataFechamento >= inicioMes) {
          mMes.fechQtd++
          mMes.fechPL += parseFloat(c.contrato_pro_labore || 0)
          mMes.fechExito += parseFloat(c.contrato_exito_total || 0)
          mMes.fechMensal += parseFloat(c.contrato_fixo_mensal || 0)
        }
        if (statusNormalizado === 'Rejeitada' && dataRejeicao && dataRejeicao >= inicioMes) {
          mMes.rejeitados++
        }
      })

      // Calcular taxas de conversão
      funilTemp.taxaConversaoProposta = funilTemp.totalEntrada > 0
        ? Math.round((funilTemp.qualificadosProposta / funilTemp.totalEntrada) * 100)
        : 0
      funilTemp.taxaConversaoFechamento = funilTemp.qualificadosProposta > 0
        ? Math.round((funilTemp.fechados / funilTemp.qualificadosProposta) * 100)
        : 0

      // Gráfico de Evolução Mensal - baseado em data de cada fase
      const ultimos6Meses = []
      for (let i = 5; i >= 0; i--) {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
        const mesAno = data.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
        ultimos6Meses.push({
          mes: mesAno,
          prospects: 0,
          propostas: 0,
          fechados: 0,
          rejeitados: 0,
          mesNumero: data.getMonth(),
          anoNumero: data.getFullYear()
        })
      }

      contratos.forEach((c) => {
        const statusNormalizado = c.status?.trim()
        
        // Usar data_prospect ou created_at para prospects
        const dataProspect = c.data_prospect ? new Date(c.data_prospect) : new Date(c.created_at)
        const mesProspect = dataProspect.getMonth()
        const anoProspect = dataProspect.getFullYear()

        ultimos6Meses.forEach((item) => {
          if (item.mesNumero === mesProspect && item.anoNumero === anoProspect) {
            item.prospects++
          }
        })

        // Propostas - baseado em data_proposta
        if (c.data_proposta && (statusNormalizado === 'Proposta Enviada' || statusNormalizado === 'Contrato Fechado')) {
          const dataProposta = new Date(c.data_proposta)
          const mesProposta = dataProposta.getMonth()
          const anoProposta = dataProposta.getFullYear()
          
          ultimos6Meses.forEach((item) => {
            if (item.mesNumero === mesProposta && item.anoNumero === anoProposta) {
              item.propostas++
            }
          })
        }

        // Fechados - baseado em data_contrato
        if (c.data_contrato && statusNormalizado === 'Contrato Fechado') {
          const dataFechamento = new Date(c.data_contrato)
          const mesFechamento = dataFechamento.getMonth()
          const anoFechamento = dataFechamento.getFullYear()
          
          ultimos6Meses.forEach((item) => {
            if (item.mesNumero === mesFechamento && item.anoNumero === anoFechamento) {
              item.fechados++
            }
          })
        }

        // Rejeitados - baseado em data_rejeicao
        if (c.data_rejeicao && statusNormalizado === 'Rejeitada') {
          const dataRejeicao = new Date(c.data_rejeicao)
          const mesRejeicao = dataRejeicao.getMonth()
          const anoRejeicao = dataRejeicao.getFullYear()
          
          ultimos6Meses.forEach((item) => {
            if (item.mesNumero === mesRejeicao && item.anoNumero === anoRejeicao) {
              item.rejeitados++
            }
          })
        }
      })

      setMetrics({ semana: mSemana, mes: mMes, geral: mGeral })
      setFunil(funilTemp)
      setEvolucaoMensal(ultimos6Meses)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatMoney = (value) => {
    if (!value || isNaN(value)) return 'R$ 0,00'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const enviarDashboardPorEmail = async () => {
    setEnviandoEmail(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      
      const canvas = await html2canvas(dashboardRef.current, {
        backgroundColor: '#f9fafb',
        scale: 2,
        logging: false,
        useCORS: true,
      })
      
      canvas.toBlob(async (blob) => {
        const reader = new FileReader()
        reader.onloadend = () => {
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
          
          const mailtoLink = `mailto:?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}%0A%0A[Dashboard em anexo - por favor, cole a imagem do clipboard]`
          
          canvas.toBlob((blob) => {
            const item = new ClipboardItem({ 'image/png': blob })
            navigator.clipboard.write([item]).then(() => {
              alert('✅ Dashboard copiado para a área de transferência!\n\nO programa de email será aberto. Cole a imagem (Ctrl+V ou Cmd+V) no corpo do email.')
              window.location.href = mailtoLink
            }).catch(() => {
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

  const totalNegociacao = metrics.geral.valorEmNegociacaoPL + metrics.geral.valorEmNegociacaoExito
  const totalCarteira = metrics.geral.totalFechadoPL + metrics.geral.totalFechadoExito + metrics.geral.receitaRecorrenteAtiva

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full space-y-8 pb-10' ref={dashboardRef}>
      {/* HEADER */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-[#0F2C4C]'>Controladoria Jurídica</h1>
          <p className='text-gray-500'>Visão estratégica de contratos e resultados.</p>
        </div>
        
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

      {/* 1. RESUMO DA SEMANA */}
      <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-200'>
        <div className='flex items-center gap-2 mb-6 border-b pb-4'>
          <CalendarDays className='text-blue-600' size={24} />
          <div>
            <h2 className='text-xl font-bold text-gray-800'>Resumo da Semana</h2>
            <p className='text-xs text-gray-500'>Performance dos últimos 7 dias</p>
          </div>
        </div>

        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <div className='bg-blue-50 p-4 rounded-xl border border-blue-100'>
            <p className='text-xs font-bold text-blue-600 uppercase mb-1'>Novos Prospects</p>
            <p className='text-2xl font-bold text-blue-900'>{metrics.semana.novos}</p>
          </div>

          <div className='bg-yellow-50 p-4 rounded-xl border border-yellow-100'>
            <p className='text-xs font-bold text-yellow-600 uppercase mb-1'>Propostas Enviadas</p>
            <p className='text-2xl font-bold text-yellow-900'>{metrics.semana.propQtd}</p>
            <p className='text-xs text-gray-600 mt-1'>
              {formatMoney(metrics.semana.propPL + metrics.semana.propExito)}
            </p>
          </div>

          <div className='bg-green-50 p-4 rounded-xl border border-green-100'>
            <p className='text-xs font-bold text-green-600 uppercase mb-1'>Contratos Fechados</p>
            <p className='text-2xl font-bold text-green-900'>{metrics.semana.fechQtd}</p>
            <p className='text-xs text-gray-600 mt-1'>
              {formatMoney(metrics.semana.fechPL + metrics.semana.fechExito + metrics.semana.fechMensal)}
            </p>
          </div>

          <div className='bg-red-50 p-4 rounded-xl border border-red-100'>
            <p className='text-xs font-bold text-red-600 uppercase mb-1'>Rejeitados</p>
            <p className='text-2xl font-bold text-red-900'>{metrics.semana.rejeitados}</p>
          </div>
        </div>

        <div className='mt-4 pt-4 border-t border-gray-100'>
          <p className='text-sm text-gray-600'>
            <span className='font-bold'>Resumo:</span> Esta semana entraram {metrics.semana.novos} novos prospects, 
            {metrics.semana.propQtd > 0 && ` foram enviadas ${metrics.semana.propQtd} propostas,`}
            {metrics.semana.fechQtd > 0 && ` ${metrics.semana.fechQtd} contrato(s) fechado(s)`}
            {metrics.semana.rejeitados > 0 && ` e ${metrics.semana.rejeitados} rejeitado(s)`}.
          </p>
        </div>
      </div>

      {/* 2. DISTRIBUIÇÃO DA CARTEIRA + ENTRADA DE CASOS (LADO A LADO) */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Distribuição da Carteira */}
        <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-200'>
          <div className='flex items-center gap-2 mb-6 border-b pb-4'>
            <PieChart className='text-blue-600' size={24} />
            <div>
              <h2 className='text-xl font-bold text-gray-800'>Distribuição da Carteira</h2>
              <p className='text-xs text-gray-500'>Status atual de todos os casos</p>
            </div>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
            <div className='bg-orange-50 p-4 rounded-xl border border-orange-100 text-center'>
              <p className='text-xs font-bold text-orange-600 uppercase mb-1'>Sob Análise</p>
              <p className='text-3xl font-bold text-orange-900'>{metrics.geral.emAnalise}</p>
            </div>

            <div className='bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-center'>
              <p className='text-xs font-bold text-yellow-600 uppercase mb-1'>Propostas</p>
              <p className='text-3xl font-bold text-yellow-900'>{metrics.geral.propostasAtivas}</p>
            </div>

            <div className='bg-green-50 p-4 rounded-xl border border-green-100 text-center'>
              <p className='text-xs font-bold text-green-600 uppercase mb-1'>Fechados</p>
              <p className='text-3xl font-bold text-green-900'>{metrics.geral.fechados}</p>
            </div>

            <div className='bg-red-50 p-4 rounded-xl border border-red-100 text-center'>
              <p className='text-xs font-bold text-red-600 uppercase mb-1'>Rejeitados</p>
              <p className='text-3xl font-bold text-red-900'>{metrics.geral.rejeitados}</p>
            </div>

            <div className='bg-blue-50 p-4 rounded-xl border border-blue-100 text-center'>
              <p className='text-xs font-bold text-blue-600 uppercase mb-1'>Probono</p>
              <p className='text-3xl font-bold text-blue-900'>{metrics.geral.probono}</p>
            </div>

            <div className='bg-purple-50 p-4 rounded-xl border border-purple-100 text-center'>
              <p className='text-xs font-bold text-purple-600 uppercase mb-1'>Total</p>
              <p className='text-3xl font-bold text-purple-900'>{metrics.geral.totalCasos}</p>
            </div>
          </div>
        </div>

        {/* Entrada de Casos (6 Meses) */}
        <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-200'>
          <div className='flex items-center gap-2 mb-6 border-b pb-4'>
            <BarChart3 className='text-blue-600' size={24} />
            <div>
              <h2 className='text-xl font-bold text-gray-800'>Entrada de Casos (6 Meses)</h2>
              <p className='text-xs text-gray-500'>Evolução por fase do processo</p>
            </div>
          </div>

          <div className='space-y-4'>
            {evolucaoMensal.map((item, index) => (
              <div key={index} className='border-b border-gray-100 pb-3 last:border-0'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm font-bold text-gray-700'>{item.mes}</span>
                  <span className='text-xs text-gray-500'>Total: {item.prospects}</span>
                </div>
                <div className='grid grid-cols-4 gap-2 text-xs'>
                  <div className='bg-blue-50 px-2 py-1 rounded text-center'>
                    <p className='font-semibold text-blue-700'>{item.prospects}</p>
                    <p className='text-[10px] text-gray-500'>Prospects</p>
                  </div>
                  <div className='bg-yellow-50 px-2 py-1 rounded text-center'>
                    <p className='font-semibold text-yellow-700'>{item.propostas}</p>
                    <p className='text-[10px] text-gray-500'>Propostas</p>
                  </div>
                  <div className='bg-green-50 px-2 py-1 rounded text-center'>
                    <p className='font-semibold text-green-700'>{item.fechados}</p>
                    <p className='text-[10px] text-gray-500'>Fechados</p>
                  </div>
                  <div className='bg-red-50 px-2 py-1 rounded text-center'>
                    <p className='font-semibold text-red-700'>{item.rejeitados}</p>
                    <p className='text-[10px] text-gray-500'>Rejeitados</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. FUNIL DE EFICIÊNCIA */}
      <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-200'>
        <div className='flex items-center gap-2 mb-6 border-b pb-4'>
          <Filter className='text-blue-600' size={24} />
          <div>
            <h2 className='text-xl font-bold text-gray-800'>Funil de Eficiência</h2>
            <p className='text-xs text-gray-500'>Taxa de conversão de Prospects até Contratos Fechados</p>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-5 gap-4 items-center'>
          <div className='md:col-span-1 bg-gray-50 p-4 rounded-xl border border-gray-200 text-center relative'>
            <p className='text-xs font-bold text-gray-500 uppercase'>Entrada Total</p>
            <p className='text-4xl font-bold text-gray-800 my-2'>{funil.totalEntrada}</p>
            <p className='text-xs text-gray-500'>100%</p>
          </div>

          <div className='hidden md:flex items-center justify-center'><ArrowRight className='text-gray-300' size={32} /></div>

          <div className='md:col-span-1 bg-yellow-50 p-4 rounded-xl border border-yellow-200 text-center relative'>
            <p className='text-xs font-bold text-yellow-600 uppercase'>Propostas Enviadas</p>
            <p className='text-4xl font-bold text-yellow-800 my-2'>{funil.qualificadosProposta}</p>
            <p className='text-xs text-yellow-600 font-bold'>{funil.taxaConversaoProposta}%</p>
            {funil.perdaAnalise > 0 && (
              <div className='absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-red-100 px-2 py-1 rounded text-xs'>
                <span className='text-red-700 font-bold'>-{funil.perdaAnalise}</span>
              </div>
            )}
          </div>

          <div className='hidden md:flex items-center justify-center'><ArrowRight className='text-gray-300' size={32} /></div>

          <div className='md:col-span-1 bg-green-50 p-4 rounded-xl border border-green-200 text-center relative'>
            <p className='text-xs font-bold text-green-600 uppercase'>Contratos Fechados</p>
            <p className='text-4xl font-bold text-green-800 my-2'>{funil.fechados}</p>
            <p className='text-xs text-green-600 font-bold'>{funil.taxaConversaoFechamento}%</p>
            {funil.perdaNegociacao > 0 && (
              <div className='absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-red-100 px-2 py-1 rounded text-xs'>
                <span className='text-red-700 font-bold'>-{funil.perdaNegociacao}</span>
              </div>
            )}
          </div>
        </div>

        <div className='mt-8 pt-4 border-t'>
          <p className='text-sm text-gray-600'>
            <span className='font-bold'>Análise:</span> De {funil.totalEntrada} casos que entraram, {funil.qualificadosProposta} geraram propostas ({funil.taxaConversaoProposta}%) 
            e {funil.fechados} foram fechados ({funil.taxaConversaoFechamento}% das propostas).
            {funil.perdaAnalise > 0 && ` Perdidos em análise: ${funil.perdaAnalise}.`}
            {funil.perdaNegociacao > 0 && ` Perdidos em negociação: ${funil.perdaNegociacao}.`}
          </p>
        </div>
      </div>

      {/* 4. VALORES (PERFORMANCE COMERCIAL) */}
      <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-200'>
        <div className='flex items-center gap-2 mb-6 border-b pb-4'>
          <DollarSign className='text-blue-600' size={24} />
          <div>
            <h2 className='text-xl font-bold text-gray-800'>Valores</h2>
            <p className='text-xs text-gray-500'>Desempenho comercial e financeiro</p>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {/* Mês Atual */}
          <div className='bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200'>
            <div className='flex items-center gap-2 mb-4'>
              <CalendarDays className='text-blue-600' size={20} />
              <h3 className='text-sm font-bold text-blue-900 uppercase'>Mês Atual</h3>
            </div>
            <div className='space-y-3'>
              <div>
                <p className='text-xs text-blue-700 font-semibold'>Propostas ({metrics.mes.propQtd})</p>
                <p className='text-lg font-bold text-blue-900'>{formatMoney(metrics.mes.propPL + metrics.mes.propExito)}</p>
                <p className='text-xs text-gray-600'>PL: {formatMoney(metrics.mes.propPL)} | Êxito: {formatMoney(metrics.mes.propExito)}</p>
              </div>
              <div className='pt-2 border-t border-blue-200'>
                <p className='text-xs text-blue-700 font-semibold'>Fechamentos ({metrics.mes.fechQtd})</p>
                <p className='text-lg font-bold text-blue-900'>{formatMoney(metrics.mes.fechPL + metrics.mes.fechExito + metrics.mes.fechMensal)}</p>
                <p className='text-xs text-gray-600'>PL: {formatMoney(metrics.mes.fechPL)} | Êxito: {formatMoney(metrics.mes.fechExito)} | Mensal: {formatMoney(metrics.mes.fechMensal)}</p>
              </div>
            </div>
          </div>

          {/* Em Negociação */}
          <div className='bg-gradient-to-br from-yellow-50 to-yellow-100 p-5 rounded-xl border border-yellow-200'>
            <div className='flex items-center gap-2 mb-4'>
              <TrendingUp className='text-yellow-600' size={20} />
              <h3 className='text-sm font-bold text-yellow-900 uppercase'>Em Negociação</h3>
            </div>
            <div className='space-y-3'>
              <div>
                <p className='text-xs text-yellow-700 font-semibold'>Propostas Ativas ({metrics.geral.propostasAtivas})</p>
                <p className='text-2xl font-bold text-yellow-900'>{formatMoney(totalNegociacao)}</p>
              </div>
              <div className='pt-2 border-t border-yellow-200 space-y-1'>
                <div className='flex justify-between text-xs'>
                  <span className='text-gray-600'>Pro Labore:</span>
                  <span className='font-bold text-gray-700'>{formatMoney(metrics.geral.valorEmNegociacaoPL)}</span>
                </div>
                <div className='flex justify-between text-xs'>
                  <span className='text-gray-600'>Êxito:</span>
                  <span className='font-bold text-gray-700'>{formatMoney(metrics.geral.valorEmNegociacaoExito)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Carteira Total */}
          <div className='bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200'>
            <div className='flex items-center gap-2 mb-4'>
              <Briefcase className='text-green-600' size={20} />
              <h3 className='text-sm font-bold text-green-900 uppercase'>Carteira Total</h3>
            </div>
            <div className='space-y-3'>
              <div>
                <p className='text-xs text-green-700 font-semibold'>Contratos Ativos ({metrics.geral.fechados})</p>
                <p className='text-2xl font-bold text-green-900'>{formatMoney(totalCarteira)}</p>
              </div>
              <div className='pt-2 border-t border-green-200 space-y-1'>
                <div className='flex justify-between text-xs'>
                  <span className='text-gray-600'>Pro Labore:</span>
                  <span className='font-bold text-gray-700'>{formatMoney(metrics.geral.totalFechadoPL)}</span>
                </div>
                <div className='flex justify-between text-xs'>
                  <span className='text-gray-600'>Êxito:</span>
                  <span className='font-bold text-gray-700'>{formatMoney(metrics.geral.totalFechadoExito)}</span>
                </div>
                <div className='flex justify-between text-xs'>
                  <span className='text-gray-600'>Recorrente:</span>
                  <span className='font-bold text-gray-700'>{formatMoney(metrics.geral.receitaRecorrenteAtiva)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. FOTOGRAFIA FINANCEIRA TOTAL */}
      <div className='bg-gradient-to-br from-purple-50 to-indigo-100 p-6 rounded-2xl shadow-lg border-2 border-purple-200'>
        <div className='flex items-center gap-2 mb-6 border-b border-purple-200 pb-4'>
          <Target className='text-purple-600' size={28} />
          <div>
            <h2 className='text-2xl font-bold text-purple-900'>Fotografia Financeira Total</h2>
            <p className='text-sm text-purple-700'>Visão consolidada de todo o pipeline comercial</p>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='bg-white p-6 rounded-xl shadow-sm'>
            <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
              <TrendingUp className='text-yellow-600' size={20} />
              Em Negociação
            </h3>
            <div className='space-y-3'>
              <div className='flex justify-between items-center border-b pb-2'>
                <span className='text-gray-600'>Propostas Ativas:</span>
                <span className='text-xl font-bold text-yellow-700'>{metrics.geral.propostasAtivas}</span>
              </div>
              <div className='flex justify-between items-center border-b pb-2'>
                <span className='text-gray-600'>Valor Total:</span>
                <span className='text-2xl font-bold text-yellow-900'>{formatMoney(totalNegociacao)}</span>
              </div>
              <div className='flex justify-between items-center text-sm'>
                <span className='text-gray-500'>Pro Labore:</span>
                <span className='font-semibold text-gray-700'>{formatMoney(metrics.geral.valorEmNegociacaoPL)}</span>
              </div>
              <div className='flex justify-between items-center text-sm'>
                <span className='text-gray-500'>Êxito:</span>
                <span className='font-semibold text-gray-700'>{formatMoney(metrics.geral.valorEmNegociacaoExito)}</span>
              </div>
            </div>
          </div>

          <div className='bg-white p-6 rounded-xl shadow-sm'>
            <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
              <CheckCircle2 className='text-green-600' size={20} />
              Contratos Fechados
            </h3>
            <div className='space-y-3'>
              <div className='flex justify-between items-center border-b pb-2'>
                <span className='text-gray-600'>Total de Contratos:</span>
                <span className='text-xl font-bold text-green-700'>{metrics.geral.fechados}</span>
              </div>
              <div className='flex justify-between items-center border-b pb-2'>
                <span className='text-gray-600'>Valor Total:</span>
                <span className='text-2xl font-bold text-green-900'>{formatMoney(totalCarteira)}</span>
              </div>
              <div className='flex justify-between items-center text-sm'>
                <span className='text-gray-500'>Pro Labore:</span>
                <span className='font-semibold text-gray-700'>{formatMoney(metrics.geral.totalFechadoPL)}</span>
              </div>
              <div className='flex justify-between items-center text-sm'>
                <span className='text-gray-500'>Êxito:</span>
                <span className='font-semibold text-gray-700'>{formatMoney(metrics.geral.totalFechadoExito)}</span>
              </div>
              <div className='flex justify-between items-center text-sm'>
                <span className='text-gray-500'>Recorrente Mensal:</span>
                <span className='font-semibold text-gray-700'>{formatMoney(metrics.geral.receitaRecorrenteAtiva)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className='mt-6 bg-white p-6 rounded-xl shadow-sm'>
          <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
            <DollarSign className='text-purple-600' size={20} />
            Consolidado Total
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='text-center p-4 bg-purple-50 rounded-lg border border-purple-200'>
              <p className='text-sm text-purple-700 font-semibold mb-1'>Pipeline Total</p>
              <p className='text-3xl font-bold text-purple-900'>{formatMoney(totalNegociacao + totalCarteira)}</p>
            </div>
            <div className='text-center p-4 bg-blue-50 rounded-lg border border-blue-200'>
              <p className='text-sm text-blue-700 font-semibold mb-1'>Contratos Assinados</p>
              <p className='text-3xl font-bold text-blue-900'>{metrics.geral.assinados}</p>
              <p className='text-xs text-gray-600 mt-1'>de {metrics.geral.fechados} fechados</p>
            </div>
            <div className='text-center p-4 bg-orange-50 rounded-lg border border-orange-200'>
              <p className='text-sm text-orange-700 font-semibold mb-1'>Aguardando Assinatura</p>
              <p className='text-3xl font-bold text-orange-900'>{metrics.geral.naoAssinados}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
