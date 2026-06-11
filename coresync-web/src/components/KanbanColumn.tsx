import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useTranslation } from 'react-i18next';

interface KanbanColumnProps {
  status: string;
  index: number;
  children: React.ReactNode;
}

export function KanbanColumn({ status, index, children }: KanbanColumnProps) {
  const { t } = useTranslation();
  
  const { isOver, setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`
        animate-brutal-pop flex w-[320px] shrink-0 flex-col 
        border-4 p-4 transition-colors duration-200
        ${isOver 
          ? 'border-dashed border-zinc-950 dark:border-zinc-100 bg-yellow-100 dark:bg-yellow-900/40' 
          : 'border-solid border-zinc-950 dark:border-zinc-800 bg-white dark:bg-zinc-900'
        }
      `}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <h2 className={`mb-4 text-xl font-bold uppercase border-b-4 pb-2 transition-colors ${isOver ? 'text-zinc-950 dark:text-zinc-100 border-zinc-950 dark:border-zinc-100' : 'text-zinc-600 dark:text-zinc-400 border-zinc-950 dark:border-zinc-800'}`}>
        {t(`pipeline.stages.${status}`)}
      </h2>
      <div className="flex flex-col gap-4 overflow-y-auto pr-2 pb-8 min-h-[100px]">
        {children}
      </div>
    </div>
  );
}
