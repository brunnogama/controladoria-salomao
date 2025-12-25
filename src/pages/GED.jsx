import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { FileText, Download, FolderOpen, Calendar, Search, ExternalLink } from 'lucide-react';

const GED = () => {
  const [documentos, setDocumentos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocumentos();
  }, []);

  const fetchDocumentos = async () => {
    try {
      const { data } = await supabase
        .from('contratos')
        .select(`id, descricao_contrato, data_contrato, arquivo_pdf_url, clientes(razao_social)`)
        .not('arquivo_pdf_url', 'is', null)
        .order('data_contrato', { ascending: false });
      setDocumentos(data || []);
    } finally {
      setLoading(false);
    }
  };

  const agrupados = documentos.filter(d => 
    d.clientes?.razao_social?.toLowerCase().includes(filtro.toLowerCase()) ||
    d.descricao_contrato?.toLowerCase().includes(filtro.toLowerCase())
  ).reduce((acc, doc) => {
    const nome = doc.clientes?.razao_social || 'Sem Cliente';
    if (!acc[nome]) acc[nome] = [];
    acc[nome].push(doc);
    return acc;
  }, {});

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0F2C4C]">GED</h1>
          <p className="text-gray-500 font-medium italic">Repositório Central de Contratos Digitais.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Filtrar por cliente..." className="w-full pl-12 pr-4 py-3 bg-white border rounded-2xl outline-none focus:ring-2 focus:ring-[#0F2C4C]" onChange={(e) => setFiltro(e.target.value)} />
        </div>
      </div>

      {Object.keys(agrupados).length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-gray-400 font-bold uppercase tracking-widest">Nenhum PDF disponível</div>
      ) : (
        <div className="space-y-6">
          {Object.keys(agrupados).map(cliente => (
            <div key={cliente} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
              <div className="bg-gray-50 px-6 py-4 border-b font-black text-[#0F2C4C] text-xs uppercase tracking-widest flex items-center gap-2">
                <FolderOpen size={18} className="text-blue-600" /> {cliente}
              </div>
              <div className="divide-y divide-gray-50">
                {agrupados[cliente].map(doc => (
                  <div key={doc.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-left">
                      <div className="bg-red-50 p-3 rounded-xl text-red-600"><FileText size={24} /></div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm leading-tight">{doc.descricao_contrato || 'Contrato'}</p>
                        <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1 mt-1">
                          <Calendar size={12} /> {doc.data_contrato ? new Date(doc.data_contrato).toLocaleDateString('pt-BR') : 'Data não informada'}
                        </p>
                      </div>
                    </div>
                    <a href={doc.arquivo_pdf_url} target="_blank" rel="noreferrer" className="bg-[#0F2C4C] text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-blue-900 shadow-lg transition-all">
                      <ExternalLink size={16} /> Abrir Documento
                    </a>
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
