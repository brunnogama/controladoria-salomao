import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
  History,
  FileText,
  User,
  ArrowRight,
  Clock,
  CheckCircle2,
  Edit2,
  Trash2,
  Upload,
  Filter,
  Calendar,
  MapPin,
  Monitor,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';

const Historico = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroAcao, setFiltroAcao] = useState('');
  const [logExpandido, setLogExpandido] = useState(null);
  const [tabelaExiste, setTabelaExiste] = useState(true);

  useEffect(() => {
    buscarLogs();
  }, []);

  const buscarLogs = async () => {
    setLoading(true);
    try {
      // Verificar se a tabela existe
      const { data, error } = await supabase
        .from('logs_sistema')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Erro ao buscar logs:', error);
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          setTabelaExiste(false);
        }
        setLogs([]);
      } else {
        setLogs(data || []);
        setTabelaExiste(true);
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const criarLog = async (acao, detalhes) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('logs_sistema')
        .insert([{
          acao,
          detalhes,
          categoria: 'Sistema',
          usuario_id: user?.id,
          usuario_email: user?.email,
          usuario_nome: user?.user_metadata?.name || user?.email,
        }]);

      if (!error) {
        buscarLogs();
      }
    } catch (err) {
      console.error('Erro ao criar log:', err);
    }
  };

  /**
   * Retorna ícone baseado na ação
   */
  const getIcon = (acao) => {
    const icones = {
      'Criação': <CheckCircle2 size={20} className='text-green-500' />,
      'Edição': <Edit2 size={20} className='text-blue-500' />,
      'Exclusão': <Trash2 size={20} className='text-red-500' />,
      'Mudança de Status': <ArrowRight size={20} className='text-orange-500' />,
      'Upload de Documento': <Upload size={20} className='text-purple-500' />,
      'Login': <User size={20} className='text-cyan-500' />,
      'Logout': <User size={20} className='text-gray-500' />
    };
    return icones[acao] || <FileText size={20} className='text-gray-500' />;
  };

  /**
   * Retorna cor do badge baseado na categoria
   */
  const getCategoriaColor = (categoria) => {
    const cores = {
      'Cliente': 'bg-purple-100 text-purple-700',
      'Contrato': 'bg-blue-100 text-blue-700',
      'GED': 'bg-green-100 text-green-700',
      'Sistema': 'bg-gray-100 text-gray-700',
      'Autenticação': 'bg-cyan-100 text-cyan-700',
      'Kanban': 'bg-orange-100 text-orange-700'
    };
    return cores[categoria] || 'bg-gray-100 text-gray-700';
  };

  /**
   * Formata data e hora
   */
  const formatarDataHora = (data) => {
    if (!data) return '';
    return new Date(data).toLocaleString('pt-BR');
  };

  /**
   * Filtra logs
   */
  const logsFiltrados = filtroAcao 
    ? logs.filter(log => log.acao === filtroAcao)
    : logs;

  /**
   * Toggle expansão de log
   */
  const toggleExpansao = (logId) => {
    setLogExpandido(logExpandido === logId ? null : logId);
  };

  /**
   * Renderiza diff de dados (antes/depois)
   */
  const renderizarDiff = (log) => {
    if (!log.dados_anteriores && !log.dados_novos) return null;

    return (
      <div className='mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200'>
        <h5 className='text-xs font-bold text-gray-600 mb-2'>Alterações:</h5>
        
        <div className='grid grid-cols-2 gap-3 text-xs'>
          {log.dados_anteriores && (
            <div>
              <span className='font-semibold text-red-600'>Antes:</span>
              <pre className='mt-1 p-2 bg-red-50 rounded border border-red-200 overflow-x-auto'>
                {JSON.stringify(log.dados_anteriores, null, 2)}
              </pre>
            </div>
          )}
          
          {log.dados_novos && (
            <div>
              <span className='font-semibold text-green-600'>Depois:</span>
              <pre className='mt-1 p-2 bg-green-50 rounded border border-green-200 overflow-x-auto'>
                {JSON.stringify(log.dados_novos, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Estatísticas
  const estatisticas = {
    total: logs.length,
    porAcao: logs.reduce((acc, log) => {
      acc[log.acao] = (acc[log.acao] || 0) + 1;
      return acc;
    }, {})
  };

  if (!tabelaExiste) {
    return (
      <div className='w-full space-y-6 p-6'>
        <div className='bg-orange-50 border-2 border-orange-200 rounded-xl p-8 text-center'>
          <AlertCircle size={48} className='mx-auto mb-4 text-orange-600' />
          <h2 className='text-2xl font-bold text-orange-900 mb-2'>
            Tabela de Logs Não Encontrada
          </h2>
          <p className='text-orange-700 mb-6'>
            A tabela `logs_sistema` não existe no banco de dados.
          </p>
          
          <div className='bg-white p-6 rounded-lg border border-orange-300 text-left max-w-2xl mx-auto'>
            <h3 className='font-bold text-gray-800 mb-3'>Execute este SQL no Supabase:</h3>
            <pre className='bg-gray-900 text-green-400 p-4 rounded overflow-x-auto text-sm'>
{`CREATE TABLE IF NOT EXISTS logs_sistema (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  acao TEXT NOT NULL,
  categoria TEXT,
  detalhes TEXT,
  usuario_id UUID,
  usuario_email TEXT,
  usuario_nome TEXT,
  ip_address TEXT,
  user_agent TEXT,
  dados_anteriores JSONB,
  dados_novos JSONB,
  metadados JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_logs_acao 
  ON logs_sistema(acao);
CREATE INDEX IF NOT EXISTS idx_logs_categoria 
  ON logs_sistema(categoria);
CREATE INDEX IF NOT EXISTS idx_logs_created_at 
  ON logs_sistema(created_at DESC);`}
            </pre>
          </div>

          <button
            onClick={buscarLogs}
            className='mt-6 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-bold'
          >
            Verificar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='bg-[#0F2C4C] p-3 rounded-xl text-white'>
            <History size={28} />
          </div>
          <div>
            <h1 className='text-3xl font-bold text-[#0F2C4C]'>
              Histórico de Atividades
            </h1>
            <p className='text-gray-500'>
              Auditoria completa das operações do sistema
            </p>
          </div>
        </div>

        <button
          onClick={buscarLogs}
          disabled={loading}
          className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50'
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Atualizar
        </button>
      </div>

      {/* Estatísticas */}
      {logs.length > 0 && (
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div className='bg-white p-4 rounded-xl border border-gray-200'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs text-gray-500 uppercase font-semibold'>Total de Logs</p>
                <p className='text-2xl font-bold text-gray-800'>{estatisticas.total}</p>
              </div>
              <FileText className='text-gray-300' size={32} />
            </div>
          </div>

          <div className='bg-white p-4 rounded-xl border border-gray-200'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs text-gray-500 uppercase font-semibold'>Criações</p>
                <p className='text-2xl font-bold text-green-600'>
                  {estatisticas.porAcao['Criação'] || 0}
                </p>
              </div>
              <CheckCircle2 className='text-green-300' size={32} />
            </div>
          </div>

          <div className='bg-white p-4 rounded-xl border border-gray-200'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs text-gray-500 uppercase font-semibold'>Edições</p>
                <p className='text-2xl font-bold text-blue-600'>
                  {estatisticas.porAcao['Edição'] || 0}
                </p>
              </div>
              <Edit2 className='text-blue-300' size={32} />
            </div>
          </div>

          <div className='bg-white p-4 rounded-xl border border-gray-200'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs text-gray-500 uppercase font-semibold'>Exclusões</p>
                <p className='text-2xl font-bold text-red-600'>
                  {estatisticas.porAcao['Exclusão'] || 0}
                </p>
              </div>
              <Trash2 className='text-red-300' size={32} />
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className='bg-white p-4 rounded-xl border border-gray-200'>
        <div className='flex items-center gap-4'>
          <Filter size={20} className='text-gray-400' />
          
          <select
            value={filtroAcao}
            onChange={(e) => setFiltroAcao(e.target.value)}
            className='flex-1 p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value=''>Todas as Ações</option>
            <option value='Criação'>Criação</option>
            <option value='Edição'>Edição</option>
            <option value='Exclusão'>Exclusão</option>
            <option value='Mudança de Status'>Mudança de Status</option>
            <option value='Upload de Documento'>Upload de Documento</option>
            <option value='Login'>Login</option>
            <option value='Logout'>Logout</option>
          </select>

          {filtroAcao && (
            <button
              onClick={() => setFiltroAcao('')}
              className='px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors'
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Botão para Criar Log de Teste */}
      {logs.length === 0 && !loading && (
        <div className='bg-blue-50 border border-blue-200 rounded-xl p-6 text-center'>
          <p className='text-blue-700 mb-4'>
            Nenhum log registrado ainda. Crie um log de teste para verificar o funcionamento:
          </p>
          <button
            onClick={() => criarLog('Criação', 'Log de teste criado manualmente')}
            className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold'
          >
            Criar Log de Teste
          </button>
        </div>
      )}

      {/* Lista de Logs */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        {loading ? (
          <div className='p-10 text-center text-gray-500'>
            <RefreshCw className='animate-spin mx-auto mb-4' size={32} />
            Carregando histórico...
          </div>
        ) : logsFiltrados.length === 0 ? (
          <div className='p-16 flex flex-col items-center justify-center text-gray-400'>
            <Clock size={48} className='mb-4 opacity-20' />
            <p className='font-semibold'>Nenhuma atividade registrada</p>
            <p className='text-xs mt-2'>
              {filtroAcao 
                ? 'Nenhum log encontrado com este filtro'
                : 'As ações aparecerão aqui conforme você usar o sistema'
              }
            </p>
          </div>
        ) : (
          <div className='divide-y divide-gray-100'>
            {logsFiltrados.map((log) => (
              <div key={log.id} className='hover:bg-gray-50 transition-colors'>
                <div className='p-4 flex items-start gap-4'>
                  {/* Ícone */}
                  <div className='mt-1 p-2 bg-gray-100 rounded-full border border-gray-200 shrink-0'>
                    {getIcon(log.acao)}
                  </div>

                  {/* Conteúdo Principal */}
                  <div className='flex-1 min-w-0'>
                    <div className='flex justify-between items-start gap-4'>
                      <div className='flex-1'>
                        {/* Ação */}
                        <h4 className='font-bold text-gray-800 text-sm'>
                          {log.acao}
                        </h4>
                        
                        {/* Detalhes */}
                        <p className='text-sm text-gray-600 mt-1'>{log.detalhes}</p>

                        {/* Metadados */}
                        <div className='mt-3 flex flex-wrap gap-2 text-xs'>
                          {/* Categoria */}
                          {log.categoria && (
                            <span className={`px-2 py-1 rounded-full font-semibold ${getCategoriaColor(log.categoria)}`}>
                              {log.categoria}
                            </span>
                          )}

                          {/* Usuário */}
                          {(log.usuario_nome || log.usuario_email) && (
                            <div className='flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-gray-700'>
                              <User size={12} />
                              <span className='font-medium'>{log.usuario_nome || log.usuario_email}</span>
                            </div>
                          )}

                          {/* Data e Hora */}
                          <div className='flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-gray-700'>
                            <Clock size={12} />
                            <span>{formatarDataHora(log.created_at)}</span>
                          </div>

                          {/* IP */}
                          {log.ip_address && (
                            <div className='flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-gray-700'>
                              <MapPin size={12} />
                              <span>{log.ip_address}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Botão Expandir */}
                      {(log.dados_anteriores || log.dados_novos || log.user_agent) && (
                        <button
                          onClick={() => toggleExpansao(log.id)}
                          className='p-2 hover:bg-gray-200 rounded-lg transition-colors'
                        >
                          {logExpandido === log.id ? (
                            <ChevronUp size={18} className='text-gray-600' />
                          ) : (
                            <ChevronDown size={18} className='text-gray-600' />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Detalhes Expandidos */}
                    {logExpandido === log.id && (
                      <div className='mt-4 space-y-3'>
                        {/* User Agent */}
                        {log.user_agent && (
                          <div className='p-3 bg-blue-50 rounded-lg border border-blue-200'>
                            <div className='flex items-center gap-2 mb-2'>
                              <Monitor size={14} className='text-blue-600' />
                              <span className='text-xs font-semibold text-blue-700'>Navegador/Sistema:</span>
                            </div>
                            <p className='text-xs text-blue-800 font-mono break-all'>
                              {log.user_agent}
                            </p>
                          </div>
                        )}

                        {/* Diff de Dados */}
                        {renderizarDiff(log)}

                        {/* Metadados Adicionais */}
                        {log.metadados && (
                          <div className='p-3 bg-purple-50 rounded-lg border border-purple-200'>
                            <span className='text-xs font-semibold text-purple-700'>Metadados:</span>
                            <pre className='mt-1 text-xs text-purple-800 overflow-x-auto'>
                              {JSON.stringify(log.metadados, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Historico;
