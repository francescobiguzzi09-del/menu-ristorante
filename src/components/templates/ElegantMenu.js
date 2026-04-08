import React from 'react';
import GlobalFooter from '../GlobalFooter';

export default function ElegantMenu({ menuByCategory, settings, onItemClick }) {
  const restaurantName = settings?.restaurantName || "Il Nostro Menù";
  
  const paletteId = settings?.palette || 'default';
  const palettes = {
    default: { text: 'text-[#c9a66b]', bg: 'bg-[#c9a66b]', border: 'border-[#c9a66b]', hoverText: 'group-hover:text-[#c9a66b]', hoverBorder: 'group-hover:border-[#c9a66b]', selectionBg: 'selection:bg-[#c9a66b]' },
    sapphire: { text: 'text-blue-500', bg: 'bg-blue-500', border: 'border-blue-500', hoverText: 'group-hover:text-blue-500', hoverBorder: 'group-hover:border-blue-500', selectionBg: 'selection:bg-blue-500' },
    ruby: { text: 'text-rose-500', bg: 'bg-rose-500', border: 'border-rose-500', hoverText: 'group-hover:text-rose-500', hoverBorder: 'group-hover:border-rose-500', selectionBg: 'selection:bg-rose-500' }
  };
  const theme = palettes[paletteId] || palettes.default;

  return (
    <div className={`min-h-screen bg-[#0a0a0b] text-[#e0dfdc] pb-24 ${theme.selectionBg} selection:text-[#0a0a0b] font-sans relative overflow-hidden`}>
      
      {/* BACKGROUND EFFECTS */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-[#1a1815] to-[#0a0a0b] opacity-80 z-0"></div>
      <div className={`absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full ${theme.bg} blur-[150px] opacity-10 pointer-events-none`}></div>
      
      {/* HEADER ELEGANCE */}
      <header className="relative z-10 pt-24 pb-16 px-6 text-center">
        <h1 className="text-5xl md:text-6xl font-serif text-white mb-2 tracking-wide font-light">{restaurantName}</h1>
        <div className={`h-[1px] w-12 ${theme.bg} mx-auto mt-6 mb-4`}></div>
        <p className="text-[#a19f9b] uppercase tracking-[0.3em] text-xs font-medium">{settings?.customHeader || "Fine Dining & Experience"}</p>
      </header>

      {/* MENU LIST */}
      <main className="relative z-10 max-w-2xl mx-auto px-6 space-y-20">
        
        {Object.entries(menuByCategory).length === 0 && (
           <div className="text-center py-20 border border-[#222] rounded-3xl bg-[#111112]">
             <span className="text-4xl inline-block mb-4 opacity-70 filter grayscale">🍽️</span>
             <h2 className="text-xl font-serif text-white mb-2">Il menù è in preparazione</h2>
             <p className="text-sm text-[#888]">Il nostro Executive Chef sta creando nuove ispirazioni...</p>
           </div>
        )}

        {Object.entries(menuByCategory).map(([category, items]) => (
          <section key={category} className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* INTESTAZIONE CATEGORIA */}
            <div className="flex items-center gap-4 mb-10 w-full justify-center">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#333]"></div>
              <h2 className={`text-2xl font-serif ${theme.text} tracking-wider text-center px-4`}>
                {category}
              </h2>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#333]"></div>
            </div>

            <div className="space-y-12">
              {items.map(item => (
                <div key={item.id} onClick={() => onItemClick && onItemClick(item)} className="group cursor-pointer flex gap-5 sm:gap-6 items-start hover:opacity-80 transition-opacity">
                  {item.image && (
                    <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-2xl overflow-hidden border border-[#2a2a2a] shadow-lg mt-1 relative bg-[#111]">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="flex-1 w-full min-w-0">
                    <div className="flex justify-between items-baseline mb-3 gap-4 sm:gap-6">
                      <h3 className={`text-xl md:text-2xl font-serif text-white tracking-wide ${theme.hoverText} transition-colors leading-tight break-words flex-1 min-w-0`}>
                        {item.name}
                      </h3>
                      <div className={`border-b border-dotted border-[#444] flex-1 mx-2 mb-1 ${theme.hoverBorder} transition-colors shrink-0`}></div>
                      <span className={`${theme.text} font-medium text-lg whitespace-nowrap shrink-0`}>
                        $ {item.price.toFixed(2)}
                      </span>
                    </div>
                    
                    {item.description && (
                      <p className="text-[#8e8d89] leading-relaxed text-sm max-w-[90%] font-light break-words">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* PREZZO COPERTO */}
        {settings?.coverCharge && (
          <div className="mt-16 text-center border-t border-[#222] pt-8 animate-in fade-in duration-1000">
            <p className="text-[#a19f9b] text-sm uppercase tracking-widest">
              Coperto / Servizio: <span className={`${theme.text} font-bold ml-2`}>$ {parseFloat(settings.coverCharge).toFixed(2)}</span>
            </p>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 mt-24 text-center pb-8 border-t border-[#1a1815] pt-8">
        <p className="text-[#555] text-xs tracking-widest uppercase text-center w-full block">{settings?.customFooter || "Buon Appetito."}</p>
        <GlobalFooter settings={settings} theme="dark" />
      </footer>
    </div>
  );
}
