import React from 'react';
import GlobalFooter from '../GlobalFooter';

export default function LuxuryMenu({ menuByCategory, settings, onItemClick }) {
  const restaurantName = settings?.restaurantName || "L'Essenza";
  const paletteId = settings?.palette || 'default';
  
  // Mappa Luxury 
  const palettes = {
    default: { bg: 'bg-[#f8f8f6]', card: 'bg-[#ffffff]', accent: 'text-[#8b7355]', border: 'border-[#e5e5e0]', text: 'text-[#1a1a1a]', secText: 'text-[#737373]' },
    charcoal: { bg: 'bg-[#111111]', card: 'bg-[#1a1a1a]', accent: 'text-[#c9a66b]', border: 'border-[#333333]', text: 'text-[#f5f5f5]', secText: 'text-[#888888]' },
    emerald: { bg: 'bg-[#06241a]', card: 'bg-[#0a2e22]', accent: 'text-[#e0c294]', border: 'border-[#144333]', text: 'text-[#ecf3ee]', secText: 'text-[#8da59b]' }
  };
  const theme = palettes[paletteId] || palettes.default;

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} font-serif pb-20 relative overflow-x-hidden selection:bg-[#c9a66b] selection:text-white`}>
      {/* LUXURY NOISE OVERLAY */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      <main className="max-w-3xl mx-auto px-6 pt-24 relative z-10">
        {/* EDITORIAL HEADER */}
        <header className="mb-24 flex flex-col items-center justify-center text-center">
           <div className={`text-[10px] uppercase tracking-[0.4em] ${theme.secText} mb-6`}>{settings?.customHeader || "Gastronomic Experience"}</div>
           <h1 className={`text-5xl md:text-7xl font-medium tracking-tighter uppercase ${theme.text}`}>{restaurantName}</h1>
           <div className={`h-16 w-px ${theme.border} border-l mt-12 mb-8`}></div>
           <p className={`text-sm italic ${theme.secText} max-w-sm`}>Savour the finest selection of dishes crafted with absolute dedication.</p>
        </header>

        {/* MENU ITEMS (1 PER ROW, MAGAZINE STYLE) */}
        <div className="space-y-32">
          {Object.entries(menuByCategory).map(([category, items]) => (
            <section key={category}>
              <div className="flex flex-col items-center mb-16">
                <h2 className={`text-2xl md:text-3xl font-medium tracking-wider uppercase ${theme.text} mb-4`}>{category}</h2>
                <div className={`w-8 h-[1px] ${theme.border} border-t`}></div>
              </div>

              <div className="grid grid-cols-1 gap-16 md:gap-24">
                {items.map((item) => (
                  <div 
                     key={item.id} 
                     onClick={() => onItemClick && onItemClick(item)}
                     className={`group cursor-pointer flex flex-col items-center justify-center text-center`}
                  >
                    {item.image && (
                      <div className={`w-full max-w-lg aspect-[4/3] overflow-hidden mb-8 ${theme.border} border shadow-2xl ${theme.card}`}>
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out opacity-90 group-hover:opacity-100" />
                      </div>
                    )}
                    
                    <div className="flex flex-col items-center px-4 w-full">
                      <h3 className={`text-xl md:text-2xl font-medium tracking-wide uppercase ${theme.text} mb-3 group-hover:${theme.accent} transition-colors`}>{item.name}</h3>
                      <p className={`text-sm md:text-base italic leading-relaxed ${theme.secText} max-w-md mb-4`}>{item.description}</p>
                      <span className={`text-lg font-medium tracking-widest ${theme.accent}`}>${parseFloat(item.price).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* PREZZO COPERTO */}
        {settings?.coverCharge && (
          <div className={`mt-32 max-w-sm mx-auto p-8 flex flex-col items-center text-center border ${theme.border} ${theme.card}`}>
            <p className={`text-xs uppercase tracking-[0.3em] ${theme.secText} mb-2`}>Cover Charge</p>
            <p className={`text-2xl font-medium ${theme.accent}`}>${parseFloat(settings.coverCharge).toFixed(2)}</p>
          </div>
        )}
      </main>
      <div className="mt-20">
        {settings?.customFooter && (
          <p className={`text-center ${theme.secText} text-[10px] uppercase tracking-[0.3em] mb-8`}>{settings.customFooter}</p>
        )}
        <GlobalFooter settings={settings} theme={paletteId === 'default' ? 'light' : 'dark'} />
      </div>
    </div>
  );
}
