import React from 'react';
import GlobalFooter from '../GlobalFooter';

export default function BrunchMenu({ menuByCategory, settings, onItemClick }) {
  const restaurantName = settings?.restaurantName || "Brunch Café";
  const coverCharge = settings?.coverCharge;

  const palette = settings?.palette || 'default';
  const colors = {
    default: { text: 'text-emerald-600', bg: 'bg-emerald-600' },
    rose: { text: 'text-rose-600', bg: 'bg-rose-600' },
    ocean: { text: 'text-sky-600', bg: 'bg-sky-600' }
  };
  const activeColor = colors[palette] || colors.default;

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900 font-sans pb-20">
      
      <header className="bg-white px-6 pt-12 pb-10 shadow-sm border-b border-slate-100 text-center mb-10 rounded-b-[3rem] animate-in slide-in-from-top-full duration-700">
         <h1 className="font-black text-3xl md:text-4xl uppercase tracking-wider text-slate-900">{restaurantName}</h1>
         <p className={`text-xs md:text-sm uppercase tracking-widest ${activeColor.text} mt-2 font-bold`}>{settings?.customHeader || "Healthy & Organic"}</p>
      </header>

      <main className="max-w-2xl mx-auto px-5">
        <div className="space-y-12">
          {Object.entries(menuByCategory).map(([category, items], catIndex) => (
            <section key={category} className="animate-in fade-in slide-in-from-bottom-8" style={{ animationDelay: `${catIndex * 150}ms` }}>
              <div className="mb-4 pl-2">
                <h2 className="font-black text-sm text-slate-400 uppercase tracking-widest">{category}</h2>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {items.map((item) => (
                  <div 
                     key={item.id} 
                     onClick={() => onItemClick && onItemClick(item)}
                     className="group cursor-pointer bg-white p-5 rounded-[2rem] shadow-[0_4px_20px_-5px_rgba(6,81,237,0.05)] hover:shadow-[0_8px_30px_-5px_rgba(6,81,237,0.1)] border border-slate-50 flex gap-4 items-center transition-all hover:-translate-y-1"
                  >
                    {item.image && (
                      <div className="w-20 h-20 shrink-0 rounded-2xl bg-slate-100 overflow-hidden shadow-sm">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0 pr-4">
                       <h3 className="font-bold text-slate-800 text-lg mb-1 truncate">{item.name}</h3>
                       {item.description && (
                         <p className="text-sm text-slate-500 line-clamp-2 leading-snug">{item.description}</p>
                       )}
                    </div>
                    <div className={`font-black ${activeColor.text} text-xl shrink-0`}>
                       €{parseFloat(item.price).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {coverCharge && (
          <div className="mt-16 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 flex justify-between items-center text-sm">
            <span className="text-slate-500 uppercase tracking-widest font-bold">Servizio</span>
            <span className={`font-black ${activeColor.text} text-lg`}>€{parseFloat(coverCharge).toFixed(2)}</span>
          </div>
        )}
      </main>

      <div className="mt-16 text-center">
        {settings?.customFooter && (
          <p className={`font-bold ${activeColor.text} text-xs tracking-widest uppercase mb-6 block`}>{settings.customFooter}</p>
        )}
        <GlobalFooter settings={settings} theme="light" />
      </div>
    </div>
  );
}
