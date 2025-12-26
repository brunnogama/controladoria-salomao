import React, { useState, useEffect } from 'react';
import { 
  Save, Monitor, RefreshCw, History, ChevronDown, ChevronUp,
  CheckCircle, Building2, Copyright, Trash2, AlertTriangle,
  Users, Plus, Edit2, X, Shield, ShieldOff, Mail, Calendar, Code
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { APP_VERSION, RECENT_CHANGES } from '../version';

const Configuracoes = () => {
  const [logoInterno, setLogoInterno] = useState('');
  const [logoLogin, setLogoLogin] = useState('');
  const [status, setStatus] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetando, setResetando] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    nome_completo: '',
    role: 'user'
  });
  const [showFullChangelog, setShowFullChangelog] = useState(false);

  // Usar changelog do arquivo version.js ao invés de hardcoded
  const changelog = RECENT_CHANGES;

  useEffect(() => {
    const si = localStorage.getItem('app_logo_path');
    const sl = localStorage.getItem('app_login_logo_path');
    if (si) setLogoInterno(si.replace('/', ''));
    if (sl) setLogoLogin(sl.replace('/', ''));
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    setLoadingUsuarios(true);
    try {
      const { data, error } = await supabase
        .from('usuarios_sistema')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUsuarios(data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      alert('❌ Erro ao carregar usuários: ' + error.message);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const salvar = (tipo, valor) => {
    const path = valor.startsWith('/') ? valor : `/${valor}`;
    localStorage.setItem(tipo === 'interno' ? 'app_logo_path' : 'app_login_logo_path', path);
    setStatus('Configuração salva com sucesso!');
    setTimeout(() => setStatus(''), 3000);
  };

  const resetarDados = async () => {
    setResetando(true);
    try {
      await supabase.from('historico_status_contratos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('contratos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('clientes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('logs_sistema').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      alert('✅ Todos os dados foram resetados!');
      setShowResetModal(false);
      window.location.reload();
    } catch (error) {
      alert('❌ Erro: ' + error.message);
    } finally {
      setResetando(false);
    }
  };

  const abrirModalUsuario = (usuario = null) => {
    if (usuario) {
      setEditingUser(usuario);
      setUserForm({
        email: usuario.email,
        password: '',
        nome_completo: usuario.nome_completo || '',
        role: usuario.role || 'user'
      });
    } else {
      setEditingUser(null);
      setUserForm({ email: '', password: '', nome_completo: '', role: 'user' });
    }
    setShowUserModal(true);
  };

  const criarUsuario = async () => {
    try {
      if (!userForm.email || !userForm.password) {
        alert('❌ Email e senha são obrigatórios!');
        return;
      }
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userForm.email,
        password: userForm.password,
        options: {
          data: {
            nome_completo: userForm.nome_completo,
            role: userForm.role
          }
        }
      });
      if (authError) throw authError;
      const { error: dbError } = await supabase
        .from('usuarios_sistema')
        .insert([{
          auth_user_id: authData.user.id,
          email: userForm.email,
          nome_completo: userForm.nome_completo,
          role: userForm.role,
          ativo: true
        }]);
      if (dbError) throw dbError;
      alert('✅ Usuário criado!');
      setShowUserModal(false);
      fetchUsuarios();
    } catch (error) {
      alert('❌ Erro: ' + error.message);
    }
  };

  const atualizarUsuario = async () => {
    try {
      const { error: dbError } = await supabase
        .from('usuarios_sistema')
        .update({
          email: userForm.email,
          nome_completo: userForm.nome_completo,
          role: userForm.role
        })
        .eq('id', editingUser.id);
      if (dbError) throw dbError;
      if (userForm.password && editingUser.auth_user_id) {
        const { error: authError } = await supabase.auth.updateUser({
          password: userForm.password
        });
        if (authError) console.warn('Aviso ao atualizar senha:', authError);
      }
      alert('✅ Usuário atualizado!');
      setShowUserModal(false);
      fetchUsuarios();
    } catch (error) {
      alert('❌ Erro: ' + error.message);
    }
  };

  const excluirUsuario = async (userId, email) => {
    if (!window.confirm(`⚠️ Excluir "${email}"?`)) return;
    try {
      const { error } = await supabase
        .from('usuarios_sistema')
        .delete()
        .eq('id', userId);
      if (error) throw error;
      alert('✅ Usuário excluído!');
      fetchUsuarios();
    } catch (error) {
      alert('❌ Erro: ' + error.message);
    }
  };

  const toggleUsuarioStatus = async (userId, currentAtivo) => {
    try {
      const { error } = await supabase
        .from('usuarios_sistema')
        .update({ ativo: !currentAtivo })
        .eq('id', userId);
      if (error) throw error;
      alert(`✅ Usuário ${currentAtivo ? 'inativado' : 'ativado'}!`);
      fetchUsuarios();
    } catch (error) {
      alert('❌ Erro: ' + error.message);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0F2C4C] flex items-center gap-3">
            <Monitor size={32} />
            Configurações do Sistema
          </h1>
          <p className="text-gray-500 mt-1">Personalize aparência e gerencie usuários</p>
        </div>
        <div className="text-sm text-gray-400 font-mono">v{APP_VERSION}</div>
      </div>

      {status && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-center gap-3">
          <CheckCircle size={20} className="text-green-600" />
          <p className="text-green-700 font-bold">{status}</p>
        </div>
      )}

      {/* PAINEL DE USUÁRIOS */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users size={24} className="text-purple-600" />
            <div>
              <h2 className="text-xl font-bold">Gerenciamento de Usuários</h2>
              <p className="text-sm text-gray-500">Crie, edite e gerencie usuários</p>
            </div>
          </div>
          <button onClick={() => abrirModalUsuario()} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-bold">
            <Plus size={18} />
            Novo Usuário
          </button>
        </div>

        {loadingUsuarios ? (
          <div className="text-center py-8 text-gray-500">Carregando...</div>
        ) : usuarios.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Users size={48} className="mx-auto mb-2 opacity-20" />
            <p>Nenhum usuário</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Nome</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Criado</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-gray-400" />
                      {u.email}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">{u.nome_completo || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'viewer' ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} className="text-gray-400" />
                      {new Date(u.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => abrirModalUsuario(u)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg" title="Editar">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => toggleUsuarioStatus(u.id, u.ativo)} className={`p-2 rounded-lg ${u.ativo ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`} title={u.ativo ? 'Inativar' : 'Ativar'}>
                        {u.ativo ? <ShieldOff size={16} /> : <Shield size={16} />}
                      </button>
                      <button onClick={() => excluirUsuario(u.id, u.email)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg" title="Excluir">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* LOGOS */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
          <Building2 size={24} className="text-blue-600" />
          Logos do Sistema
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Logo Interno</label>
            <div className="flex gap-3">
              <input type="text" value={logoInterno} onChange={(e) => setLogoInterno(e.target.value)} className="flex-1 p-3 border rounded-lg" placeholder="logo-interno.png" />
              <button onClick={() => salvar('interno', logoInterno)} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold flex items-center gap-2">
                <Save size={18} />
                Salvar
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Logo Login</label>
            <div className="flex gap-3">
              <input type="text" value={logoLogin} onChange={(e) => setLogoLogin(e.target.value)} className="flex-1 p-3 border rounded-lg" placeholder="logo-login.png" />
              <button onClick={() => salvar('login', logoLogin)} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold flex items-center gap-2">
                <Save size={18} />
                Salvar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RESET */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border-2 border-red-200 p-6">
        <div className="flex items-start gap-4">
          <AlertTriangle size={32} className="text-red-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-red-800 mb-2">Zona de Perigo</h2>
            <p className="text-red-700 mb-4">Deletar TODOS os dados do sistema. IRREVERSÍVEL!</p>
            <button onClick={() => setShowResetModal(true)} className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold flex items-center gap-2">
              <Trash2 size={18} />
              Resetar Tudo
            </button>
          </div>
        </div>
      </div>

      {/* CHANGELOG E CRÉDITOS LADO A LADO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CRÉDITOS */}
        <div className="bg-gradient-to-r from-[#0F2C4C] to-blue-900 rounded-xl p-6 text-white">
          <div className="flex items-center gap-4 mb-4">
            <Code size={32} />
            <div>
              <h3 className="text-xl font-bold">Flow Metrics System</h3>
              <p className="text-blue-200 text-sm">Controladoria Jurídica</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 text-sm">
            <div>
              <p className="text-blue-200 mb-1">Stack</p>
              <p className="font-bold">React + Supabase</p>
            </div>
            <div>
              <p className="text-blue-200 mb-1">Versão Atual</p>
              <p className="font-bold">v{APP_VERSION}</p>
            </div>
            <div>
              <p className="text-blue-200 mb-1">Última Atualização</p>
              <p className="font-bold">{changelog[0].data}</p>
            </div>
          </div>
        </div>

        {/* CHANGELOG - VERSÃO ATUAL */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <History size={20} className="text-green-600" />
              Changelog
            </h2>
          </div>

          {/* Versão Mais Recente */}
          <div className="border-l-4 border-green-500 pl-4 py-3 mb-3 bg-gradient-to-r from-green-50 to-transparent">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs font-black">
                v{changelog[0].versao}
              </span>
              <span className="text-xs text-gray-500">{changelog[0].data}</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-xs text-gray-700">
              {changelog[0].mudancas.slice(0, 5).map((m, i) => (
                <li key={i} className="leading-relaxed">{m}</li>
              ))}
            </ul>
          </div>

          {/* Botão Ver Histórico */}
          <button
            onClick={() => setShowFullChangelog(!showFullChangelog)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold transition-colors text-sm"
          >
            {showFullChangelog ? (
              <>
                <ChevronUp size={16} />
                Ocultar Histórico
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                Ver Completo ({changelog.length - 1} versões)
              </>
            )}
          </button>
        </div>
      </div>

      {/* Histórico Completo Expandido */}
      {showFullChangelog && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-bold text-lg mb-4 text-gray-800">Histórico Completo</h3>
          <div className="space-y-4">
            {changelog.slice(1).map((entry, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-black">
                    v{entry.versao}
                  </span>
                  <span className="text-sm text-gray-500">{entry.data}</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-bold">
                    {entry.tipo}
                  </span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {entry.mudancas.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="text-center py-8 border-t">
        <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
          <Copyright size={16} />
          <span>2024-2025 Controladoria Jurídica</span>
        </div>
        <p className="text-xs text-gray-400 mt-2">Desenvolvido com Supabase + React</p>
      </div>

      {/* MODALS... */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-6 flex items-center justify-between text-white rounded-t-2xl">
              <h2 className="text-xl font-bold">{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h2>
              <button onClick={() => setShowUserModal(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                <input type="email" value={userForm.email} onChange={(e) => setUserForm({...userForm, email: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="usuario@exemplo.com" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Senha {editingUser && '(vazio = não altera)'} *</label>
                <input type="password" value={userForm.password} onChange={(e) => setUserForm({...userForm, password: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nome Completo</label>
                <input type="text" value={userForm.nome_completo} onChange={(e) => setUserForm({...userForm, nome_completo: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="João da Silva" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Role</label>
                <select value={userForm.role} onChange={(e) => setUserForm({...userForm, role: e.target.value})} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowUserModal(false)} className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200">Cancelar</button>
                <button onClick={editingUser ? atualizarUsuario : criarUsuario} className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700">{editingUser ? 'Atualizar' : 'Criar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showResetModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="bg-gradient-to-r from-red-600 to-red-800 p-6 text-white rounded-t-2xl">
              <div className="flex items-center gap-3">
                <AlertTriangle size={32} />
                <h2 className="text-2xl font-bold">⚠️ CONFIRMAÇÃO</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-lg font-bold text-red-800">Deletar TODOS OS DADOS!</p>
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                  <li>Todos os contratos</li>
                  <li>Todos os clientes</li>
                  <li>Todo o histórico</li>
                  <li>Todos os logs</li>
                </ul>
              </div>
              <p className="text-red-700 font-bold bg-yellow-50 border border-yellow-300 p-3 rounded">⚠️ IRREVERSÍVEL!</p>
              <div className="flex gap-3">
                <button onClick={() => setShowResetModal(false)} disabled={resetando} className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200">Cancelar</button>
                <button onClick={resetarDados} disabled={resetando} className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {resetando ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      Resetando...
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} />
                      Sim, Resetar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Configuracoes;
