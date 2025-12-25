import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Search, Database, AlertCircle, CheckCircle } from 'lucide-react';

const DiagnosticoCNPJ = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testeCNPJ, setTesteCNPJ] = useState('');
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    buscarTodosClientes();
  }, []);

  const buscarTodosClientes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('clientes')
      .select('id, razao_social, cnpj, email')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro:', error);
    } else {
      setClientes(data || []);
    }
    setLoading(false);
  };

  const testarBusca = async () => {
    if (!testeCNPJ) return;

    const cnpjLimpo = testeCNPJ.replace(/\D/g, '');
    
    console.log('🔍 Testando busca com:', cnpjLimpo);

    // Teste 1: Busca exata
    const { data: data1, error: error1 } = await supabase
      .from('clientes')
      .select('*')
      .eq('cnpj', cnpjLimpo);

    // Teste 2: Busca com formatação
    const cnpjFormatado = testeCNPJ;
    const { data: data2, error: error2 } = await supabase
      .from('clientes')
      .select('*')
      .eq('cnpj', cnpjFormatado);

    // Teste 3: Busca LIKE
    const { data: data3, error: error3 } = await supabase
      .from('clientes')
      .select('*')
      .like('cnpj', `%${cnpjLimpo}%`);

    setResultado({
      cnpjOriginal: testeCNPJ,
      cnpjLimpo,
      teste1: { data: data1, error: error1, tipo: 'Busca Exata (sem formatação)' },
      teste2: { data: data2, error: error2, tipo: 'Busca Exata (com formatação)' },
      teste3: { data: data3, error: error3, tipo: 'Busca LIKE (parcial)' }
    });
  };

  const criarClienteTeste = async () => {
    const { data, error } = await supabase
      .from('clientes')
      .insert([{
        razao_social: 'CLIENTE TESTE BUSCA LTDA',
        cnpj: '24111888000106',
        email: 'teste@busca.com',
        nome_contato: 'Teste Sistema'
      }])
      .select();

    if (error) {
      alert('Erro ao criar cliente: ' + error.message);
    } else {
      alert('✅ Cliente teste criado com sucesso!');
      buscarTodosClientes();
    }
  };

  const limparCNPJs = async () => {
    if (!confirm('⚠️ Isso vai remover a formatação de TODOS os CNPJs (pontos, traços, barras). Continuar?')) {
      return;
    }

    // Buscar todos os clientes
    const { data: todosClientes } = await supabase
      .from('clientes')
      .select('id, cnpj');

    let atualizados = 0;
    for (const cliente of todosClientes) {
      if (cliente.cnpj) {
        const cnpjLimpo = cliente.cnpj.replace(/\D/g, '');
        if (cnpjLimpo !== cliente.cnpj) {
          await supabase
            .from('clientes')
            .update({ cnpj: cnpjLimpo })
            .eq('id', cliente.id);
          atualizados++;
        }
      }
    }

    alert(`✅ ${atualizados} CNPJs foram atualizados!`);
    buscarTodosClientes();
  };

  return (
    <div className='p-8 max-w-7xl mx-auto'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-800 mb-2'>🔍 Diagnóstico de CNPJ</h1>
        <p className='text-gray-600'>Ferramenta de debug para verificar CNPJs no banco de dados</p>
      </div>

      {/* Estatísticas */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
        <div className='bg-blue-50 p-6 rounded-xl border border-blue-200'>
          <Database className='text-blue-600 mb-2' size={24} />
          <p className='text-sm text-blue-600 font-semibold'>Total de Clientes</p>
          <p className='text-3xl font-bold text-blue-900'>{clientes.length}</p>
        </div>

        <div className='bg-green-50 p-6 rounded-xl border border-green-200'>
          <CheckCircle className='text-green-600 mb-2' size={24} />
          <p className='text-sm text-green-600 font-semibold'>Com CNPJ</p>
          <p className='text-3xl font-bold text-green-900'>
            {clientes.filter(c => c.cnpj).length}
          </p>
        </div>

        <div className='bg-red-50 p-6 rounded-xl border border-red-200'>
          <AlertCircle className='text-red-600 mb-2' size={24} />
          <p className='text-sm text-red-600 font-semibold'>Sem CNPJ</p>
          <p className='text-3xl font-bold text-red-900'>
            {clientes.filter(c => !c.cnpj).length}
          </p>
        </div>
      </div>

      {/* Ações */}
      <div className='bg-white p-6 rounded-xl border border-gray-200 mb-8'>
        <h2 className='text-xl font-bold mb-4'>Ações Rápidas</h2>
        <div className='flex gap-4'>
          <button
            onClick={criarClienteTeste}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
          >
            Criar Cliente Teste (CNPJ: 24111888000106)
          </button>
          <button
            onClick={limparCNPJs}
            className='px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700'
          >
            Limpar Formatação de Todos os CNPJs
          </button>
        </div>
      </div>

      {/* Teste de Busca */}
      <div className='bg-white p-6 rounded-xl border border-gray-200 mb-8'>
        <h2 className='text-xl font-bold mb-4'>Testar Busca de CNPJ</h2>
        <div className='flex gap-4 mb-4'>
          <input
            type='text'
            value={testeCNPJ}
            onChange={(e) => setTesteCNPJ(e.target.value)}
            placeholder='Digite um CNPJ para testar'
            className='flex-1 p-3 border rounded-lg'
          />
          <button
            onClick={testarBusca}
            className='px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2'
          >
            <Search size={20} />
            Testar Busca
          </button>
        </div>

        {resultado && (
          <div className='space-y-4'>
            <div className='bg-gray-50 p-4 rounded-lg'>
              <p className='text-sm font-bold text-gray-700'>CNPJ Original: {resultado.cnpjOriginal}</p>
              <p className='text-sm font-bold text-gray-700'>CNPJ Limpo: {resultado.cnpjLimpo}</p>
            </div>

            {['teste1', 'teste2', 'teste3'].map((teste) => {
              const r = resultado[teste];
              const encontrou = r.data && r.data.length > 0;
              return (
                <div key={teste} className={`p-4 rounded-lg border-2 ${encontrou ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                  <p className='font-bold mb-2'>{r.tipo}</p>
                  {encontrou ? (
                    <>
                      <p className='text-green-700 font-bold mb-2'>✅ {r.data.length} resultado(s) encontrado(s)</p>
                      {r.data.map((cliente, i) => (
                        <div key={i} className='bg-white p-3 rounded mb-2'>
                          <p className='font-bold'>{cliente.razao_social}</p>
                          <p className='text-sm text-gray-600'>CNPJ no banco: "{cliente.cnpj}"</p>
                          <p className='text-sm text-gray-600'>Tamanho: {cliente.cnpj?.length || 0} caracteres</p>
                        </div>
                      ))}
                    </>
                  ) : (
                    <p className='text-red-700 font-bold'>❌ Nenhum resultado encontrado</p>
                  )}
                  {r.error && (
                    <p className='text-red-600 text-sm mt-2'>Erro: {r.error.message}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lista de Clientes */}
      <div className='bg-white p-6 rounded-xl border border-gray-200'>
        <h2 className='text-xl font-bold mb-4'>Todos os Clientes ({clientes.length})</h2>
        
        {loading ? (
          <p className='text-center py-8 text-gray-500'>Carregando...</p>
        ) : clientes.length === 0 ? (
          <p className='text-center py-8 text-gray-500'>Nenhum cliente cadastrado</p>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='border-b'>
                  <th className='text-left p-3 text-sm font-bold text-gray-700'>ID</th>
                  <th className='text-left p-3 text-sm font-bold text-gray-700'>Razão Social</th>
                  <th className='text-left p-3 text-sm font-bold text-gray-700'>CNPJ</th>
                  <th className='text-left p-3 text-sm font-bold text-gray-700'>Tamanho</th>
                  <th className='text-left p-3 text-sm font-bold text-gray-700'>Status</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente) => (
                  <tr key={cliente.id} className='border-b hover:bg-gray-50'>
                    <td className='p-3 text-sm font-mono text-gray-600'>{cliente.id.slice(0, 8)}...</td>
                    <td className='p-3 text-sm font-semibold'>{cliente.razao_social}</td>
                    <td className='p-3 text-sm font-mono'>"{cliente.cnpj || 'NULL'}"</td>
                    <td className='p-3 text-sm text-gray-600'>{cliente.cnpj?.length || 0} chars</td>
                    <td className='p-3 text-sm'>
                      {cliente.cnpj ? (
                        <span className='px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold'>
                          ✓ OK
                        </span>
                      ) : (
                        <span className='px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold'>
                          ✗ NULL
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosticoCNPJ;
