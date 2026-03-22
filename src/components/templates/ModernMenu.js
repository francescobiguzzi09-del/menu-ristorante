import React from 'react';
import GlobalFooter from '../GlobalFooter';

export default function ModernMenu({ menuByCategory, settings, onItemClick }) {
  const restaurantName = settings?.restaurantName || "Il Nostro Menù";

  const paletteId = settings?.palette || 'default';
  const palettes = {
    default: { text: 'text-zinc-900', border: 'border-zinc-900', pillBg: 'bg-zinc-100', pillText: 'text-zinc-900', selectionBg: 'selection:bg-zinc-900', coverBg: 'bg-zinc-100' },
    ocean: { text: 'text-sky-600', border: 'border-sky-500', pillBg: 'bg-sky-50', pillText: 'text-sky-700', selectionBg: 'selection:bg-sky-500', coverBg: 'bg-sky-50' },
    forest: { text: 'text-emerald-600', border: 'border-emerald-500', pillBg: 'bg-emerald-50', pillText: 'text-emerald-700', selectionBg: 'selection:bg-emerald-500', coverBg: 'bg-emerald-50' }
  };
  const theme = palettes[paletteId] || palettes.default;

  return (
    <div className={`min-h-screen bg-zinc-50 text-zinc-800 pb-24 font-sans ${theme.selectionBg} selection:text-white`}>
      
      {/* HEADER MODERN */}
      <header className={`pt-20 pb-12 px-6 max-w-3xl mx-auto flex flex-col sm:flex-row justify-between items-baseline border-b-2 ${theme.border} mb-12`}>
        <h1 className={`text-4xl md:text-5xl font-black ${theme.text} tracking-tight leading-none mb-4 sm:mb-0 uppercase`}>
          {restaurantName}
        </h1>
        <p className="text-zinc-500 font-bold tracking-widest text-xs uppercase">Est. 2024</p>
      </header>

      {/* MENU LIST */}
      <main className="max-w-3xl mx-auto px-6 space-y-16">
        
        {Object.entries(menuByCategory).length === 0 && (
           <div className="text-center py-16 bg-white border border-zinc-200 shadow-sm rounded-xl">
             <h2 className="text-lg font-bold text-zinc-800 mb-2">Menù in Aggiornamento</h2>
             <p className="text-sm text-zinc-500">Stiamo lavorando alle nuove proposte.</p>
           </div>
        )}

        {Object.entries(menuByCategory).map(([category, items]) => (
          <section key={category} className="animate-in fade-in duration-700">
            {/* INTESTAZIONE CATEGORIA */}
            <div className="mb-8">
              <h2 className={`text-xl md:text-2xl font-black ${theme.text} uppercase tracking-widest flex items-center gap-4`}>
                {category}
                <div className="h-px w-full bg-zinc-200 mt-1 flex-1"></div>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 items-start">
              {items.map(item => (
                <div key={item.id} onClick={() => onItemClick && onItemClick(item)} className="group cursor-pointer flex flex-col gap-3 relative hover:opacity-80 transition-opacity">
                  {item.image && (
                    <div className="w-full rounded-xl bg-white overflow-hidden mb-2">
                      <img src={item.image} alt={item.name} className="w-full h-auto max-h-64 object-contain grayscale-[15%] group-hover:grayscale-0 transition-all duration-500" />
                    </div>
                  )}
                  
                  <div className="min-w-0">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className={`text-lg font-bold ${theme.text} leading-tight break-words flex-1 min-w-0`}>
                        {item.name}
                      </h3>
                      <span className={`font-bold ${theme.pillText} ${theme.pillBg} px-2 py-0.5 rounded text-sm shrink-0`}>
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                    
                    {item.description && (
                      <p className="text-zinc-500 mt-2 text-sm leading-relaxed break-words">
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
          <div className={`mt-16 ${theme.coverBg} p-6 rounded-xl flex justify-between items-center text-sm font-bold animate-in fade-in duration-700`}>
            <p className="text-zinc-500 uppercase tracking-widest">Servizio / Coperto</p>
            <p className={`${theme.text}`}>${parseFloat(settings.coverCharge).toFixed(2)}</p>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="max-w-3xl mx-auto px-6 mt-20 pt-8 border-t border-zinc-200 text-center flex flex-col items-center opacity-80 gap-6">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">&copy; {new Date().getFullYear()} {restaurantName.substring(0,20)}</p>
        <GlobalFooter settings={settings} theme="light" />
      </footer>
    </div>
  );
}
