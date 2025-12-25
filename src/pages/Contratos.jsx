import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Search, Plus, FileText, Download, Upload, CheckCircle2 } from 'lucide-react';

const Contratos = () => {
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContratos();
  }, []);

  const fetchContratos = async () => {
    try {
      const { data } = await supabase
        .from('contratos')
        .select('*, clientes(razao_social)')
        .order('created_at', { ascending: false });
      setContratos(data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPDF = async (event, contratoId) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${contratoId}_${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload para o Storage
      const { error: uploadError } = await supabase.storage
        .from('contratos_ged')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Pegar URL pública
      const { data: urlData } = supabase.storage.from('contratos_ged').getPublicUrl(filePath);

      // 3. Atualizar Banco de Dados
      const { error: updateError } = await supabase
        .from('contratos')
        .update({ 
          arquivo_pdf_url: urlData.publicUrl,
          data_vinculo_pdf: new Date().toISOString()
        })
        .eq('id', contratoId);

      if (updateError) throw updateError;

      alert('PDF vinculado com sucesso!');
      fetchContratos();
    } catch (error) {
      alert('Erro no upload: ' + error.message);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-[#0F2C4C]">Gestão de Contratos</h1>
        <button className="bg-[#0F2C4C] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2">
          <Plus size={20} /> Novo Caso
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Descrição do Contrato</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">GED (PDF)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {contratos.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-800 text-sm">{c.clientes?.razao_social}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{c.descricao_contrato || '---'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                      c.status === 'Contrato Fechado' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {c.status === 'Contrato Fechado' && (
                      <div className="flex items-center gap-2">
                        {c.arquivo_pdf_url ? (
                          <a href={c.arquivo_pdf_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-xs font-bold">
                            <CheckCircle2 size={16} /> Ver PDF
                          </a>
                        ) : (
                          <label className="cursor-pointer bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 hover:bg-blue-100">
                            <Upload size={14} /> Vincular PDF
                            <input type="file" accept=".pdf" className="hidden" onChange={(e) => handleUploadPDF(e, c.id)} />
                          </label>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Contratos;
