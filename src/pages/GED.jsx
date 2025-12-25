import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { FileText, Download, Search, FolderOpen, Calendar, ExternalLink } from 'lucide-react';

const GED = () => {
  const [documentos, setDocumentos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocumentos();
  }, []);

  const fetchDocumentos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contratos')
        .select(`
          id, 
          descricao_contrato, 
          data_contrato, 
          arquivo_pdf_url, 
          clientes(razao_social)
        `)
        .not('arquivo_pdf_url', 'is', null)
        .order('data_contrato', { ascending: false });
      
      if (error) throw error;
      setDocumentos(data || []);
    } catch (err) {
      console.error('Erro ao carregar GED:', err);
    } finally {
      setLoading(false);
    }
  };

  const docsFiltrados = documentos.filter(doc => 
    doc.clientes?.razao_social?.toLowerCase().includes(filtro.toLowerCase()) ||
    doc.descricao_contrato?.toLowerCase().includes(filtro.toLowerCase())
  );

  const docsAgrupados = docsFiltrados.reduce((acc, doc) => {
    const cliente = doc.clientes?.razao_social || 'Sem Cliente';
    if (!acc[cliente]) acc[cliente] = [];
    acc[cliente].push(doc);
    return acc;
  }, {});

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0F2C4C]">GED</h1>
          <p className="text-gray-500 font-medium">Gestão Eletrônica de Documentos vinculados aos contratos.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por cliente ou descrição..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#0F2C4C] shadow-sm text-sm"
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-gray-400 font-bold uppercase tracking-widest animate-pulse">Carregando documentos...</div>
      ) : Object.keys(docsAgrupados).length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-gray-400">Nenhum PDF vinculado encontrado.</div>
      ) : (
        <div className="space-y-6">
          {Object.keys(docsAgrupados).map(cliente => (
            <div key={cliente} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
              <div className="bg-gray-50 px-6 py-4 border-b flex items-center gap-3 font-black text-[#0F2C4C] uppercase text-xs tracking-widest">
                <FolderOpen size={18} className="text-blue-600" /> {cliente}
              </div>
              <div className="divide-y divide-gray-50">
                {docsAgrupados[cliente].map(doc => (
                  <div key={doc.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-blue-50/20 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="bg-red-50 p-3 rounded-xl text-red-600 shadow-sm"><FileText size={24} /></div>
                      <div>
                        <p className="font-bold text-gray-800 text-base">{doc.descricao_contrato || 'Contrato Sem Descrição'}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1.5 font-bold mt-1">
                          <Calendar size={14} /> Contratado em: {new Date(doc.data_contrato).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a 
                        href={doc.arquivo_pdf_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#0F2C4C] text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-900 transition-all shadow-lg shadow-blue-900/10"
                      >
                        <ExternalLink size={16} /> Abrir PDF
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GED;
