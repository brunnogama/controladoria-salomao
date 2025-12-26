// Hook para buscar logo de empresa automaticamente
// Usa múltiplas APIs públicas como fallback

import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

/**
 * Hook para buscar e cachear logo de empresa
 * @param {string} cnpj - CNPJ da empresa (14 dígitos)
 * @param {string} razaoSocial - Razão social da empresa
 * @param {string} clienteId - ID do cliente no banco
 * @returns {object} { logoUrl, loading, error }
 */
export const useCompanyLogo = (cnpj, razaoSocial, clienteId) => {
  const [logoUrl, setLogoUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!cnpj && !razaoSocial) return

    const fetchLogo = async () => {
      try {
        setLoading(true)
        setError(null)

        // 1. Verificar se já tem logo no banco
        if (clienteId) {
          const { data: cliente } = await supabase
            .from('clientes')
            .select('logo_url')
            .eq('id', clienteId)
            .single()

          if (cliente?.logo_url) {
            setLogoUrl(cliente.logo_url)
            setLoading(false)
            return
          }
        }

        // 2. Tentar buscar logo por domínio (extraído do email ou site)
        let logoFromApi = null

        // 2a. Tentar Clearbit (gratuito, boa qualidade)
        if (razaoSocial) {
          const domain = extractDomain(razaoSocial)
          if (domain) {
            const clearbitUrl = `https://logo.clearbit.com/${domain}`
            const isValid = await checkImageExists(clearbitUrl)
            if (isValid) {
              logoFromApi = clearbitUrl
            }
          }
        }

        // 2b. Tentar Logo.dev (fallback)
        if (!logoFromApi && razaoSocial) {
          const domain = extractDomain(razaoSocial)
          if (domain) {
            const logoDevUrl = `https://img.logo.dev/${domain}?token=pk_X-1ZO13CQnuFBiDje769jQ` // Token público demo
            const isValid = await checkImageExists(logoDevUrl)
            if (isValid) {
              logoFromApi = logoDevUrl
            }
          }
        }

        // 2c. Tentar Google S2 (favicon em alta resolução)
        if (!logoFromApi && razaoSocial) {
          const domain = extractDomain(razaoSocial)
          if (domain) {
            const googleUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
            logoFromApi = googleUrl // Google sempre retorna algo
          }
        }

        // 3. Salvar no banco se encontrou
        if (logoFromApi && clienteId) {
          await supabase
            .from('clientes')
            .update({ logo_url: logoFromApi })
            .eq('id', clienteId)
        }

        setLogoUrl(logoFromApi)
      } catch (err) {
        console.error('Erro ao buscar logo:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchLogo()
  }, [cnpj, razaoSocial, clienteId])

  return { logoUrl, loading, error }
}

/**
 * Extrai domínio da razão social (tentativa)
 * Ex: "Google Brasil Ltda" -> "google.com.br"
 */
const extractDomain = (razaoSocial) => {
  if (!razaoSocial) return null

  // Remover termos comuns
  const cleaned = razaoSocial
    .toLowerCase()
    .replace(/\s+(ltda|s\.a\.|s\/a|me|epp|eireli|brasil|internacional)\.?/gi, '')
    .trim()

  // Pegar primeira palavra significativa
  const firstWord = cleaned.split(' ')[0]

  if (firstWord && firstWord.length > 3) {
    return `${firstWord}.com.br` // Assumir .com.br para empresas brasileiras
  }

  return null
}

/**
 * Verifica se imagem existe e é válida
 */
const checkImageExists = (url) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
    
    // Timeout de 3 segundos
    setTimeout(() => resolve(false), 3000)
  })
}

/**
 * Componente para exibir logo com fallback
 */
export const CompanyLogo = ({ cnpj, razaoSocial, clienteId, size = 'md' }) => {
  const { logoUrl, loading } = useCompanyLogo(cnpj, razaoSocial, clienteId)

  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl',
    xl: 'w-20 h-20 text-3xl'
  }

  const sizeClass = sizes[size] || sizes.md

  if (loading) {
    return (
      <div className={`${sizeClass} rounded-full bg-gray-200 animate-pulse shadow-sm`} />
    )
  }

  if (logoUrl) {
    return (
      <div className={`${sizeClass} rounded-full bg-white shadow-md flex items-center justify-center overflow-hidden border border-gray-100`}>
        <img 
          src={logoUrl} 
          alt={razaoSocial}
          className="w-full h-full object-cover rounded-full"
          onError={(e) => {
            // Fallback para inicial se imagem falhar
            const parent = e.target.parentElement
            parent.className = `${sizeClass} rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold shadow-md`
            parent.innerHTML = razaoSocial?.charAt(0).toUpperCase() || '?'
          }}
        />
      </div>
    )
  }

  // Fallback: mostrar inicial
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold shadow-md`}>
      {razaoSocial?.charAt(0).toUpperCase() || '?'}
    </div>
  )
}

export default { useCompanyLogo, CompanyLogo }
