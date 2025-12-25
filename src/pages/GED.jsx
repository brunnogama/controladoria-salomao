import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { FileText, Download, FolderOpen, Calendar, Search } from 'lucide-react';

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

  const agrupados = documentos.reduce((acc, doc) => {
    const nome = doc.clientes?.razao_social || 'Sem Cliente';
    if (!acc[nome]) acc[nome] = [];
    acc[nome].push(doc);
    return acc;
  }, {});

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-black text-[#0F2C4C]">GED - Central de Documentos</h1>
      
      {Object.keys(agrupados).map(cliente => (
        <div key={cliente} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b font-black text-[#0F2C4C] text-xs uppercase tracking-widest flex items-center gap-2">
            <FolderOpen size={18} className="text-blue-600" /> {cliente}
          </div>
          <div className="divide-y divide-gray-50">
            {agrupados[cliente].map(doc => (
              <div key={doc.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="bg-red-50 p-3 rounded-xl text-red-600"><FileText size={24} /></div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{doc.descricao_contrato || 'Contrato'}</p>
                    <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                      <Calendar size={12} /> {new Date(doc.data_contrato).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <a href={doc.arquivo_pdf_url} target="_blank" rel="noreferrer" className="bg-[#0F2C4C] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2">
                  <Download size={16} /> Download
                </a>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GED;
