import React from 'react';

interface LogoutModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function LogoutModal({ isOpen, onConfirm, onCancel }: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-sm border-4 border-zinc-950 dark:border-zinc-100 bg-white dark:bg-zinc-900 p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)]">
        <h2 className="mb-4 text-3xl font-black uppercase text-zinc-950 dark:text-white">Sair da Conta</h2>
        <p className="mb-8 font-bold text-zinc-600 dark:text-zinc-400">Tem certeza que deseja sair do sistema?</p>
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 border-4 border-zinc-950 dark:border-zinc-100 bg-zinc-500 py-3 font-bold uppercase text-zinc-950 dark:text-white transition-transform active:translate-x-1 active:translate-y-1 hover:bg-zinc-400"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 border-4 border-zinc-950 dark:border-zinc-100 bg-red-500 py-3 font-bold uppercase text-zinc-950 dark:text-white transition-transform active:translate-x-1 active:translate-y-1 hover:bg-red-400"
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
