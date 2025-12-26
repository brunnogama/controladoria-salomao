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
  AlertCircle,
  FileSignature,
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
  const [ultimosCasos, setUltimosCasos] = useState([])
  const [contratosSemAssinatura, setContratosSemAssinatura] = useState([])
  const [periodoSemana, setPeriodoSemana] = useState({ inicio: '', fim: '' })
  const [dadosRejeicao, setDadosRejeicao] = useState({
    porMotivo: [],
    porIniciativa: []
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      const { data: contratos } = await supabase.from('contratos').select(`
          *,
          cliente:clientes(razao_social, cnpj)
        `).order('created_at', { ascending: false })

      console.log('📊 Dashboard - Contratos carregados:', contratos?.length || 0)
      console.log('📊 Dashboard - Primeiros 3 contratos:', contratos?.slice(0, 3))

      if (!contratos) return

      const hoje = new Date()
      const inicioSemana = new Date(hoje)
      inicioSemana.setDate(hoje.getDate() - hoje.getDay())
      inicioSemana.setHours(0, 0, 0, 0)
      
      const fimSemana = new Date(inicioSemana)
      fimSemana.setDate(inicioSemana.getDate() + 6)
      fimSemana.setHours(23, 59, 59, 999)

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

        const contratoAssinado = c.contrato_assinado === 'sim'

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
        
        // Contar entrada de casos baseado na data do PRIMEIRO STATUS preenchido
        // Prioridade: data_prospect > data_proposta > data_contrato > data_rejeicao > data_probono > created_at
        let dataEntrada = null
        
        if (c.data_prospect) {
          dataEntrada = new Date(c.data_prospect)
        } else if (c.data_proposta) {
          dataEntrada = new Date(c.data_proposta)
        } else if (c.data_contrato) {
          dataEntrada = new Date(c.data_contrato)
        } else if (c.data_rejeicao) {
          dataEntrada = new Date(c.data_rejeicao)
        } else if (c.data_probono) {
          dataEntrada = new Date(c.data_probono)
        } else {
          dataEntrada = new Date(c.created_at) // Fallback
        }
        
        const mesEntrada = dataEntrada.getMonth()
        const anoEntrada = dataEntrada.getFullYear()

        ultimos6Meses.forEach((item) => {
          if (item.mesNumero === mesEntrada && item.anoNumero === anoEntrada) {
            item.prospects++ // Conta entrada do caso no sistema
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
      
      // Definir período da semana
      setPeriodoSemana({
        inicio: inicioSemana.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        fim: fimSemana.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      })
      
      setEvolucaoMensal(ultimos6Meses)
      
      // Preparar últimos 10 casos cadastrados
      const casos10 = contratos.slice(0, 10).map(c => ({
        id: c.id,
        cliente: c.cliente?.razao_social || 'Sem cliente',
        status: c.status,
        data: c.data_prospect || c.created_at,
        numero_hon: c.numero_hon,
        area: c.area,
        numero_proc: c.numero_proc
      }))
      setUltimosCasos(casos10)

      // Processar dados de rejeição
      const rejeitados = contratos.filter(c => c.status?.trim() === 'Rejeitada')
      
      // Contar por motivo
      const motivoCount = {}
      rejeitados.forEach(c => {
        const motivo = c.motivo_rejeicao || 'Não informado'
        motivoCount[motivo] = (motivoCount[motivo] || 0) + 1
      })
      
      const porMotivo = Object.entries(motivoCount).map(([motivo, count]) => ({
        motivo,
        count,
        percentual: rejeitados.length > 0 ? Math.round((count / rejeitados.length) * 100) : 0
      })).sort((a, b) => b.count - a.count)

      // Contar por iniciativa
      const iniciativaCount = {}
      rejeitados.forEach(c => {
        const iniciativa = c.iniciativa_rejeicao || 'Não informado'
        iniciativaCount[iniciativa] = (iniciativaCount[iniciativa] || 0) + 1
      })
      
      const porIniciativa = Object.entries(iniciativaCount).map(([iniciativa, count]) => ({
        iniciativa,
        count,
        percentual: rejeitados.length > 0 ? Math.round((count / rejeitados.length) * 100) : 0
      })).sort((a, b) => b.count - a.count)

      setDadosRejeicao({ porMotivo, porIniciativa })

      // Processar contratos sem assinatura
      const semAssinatura = contratos
        .filter(c => c.status?.trim() === 'Contrato Fechado' && c.contrato_assinado === 'nao')
        .map(c => ({
          id: c.id,
          cliente: c.cliente?.razao_social || 'Sem cliente',
          numero_hon: c.numero_hon || 'Não informado',
          data_contrato: c.data_contrato,
          responsavel: c.responsavel || 'Não informado',
          dias_sem_assinar: c.data_contrato ? Math.floor((new Date() - new Date(c.data_contrato)) / (1000 * 60 * 60 * 24)) : 0
        }))
        .sort((a, b) => b.dias_sem_assinar - a.dias_sem_assinar)
      
      setContratosSemAssinatura(semAssinatura)
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
            <p className='text-xs text-gray-500'>
              Resultados do período {periodoSemana.inicio} a {periodoSemana.fim}
            </p>
          </div>
        </div>

        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <div className='bg-blue-50 p-4 rounded-xl border border-blue-100'>
            <p className='text-xs font-bold text-blue-600 uppercase mb-1'>Novas Análises</p>
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
          <p className='text-sm text-gray-600 mb-3'>
            <span className='font-bold'>Resumo:</span> Esta semana {metrics.semana.novos === 1 ? 'entrou 1 novo caso' : `entraram ${metrics.semana.novos} novos casos`}{metrics.semana.propQtd > 0 && `, ${metrics.semana.propQtd === 1 ? 'foi enviada 1 proposta' : `foram enviadas ${metrics.semana.propQtd} propostas`}`}{metrics.semana.fechQtd > 0 && `, ${metrics.semana.fechQtd} ${metrics.semana.fechQtd === 1 ? 'contrato fechado' : 'contratos fechados'}`}{metrics.semana.rejeitados > 0 && ` e ${metrics.semana.rejeitados} ${metrics.semana.rejeitados === 1 ? 'rejeitado' : 'rejeitados'}`}.
          </p>
          
          {/* Resumo Financeiro */}
          <div className='grid grid-cols-2 gap-4 mt-4'>
            <div className='bg-yellow-50 p-3 rounded-lg border border-yellow-200'>
              <p className='text-xs font-bold text-yellow-700 mb-1'>💰 Propostas Enviadas</p>
              <p className='text-lg font-bold text-yellow-900'>{formatMoney(metrics.semana.propPL + metrics.semana.propExito)}</p>
              <div className='flex justify-between text-[10px] text-gray-600 mt-1'>
                <span>PL: {formatMoney(metrics.semana.propPL)}</span>
                <span>Êxito: {formatMoney(metrics.semana.propExito)}</span>
              </div>
            </div>
            
            <div className='bg-green-50 p-3 rounded-lg border border-green-200'>
              <p className='text-xs font-bold text-green-700 mb-1'>💰 Contratos Fechados</p>
              <p className='text-lg font-bold text-green-900'>{formatMoney(metrics.semana.fechPL + metrics.semana.fechExito + metrics.semana.fechMensal)}</p>
              <div className='flex justify-between text-[10px] text-gray-600 mt-1'>
                <span>PL: {formatMoney(metrics.semana.fechPL)}</span>
                <span>Êxito: {formatMoney(metrics.semana.fechExito)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* ANÁLISE GERENCIAL - Resumo da Semana */}
        <div className='mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 p-5 rounded-r-xl'>
          <h4 className='text-sm font-black text-blue-900 uppercase mb-3 flex items-center gap-2'>
            <TrendingUp size={18} className='text-blue-600' />
            Análise Gerencial
          </h4>
          <div className='space-y-3 text-sm text-blue-900'>
            {/* Taxa de Conversão Semanal */}
            <div className='flex items-start gap-2'>
              <span className='text-blue-600 font-bold'>📊</span>
              <div className='flex-1'>
                <strong>Taxa de Conversão:</strong> {metrics.semana.novos > 0 ? (
                  <>
                    De <strong>{metrics.semana.novos} {metrics.semana.novos === 1 ? 'caso novo' : 'casos novos'}</strong>, 
                    {metrics.semana.propQtd > 0 && ` ${metrics.semana.propQtd} ${metrics.semana.propQtd === 1 ? 'virou proposta' : 'viraram propostas'} (${((metrics.semana.propQtd / metrics.semana.novos) * 100).toFixed(0)}%)`}
                    {metrics.semana.fechQtd > 0 && ` e ${metrics.semana.fechQtd} ${metrics.semana.fechQtd === 1 ? 'foi fechado' : 'foram fechados'} (${((metrics.semana.fechQtd / metrics.semana.novos) * 100).toFixed(0)}%)`}.
                  </>
                ) : 'Sem novos casos na semana.'}
              </div>
            </div>
            
            {/* Valor Médio de Honorários */}
            {metrics.semana.fechQtd > 0 && (
              <div className='flex items-start gap-2'>
                <span className='text-green-600 font-bold'>💰</span>
                <div className='flex-1'>
                  <strong>Valor Médio de Honorários:</strong> {formatMoney((metrics.semana.fechPL + metrics.semana.fechExito + metrics.semana.fechMensal) / metrics.semana.fechQtd)} por contrato. 
                  {metrics.semana.fechPL > 0 && ` Pró-labore médio: ${formatMoney(metrics.semana.fechPL / metrics.semana.fechQtd)}.`}
                </div>
              </div>
            )}
            
            {/* Perda de Oportunidades */}
            {metrics.semana.rejeitados > 0 && (
              <div className='flex items-start gap-2'>
                <span className='text-red-600 font-bold'>⚠️</span>
                <div className='flex-1'>
                  <strong>Atenção:</strong> {metrics.semana.rejeitados} {metrics.semana.rejeitados === 1 ? 'caso rejeitado' : 'casos rejeitados'} esta semana ({metrics.semana.novos > 0 ? ((metrics.semana.rejeitados / metrics.semana.novos) * 100).toFixed(0) : '0'}% dos casos novos).
                </div>
              </div>
            )}
            
            {/* Taxa de Efetivação */}
            {metrics.semana.propQtd > 0 && metrics.semana.fechQtd > 0 && (
              <div className='flex items-start gap-2'>
                <span className='text-purple-600 font-bold'>⚡</span>
                <div className='flex-1'>
                  <strong>Taxa de Efetivação:</strong> {((metrics.semana.fechQtd / metrics.semana.propQtd) * 100).toFixed(0)}% das propostas enviadas foram convertidas em contratos na mesma semana. 
                  {((metrics.semana.fechQtd / metrics.semana.propQtd) * 100) >= 50 ? ' ✅ Excelente taxa de fechamento!' : ' Manter acompanhamento próximo das propostas pendentes.'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. DISTRIBUIÇÃO DA CARTEIRA + ENTRADA DE CASOS + ÚLTIMOS 10 CASOS (GRID) */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Distribuição da Carteira */}
        <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-200'>
          <div className='flex items-center gap-2 mb-6 border-b pb-4'>
            <PieChart className='text-blue-600' size={24} />
            <div>
              <h2 className='text-xl font-bold text-gray-800'>Distribuição da Carteira</h2>
              <p className='text-xs text-gray-500'>Status atual de todos os casos</p>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-3'>
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

          {/* Gráfico de Colunas - Entrada de Casos Novos Últimos 6 Meses */}
          <div className='mt-4 pt-4 border-t border-gray-200'>
            <h3 className='text-xs font-bold text-purple-700 mb-3 uppercase tracking-wide'>Entrada de Casos Novos (Últimos 6 Meses)</h3>
            <div className='relative h-32 flex items-end justify-between gap-1 px-2'>
              {evolucaoMensal.map((item, i) => {
                const total = item.prospects
                const maxTotal = Math.max(...evolucaoMensal.map(m => m.prospects), 1)
                const altura = total > 0 ? (total / maxTotal) * 100 : 0
                
                return (
                  <div key={i} className='flex-1 flex flex-col items-center justify-end' style={{ height: '100%' }}>
                    {/* Rótulo do valor */}
                    {total > 0 && (
                      <span className='text-[11px] font-bold text-purple-900 mb-1'>
                        {total}
                      </span>
                    )}
                    
                    {/* Coluna */}
                    <div 
                      className='w-full rounded-t-lg transition-all duration-300 hover:opacity-80 relative'
                      style={{
                        height: `${altura}%`,
                        minHeight: total > 0 ? '8px' : '0px',
                        background: total > 0 
                          ? 'linear-gradient(to top, #9333ea, #c084fc)' 
                          : 'transparent'
                      }}
                    >
                      {total > 0 && (
                        <div className='absolute inset-0 bg-white/20 rounded-t-lg'></div>
                      )}
                    </div>
                    
                    {/* Label do mês */}
                    <span className='text-[9px] text-purple-600 font-semibold mt-2'>
                      {item.mes}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* ANÁLISE GERENCIAL - Distribuição da Carteira */}
          <div className='mt-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-600 p-4 rounded-r-xl'>
            <h4 className='text-xs font-black text-purple-900 uppercase mb-2 flex items-center gap-2'>
              <PieChart size={16} className='text-purple-600' />
              Análise da Carteira Ativa
            </h4>
            <div className='space-y-2 text-xs text-purple-900'>
              {/* Distribuição por Status */}
              <div className='flex items-start gap-2'>
                <span className='text-purple-600 font-bold'>📌</span>
                <div className='flex-1'>
                  <strong>Distribuição:</strong> {((metrics.geral.emAnalise / metrics.geral.totalCasos) * 100).toFixed(0)}% em análise, 
                  {((metrics.geral.propostasAtivas / metrics.geral.totalCasos) * 100).toFixed(0)}% em negociação, 
                  {((metrics.geral.fechados / metrics.geral.totalCasos) * 100).toFixed(0)}% fechados.
                  {metrics.geral.emAnalise > metrics.geral.fechados && ' ⚠️ Mais casos em análise do que fechados - oportunidade de acelerar qualificação.'}
                </div>
              </div>
              
              {/* Taxa de Rejeição */}
              {metrics.geral.rejeitados > 0 && (
                <div className='flex items-start gap-2'>
                  <span className='text-red-600 font-bold'>⚠️</span>
                  <div className='flex-1'>
                    <strong>Taxa de Rejeição:</strong> {((metrics.geral.rejeitados / metrics.geral.totalCasos) * 100).toFixed(0)}% dos casos foram rejeitados ({metrics.geral.rejeitados} de {metrics.geral.totalCasos}).
                    {((metrics.geral.rejeitados / metrics.geral.totalCasos) * 100) > 30 && ' Alta taxa - revisar critérios de triagem inicial.'}
                  </div>
                </div>
              )}
              
              {/* Proporção Propostas/Contratos */}
              <div className='flex items-start gap-2'>
                <span className='text-green-600 font-bold'>✅</span>
                <div className='flex-1'>
                  <strong>Proporção Propostas/Contratos:</strong> Para cada {metrics.geral.fechados} {metrics.geral.fechados === 1 ? 'contrato ativo' : 'contratos ativos'}, 
                  há {metrics.geral.propostasAtivas} {metrics.geral.propostasAtivas === 1 ? 'proposta pendente' : 'propostas pendentes'} (proporção de {metrics.geral.fechados > 0 ? (metrics.geral.propostasAtivas / metrics.geral.fechados).toFixed(1) : '0'}:1).
                  {metrics.geral.fechados > 0 && (metrics.geral.propostasAtivas / metrics.geral.fechados) < 0.3 && ' ⚠️ Baixo volume de propostas pendentes - intensificar captação.'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Entrada de Casos (Últimos 6 Meses) - SEM SCROLL */}
        <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-200'>
          <div className='flex items-center gap-2 mb-4 border-b pb-3'>
            <BarChart3 className='text-blue-600' size={20} />
            <div>
              <h2 className='text-lg font-bold text-gray-800'>Entrada de Casos (Últimos 6 Meses)</h2>
              <p className='text-[10px] text-gray-500'>Evolução por fase</p>
            </div>
          </div>

          <div className='space-y-2'>
            {evolucaoMensal.map((item, index) => (
              <div key={index} className='border-b border-gray-100 pb-2 last:border-0'>
                <div className='flex items-center justify-between mb-1'>
                  <span className='text-xs font-bold text-gray-700'>{item.mes}</span>
                  <span className='text-[10px] text-gray-500'>Total: {item.prospects}</span>
                </div>
                <div className='grid grid-cols-4 gap-1.5 text-xs'>
                  <div className='bg-blue-50 px-1.5 py-1 rounded text-center'>
                    <p className='font-semibold text-blue-700 text-xs'>{item.prospects}</p>
                    <p className='text-[9px] text-gray-500'>Prosp</p>
                  </div>
                  <div className='bg-yellow-50 px-1.5 py-1 rounded text-center'>
                    <p className='font-semibold text-yellow-700 text-xs'>{item.propostas}</p>
                    <p className='text-[9px] text-gray-500'>Prop</p>
                  </div>
                  <div className='bg-green-50 px-1.5 py-1 rounded text-center'>
                    <p className='font-semibold text-green-700 text-xs'>{item.fechados}</p>
                    <p className='text-[9px] text-gray-500'>Fech</p>
                  </div>
                  <div className='bg-red-50 px-1.5 py-1 rounded text-center'>
                    <p className='font-semibold text-red-700 text-xs'>{item.rejeitados}</p>
                    <p className='text-[9px] text-gray-500'>Rej</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* INSIGHTS - Entrada de Casos */}
          {evolucaoMensal.length > 0 && (
          <div className='mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 p-4 rounded-r-xl'>
            <h4 className='text-xs font-black text-blue-900 uppercase mb-3 flex items-center gap-2'>
              <TrendingUp size={16} className='text-blue-600' />
              Análise de Tendência
            </h4>
            <div className='space-y-2 text-xs text-blue-900'>
              {/* Média Mensal */}
              <div className='flex items-start gap-2'>
                <span className='text-blue-600 font-bold'>📊</span>
                <div className='flex-1'>
                  <strong>Média Mensal (6 meses):</strong> {(evolucaoMensal.reduce((acc, m) => acc + m.prospects, 0) / evolucaoMensal.length).toFixed(1)} novos casos, 
                  {' '}{(evolucaoMensal.reduce((acc, m) => acc + m.propostas, 0) / evolucaoMensal.length).toFixed(1)} propostas, 
                  {' '}{(evolucaoMensal.reduce((acc, m) => acc + m.fechados, 0) / evolucaoMensal.length).toFixed(1)} fechamentos.
                </div>
              </div>
              
              {/* Tendência */}
              {evolucaoMensal.length >= 3 && (() => {
                const ultimos3 = evolucaoMensal.slice(-3);
                const primeiros3 = evolucaoMensal.slice(0, 3);
                const mediaRecente = ultimos3.reduce((acc, m) => acc + m.prospects, 0) / 3;
                const mediaAnterior = primeiros3.reduce((acc, m) => acc + m.prospects, 0) / 3;
                
                // Se não há dados nos primeiros 3 meses, não calcula tendência
                if (mediaAnterior === 0) {
                  if (mediaRecente > 0) {
                    return (
                      <div className='flex items-start gap-2'>
                        <span className='font-bold text-blue-600'>ℹ️</span>
                        <div className='flex-1'>
                          <strong>Tendência (3 meses):</strong> Primeiros meses sem dados. Entrada atual de {mediaRecente.toFixed(1)} casos/mês.
                        </div>
                      </div>
                    );
                  }
                  return null; // Sem dados em nenhum período
                }
                
                const variacao = ((mediaRecente - mediaAnterior) / mediaAnterior) * 100;
                
                return (
                  <div className='flex items-start gap-2'>
                    <span className={`font-bold ${variacao > 0 ? 'text-green-600' : variacao < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      {variacao > 0 ? '📈' : variacao < 0 ? '📉' : '➡️'}
                    </span>
                    <div className='flex-1'>
                      <strong>Tendência (3 meses):</strong> {variacao > 0 ? 'Crescimento' : variacao < 0 ? 'Queda' : 'Estável'} de <strong>{Math.abs(variacao).toFixed(0)}%</strong> na entrada de casos.
                      {' '}{variacao > 20 && '🚀 Crescimento expressivo da demanda!'}
                      {variacao < -20 && '⚠️ Atenção: queda significativa.'}
                      {Math.abs(variacao) < 5 && ' ➡️ Entrada estável.'}
                    </div>
                  </div>
                );
              })()}
              
              {/* Taxa de Conversão Média */}
              {(() => {
                const totalProspects = evolucaoMensal.reduce((acc, m) => acc + m.prospects, 0);
                const totalFechados = evolucaoMensal.reduce((acc, m) => acc + m.fechados, 0);
                const taxaConversao = totalProspects > 0 ? (totalFechados / totalProspects) * 100 : 0;
                
                return (
                  <div className='flex items-start gap-2'>
                    <span className='text-purple-600 font-bold'>🎯</span>
                    <div className='flex-1'>
                      <strong>Taxa de Conversão (6 meses):</strong> {taxaConversao.toFixed(0)}% dos casos prospectados foram fechados.
                      {taxaConversao >= 40 && ' ✅ Excelente taxa de conversão!'}
                      {taxaConversao < 20 && ' ⚠️ Taxa baixa - revisar qualificação inicial.'}
                    </div>
                  </div>
                );
              })()}
              
              {/* Melhor e Pior Mês */}
              {(() => {
                const melhorMes = evolucaoMensal.reduce((prev, curr) => prev.fechados > curr.fechados ? prev : curr);
                const piorMes = evolucaoMensal.reduce((prev, curr) => prev.fechados < curr.fechados ? prev : curr);
                
                return (
                  <div className='flex items-start gap-2'>
                    <span className='text-yellow-600 font-bold'>⭐</span>
                    <div className='flex-1'>
                      <strong>Resultado Mensal:</strong> Melhor mês foi <strong>{melhorMes.mes}</strong> ({melhorMes.fechados} fechamentos).
                      {melhorMes.mes !== piorMes.mes && ` Menor foi ${piorMes.mes} (${piorMes.fechados} fechamentos).`}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
          )}
        </div>

        {/* Últimos Casos Cadastrados - SEM SCROLL */}
        <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-200'>
          <div className='flex items-center gap-2 mb-4 border-b pb-3'>
            <History className='text-blue-600' size={20} />
            <div>
              <h2 className='text-lg font-bold text-gray-800'>Últimos Casos</h2>
              <p className='text-[10px] text-gray-500'>Casos mais recentes</p>
            </div>
          </div>

          {ultimosCasos.length === 0 ? (
            <div className='text-center py-8 text-gray-400'>
              <FileText size={48} className='mx-auto mb-2 opacity-20' />
              <p className='text-sm'>Nenhum caso cadastrado</p>
            </div>
          ) : (
            <div className='space-y-2'>
              {ultimosCasos.slice(0, 10).map((caso, index) => {
                const statusColors = {
                  'Sob Análise': 'bg-orange-100 text-orange-700 border-orange-200',
                  'Proposta Enviada': 'bg-yellow-100 text-yellow-700 border-yellow-200',
                  'Contrato Fechado': 'bg-green-100 text-green-700 border-green-200',
                  'Rejeitada': 'bg-red-100 text-red-700 border-red-200',
                  'Probono': 'bg-blue-100 text-blue-700 border-blue-200',
                }
                
                const dataFormatada = new Date(caso.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                const statusClass = statusColors[caso.status] || 'bg-gray-100 text-gray-700 border-gray-200'
                
                return (
                  <div key={caso.id} className={`p-2 rounded-lg border ${index === 0 ? 'bg-blue-50 border-blue-300' : statusClass}`}>
                    <div className='flex items-center justify-between gap-2'>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-1.5 mb-0.5'>
                          {index === 0 && <span className='text-[9px] bg-blue-600 text-white px-1 py-0.5 rounded font-bold'>NOVO</span>}
                          <p className='text-xs font-bold text-gray-800 truncate leading-tight'>{caso.cliente}</p>
                        </div>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${statusColors[caso.status] || 'bg-gray-100 text-gray-700'}`}>
                          {caso.status}
                        </span>
                      </div>
                      <span className='text-[10px] text-gray-600 font-semibold whitespace-nowrap'>{dataFormatada}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          
          {/* INSIGHTS - Últimos Casos */}
          {ultimosCasos.length > 0 && (
            <div className='mt-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-600 p-4 rounded-r-xl'>
              <h4 className='text-xs font-black text-indigo-900 uppercase mb-3 flex items-center gap-2'>
                <BarChart3 size={16} className='text-indigo-600' />
                Distribuição dos Últimos 10 Casos
              </h4>
              <div className='space-y-2 text-xs text-indigo-900'>
                {/* Distribuição por Status */}
                {(() => {
                  const statusCount = ultimosCasos.slice(0, 10).reduce((acc, caso) => {
                    acc[caso.status] = (acc[caso.status] || 0) + 1;
                    return acc;
                  }, {});
                  
                  const statusMaisComum = Object.entries(statusCount).sort((a, b) => b[1] - a[1])[0];
                  
                  return (
                    <div className='flex items-start gap-2'>
                      <span className='text-indigo-600 font-bold'>📊</span>
                      <div className='flex-1'>
                        <strong>Por Status:</strong> {Object.entries(statusCount).map(([status, count]) => 
                          `${count} ${status}`
                        ).join(', ')}.
                        {statusMaisComum && <> Predominância em <strong>{statusMaisComum[0]}</strong>.</>}
                      </div>
                    </div>
                  );
                })()}
                
                {/* Distribuição por Área */}
                {(() => {
                  const casosComArea = ultimosCasos.slice(0, 10).filter(c => c.area);
                  if (casosComArea.length === 0) return null;
                  
                  const areaCount = casosComArea.reduce((acc, caso) => {
                    acc[caso.area] = (acc[caso.area] || 0) + 1;
                    return acc;
                  }, {});
                  
                  const areaMaisComum = Object.entries(areaCount).sort((a, b) => b[1] - a[1])[0];
                  
                  return (
                    <div className='flex items-start gap-2'>
                      <span className='text-purple-600 font-bold'>⚖️</span>
                      <div className='flex-1'>
                        <strong>Por Área:</strong> {Object.entries(areaCount).map(([area, count]) => 
                          `${count} ${area}`
                        ).join(', ')}.
                        {areaMaisComum && areaMaisComum[1] > 1 && <> Concentração em <strong>{areaMaisComum[0]}</strong>.</>}
                      </div>
                    </div>
                  );
                })()}
                
                {/* Distribuição por Número de Processo (TJ/UF) */}
                {(() => {
                  const casosComProcesso = ultimosCasos.slice(0, 10).filter(c => c.numero_proc);
                  if (casosComProcesso.length === 0) return null;
                  
                  // Extrair TJ da numeração (formato: NNNNNNN-DD.AAAA.J.TR.OOOO)
                  const tjCount = casosComProcesso.reduce((acc, caso) => {
                    const match = caso.numero_proc?.match(/\.(\d)\.(\d{2})\./);
                    if (match) {
                      const segmento = match[1]; // J (Justiça)
                      const tribunal = match[2]; // TR (Tribunal)
                      
                      // Mapear código para nome do TJ
                      const tribunalMap = {
                        '01': 'TJAC', '02': 'TJAL', '03': 'TJAP', '04': 'TJAM',
                        '05': 'TJBA', '06': 'TJCE', '07': 'TJDF', '08': 'TJES',
                        '09': 'TJGO', '10': 'TJMA', '11': 'TJMT', '12': 'TJMS',
                        '13': 'TJMG', '14': 'TJPA', '15': 'TJPB', '16': 'TJPR',
                        '17': 'TJPE', '18': 'TJPI', '19': 'TJRJ', '20': 'TJRN',
                        '21': 'TJRS', '22': 'TJRO', '23': 'TJRR', '24': 'TJSC',
                        '25': 'TJSP', '26': 'TJSE', '27': 'TJTO'
                      };
                      
                      const tjNome = tribunalMap[tribunal] || `TJ-${tribunal}`;
                      acc[tjNome] = (acc[tjNome] || 0) + 1;
                    }
                    return acc;
                  }, {});
                  
                  if (Object.keys(tjCount).length === 0) return null;
                  
                  const tjMaisComum = Object.entries(tjCount).sort((a, b) => b[1] - a[1])[0];
                  
                  return (
                    <div className='flex items-start gap-2'>
                      <span className='text-green-600 font-bold'>🏛️</span>
                      <div className='flex-1'>
                        <strong>Por Tribunal:</strong> {Object.entries(tjCount).map(([tj, count]) => 
                          `${count} ${tj}`
                        ).join(', ')}.
                        {tjMaisComum && tjMaisComum[1] > 1 && <> Maior volume em <strong>{tjMaisComum[0]}</strong>.</>}
                      </div>
                    </div>
                  );
                })()}
                
                {/* Velocidade de Entrada */}
                {ultimosCasos.length >= 2 && (() => {
                  const caso1 = new Date(ultimosCasos[0].data);
                  const caso2 = new Date(ultimosCasos[1].data);
                  const diffDias = Math.abs((caso1 - caso2) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div className='flex items-start gap-2'>
                      <span className='text-blue-600 font-bold'>⏱️</span>
                      <div className='flex-1'>
                        <strong>Ritmo de Entrada:</strong> Últimos 2 casos cadastrados com {diffDias.toFixed(0)} dia(s) de intervalo.
                        {diffDias < 1 && ' 🚀 Alta frequência!'}
                        {diffDias > 7 && ' ⚠️ Ritmo mais lento que o habitual.'}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. FLUXO DE CASOS */}
      <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-200'>
        <div className='flex items-center gap-2 mb-6 border-b pb-4'>
          <Filter className='text-blue-600' size={24} />
          <div>
            <h2 className='text-xl font-bold text-gray-800'>Fluxo de Casos</h2>
            <p className='text-xs text-gray-500'>Da captação ao contrato fechado</p>
          </div>
        </div>

        <div className='flex flex-col md:flex-row items-center justify-center gap-3'>
          {/* Entrada Total */}
          <div className='bg-gray-50 p-4 rounded-xl border border-gray-200 text-center w-full md:w-auto md:min-w-[140px]'>
            <p className='text-[10px] font-bold text-gray-500 uppercase mb-1'>Entrada Total</p>
            <p className='text-3xl font-bold text-gray-800'>{funil.totalEntrada}</p>
            <p className='text-[10px] text-gray-500 mt-1'>100%</p>
          </div>

          <ArrowRight className='hidden md:block text-gray-300' size={24} />

          {/* Propostas Enviadas */}
          <div className='bg-yellow-50 p-4 rounded-xl border border-yellow-200 text-center w-full md:w-auto md:min-w-[140px]'>
            <p className='text-[10px] font-bold text-yellow-600 uppercase mb-1'>Propostas</p>
            <p className='text-3xl font-bold text-yellow-800'>{funil.qualificadosProposta}</p>
            <p className='text-[10px] text-yellow-600 font-bold mt-1'>{funil.taxaConversaoProposta}%</p>
          </div>

          <ArrowRight className='hidden md:block text-gray-300' size={24} />

          {/* Contratos Fechados */}
          <div className='bg-green-50 p-4 rounded-xl border border-green-200 text-center w-full md:w-auto md:min-w-[140px]'>
            <p className='text-[10px] font-bold text-green-600 uppercase mb-1'>Fechados</p>
            <p className='text-3xl font-bold text-green-800'>{funil.fechados}</p>
            <p className='text-[10px] text-green-600 font-bold mt-1'>{funil.taxaConversaoFechamento}%</p>
          </div>

          <ArrowRight className='hidden md:block text-gray-300' size={24} />

          {/* Total Rejeitados */}
          <div className='bg-red-50 p-4 rounded-xl border border-red-200 text-center w-full md:w-auto md:min-w-[140px]'>
            <p className='text-[10px] font-bold text-red-600 uppercase mb-1'>Rejeitados</p>
            <p className='text-3xl font-bold text-red-800'>{metrics.geral.rejeitados}</p>
            <p className='text-[10px] text-red-600 font-bold mt-1'>
              {funil.totalEntrada > 0 ? Math.round((metrics.geral.rejeitados / funil.totalEntrada) * 100) : 0}%
            </p>
          </div>
        </div>

        <div className='mt-6 pt-4 border-t bg-gray-50 rounded-lg p-4'>
          <p className='text-sm text-gray-700'>
            <span className='font-bold text-blue-700'>Resumo:</span> De {funil.totalEntrada} {funil.totalEntrada === 1 ? 'caso' : 'casos'}, {funil.qualificadosProposta} {funil.qualificadosProposta === 1 ? 'virou proposta' : 'viraram propostas'} ({funil.taxaConversaoProposta}%), {funil.fechados} {funil.fechados === 1 ? 'foi fechado' : 'foram fechados'} ({funil.taxaConversaoFechamento}% das propostas) e {metrics.geral.rejeitados} {metrics.geral.rejeitados === 1 ? 'foi rejeitado' : 'foram rejeitados'}.
            {funil.perdaAnalise > 0 && ` ${funil.perdaAnalise} ${funil.perdaAnalise === 1 ? 'rejeitado' : 'rejeitados'} antes da proposta.`}
            {funil.perdaNegociacao > 0 && ` ${funil.perdaNegociacao} ${funil.perdaNegociacao === 1 ? 'rejeitado' : 'rejeitados'} após proposta.`}
          </p>
        </div>
      </div>

      {/* 4. VALORES (ANÁLISE FINANCEIRA) */}
      <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-200'>
        <div className='flex items-center gap-2 mb-6 border-b pb-4'>
          <DollarSign className='text-blue-600' size={24} />
          <div>
            <h2 className='text-xl font-bold text-gray-800'>Valores</h2>
            <p className='text-xs text-gray-500'>Análise financeira da carteira</p>
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
                <p className='text-xs text-blue-700 font-semibold'>Fechados ({metrics.mes.fechQtd})</p>
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
        
        {/* ANÁLISE GERENCIAL - Valores */}
        <div className='mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-600 p-5 rounded-r-xl'>
          <h4 className='text-sm font-black text-green-900 uppercase mb-3 flex items-center gap-2'>
            <DollarSign size={18} className='text-green-600' />
            Análise Financeira
          </h4>
          <div className='space-y-3 text-sm text-green-900'>
            {/* Visão Consolidada */}
            <div className='flex items-start gap-2'>
              <span className='text-green-600 font-bold'>💼</span>
              <div className='flex-1'>
                <strong>Visão Consolidada:</strong> {formatMoney(totalNegociacao)} em propostas ativas + {formatMoney(totalCarteira)} em contratos vigentes = <strong>{formatMoney(totalNegociacao + totalCarteira)} no total</strong>.
              </div>
            </div>
            
            {/* Grau de Concretização */}
            {totalNegociacao > 0 && totalCarteira > 0 && (
              <div className='flex items-start gap-2'>
                <span className='text-blue-600 font-bold'>📈</span>
                <div className='flex-1'>
                  <strong>Grau de Concretização:</strong> {((totalCarteira / (totalNegociacao + totalCarteira)) * 100).toFixed(0)}% já convertidos em contratos assinados. 
                  {metrics.geral.propostasAtivas > 0 && ` Há ${metrics.geral.propostasAtivas} ${metrics.geral.propostasAtivas === 1 ? 'proposta aguardando decisão' : 'propostas aguardando decisão'}.`}
                </div>
              </div>
            )}
            
            {/* Composição da Receita */}
            {metrics.geral.totalFechadoPL > 0 && (
              <div className='flex items-start gap-2'>
                <span className='text-purple-600 font-bold'>📊</span>
                <div className='flex-1'>
                  <strong>Composição da Carteira:</strong> {((metrics.geral.totalFechadoPL / totalCarteira) * 100).toFixed(0)}% em Pró-labore (recorrente/previsível), 
                  {((metrics.geral.totalFechadoExito / totalCarteira) * 100).toFixed(0)}% em Êxito (condicional), 
                  {((metrics.geral.receitaRecorrenteAtiva / totalCarteira) * 100).toFixed(0)}% em Recorrente.
                </div>
              </div>
            )}
            
            {/* Receita Recorrente */}
            {metrics.geral.receitaRecorrenteAtiva > 0 && (
              <div className='flex items-start gap-2'>
                <span className='text-green-600 font-bold'>♻️</span>
                <div className='flex-1'>
                  <strong>Receita Previsível Mensal:</strong> {formatMoney(metrics.geral.receitaRecorrenteAtiva)} garantidos por mês em contratos recorrentes. 
                  Base sólida para planejamento financeiro.
                </div>
              </div>
            )}
            
            {/* Oportunidade Mensal */}
            {metrics.mes.propPL > 0 && metrics.mes.fechPL > 0 && (
              <div className='flex items-start gap-2'>
                <span className='text-yellow-600 font-bold'>⚡</span>
                <div className='flex-1'>
                  <strong>Performance do Mês:</strong> De {formatMoney(metrics.mes.propPL + metrics.mes.propExito)} em propostas, 
                  já foram convertidos {formatMoney(metrics.mes.fechPL + metrics.mes.fechExito + metrics.mes.fechMensal)} ({((metrics.mes.fechPL + metrics.mes.fechExito + metrics.mes.fechMensal) / (metrics.mes.propPL + metrics.mes.propExito) * 100).toFixed(0)}% de realização).
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. FOTOGRAFIA FINANCEIRA TOTAL */}
      <div className='bg-gradient-to-br from-purple-50 to-indigo-100 p-6 rounded-2xl shadow-lg border-2 border-purple-200'>
        <div className='flex items-center gap-2 mb-6 border-b border-purple-200 pb-4'>
          <Target className='text-purple-600' size={28} />
          <div>
            <h2 className='text-2xl font-bold text-purple-900'>Fotografia Financeira Total</h2>
            <p className='text-sm text-purple-700'>Panorama completo de honorários e contratos</p>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Card Em Negociação */}
          <div className='bg-white p-6 rounded-xl shadow-sm'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-bold text-gray-800 flex items-center gap-2'>
                <TrendingUp className='text-yellow-600' size={20} />
                Em Negociação
              </h3>
              <div className='text-right'>
                <p className='text-xs text-gray-500 mb-1'>Total (PL + Êxito)</p>
                <p className='text-2xl font-bold text-yellow-900'>{formatMoney(totalNegociacao)}</p>
              </div>
            </div>
            <div className='space-y-3'>
              <div className='flex justify-between items-center border-b pb-2'>
                <span className='text-gray-600'>Propostas Ativas:</span>
                <span className='text-xl font-bold text-yellow-700'>{metrics.geral.propostasAtivas}</span>
              </div>
              <div className='flex justify-between items-center text-sm'>
                <span className='text-gray-500'>Pro Labore:</span>
                <span className='font-semibold text-gray-700'>{formatMoney(metrics.geral.valorEmNegociacaoPL)}</span>
              </div>
              <div className='flex justify-between items-center text-sm'>
                <span className='text-gray-500'>Êxito:</span>
                <span className='font-semibold text-gray-700'>{formatMoney(metrics.geral.valorEmNegociacaoExito)}</span>
              </div>
              <div className='flex justify-between items-center text-sm'>
                <span className='text-gray-500'>Recorrente Mensal:</span>
                <span className='font-semibold text-gray-700'>R$ 0,00</span>
              </div>
            </div>
          </div>

          {/* Card Contratos Fechados */}
          <div className='bg-white p-6 rounded-xl shadow-sm'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-bold text-gray-800 flex items-center gap-2'>
                <CheckCircle2 className='text-green-600' size={20} />
                Contratos Fechados
              </h3>
              <div className='text-right'>
                <p className='text-xs text-gray-500 mb-1'>Total (PL + Êxito)</p>
                <p className='text-2xl font-bold text-green-900'>{formatMoney(metrics.geral.totalFechadoPL + metrics.geral.totalFechadoExito)}</p>
              </div>
            </div>
            <div className='space-y-3'>
              <div className='flex justify-between items-center border-b pb-2'>
                <span className='text-gray-600'>Total de Contratos:</span>
                <span className='text-xl font-bold text-green-700'>{metrics.geral.fechados}</span>
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
        
        {/* ANÁLISE GERENCIAL - Fotografia Financeira */}
        <div className='mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-600 p-5 rounded-r-xl'>
          <h4 className='text-sm font-black text-indigo-900 uppercase mb-3 flex items-center gap-2'>
            <Target size={18} className='text-indigo-600' />
            Visão Estratégica
          </h4>
          <div className='space-y-3 text-sm text-indigo-900'>
            {/* Cenário de Crescimento */}
            <div className='flex items-start gap-2'>
              <span className='text-indigo-600 font-bold'>🎯</span>
              <div className='flex-1'>
                <strong>Cenário de Crescimento:</strong> {formatMoney(totalNegociacao + totalCarteira)} considerando propostas e contratos. 
                Se todas as propostas forem aprovadas, a carteira cresceria de {formatMoney(totalCarteira)} para <strong>{formatMoney(totalNegociacao + totalCarteira)}</strong> (expansão de {totalCarteira > 0 ? ((totalNegociacao / totalCarteira) * 100).toFixed(0) : '0'}%).
              </div>
            </div>
            
            {/* Distribuição de Receita */}
            {metrics.geral.totalFechadoExito > 0 && metrics.geral.totalFechadoPL > 0 && (
              <div className='flex items-start gap-2'>
                <span className='text-orange-600 font-bold'>⚖️</span>
                <div className='flex-1'>
                  <strong>Distribuição de Receita:</strong> {((metrics.geral.totalFechadoPL / totalCarteira) * 100).toFixed(0)}% da carteira é previsível (Pró-labore fixo), 
                  {((metrics.geral.totalFechadoExito / totalCarteira) * 100).toFixed(0)}% é condicional (Êxito). 
                  {((metrics.geral.totalFechadoExito / totalCarteira) * 100) > 60 && ' ⚠️ Alta concentração em êxito - considerar equilibrar com mais fixo.'}
                  {((metrics.geral.totalFechadoPL / totalCarteira) * 100) > 70 && ' ✅ Boa base de receita previsível.'}
                </div>
              </div>
            )}
            
            {/* Projeção de Receita Mensal */}
            {metrics.geral.receitaRecorrenteAtiva > 0 && metrics.geral.valorEmNegociacaoPL > 0 && (
              <div className='flex items-start gap-2'>
                <span className='text-green-600 font-bold'>📈</span>
                <div className='flex-1'>
                  <strong>Projeção de Receita Mensal:</strong> Atual de {formatMoney(metrics.geral.receitaRecorrenteAtiva)}/mês + {formatMoney(metrics.geral.valorEmNegociacaoPL)} em propostas = 
                  <strong> {formatMoney(metrics.geral.receitaRecorrenteAtiva + metrics.geral.valorEmNegociacaoPL)} projetados/mês</strong> (crescimento potencial de {((metrics.geral.valorEmNegociacaoPL / metrics.geral.receitaRecorrenteAtiva) * 100).toFixed(0)}%).
                </div>
              </div>
            )}
            
            {/* Status de Assinatura */}
            {metrics.geral.naoAssinados > 0 && (
              <div className='flex items-start gap-2'>
                <span className='text-red-600 font-bold'>⚠️</span>
                <div className='flex-1'>
                  <strong>Ação Necessária:</strong> {metrics.geral.naoAssinados} {metrics.geral.naoAssinados === 1 ? 'contrato fechado' : 'contratos fechados'} ainda não {metrics.geral.naoAssinados === 1 ? 'foi assinado' : 'foram assinados'} ({((metrics.geral.naoAssinados / metrics.geral.fechados) * 100).toFixed(0)}% dos contratos). 
                  Priorize a coleta de assinaturas para garantir execução.
                </div>
              </div>
            )}
            
            {/* Volume de Propostas */}
            {metrics.geral.propostasAtivas > 0 && metrics.geral.fechados > 0 && (
              <div className='flex items-start gap-2'>
                <span className='text-purple-600 font-bold'>🔄</span>
                <div className='flex-1'>
                  <strong>Volume de Propostas:</strong> Proporção atual de {(metrics.geral.propostasAtivas / metrics.geral.fechados).toFixed(1)} propostas aguardando decisão para cada contrato vigente. 
                  {(metrics.geral.propostasAtivas / metrics.geral.fechados) > 1 ? ' Volume adequado de negociações em andamento.' : ' ⚠️ Baixo volume de propostas - intensificar captação.'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6. ANÁLISE DE REJEIÇÕES */}
      {metrics.geral.rejeitados > 0 && (
        <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-200'>
          <div className='flex items-center gap-2 mb-6 border-b pb-4'>
            <XCircle className='text-red-600' size={24} />
            <div>
              <h2 className='text-xl font-bold text-gray-800'>Análise de Rejeições</h2>
              <p className='text-xs text-gray-500'>Detalhamento dos casos não aceitos ({metrics.geral.rejeitados} total)</p>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Por Motivo */}
            <div>
              <h3 className='text-sm font-bold text-gray-700 mb-4 flex items-center gap-2'>
                <AlertCircle className='text-red-500' size={18} />
                Por Motivo da Rejeição
              </h3>
              {dadosRejeicao.porMotivo.length === 0 ? (
                <div className='text-center py-8 text-gray-400'>
                  <p className='text-sm'>Dados de motivo não informados</p>
                </div>
              ) : (
                <div className='space-y-3'>
                  {dadosRejeicao.porMotivo.map((item, index) => (
                    <div key={index} className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                      <div className='flex items-center justify-between mb-2'>
                        <span className='text-sm font-bold text-gray-800'>{item.motivo}</span>
                        <div className='flex items-center gap-2'>
                          <span className='text-lg font-bold text-red-600'>{item.count}</span>
                          <span className='text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-bold'>
                            {item.percentual}%
                          </span>
                        </div>
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-2'>
                        <div 
                          className='bg-gradient-to-r from-red-400 to-red-600 h-2 rounded-full transition-all'
                          style={{ width: `${item.percentual}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Por Iniciativa */}
            <div>
              <h3 className='text-sm font-bold text-gray-700 mb-4 flex items-center gap-2'>
                <Users className='text-red-500' size={18} />
                Por Iniciativa da Rejeição
              </h3>
              {dadosRejeicao.porIniciativa.length === 0 ? (
                <div className='text-center py-8 text-gray-400'>
                  <p className='text-sm'>Dados de iniciativa não informados</p>
                </div>
              ) : (
                <div className='space-y-3'>
                  {dadosRejeicao.porIniciativa.map((item, index) => {
                    const cores = {
                      'Cliente': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', badge: 'bg-blue-100 text-blue-700', bar: 'from-blue-400 to-blue-600' },
                      'Escritório': { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', badge: 'bg-orange-100 text-orange-700', bar: 'from-orange-400 to-orange-600' },
                    }
                    const cor = cores[item.iniciativa] || { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-800', badge: 'bg-gray-100 text-gray-700', bar: 'from-gray-400 to-gray-600' }
                    
                    return (
                      <div key={index} className={`${cor.bg} rounded-lg p-4 border ${cor.border}`}>
                        <div className='flex items-center justify-between mb-2'>
                          <span className={`text-sm font-bold ${cor.text}`}>{item.iniciativa}</span>
                          <div className='flex items-center gap-2'>
                            <span className={`text-lg font-bold ${cor.text}`}>{item.count}</span>
                            <span className={`text-xs ${cor.badge} px-2 py-1 rounded-full font-bold`}>
                              {item.percentual}%
                            </span>
                          </div>
                        </div>
                        <div className='w-full bg-white/50 rounded-full h-2'>
                          <div 
                            className={`bg-gradient-to-r ${cor.bar} h-2 rounded-full transition-all`}
                            style={{ width: `${item.percentual}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className='mt-6 pt-4 border-t bg-red-50 rounded-lg p-4'>
            <p className='text-sm text-gray-700'>
              <span className='font-bold text-red-700'>Insight:</span> {' '}
              {dadosRejeicao.porMotivo.length > 0 && dadosRejeicao.porMotivo[0] && (
                <>O principal motivo de rejeição é "{dadosRejeicao.porMotivo[0].motivo}" ({dadosRejeicao.porMotivo[0].count} casos, {dadosRejeicao.porMotivo[0].percentual}%). </>
              )}
              {dadosRejeicao.porIniciativa.length > 0 && dadosRejeicao.porIniciativa[0] && (
                <>A maioria das rejeições parte do(a) {dadosRejeicao.porIniciativa[0].iniciativa} ({dadosRejeicao.porIniciativa[0].count} casos, {dadosRejeicao.porIniciativa[0].percentual}%).</>
              )}
            </p>
          </div>
        </div>
      )}

      {/* 7. STATUS DAS ASSINATURAS NOS CONTRATOS */}
      <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-200'>
        <div className='flex items-center gap-2 mb-6 border-b pb-4'>
          <FileSignature className='text-purple-600' size={24} />
          <div>
            <h2 className='text-xl font-bold text-gray-800'>Status das Assinaturas nos Contratos</h2>
            <p className='text-xs text-gray-500'>Acompanhamento de formalização dos contratos</p>
          </div>
        </div>

        {/* Cards de Status de Assinatura */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-300'>
            <p className='text-sm text-blue-700 font-semibold mb-1'>✓ Contratos Fechados Assinados</p>
            <p className='text-3xl font-bold text-blue-900'>{metrics.geral.assinados}</p>
            <p className='text-xs text-gray-600 mt-1'>de {metrics.geral.fechados} fechados</p>
          </div>
          <div className='text-center p-4 bg-orange-50 rounded-lg border-2 border-orange-300'>
            <p className='text-sm text-orange-700 font-semibold mb-1'>⏳ Contratos Fechados Aguardando Assinatura</p>
            <p className='text-3xl font-bold text-orange-900'>{metrics.geral.naoAssinados}</p>
            <p className='text-xs text-gray-600 mt-1'>pendentes de assinatura</p>
          </div>
        </div>

        {/* Lista de Contratos Aguardando Assinatura */}
        {contratosSemAssinatura.length > 0 && (
          <div className='mt-6 bg-orange-50 p-6 rounded-xl border-2 border-orange-200'>
            <h4 className='text-sm font-bold text-orange-900 mb-4 flex items-center gap-2'>
              <AlertCircle className='text-orange-600' size={18} />
              Contratos Aguardando Assinatura ({contratosSemAssinatura.length})
            </h4>
            <div className='space-y-2'>
              {contratosSemAssinatura.map((contrato) => (
                <div key={contrato.id} className='bg-white p-3 rounded-lg border border-orange-300 flex justify-between items-center'>
                  <div>
                    <p className='font-bold text-gray-800 text-sm'>{contrato.cliente}</p>
                    <p className='text-xs text-gray-600'>
                      HON: {contrato.numero_hon} • Responsável: {contrato.responsavel}
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='text-xs text-gray-500'>
                      {new Date(contrato.data_contrato).toLocaleDateString('pt-BR')}
                    </p>
                    <p className={`text-xs font-bold ${contrato.dias_sem_assinar > 5 ? 'text-red-600' : 'text-orange-600'}`}>
                      {contrato.dias_sem_assinar} dia(s) sem assinar
                      {contrato.dias_sem_assinar > 5 && ' ⚠️'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
