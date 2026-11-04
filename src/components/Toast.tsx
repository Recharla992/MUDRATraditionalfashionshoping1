import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast } = useApp();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-[#D4AF37] shrink-0" />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="bg-[#07172C] text-[#FAF8F5] border border-[#D4AF37]/40 shadow-xl rounded-lg px-4 py-3 flex items-center gap-3 text-xs sm:text-sm max-w-md">
        {icons[toast.type]}
        <span className="font-medium tracking-wide">{toast.message}</span>
      </div>
    </div>
  );
};
