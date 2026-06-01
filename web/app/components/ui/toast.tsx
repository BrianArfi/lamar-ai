'use client';

import { Toaster as SonnerToaster } from 'sonner';

export { toast } from 'sonner';

export const Toaster = () => {
  return (
    <SonnerToaster
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: 'group toast border border-border bg-zinc-900 text-zinc-100 rounded-xl shadow-xl flex gap-3 p-4 items-center font-sans',
          title: 'text-sm font-semibold text-zinc-100',
          description: 'text-xs text-zinc-400 font-normal leading-relaxed',
          actionButton: 'bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-opacity-90 transition-all',
          cancelButton: 'bg-zinc-800 text-zinc-300 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-zinc-700 transition-all',
          error: 'border-rose-500/20 bg-rose-500/5 text-rose-200',
          success: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-200',
          warning: 'border-amber-500/20 bg-amber-500/5 text-amber-200',
          info: 'border-sky-500/20 bg-sky-500/5 text-sky-200',
        },
      }}
    />
  );
};
