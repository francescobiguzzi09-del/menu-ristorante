import React from 'react';
import GlobalFooter from '../GlobalFooter';
import { ItemBadge, ItemIngredients } from './ItemExtras';

export default function SushiMenu({ menuByCategory, settings, onItemClick, activeCategory, onCategoryClick, allCategories, activeLang, filteredMenu }) {
  const restaurantName = settings?.restaurantName || "SUSHI CLUB";
  const currency = settings?.currency || '€';
  const coverCharge = settings?.coverCharge;

  const palette = settings?.palette || 'default';
  const colors = {
    default: { text: "text-emerald-400", bg: "bg-emerald-500", border: 'border-emerald-500/30' },
    ruby: { text: "text-rose-400", bg: "bg-rose-500", border: 'border-rose-500/30' },
    gold: { text: "text-amber-400", bg: "bg-amber-500", border: 'border-amber-500/30' }
  };
  const activeColor = colors[palette] || colors.default;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-mono pb-20 relative overflow-x-hidden">
      
      <main className="relative z-10 max-w-2xl mx-auto px-5 pt-16">
        <header className="mb-14 text-center animate-in fade-in slide-in-from-top-8 duration-1000">
           <h1 className="text-3xl md:text-5xl font-black uppercase tracking-widest text-white mb-6 leading-tight">
             {restaurantName.split(' ').map((word, i) => <React.Fragment key={i}>{word}<br className="hidden sm:block" /></React.Fragment>)}
             <span className="sm:hidden">{restaurantName}</span>
           </h1>
           {settings?.customHeader && (
             <p className={`text-xs md:text-sm tracking-[0.3em] uppercase ${activeColor.text} mb-6`}>{settings.customHeader}</p>
           )}
           <div className={`h-[2px] w-16 mx-auto ${activeColor.bg} opacity-30`}></div>
        </header>

        <div className="space-y-16">
          {Object.entries(menuByCategory).map(([category, items], catIndex) => (
            <section key={category} className="animate-in fade-in slide-in-from-bottom-8" style={{ animationDelay: `${catIndex * 150}ms` }}>
              <div className="mb-8">
                <h2 className="text-xl font-bold uppercase tracking-[0.2em] text-white text-center">{category}</h2>
              </div>

              <div className="space-y-6">
                
              {items.map((item, index) => (

                  <div 
                     key={item.id} 
                     onClick={() => onItemClick && onItemClick(item)}
                     className="group cursor-pointer flex gap-4 md:gap-6 p-4 rounded-2xl hover:bg-slate-900/80 transition-colors border border-transparent hover:border-slate-800"
                  >
                    {item.image && (
                      <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-xl bg-slate-800 overflow-hidden shadow-lg border border-slate-700/50">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex justify-between items-start gap-4 mb-1">
                         <h3 className={`text-base md:text-lg font-bold text-white group-hover:${activeColor.text} transition-colors truncate`}>
                           <ItemBadge badge={item.badge} dark />
                           {item.name}
                         </h3>
                         {item.variants && item.variants.length > 0 ? (
                           <div className="flex flex-col items-end gap-0.5 shrink-0">
                             {item.variants.map((v, vi) => (
                               <span key={vi} className={`text-sm font-bold ${activeColor.text}`}>
                                 <span className="text-xs text-slate-500 mr-1">{v.name}</span>{currency}{v.price.toFixed(2)}
                               </span>
                             ))}
                           </div>
                         ) : (
                           <span className={`text-base md:text-lg font-bold ${activeColor.text} shrink-0`}>{currency}{parseFloat(item.price).toFixed(2)}</span>
                         )}
                      </div>
                      <p className="text-xs md:text-sm text-slate-500 font-light leading-relaxed line-clamp-2 md:line-clamp-none">{item.description}</p>
                      <ItemIngredients ingredients={item.ingredients} dark />
                    </div>
                  </div>
                ))}
  
              </div>
            </section>
          ))}
        </div>

        {coverCharge && (
          <div className="mt-16 text-center border-t border-slate-800 pt-8">
            <p className="text-slate-500 text-xs tracking-widest uppercase">
              Coperto / Servizio: <span className="text-white font-bold ml-2">{currency}{parseFloat(coverCharge).toFixed(2)}</span>
            </p>
          </div>
        )}
      </main>
      <div className="mt-16">
        {settings?.customFooter && (
          <p className="text-center text-slate-500 text-xs tracking-[0.2em] uppercase mb-8">{settings.customFooter}</p>
        )}
        <GlobalFooter settings={settings} theme="dark" />
      </div>
    </div>
  );
}
