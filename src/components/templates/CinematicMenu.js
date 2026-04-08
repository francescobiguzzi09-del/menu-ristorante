import React from 'react';
import GlobalFooter from '../GlobalFooter';

export default function CinematicMenu({ menuByCategory, settings, onItemClick }) {
  const restaurantName = settings?.restaurantName || "Lounge & Bar";
  const paletteId = settings?.palette || 'default';
  
  // Mappa colori Cinematic
  const palettes = {
    default: { bg: 'from-slate-950 to-slate-900', glow: 'bg-amber-500/20', accent: 'text-amber-400', border: 'border-amber-500/30' },
    sapphire: { bg: 'from-slate-950 to-slate-900', glow: 'bg-blue-500/20', accent: 'text-blue-400', border: 'border-blue-500/30' },
    ruby: { bg: 'from-slate-950 to-slate-900', glow: 'bg-rose-500/20', accent: 'text-rose-400', border: 'border-rose-500/30' }
  };
  const theme = palettes[paletteId] || palettes.default;

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-200 font-sans pb-20 relative overflow-x-hidden`}>
      {/* CINEMATIC BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
         <div className={`absolute inset-0 bg-gradient-to-br ${theme.bg}`}></div>
         <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }}></div>
         <div className={`absolute bottom-1/4 right-1/4 w-[500px] h-[500px] ${theme.glow} rounded-full blur-[150px] animate-pulse`} style={{ animationDuration: '7s' }}></div>
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-screen"></div>
      </div>

      <main className="relative z-10 max-w-3xl mx-auto px-6 pt-24">
        {/* HEADER */}
        <header className="mb-20 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
           <h1 className={`text-4xl md:text-6xl font-black uppercase tracking-[0.2em] text-white mb-6 drop-shadow-2xl`}>{restaurantName}</h1>
           <div className={`h-[1px] w-24 mx-auto ${theme.glow} ${theme.border} border-t mb-6`}></div>
           <p className="text-slate-400 text-sm tracking-widest uppercase font-light">{settings?.customHeader || "Experience the Taste"}</p>
        </header>

        {/* MENU ITEMS */}
        <div className="space-y-24">
          {Object.entries(menuByCategory).map(([category, items], catIndex) => (
            <section key={category} className="animate-in fade-in slide-in-from-bottom-12" style={{ animationDuration: '1.2s', animationDelay: `${catIndex * 150}ms`, animationFillMode: 'both' }}>
              <div className="flex items-center gap-4 mb-10">
                <h2 className={`text-2xl font-black uppercase tracking-[0.3em] text-white`}>{category}</h2>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-white/20 to-transparent"></div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {items.map((item) => (
                  <div 
                     key={item.id} 
                     onClick={() => onItemClick && onItemClick(item)}
                     className={`group relative cursor-pointer overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-5 md:p-6 transition-all duration-500 hover:bg-white/10 hover:${theme.border} hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] flex items-center gap-6`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                    {item.image && (
                      <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-xl overflow-hidden shadow-2xl bg-black border border-white/10">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-4 mb-2">
                         <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-white transition-colors truncate">{item.name}</h3>
                         <span className={`text-lg md:text-xl font-light tracking-wider ${theme.accent} shrink-0`}>${parseFloat(item.price).toFixed(2)}</span>
                      </div>
                      <p className="text-sm text-slate-400 font-light leading-relaxed line-clamp-2">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* PREZZO COPERTO */}
        {settings?.coverCharge && (
          <div className={`mt-24 bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl flex justify-between items-center text-sm font-light animate-in fade-in duration-1000`}>
            <p className="text-slate-400 uppercase tracking-widest">Service Charge</p>
            <p className={`font-bold ${theme.accent}`}>${parseFloat(settings.coverCharge).toFixed(2)}</p>
          </div>
        )}
      </main>
      <div className="mt-24 text-center">
        {settings?.customFooter && (
          <p className="text-slate-500 text-[10px] tracking-widest uppercase mb-6 block">{settings.customFooter}</p>
        )}
        <GlobalFooter settings={settings} theme="dark" />
      </div>
    </div>
  );
}
