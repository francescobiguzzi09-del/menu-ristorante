import React from 'react';
import GlobalFooter from '../GlobalFooter';

export default function VibrantMenu({ menuByCategory, settings, onItemClick }) {
  const restaurantName = settings?.restaurantName || "Super Menù";

  const paletteId = settings?.palette || 'default';
  const palettes = {
    default: {
      bgMain: 'bg-pink-50', selection: 'selection:bg-yellow-400 selection:text-black',
      headerDrop: 'bg-yellow-400', headerBg: 'bg-blue-600', badgeBorder: 'border-blue-600', badgeText: 'text-blue-600',
      priceText: 'text-yellow-400', coverBg: 'bg-emerald-400',
      hoverShadow: 'hover:shadow-[12px_12px_0px_#fde047]', emptyShadow: 'shadow-[8px_8px_0px_#fde047]'
    },
    neon: {
      bgMain: 'bg-zinc-100', selection: 'selection:bg-green-400 selection:text-black',
      headerDrop: 'bg-green-400', headerBg: 'bg-black', badgeBorder: 'border-black', badgeText: 'text-black',
      priceText: 'text-green-400', coverBg: 'bg-pink-500',
      hoverShadow: 'hover:shadow-[12px_12px_0px_#4ade80]', emptyShadow: 'shadow-[8px_8px_0px_#4ade80]'
    },
    sunset: {
      bgMain: 'bg-orange-50', selection: 'selection:bg-purple-500 selection:text-white',
      headerDrop: 'bg-purple-500', headerBg: 'bg-orange-600', badgeBorder: 'border-orange-600', badgeText: 'text-orange-600',
      priceText: 'text-purple-400', coverBg: 'bg-rose-400',
      hoverShadow: 'hover:shadow-[12px_12px_0px_#a855f7]', emptyShadow: 'shadow-[8px_8px_0px_#a855f7]'
    }
  };
  const theme = palettes[paletteId] || palettes.default;

  return (
    <div className={`min-h-screen ${theme.bgMain} text-slate-800 font-sans pb-32 ${theme.selection}`}>
      
      {/* HEADER VIBRANT */}
      <header className="pt-24 pb-12 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-block relative">
          <div className={`absolute inset-0 ${theme.headerDrop} translate-x-3 translate-y-3 rounded-3xl -z-10`}></div>
          <h1 className={`text-4xl md:text-5xl lg:text-7xl font-black ${theme.headerBg} text-white px-6 py-4 md:px-8 md:py-6 rounded-3xl tracking-tighter shadow-lg transform -rotate-2 border-4 border-slate-900 whitespace-nowrap`}>
            {restaurantName}
          </h1>
        </div>
        <p className={`mt-12 ${theme.badgeText} font-bold tracking-widest uppercase text-sm border-2 ${theme.badgeBorder} inline-block px-6 py-2 rounded-full bg-white shadow-sm`}>
          Fresh & Tasty
        </p>
      </header>

      {/* MENU LIST */}
      <main className="max-w-4xl mx-auto px-6 mt-16 space-y-24">
        
        {Object.entries(menuByCategory).length === 0 && (
           <div className={`text-center py-16 bg-white border-4 border-slate-900 rounded-[2rem] ${theme.emptyShadow}`}>
             <h2 className="text-2xl font-black text-slate-900 mb-2">Wow, tanto spazio!</h2>
             <p className="text-slate-500 font-bold">Aggiungi i tuoi super piatti.</p>
           </div>
        )}

        {Object.entries(menuByCategory).map(([category, items], index) => {
          const colors = ['bg-yellow-400', 'bg-emerald-400', 'bg-pink-400', 'bg-blue-400'];
          const accentObj = colors[index % colors.length];
          
          return (
            <section key={category} className="animate-in slide-in-from-bottom-12 duration-500">
              {/* INTESTAZIONE CATEGORIA */}
              <div className="mb-10 flex items-center gap-4">
                <h2 className={`text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter px-6 py-3 rounded-2xl border-4 border-slate-900 shadow-[4px_4px_0px_#0f172a] ${accentObj} whitespace-nowrap`}>
                  {category}
                </h2>
                <div className="flex-1 h-2 bg-slate-200 rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 gap-8 items-start">
                {items.map(item => (
                  <div key={item.id} onClick={() => onItemClick && onItemClick(item)} className={`group cursor-pointer bg-white border-4 border-slate-900 rounded-3xl p-6 shadow-[8px_8px_0px_#e2e8f0] ${theme.hoverShadow} hover:-translate-y-2 hover:-translate-x-2 transition-all flex flex-col`}>
                    
                    {item.image && (
                      <div className="w-full rounded-2xl bg-white overflow-hidden mb-6 border-4 border-slate-900 shadow-sm">
                        <img src={item.image} alt={item.name} className="w-full h-auto max-h-64 object-contain group-hover:scale-[1.03] transition-transform duration-300" />
                      </div>
                    )}
                    
                    <div className="flex-1 flex flex-col min-w-0">
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <h3 className="text-2xl font-black text-slate-900 leading-tight break-words flex-1 min-w-0">
                          {item.name}
                        </h3>
                        <span className={`text-xl font-black bg-slate-900 ${theme.priceText} px-3 py-1.5 rounded-xl border-2 border-slate-900 shrink-0 transform rotate-3`}>
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                      
                      {item.description && (
                        <p className="text-slate-600 font-medium text-sm leading-relaxed mt-2 break-words">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {/* PREZZO COPERTO */}
        {settings?.coverCharge && (
          <div className={`mt-20 ${theme.coverBg} border-4 border-slate-900 shadow-[8px_8px_0px_#0f172a] p-6 rounded-3xl flex flex-col md:flex-row justify-center items-center gap-4 text-center transform -rotate-1 hover:rotate-0 transition-transform`}>
            <p className="text-slate-900 font-black uppercase text-xl">Coperto / Extra Charge</p>
            <p className="bg-white text-slate-900 px-4 py-2 rounded-xl text-xl font-black border-2 border-slate-900">${parseFloat(settings.coverCharge).toFixed(2)}</p>
          </div>
        )}
      </main>
      <GlobalFooter settings={settings} theme="light" />
    </div>
  );
}
