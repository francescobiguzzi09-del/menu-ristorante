"use client";
import { useState, useEffect } from 'react';
import ElegantMenu from '@/components/templates/ElegantMenu';
import ModernMenu from '@/components/templates/ModernMenu';
import RusticMenu from '@/components/templates/RusticMenu';
import VibrantMenu from '@/components/templates/VibrantMenu';
import CinematicMenu from '@/components/templates/CinematicMenu';
import LuxuryMenu from '@/components/templates/LuxuryMenu';

export default function MenuRenderer({ menu, settings, restaurantId }) {
  const [activeLang, setActiveLang] = useState('it');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  // Tracker invisibile per le statistiche (Visualizzazione Pagina)
  useEffect(() => {
    if (!restaurantId || restaurantId.startsWith('guest-')) return;
    fetch('/api/track', {
      method: 'POST',
      body: JSON.stringify({ event: 'page_view', restaurantId }),
      headers: { 'Content-Type': 'application/json' }
    }).catch(e => console.error("Analytics Track Error", e));
  }, [restaurantId]);

  // Tracker Tempo di Permanenza (Nuovo)
  useEffect(() => {
    if (!restaurantId || restaurantId.startsWith('guest-')) return;
    
    const startTime = Date.now();
    let hasSent = false;

    const sendDuration = () => {
      if (hasSent) return;
      const durationSeconds = Math.round((Date.now() - startTime) / 1000);
      
      // Contiamo la visita solo se è durata più di 2 secondi
      if (durationSeconds >= 2) {
        hasSent = true;
        fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          keepalive: true,
          body: JSON.stringify({
            event: 'time_spent',
            restaurantId,
            duration: durationSeconds
          })
        }).catch(e => console.error(e));
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') sendDuration();
    };

    window.addEventListener('beforeunload', sendDuration);
    window.addEventListener('visibilitychange', handleVisibility);

    return () => {
      sendDuration();
      window.removeEventListener('beforeunload', sendDuration);
      window.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [restaurantId]);


  const handleSearchBlur = () => {
    if (searchQuery.trim().length > 2 && restaurantId) {
       fetch('/api/track', {
         method: 'POST',
         body: JSON.stringify({ event: 'search', restaurantId, query: searchQuery }),
         headers: { 'Content-Type': 'application/json' }
       }).catch(e => console.error(e));
    }
  };

  // Filtraggio testuale
  const filteredMenu = menu.filter(item => {
     if (!searchQuery) return true;
     const q = searchQuery.toLowerCase();
     return item.name.toLowerCase().includes(q) || (item.description && item.description.toLowerCase().includes(q));
  });
  
  // Raggruppa per categoria applicando le traduzioni on-the-fly
  const menuByCategory = filteredMenu.reduce((acc, item) => {
    // Risolvi i testi localizzati
    const isTranslating = activeLang !== 'it' && item.translations && item.translations[activeLang];
    
    const localizedCategory = isTranslating && item.translations[activeLang].category 
        ? item.translations[activeLang].category 
        : item.category;
    
    const localizedName = isTranslating && item.translations[activeLang].name 
        ? item.translations[activeLang].name 
        : item.name;
        
    const localizedDesc = isTranslating && item.translations[activeLang].description 
        ? item.translations[activeLang].description 
        : item.description;

    if (!acc[localizedCategory]) {
      acc[localizedCategory] = [];
    }
    
    // Inseriamo l'elemento localizzato
    acc[localizedCategory].push({
       ...item,
       name: localizedName,
       description: localizedDesc
    });
    
    return acc;
  }, {});

  const templateStyle = settings?.template || 'elegant';

  const handleItemClick = (item) => {
    setSelectedItem(item);
    if (restaurantId) {
       fetch('/api/track', {
         method: 'POST',
         body: JSON.stringify({ event: 'item_click', restaurantId, itemId: item.id }),
         headers: { 'Content-Type': 'application/json' }
       }).catch(e => console.error(e));
    }
  };

  const renderTemplate = () => {
    switch (templateStyle) {
      case 'modern': return <ModernMenu menuByCategory={menuByCategory} settings={settings} onItemClick={handleItemClick} />;
      case 'rustic': return <RusticMenu menuByCategory={menuByCategory} settings={settings} onItemClick={handleItemClick} />;
      case 'vibrant': return <VibrantMenu menuByCategory={menuByCategory} settings={settings} onItemClick={handleItemClick} />;
      case 'cinematic': return <CinematicMenu menuByCategory={menuByCategory} settings={settings} onItemClick={handleItemClick} />;
      case 'luxury': return <LuxuryMenu menuByCategory={menuByCategory} settings={settings} onItemClick={handleItemClick} />;
      case 'elegant':
      default: return <ElegantMenu menuByCategory={menuByCategory} settings={settings} onItemClick={handleItemClick} />;
    }
  };

  const flags = {
    it: '🇮🇹', en: '🇬🇧', de: '🇩🇪', fr: '🇫🇷', es: '🇪🇸'
  };

  return (
    <div className="relative">
       {/* BARRA DI RICERCA FLOATING */}
       <div className="fixed top-6 left-6 right-[100px] sm:right-auto sm:w-72 z-40 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-white/90 backdrop-blur-xl border border-white/50 shadow-lg rounded-2xl p-2.5 flex items-center gap-2">
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 ml-2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
             <input 
                type="text" 
                placeholder="Cerca un piatto..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onBlur={handleSearchBlur}
                className="w-full bg-transparent border-none focus:outline-none text-sm font-bold text-slate-800 placeholder-slate-400"
             />
          </div>
       </div>

       {/* SELETTORE LINGUA FLUTTUANTE STILE PILLOLA (NO EMOJI NATIVE) */}
       {settings?.languages && settings.languages.length > 0 && (
         <div className="fixed top-6 right-6 z-50 flex items-center bg-slate-900/90 backdrop-blur-xl p-1.5 rounded-full shadow-2xl border border-white/10 shadow-slate-900/20">
           <button 
             onClick={() => setActiveLang('it')} 
             className={`relative px-4 py-1.5 text-xs font-black tracking-widest uppercase transition-all duration-300 rounded-full z-10 ${activeLang === 'it' ? 'text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'}`}
           >
             {activeLang === 'it' && <div className="absolute inset-0 bg-white rounded-full -z-10 shadow-sm"></div>}
             IT
           </button>
           {settings.languages.map(lang => (
             <button 
               key={lang} 
               onClick={() => setActiveLang(lang)} 
               className={`relative px-4 py-1.5 text-xs font-black tracking-widest uppercase transition-all duration-300 rounded-full z-10 ${activeLang === lang ? 'text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'}`}
             >
                {activeLang === lang && <div className="absolute inset-0 bg-white rounded-full -z-10 shadow-sm"></div>}
                {lang}
             </button>
           ))}
         </div>
       )}
       
       {renderTemplate()}

       {/* MODALE DETTAGLIO PIATTO */}
       {selectedItem && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-[360px] md:max-w-[400px] rounded-[2rem] max-h-[85vh] flex flex-col mx-auto overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
              <div className="relative h-64 shrink-0 bg-slate-100 flex items-center justify-center">
                 {selectedItem.image ? (
                    <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
                 ) : (
                    <span className="text-6xl grayscale opacity-20">🍽️</span>
                 )}
                 <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-colors shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                 </button>
              </div>
              <div className="p-6 md:p-8 overflow-y-auto">
                 <div className="flex justify-between items-start gap-4 mb-4">
                    <div>
                       <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 font-bold text-xs rounded-lg uppercase tracking-wider mb-3">{selectedItem.category}</span>
                       <h3 className="text-2xl font-black text-slate-900 leading-tight">{selectedItem.name}</h3>
                    </div>
                    <span className="text-2xl font-black text-indigo-600">${selectedItem.price.toFixed(2)}</span>
                 </div>
                 <p className="text-slate-500 leading-relaxed text-sm">{selectedItem.description || 'Nessuna descrizione.'}</p>
                 <div className="mt-8 pt-6 border-t border-slate-100 flex gap-4">
                    <div className="flex-1 bg-slate-50 rounded-2xl p-4 text-center border border-slate-100 opacity-50">
                       <span className="text-xs font-bold text-slate-400 block mb-1">Info Allergeni</span>
                       <span className="text-sm font-medium text-slate-500">In arrivo...</span>
                    </div>
                 </div>
              </div>
            </div>
         </div>
       )}
    </div>
  );
}
