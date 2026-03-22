import React from 'react';

export default function GlobalFooter({ settings, theme = 'light' }) {
  // Se la funzione White-Label è attiva, non renderizziamo nulla (100% pulito)
  if (settings?.whiteLabel === true) {
    return <div className="h-12 w-full glass-spacer"></div>; // Aggiunge solo margine per non tagliare il menù
  }

  const isDark = theme === 'dark';
  
  const textColor = isDark 
    ? 'text-white/40 group-hover:text-white/80' 
    : 'text-slate-500/60 group-hover:text-slate-800';
    
  const badgeBg = isDark 
    ? 'bg-white/5 border-white/10 group-hover:border-white/20 group-hover:bg-white/10' 
    : 'bg-slate-900/5 border-slate-900/10 group-hover:border-slate-900/20 group-hover:bg-slate-900/10';
    
  const badgeText = isDark 
    ? 'text-white/50 group-hover:text-white' 
    : 'text-slate-500 group-hover:text-slate-900';

  return (
    <div className="w-full text-center py-10 mt-auto opacity-80 animate-in fade-in duration-1000 relative z-30">
      <a 
        href="https://smartmenu.ai" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="inline-flex flex-col items-center gap-2.5 group cursor-pointer"
        title="Crea anche tu il tuo menù digitale smart!"
      >
        <div className={`flex items-center gap-2 backdrop-blur-md px-4 py-2 rounded-full border transition-all duration-300 shadow-sm ${badgeBg}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
            <span className={`text-[9px] sm:text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-300 ${badgeText}`}>
              Powered by SmartMenu AI
            </span>
        </div>
      </a>
    </div>
  );
}
