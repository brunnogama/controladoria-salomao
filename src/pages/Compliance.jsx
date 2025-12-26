import React from 'react';
import { Shield, Construction, CheckCircle, FileText, AlertTriangle, Lock } from 'lucide-react';

const Compliance = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0F2C4C] flex items-center gap-3">
          <Shield size={32} className="text-blue-600" />
          Compliance
        </h1>
        <p className="text-gray-500 mt-1">
          Gestão de conformidade e requisitos regulatórios
        </p>
      </div>

      {/* Banner Em Construção */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-8 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Construction size={48} className="text-yellow-600" />
          <div>
            <h2 className="text-2xl font-bold text-yellow-900">
              Módulo em Construção
            </h2>
            <p className="text-yellow-700">
              Estamos desenvolvendo ferramentas avançadas de compliance
            </p>
          </div>
        </div>
        
        <div className="bg-white/70 rounded-xl p-6 mt-6">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <CheckCircle size={20} className="text-green-600" />
            Funcionalidades Previstas:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 bg-white p-4 rounded-lg border border-gray-100">
              <FileText size={20} className="text-blue-600 mt-1" />
              <div>
                <h4 className="font-bold text-gray-800">Documentação Obrigatória</h4>
                <p className="text-sm text-gray-600">Checklist de documentos por cliente</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white p-4 rounded-lg border border-gray-100">
              <Lock size={20} className="text-purple-600 mt-1" />
              <div>
                <h4 className="font-bold text-gray-800">LGPD & Privacidade</h4>
                <p className="text-sm text-gray-600">Termos de consentimento e DPO</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white p-4 rounded-lg border border-gray-100">
              <AlertTriangle size={20} className="text-orange-600 mt-1" />
              <div>
                <h4 className="font-bold text-gray-800">Auditorias & Certificações</h4>
                <p className="text-sm text-gray-600">ISO, SOC2, e outras certificações</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white p-4 rounded-lg border border-gray-100">
              <Shield size={20} className="text-green-600 mt-1" />
              <div>
                <h4 className="font-bold text-gray-800">Políticas de Segurança</h4>
                <p className="text-sm text-gray-600">Gestão de políticas e procedimentos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Informativos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <FileText size={24} className="text-white" />
            </div>
            <h3 className="font-bold text-blue-900">Documentação</h3>
          </div>
          <p className="text-sm text-blue-800">
            Controle centralizado de todos os documentos de compliance exigidos por clientes
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
              <Lock size={24} className="text-white" />
            </div>
            <h3 className="font-bold text-purple-900">LGPD</h3>
          </div>
          <p className="text-sm text-purple-800">
            Gestão de consentimentos, termos de uso e adequação à Lei Geral de Proteção de Dados
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <Shield size={24} className="text-white" />
            </div>
            <h3 className="font-bold text-green-900">Certificações</h3>
          </div>
          <p className="text-sm text-green-800">
            Acompanhamento de certificações ISO, SOC2, e outras exigidas por clientes enterprise
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border p-6">
        <h3 className="font-bold text-lg mb-4 text-gray-800">Roadmap de Desenvolvimento</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">1</span>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-800">Fase 1 - Documentação</h4>
              <p className="text-sm text-gray-600">Checklist e upload de documentos obrigatórios</p>
              <span className="text-xs text-yellow-600 font-bold">🔨 Em desenvolvimento</span>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">2</span>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-800">Fase 2 - LGPD</h4>
              <p className="text-sm text-gray-600">Termos, consentimentos e DPO</p>
              <span className="text-xs text-gray-500 font-bold">⏳ Planejado</span>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">3</span>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-800">Fase 3 - Auditorias</h4>
              <p className="text-sm text-gray-600">Certificações e relatórios de auditoria</p>
              <span className="text-xs text-gray-500 font-bold">⏳ Planejado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Compliance;
