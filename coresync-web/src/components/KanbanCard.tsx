import { useDraggable } from '@dnd-kit/core';
import { useTranslation } from 'react-i18next';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  estimatedValue: number;
  description?: string;
  product?: {
    id: string;
    name: string;
  };
}

interface KanbanCardProps {
  lead: Lead;
  index: number;
  onView: (lead: Lead) => void;
  onAdvance: (leadId: string) => void;
  onDecline: (leadId: string) => void;
  isNextStatusAvailable: boolean;
}

export function KanbanCard({ lead, index, onView, onAdvance, onDecline, isNextStatusAvailable }: KanbanCardProps) {
  const { t } = useTranslation();
  
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: lead.id,
    data: {
      lead,
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`
        animate-brutal-pop flex flex-col gap-2 
        border-4 border-zinc-950 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-950 p-4 
        transition-all duration-200
        ${isDragging 
          ? 'scale-105 rotate-3 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] cursor-grabbing opacity-90 z-50' 
          : 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] cursor-grab hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]'
        }
      `}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex justify-between items-start pointer-events-none">
        <div className="font-bold text-lime-600 dark:text-lime-400 uppercase">{lead.name}</div>
        {lead.product && (
          <span className="bg-purple-500 text-xs text-zinc-950 dark:text-white font-bold px-2 py-1 uppercase tracking-tighter shrink-0 border-2 border-zinc-950 dark:border-zinc-100">
            {lead.product.name}
          </span>
        )}
      </div>
      <div className="text-sm font-bold text-zinc-600 dark:text-zinc-400 pointer-events-none">{lead.email}</div>
      
      {lead.description && (
        <div className="mt-1 text-sm text-zinc-500 italic line-clamp-3 leading-tight border-l-2 border-zinc-700 pl-2 pointer-events-none">
          "{lead.description}"
        </div>
      )}
      
      <div className="text-lg font-black text-zinc-950 dark:text-white mt-1 pointer-events-none">{formatCurrency(lead.estimatedValue)}</div>
      
      {/* Controles do Card */}
      <div className="mt-2 flex gap-2 border-t-4 border-zinc-950 dark:border-zinc-800 pt-3" onPointerDown={(e) => e.stopPropagation()}>
        <button
          onClick={() => onView(lead)}
          className="flex-1 bg-blue-400 px-2 py-1 text-sm font-black uppercase text-zinc-950 transition-colors hover:bg-blue-300"
        >
          {t('pipeline.card.view', 'Ver')}
        </button>
        {isNextStatusAvailable && lead.status !== 'LOST' && (
          <button
            onClick={() => onAdvance(lead.id)}
            className="flex-1 bg-lime-400 px-2 py-1 text-sm font-black uppercase text-zinc-950 transition-colors hover:bg-lime-300"
          >
            {t('pipeline.card.advance', 'Avançar')}
          </button>
        )}
        {lead.status !== 'LOST' && (
          <button
            onClick={() => onDecline(lead.id)}
            className="flex-1 bg-zinc-700 px-2 py-1 text-sm font-black uppercase text-zinc-950 dark:text-zinc-100 transition-colors hover:bg-zinc-600"
          >
            Recusar
          </button>
        )}
      </div>
    </div>
  );
}
