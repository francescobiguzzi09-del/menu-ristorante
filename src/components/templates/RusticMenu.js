import React from 'react';
import GlobalFooter from '../GlobalFooter';

export default function RusticMenu({ menuByCategory, settings, onItemClick }) {
  const restaurantName = settings?.restaurantName || "La Nostra Osteria";

  const paletteId = settings?.palette || 'default';
  const palettes = {
    default: { text: 'text-[#d97757]', bg: 'bg-[#d97757]', hoverText: 'group-hover:text-[#d97757]', selectionBg: 'selection:bg-[#d97757]', decoration: 'decoration-[#d97757]' },
    olive: { text: 'text-[#65a30d]', bg: 'bg-[#65a30d]', hoverText: 'group-hover:text-[#65a30d]', selectionBg: 'selection:bg-[#65a30d]', decoration: 'decoration-[#65a30d]' },
    wine: { text: 'text-[#9f1239]', bg: 'bg-[#9f1239]', hoverText: 'group-hover:text-[#9f1239]', selectionBg: 'selection:bg-[#9f1239]', decoration: 'decoration-[#9f1239]' }
  };
  const theme = palettes[paletteId] || palettes.default;

  return (
    <div className={`min-h-screen bg-[#fdfbf7] text-[#4a3f35] font-serif pb-24 ${theme.selectionBg} selection:text-white`}>
      
      {/* HEADER RUSTICO */}
      <header className="pt-20 pb-16 px-6 text-center max-w-2xl mx-auto space-y-4">
        <div className={`flex justify-center mb-6 ${theme.text}`}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-[#2d241c] tracking-tight">{restaurantName}</h1>
        <div className="flex items-center justify-center gap-3">
          <span className="h-px border-t border-dashed border-[#b8a99a] w-12"></span>
          <p className={`text-[#8c7a6b] italic text-lg ${theme.decoration} decoration-wavy underline-offset-4`}>Cucina Tradizionale</p>
          <span className="h-px border-t border-dashed border-[#b8a99a] w-12"></span>
        </div>
      </header>

      {/* MENU LIST */}
      <main className="max-w-2xl mx-auto px-6 space-y-20 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#f4ebd8] rounded-full blur-[100px] -z-10"></div>
        <div className="absolute bottom-[20%] left-0 w-64 h-64 bg-[#e8dbce] rounded-full blur-[100px] -z-10"></div>

        {Object.entries(menuByCategory).length === 0 && (
           <div className="text-center py-16">
             <h2 className={`text-2xl font-bold ${theme.text} mb-2 italic`}>Il menù non è ancora pronto</h2>
             <p className="text-[#8c7a6b]">La pasta sta bollendo, tornate a breve!</p>
           </div>
        )}

        {Object.entries(menuByCategory).map(([category, items]) => (
          <section key={category} className="animate-in fade-in duration-1000">
            {/* INTESTAZIONE CATEGORIA */}
            <div className="text-center mb-10">
              <h2 className={`text-2xl md:text-3xl font-bold ${theme.text} capitalize tracking-wide relative inline-block`}>
                ~ {category} ~
              </h2>
            </div>

            <div className="space-y-10">
              {items.map(item => (
                <div key={item.id} onClick={() => onItemClick && onItemClick(item)} className="group cursor-pointer flex flex-col sm:flex-row gap-5 items-start bg-white p-6 rounded-[2rem] shadow-sm border border-[#f0e6d5] hover:shadow-md hover:border-[#e9dac1] transition-all">
                  
                  {item.image && (
                    <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-full overflow-hidden border-4 border-[#fdfbf7] shadow-md relative mx-auto sm:mx-0 -mt-10 sm:mt-0 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  
                  <div className="flex-1 w-full text-center sm:text-left mt-2 sm:mt-0 min-w-0">
                    <div className="flex flex-col sm:flex-row justify-between items-center sm:items-baseline gap-2 sm:gap-4 mb-2">
                      <h3 className={`text-xl md:text-2xl font-bold text-[#2d241c] leading-tight ${theme.hoverText} transition-colors break-words flex-1 min-w-0`}>
                        {item.name}
                      </h3>
                      <div className="hidden sm:block border-b-2 border-dotted border-[#e4d4c3] flex-1 translate-y-[-6px]"></div>
                      <span className="text-xl font-bold text-[#2d241c] shrink-0">
                        € {item.price.toFixed(2)}
                      </span>
                    </div>
                    
                    {item.description && (
                      <p className="text-[#8c7a6b] leading-relaxed text-[15px] italic break-words">
                        "{item.description}"
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
          <div className="mt-16 text-center pt-8 border-t border-dashed border-[#d2c4b4] animate-in fade-in duration-1000">
            <p className="text-[#8c7a6b] text-lg">
              Servizio e Coperto: <span className={`font-bold ${theme.text} ml-2`}>€ {parseFloat(settings.coverCharge).toFixed(2)}</span>
            </p>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-20 py-10 text-center border-t-8 border-[#f4ebd8] bg-[#fdfbf7] text-[#8c7a6b]">
         <p className="font-bold tracking-widest uppercase text-xs">Fatto con amore.</p>
         <GlobalFooter settings={settings} theme="light" />
      </footer>
    </div>
  );
}
