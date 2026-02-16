import React from 'react';
import { Sparkles } from 'lucide-react';

export default function NextHeader({ children, className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
        <Sparkles className="w-5 h-5 text-white" />
      </div>
      <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
        NEXT
      </span>
      {children}
    </div>
  );
}