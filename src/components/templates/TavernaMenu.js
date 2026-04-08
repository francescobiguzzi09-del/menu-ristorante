import React from 'react';
import GlobalFooter from '../GlobalFooter';

export default function TavernaMenu({ menuByCategory, settings, onItemClick }) {
  const restaurantName = settings?.restaurantName || "La Taverna";
  const coverCharge = settings?.coverCharge;
  
  const palette = settings?.palette || 'default';
  const colors = {
    default: { text: 'text-[#c9a66b]', bg: 'bg-[#c9a66b]', from: 'from-[#c9a66b]', hex: '#c9a66b', border: 'border-[#c9a66b]' },
    silver: { text: 'text-slate-300', bg: 'bg-slate-300', from: 'from-slate-300', hex: '#cbd5e1', border: 'border-slate-300' },
    copper: { text: 'text-amber-700', bg: 'bg-amber-700', from: 'from-amber-700', hex: '#b45309', border: 'border-amber-700' }
  };
  const activeColor = colors[palette] || colors.default;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e0dfdc] font-serif pb-20 relative overflow-x-hidden">
      
      {/* Subdued glow */}
      <div className={`absolute top-[-10%] right-[-10%] w-[60%] h-[40%] rounded-full ${activeColor.bg} blur-[120px] opacity-[0.08] pointer-events-none`}></div>

      <main className="relative z-10 max-w-2xl mx-auto px-6 pt-20">
        <header className="mb-20 text-center animate-in fade-in slide-in-from-top-8 duration-1000">
           <div className={`w-16 h-[1px] ${activeColor.bg} mx-auto mt-2 mb-6`}></div>
           <h1 className="text-4xl md:text-5xl font-light text-white mb-3 tracking-wide">{restaurantName}</h1>
           <p className="text-xs text-[#a19f9b] uppercase tracking-[0.3em] mb-6">{settings?.customHeader || "Dal 1956"}</p>
           <div className={`w-16 h-[1px] ${activeColor.bg} mx-auto mb-10`}></div>
        </header>

        <div className="space-y-16">
          {Object.entries(menuByCategory).map(([category, items], catIndex) => (
            <section key={category} className="animate-in fade-in slide-in-from-bottom-8" style={{ animationDelay: `${catIndex * 150}ms` }}>
              
              <div className="flex items-center gap-4 mb-8 justify-center">
                 <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#333]"></div>
                 <h2 className={`text-center text-sm md:text-base ${activeColor.text} tracking-widest uppercase`}>{category}</h2>
                 <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#333]"></div>
              </div>

              <div className="space-y-6">
                {items.map((item) => (
                  <div 
                     key={item.id} 
                     onClick={() => onItemClick && onItemClick(item)}
                     className="group cursor-pointer flex flex-col hover:opacity-80 transition-opacity"
                  >
                    <div className="flex justify-between items-baseline mb-2">
                       <h3 className="font-bold text-white text-lg tracking-wide">{item.name}</h3>
                       <span className="border-b border-dotted border-[#444] flex-1 mx-4"></span>
                       <span className={`font-bold ${activeColor.text} text-lg`}>€{parseFloat(item.price).toFixed(2)}</span>
                    </div>
                    {item.description && (
                       <p className="text-sm md:text-base text-[#8e8d89] font-sans font-light leading-relaxed max-w-[90%]">
                         {item.description}
                       </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {coverCharge && (
          <div className="mt-20 text-center pt-8">
            <p className="text-[#a19f9b] text-xs font-sans tracking-widest uppercase">
              Coperto / Servizio: <span className={`${activeColor.text} font-bold ml-2`}>€{parseFloat(coverCharge).toFixed(2)}</span>
            </p>
          </div>
        )}
      </main>

      <div className="mt-16 text-center">
        {settings?.customFooter && (
          <p className="text-[#a19f9b] text-[10px] tracking-widest uppercase mb-6 block">{settings.customFooter}</p>
        )}
        <GlobalFooter settings={settings} theme="dark" />
      </div>
    </div>
  );
}
