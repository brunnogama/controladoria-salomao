/**
 * @file PDFUpload.jsx
 * @description Componente reutilizável para upload de PDF
 * @version 1.4.0
 * @author Marcio Gama - Flow Metrics
 */

import React, { useState } from 'react';
import { Upload, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import { validateFileSize, validateFileExtension, sanitizeFilename } from '../utils/validators';
import { FILE_VALIDATION } from '../constants';

/**
 * Componente de Upload de PDF
 * @param {Object} props
 * @param {Function} props.onUpload - Callback chamado ao fazer upload (recebe File)
 * @param {boolean} props.loading - Estado de loading
 * @param {string} props.buttonText - Texto do botão
 * @param {string} props.buttonClass - Classes CSS customizadas do botão
 * @param {boolean} props.showPreview - Se deve mostrar preview do arquivo
 */
const PDFUpload = ({
  onUpload,
  loading = false,
  buttonText = 'Vincular PDF',
  buttonClass = '',
  showPreview = false,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  /**
   * Valida arquivo selecionado
   */
  const validateFile = (file) => {
    setError(null);

    // Valida extensão
    if (!validateFileExtension(file, FILE_VALIDATION.ALLOWED_EXTENSIONS)) {
      setError('Apenas arquivos PDF são permitidos');
      return false;
    }

    // Valida tamanho
    if (!validateFileSize(file, FILE_VALIDATION.MAX_SIZE_MB)) {
      setError(`Arquivo muito grande. Máximo: ${FILE_VALIDATION.MAX_SIZE_MB}MB`);
      return false;
    }

    return true;
  };

  /**
   * Handler de mudança de arquivo
   */
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (validateFile(file)) {
      // Sanitiza nome do arquivo
      const sanitizedName = sanitizeFilename(file.name);
      const sanitizedFile = new File([file], sanitizedName, { type: file.type });
      
      setSelectedFile(sanitizedFile);
      setError(null);
    } else {
      setSelectedFile(null);
    }
  };

  /**
   * Handler de drag over
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  /**
   * Handler de drag leave
   */
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  /**
   * Handler de drop
   */
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (validateFile(file)) {
      const sanitizedName = sanitizeFilename(file.name);
      const sanitizedFile = new File([file], sanitizedName, { type: file.type });
      setSelectedFile(sanitizedFile);
      setError(null);
    } else {
      setSelectedFile(null);
    }
  };

  /**
   * Handler de upload
   */
  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
      setError(null);
    } catch (err) {
      setError('Erro ao fazer upload. Tente novamente.');
    }
  };

  /**
   * Limpa arquivo selecionado
   */
  const handleClear = () => {
    setSelectedFile(null);
    setError(null);
  };

  const defaultButtonClass = `
    bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] 
    font-black uppercase flex items-center gap-1 
    hover:bg-blue-100 transition-all cursor-pointer
  `;

  return (
    <div className="space-y-3">
      {/* Área de Drop ou Botão de Seleção */}
      {!selectedFile ? (
        <div
          className={`
            border-2 border-dashed rounded-xl p-4 transition-all
            ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <label className={buttonClass || defaultButtonClass}>
            <Upload size={14} /> {buttonText}
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
              disabled={loading}
            />
          </label>

          <p className="text-xs text-gray-400 mt-2 text-center">
            ou arraste um arquivo PDF aqui
          </p>
        </div>
      ) : (
        // Preview do Arquivo Selecionado
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle2 size={20} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>

            <button
              onClick={handleClear}
              className="p-1 hover:bg-red-100 rounded text-gray-400 hover:text-red-600 transition-colors"
              disabled={loading}
            >
              <X size={16} />
            </button>
          </div>

          <button
            onClick={handleUpload}
            disabled={loading}
            className="
              w-full mt-3 bg-blue-600 text-white py-2 rounded-lg 
              text-xs font-bold uppercase 
              hover:bg-blue-700 transition-all 
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2
            "
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload size={14} />
                Confirmar Upload
              </>
            )}
          </button>
        </div>
      )}

      {/* Mensagem de Erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle size={16} className="text-red-600 mt-0.5 shrink-0" />
          <p className="text-xs text-red-700 font-medium">{error}</p>
        </div>
      )}
    </div>
  );
};

export default PDFUpload;
