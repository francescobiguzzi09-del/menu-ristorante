import React from 'react';
import GlobalFooter from '../GlobalFooter';

export default function SupremeMenu({ menuByCategory, settings, onItemClick }) {
  const restaurantName = settings?.restaurantName || "Supreme Bites";
  const paletteId = settings?.palette || 'default';
  
  // Mappa Supreme 
  const palettes = {
    default: { bg: 'bg-[#f4f4f5]', card: 'bg-white', primary: 'bg-indigo-600', text: 'text-indigo-600', shadow: 'shadow-[8px_8px_0px_0px_rgba(79,70,229,1)]' },
    neon: { bg: 'bg-zinc-950', card: 'bg-zinc-900', primary: 'bg-lime-400', text: 'text-lime-400', shadow: 'shadow-[8px_8px_0px_0px_rgba(163,230,53,1)]' },
    sunset: { bg: 'bg-rose-50', card: 'bg-white', primary: 'bg-rose-500', text: 'text-rose-500', shadow: 'shadow-[8px_8px_0px_0px_rgba(244,63,94,1)]' }
  };
  const theme = palettes[paletteId] || palettes.default;
  const isDark = paletteId === 'neon';

  return (
    <div className={`min-h-screen ${theme.bg} ${isDark ? 'text-slate-200' : 'text-slate-800'} font-sans pb-20 overflow-x-hidden selection:bg-black selection:text-white`}>
      {/* NOISE OVERLAY */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      <main className="max-w-4xl mx-auto px-6 pt-24 relative z-10">
        {/* HEADER */}
        <header className="mb-24 relative">
           <div className={`absolute -top-10 -left-10 w-40 h-40 ${theme.primary} rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse`}></div>
           <div className={`absolute top-0 -right-10 w-40 h-40 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse`} style={{ animationDelay: '2s' }}></div>
           
           <div className={`inline-block border-4 ${isDark ? 'border-zinc-700 bg-zinc-800' : 'border-black bg-white'} px-6 py-4 md:px-8 md:py-6 transform -rotate-2 hover:rotate-0 transition-transform duration-300 ${theme.shadow}`}>
             <h1 className={`text-3xl md:text-5xl font-black uppercase tracking-tighter ${isDark ? 'text-white' : 'text-black'}`}>{restaurantName}</h1>
           </div>
        </header>

        {/* MENU ITEMS */}
        <div className="space-y-32">
          {Object.entries(menuByCategory).map(([category, items]) => (
            <section key={category}>
              <div className="flex items-center gap-6 mb-12">
                <h2 className={`text-5xl md:text-7xl font-black uppercase tracking-tighter ${isDark ? 'text-white/10' : 'text-black/10'}`}>{category}</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {items.map((item) => (
                  <div 
                     key={item.id} 
                     onClick={() => onItemClick && onItemClick(item)}
                     className={`group cursor-pointer relative border-4 ${isDark ? 'border-zinc-700' : 'border-black'} ${theme.card} rounded-3xl p-6 transition-all duration-300 hover:-translate-y-2 hover:-translate-x-2 hover:${theme.shadow} flex flex-col h-full`}
                  >
                    {item.image && (
                      <div className={`w-full aspect-video rounded-xl overflow-hidden mb-6 border-4 ${isDark ? 'border-zinc-700 bg-zinc-800' : 'border-black bg-white'}`}>
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      </div>
                    )}
                    
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start gap-4 mb-3">
                         <h3 className={`text-xl font-black uppercase leading-tight ${isDark ? 'text-white' : 'text-black'}`}>{item.name}</h3>
                         <span className={`text-xl font-black ${theme.text} shrink-0`}>${parseFloat(item.price).toFixed(2)}</span>
                      </div>
                      <p className={`text-sm font-medium leading-relaxed mt-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* PREZZO COPERTO */}
        {settings?.coverCharge && (
          <div className={`mt-32 border-4 ${isDark ? 'border-zinc-700 bg-zinc-800' : 'border-black bg-white'} px-8 py-6 flex justify-between items-center text-lg font-black uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]`}>
            <p className={isDark ? 'text-white' : 'text-black'}>Cover Charge</p>
            <p className={theme.text}>${parseFloat(settings.coverCharge).toFixed(2)}</p>
          </div>
        )}
      </main>

      <GlobalFooter settings={settings} theme={isDark ? 'dark' : 'light'} />
    </div>
  );
}
