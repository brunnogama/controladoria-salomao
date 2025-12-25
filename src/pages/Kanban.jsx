import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
  Plus,
  GripVertical,
  Clock,
  User,
  X,
  Edit2,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';

const Kanban = () => {
  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [tarefaSelecionada, setTarefaSelecionada] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    status: 'a_fazer',
    prioridade: 'media',
    responsavel: ''
  });

  const colunas = [
    { id: 'a_fazer', titulo: 'A Fazer', cor: 'orange', icon: Clock },
    { id: 'em_progresso', titulo: 'Em Progresso', cor: 'blue', icon: Loader2 },
    { id: 'concluido', titulo: 'Concluídos', cor: 'green', icon: CheckCircle2 }
  ];

  useEffect(() => {
    buscarTarefas();
  }, []);

  const buscarTarefas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tarefas_kanban')
        .select('*')
        .order('ordem', { ascending: true });

      if (error) throw error;
      setTarefas(data || []);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      alert('Erro ao carregar tarefas!');
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (status = 'a_fazer', tarefa = null) => {
    if (tarefa) {
      setTarefaSelecionada(tarefa);
      setFormData({
        titulo: tarefa.titulo,
        descricao: tarefa.descricao || '',
        status: tarefa.status,
        prioridade: tarefa.prioridade || 'media',
        responsavel: tarefa.responsavel || ''
      });
      setModoEdicao(false);
    } else {
      setTarefaSelecionada(null);
      setFormData({
        titulo: '',
        descricao: '',
        status,
        prioridade: 'media',
        responsavel: ''
      });
      setModoEdicao(true);
    }
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setTarefaSelecionada(null);
    setModoEdicao(false);
    setFormData({
      titulo: '',
      descricao: '',
      status: 'a_fazer',
      prioridade: 'media',
      responsavel: ''
    });
  };

  const salvarTarefa = async (e) => {
    e.preventDefault();

    if (!formData.titulo.trim()) {
      alert('O título é obrigatório!');
      return;
    }

    try {
      if (tarefaSelecionada) {
        // Editar
        const { error } = await supabase
          .from('tarefas_kanban')
          .update({
            titulo: formData.titulo,
            descricao: formData.descricao,
            prioridade: formData.prioridade,
            responsavel: formData.responsavel,
            data_conclusao: formData.status === 'concluido' ? new Date() : null
          })
          .eq('id', tarefaSelecionada.id);

        if (error) throw error;
        alert('✅ Tarefa atualizada!');
      } else {
        // Criar
        const { error } = await supabase
          .from('tarefas_kanban')
          .insert([{
            ...formData,
            ordem: tarefas.filter(t => t.status === formData.status).length
          }]);

        if (error) throw error;
        alert('✅ Tarefa criada!');
      }

      buscarTarefas();
      fecharModal();
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      alert('❌ Erro ao salvar tarefa!');
    }
  };

  const excluirTarefa = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;

    try {
      const { error } = await supabase
        .from('tarefas_kanban')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      alert('✅ Tarefa excluída!');
      buscarTarefas();
      fecharModal();
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      alert('❌ Erro ao excluir tarefa!');
    }
  };

  // Drag and Drop
  const handleDragStart = (e, tarefa) => {
    setDraggedTask(tarefa);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, novoStatus) => {
    e.preventDefault();
    
    if (!draggedTask || draggedTask.status === novoStatus) {
      setDraggedTask(null);
      return;
    }

    try {
      const { error } = await supabase
        .from('tarefas_kanban')
        .update({
          status: novoStatus,
          data_conclusao: novoStatus === 'concluido' ? new Date() : null
        })
        .eq('id', draggedTask.id);

      if (error) throw error;

      buscarTarefas();
      setDraggedTask(null);
    } catch (error) {
      console.error('Erro ao mover tarefa:', error);
      alert('❌ Erro ao mover tarefa!');
    }
  };

  const getPrioridadeCor = (prioridade) => {
    const cores = {
      'baixa': 'bg-gray-100 text-gray-700',
      'media': 'bg-blue-100 text-blue-700',
      'alta': 'bg-red-100 text-red-700'
    };
    return cores[prioridade] || cores.media;
  };

  const formatarData = (data) => {
    if (!data) return '';
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className='p-6 max-w-[1600px] mx-auto'>
      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-[#0F2C4C] mb-2'>Kanban de Tarefas</h1>
        <p className='text-gray-600'>Gerencie suas tarefas de forma visual</p>
      </div>

      {/* Colunas Kanban */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {colunas.map((coluna) => {
          const tarefasDaColuna = tarefas.filter(t => t.status === coluna.id);
          const Icon = coluna.icon;

          return (
            <div
              key={coluna.id}
              className={`bg-${coluna.cor}-50 rounded-2xl border-2 border-${coluna.cor}-200 min-h-[600px]`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, coluna.id)}
            >
              {/* Header da Coluna */}
              <div className={`bg-${coluna.cor}-100 p-4 rounded-t-xl border-b-2 border-${coluna.cor}-200`}>
                <div className='flex items-center justify-between mb-3'>
                  <div className='flex items-center gap-2'>
                    <Icon className={`text-${coluna.cor}-600`} size={24} />
                    <h2 className={`text-lg font-bold text-${coluna.cor}-900`}>
                      {coluna.titulo}
                    </h2>
                  </div>
                  <span className={`px-3 py-1 bg-${coluna.cor}-200 text-${coluna.cor}-900 rounded-full text-sm font-bold`}>
                    {tarefasDaColuna.length}
                  </span>
                </div>
                
                <button
                  onClick={() => abrirModal(coluna.id)}
                  className={`w-full flex items-center justify-center gap-2 py-2 bg-${coluna.cor}-600 hover:bg-${coluna.cor}-700 text-white rounded-lg transition-colors font-semibold text-sm`}
                >
                  <Plus size={18} />
                  Nova Tarefa
                </button>
              </div>

              {/* Lista de Tarefas */}
              <div className='p-4 space-y-3'>
                {loading ? (
                  <div className='text-center py-8'>
                    <Loader2 className='animate-spin mx-auto text-gray-400' size={32} />
                  </div>
                ) : tarefasDaColuna.length === 0 ? (
                  <div className='text-center py-8 text-gray-400'>
                    <AlertCircle size={32} className='mx-auto mb-2 opacity-30' />
                    <p className='text-sm'>Nenhuma tarefa</p>
                  </div>
                ) : (
                  tarefasDaColuna.map((tarefa) => (
                    <div
                      key={tarefa.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, tarefa)}
                      onClick={() => abrirModal(coluna.id, tarefa)}
                      className='bg-white p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 cursor-pointer transition-all hover:shadow-md group'
                    >
                      {/* Header do Card */}
                      <div className='flex items-start gap-2 mb-2'>
                        <GripVertical className='text-gray-300 group-hover:text-gray-400 cursor-grab shrink-0 mt-1' size={18} />
                        <div className='flex-1 min-w-0'>
                          <h3 className='font-bold text-gray-800 text-sm line-clamp-2'>
                            {tarefa.titulo}
                          </h3>
                        </div>
                      </div>

                      {/* Descrição */}
                      {tarefa.descricao && (
                        <p className='text-xs text-gray-600 mb-3 line-clamp-2 ml-6'>
                          {tarefa.descricao}
                        </p>
                      )}

                      {/* Metadados */}
                      <div className='flex flex-wrap gap-2 ml-6'>
                        {/* Prioridade */}
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${getPrioridadeCor(tarefa.prioridade)}`}>
                          {tarefa.prioridade?.toUpperCase()}
                        </span>

                        {/* Responsável */}
                        {tarefa.responsavel && (
                          <div className='flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-[10px] text-gray-700'>
                            <User size={10} />
                            <span className='font-medium'>{tarefa.responsavel}</span>
                          </div>
                        )}

                        {/* Data */}
                        <div className='flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-[10px] text-gray-700'>
                          <Calendar size={10} />
                          <span>{formatarData(tarefa.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modalAberto && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4' onClick={fecharModal}>
          <div className='bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto' onClick={(e) => e.stopPropagation()}>
            {/* Header do Modal */}
            <div className='bg-gradient-to-r from-[#0F2C4C] to-blue-900 p-6 flex items-center justify-between text-white'>
              <h2 className='text-xl font-bold'>
                {tarefaSelecionada && !modoEdicao ? 'Detalhes da Tarefa' : tarefaSelecionada ? 'Editar Tarefa' : 'Nova Tarefa'}
              </h2>
              <div className='flex items-center gap-2'>
                {tarefaSelecionada && !modoEdicao && (
                  <>
                    <button
                      onClick={() => setModoEdicao(true)}
                      className='p-2 hover:bg-white/20 rounded-lg transition-colors'
                      title='Editar'
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => excluirTarefa(tarefaSelecionada.id)}
                      className='p-2 hover:bg-red-500 rounded-lg transition-colors'
                      title='Excluir'
                    >
                      <Trash2 size={20} />
                    </button>
                  </>
                )}
                <button onClick={fecharModal} className='p-2 hover:bg-white/20 rounded-lg transition-colors'>
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Conteúdo */}
            <div className='p-6'>
              {tarefaSelecionada && !modoEdicao ? (
                // Modo Visualização
                <div className='space-y-4'>
                  <div>
                    <label className='text-xs font-bold text-gray-500 uppercase'>Título</label>
                    <p className='text-lg font-bold text-gray-800 mt-1'>{tarefaSelecionada.titulo}</p>
                  </div>

                  {tarefaSelecionada.descricao && (
                    <div>
                      <label className='text-xs font-bold text-gray-500 uppercase'>Descrição</label>
                      <p className='text-gray-700 mt-1 whitespace-pre-wrap'>{tarefaSelecionada.descricao}</p>
                    </div>
                  )}

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='text-xs font-bold text-gray-500 uppercase'>Prioridade</label>
                      <span className={`inline-block mt-1 px-3 py-1 rounded font-bold text-sm ${getPrioridadeCor(tarefaSelecionada.prioridade)}`}>
                        {tarefaSelecionada.prioridade?.toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <label className='text-xs font-bold text-gray-500 uppercase'>Status</label>
                      <p className='text-gray-700 mt-1 font-semibold'>
                        {colunas.find(c => c.id === tarefaSelecionada.status)?.titulo}
                      </p>
                    </div>
                  </div>

                  {tarefaSelecionada.responsavel && (
                    <div>
                      <label className='text-xs font-bold text-gray-500 uppercase'>Responsável</label>
                      <p className='text-gray-700 mt-1'>{tarefaSelecionada.responsavel}</p>
                    </div>
                  )}

                  <div className='grid grid-cols-2 gap-4 pt-4 border-t'>
                    <div>
                      <label className='text-xs font-bold text-gray-500 uppercase'>Criado em</label>
                      <p className='text-gray-700 mt-1 text-sm'>{formatarData(tarefaSelecionada.created_at)}</p>
                    </div>
                    {tarefaSelecionada.data_conclusao && (
                      <div>
                        <label className='text-xs font-bold text-gray-500 uppercase'>Concluído em</label>
                        <p className='text-gray-700 mt-1 text-sm'>{formatarData(tarefaSelecionada.data_conclusao)}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Modo Edição/Criação
                <form onSubmit={salvarTarefa} className='space-y-4'>
                  <div>
                    <label className='block text-sm font-bold text-gray-700 mb-1'>Título *</label>
                    <input
                      type='text'
                      value={formData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                      className='w-full p-3 border-2 border-gray-300 rounded-lg outline-none focus:border-blue-500'
                      placeholder='Digite o título da tarefa'
                      required
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-bold text-gray-700 mb-1'>Descrição</label>
                    <textarea
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      className='w-full p-3 border-2 border-gray-300 rounded-lg outline-none focus:border-blue-500'
                      rows='4'
                      placeholder='Descreva a tarefa...'
                    />
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-bold text-gray-700 mb-1'>Prioridade</label>
                      <select
                        value={formData.prioridade}
                        onChange={(e) => setFormData({ ...formData, prioridade: e.target.value })}
                        className='w-full p-3 border-2 border-gray-300 rounded-lg outline-none focus:border-blue-500'
                      >
                        <option value='baixa'>Baixa</option>
                        <option value='media'>Média</option>
                        <option value='alta'>Alta</option>
                      </select>
                    </div>

                    <div>
                      <label className='block text-sm font-bold text-gray-700 mb-1'>Responsável</label>
                      <input
                        type='text'
                        value={formData.responsavel}
                        onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                        className='w-full p-3 border-2 border-gray-300 rounded-lg outline-none focus:border-blue-500'
                        placeholder='Nome do responsável'
                      />
                    </div>
                  </div>

                  <div className='flex gap-3 pt-4'>
                    <button
                      type='submit'
                      className='flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors'
                    >
                      {tarefaSelecionada ? 'Salvar Alterações' : 'Criar Tarefa'}
                    </button>
                    <button
                      type='button'
                      onClick={fecharModal}
                      className='px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-bold transition-colors'
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Kanban;
