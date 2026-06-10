import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { api } from '../services/api';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  estimatedValue: number;
  description?: string;
  attachments?: string[];
  product?: {
    id: string;
    name: string;
  };
}

interface LeadDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onLeadUpdated: () => void;
}

export function LeadDetailsModal({ isOpen, onClose, lead, onLeadUpdated }: LeadDetailsModalProps) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!lead || acceptedFiles.length === 0) return;
    
    setUploading(true);
    try {
      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append('file', file);

        await api.post(`/leads/${lead.id}/attachments`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      onLeadUpdated(); // recarrega a lista de leads
    } catch (err) {
      alert('Erro ao enviar arquivo.');
    } finally {
      setUploading(false);
    }
  }, [lead, onLeadUpdated]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl border-4 border-zinc-950 dark:border-zinc-100 bg-white dark:bg-zinc-900 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] flex flex-col md:flex-row gap-6 max-h-[90vh] overflow-y-auto">
        
        {/* Esquerda: Detalhes do Lead */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b-4 border-zinc-950 dark:border-zinc-800 pb-4">
            <h2 className="text-3xl font-black uppercase text-lime-600 dark:text-lime-400">{lead.name}</h2>
            <button
              onClick={onClose}
              className="md:hidden text-2xl font-bold text-zinc-600 dark:text-zinc-400 transition-colors hover:text-red-400"
            >
              X
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <p className="font-bold text-zinc-600 dark:text-zinc-400 uppercase">Contato</p>
            <p className="text-xl font-bold text-zinc-950 dark:text-white">{lead.email}</p>
            <p className="text-lg text-zinc-300">{lead.phone || 'Sem telefone'}</p>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <p className="font-bold text-zinc-600 dark:text-zinc-400 uppercase">Valor Estimado</p>
            <p className="text-3xl font-black text-zinc-950 dark:text-white">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(lead.estimatedValue)}
            </p>
          </div>

          {lead.product && (
             <div className="flex flex-col gap-2 mt-2">
               <p className="font-bold text-zinc-600 dark:text-zinc-400 uppercase">Produto</p>
               <span className="bg-purple-500 text-sm text-zinc-950 dark:text-white font-bold px-2 py-1 uppercase tracking-tighter self-start border-2 border-zinc-950 dark:border-zinc-100">
                 {lead.product.name}
               </span>
             </div>
          )}

          {lead.description && (
             <div className="flex flex-col gap-2 mt-2">
               <p className="font-bold text-zinc-600 dark:text-zinc-400 uppercase">Descrição / Notas</p>
               <div className="text-md text-zinc-300 italic border-l-4 border-zinc-700 pl-4">
                 {lead.description}
               </div>
             </div>
          )}
        </div>

        {/* Direita: Cofre de Arquivos */}
        <div className="flex-1 flex flex-col gap-4 border-t-4 border-zinc-950 dark:border-zinc-800 md:border-t-0 md:border-l-4 md:pl-6 pt-6 md:pt-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-black uppercase text-zinc-950 dark:text-zinc-100">Cofre de Arquivos</h3>
            <button
              onClick={onClose}
              className="hidden md:block text-2xl font-bold text-zinc-600 dark:text-zinc-400 transition-colors hover:text-red-400"
            >
              X
            </button>
          </div>

          {/* Área de Dropzone Neo-Brutalista */}
          <div 
            {...getRootProps()} 
            className={`border-4 border-dashed p-8 text-center cursor-pointer transition-all ${isDragActive ? 'border-lime-400 bg-lime-400/20' : 'border-zinc-600 bg-zinc-100 dark:bg-zinc-950 hover:border-zinc-400'}`}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <p className="font-bold text-lime-600 dark:text-lime-400 uppercase">Enviando...</p>
            ) : isDragActive ? (
              <p className="font-bold text-lime-600 dark:text-lime-400 uppercase">Solte os arquivos aqui...</p>
            ) : (
              <p className="font-bold text-zinc-600 dark:text-zinc-400 uppercase">Arraste arquivos ou clique para selecionar</p>
            )}
          </div>

          {/* Lista de Anexos */}
          <div className="flex flex-col gap-2 mt-4 overflow-y-auto pr-2 max-h-60">
            {lead.attachments && lead.attachments.length > 0 ? (
              lead.attachments.map((url, index) => {
                const filename = url.substring(url.lastIndexOf('/') + 1);
                return (
                  <a 
                    key={index} 
                    href={url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-between border-4 border-zinc-950 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 p-3 hover:bg-zinc-200 dark:bg-zinc-800 transition-colors group"
                  >
                    <span className="font-bold text-zinc-300 truncate max-w-[80%]">{filename}</span>
                    <span className="text-lime-600 dark:text-lime-400 font-black opacity-0 group-hover:opacity-100 transition-opacity">ABRIR</span>
                  </a>
                );
              })
            ) : (
              <p className="text-sm font-bold text-zinc-600 uppercase text-center mt-4">Nenhum arquivo anexado</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
