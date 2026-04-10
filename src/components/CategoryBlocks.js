import React from 'react';

export default function CategoryBlocks({
  settings,
  activeCategory,
  onCategoryClick,
  allCategories,
  activeLang,
  filteredMenu,
}) {
  const templateStyle = settings?.template || 'elegant';

  const categoriesData = allCategories.map((cat) => {
    const originalCat = filteredMenu?.find((i) => {
      const isTranslating =
        activeLang !== 'it' && i.translations && i.translations[activeLang];
      const c =
        isTranslating && i.translations[activeLang].category
          ? i.translations[activeLang].category
          : i.category;
      return c === cat;
    })?.category;
    const catMeta = (settings?.categoryMetadata || {})[originalCat] || {};
    return { name: cat, image: catMeta.image };
  });

  switch (templateStyle) {
    case 'modern':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16 animate-in fade-in duration-700">
          {categoriesData.map((c) => (
            <div key={c.name} onClick={() => onCategoryClick(c.name)} className="group cursor-pointer flex flex-col gap-4 relative hover:opacity-80 transition-opacity">
               <div className="w-full aspect-video rounded-xl bg-zinc-100 overflow-hidden mb-2 shadow-sm border border-zinc-200">
                  {c.image ? (
                     <img src={c.image} className="w-full h-full object-cover grayscale-[15%] group-hover:grayscale-0 transition-all duration-500" alt={c.name} />
                  ) : (
                     <div className="w-full h-full flex items-center justify-center text-5xl opacity-40">🍽️</div>
                  )}
               </div>
               <h3 className="text-xl md:text-2xl font-black text-zinc-900 uppercase tracking-widest text-center">{c.name}</h3>
            </div>
          ))}
        </div>
      );
      
    case 'brunch':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12 animate-in fade-in duration-700">
          {categoriesData.map((c) => (
            <div key={c.name} onClick={() => onCategoryClick(c.name)} className="group cursor-pointer relative rounded-[2rem] overflow-hidden shadow-[0_4px_20px_-5px_rgba(6,81,237,0.05)] hover:shadow-[0_8px_30px_-5px_rgba(6,81,237,0.1)] transition-all hover:-translate-y-1 aspect-video border border-slate-50 bg-white">
               {c.image ? (
                  <img src={c.image} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" alt={c.name} />
               ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-50 text-5xl">🍽️</div>
               )}
               <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-slate-900/80 to-transparent flex items-end justify-center p-6 sm:p-8">
                  <h3 className="text-2xl sm:text-3xl font-black text-white text-center tracking-wider capitalize">{c.name}</h3>
               </div>
            </div>
          ))}
        </div>
      );
      
    case 'cinematic':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-24 animate-in fade-in duration-1000">
          {categoriesData.map((c) => (
            <div key={c.name} onClick={() => onCategoryClick(c.name)} className="group cursor-pointer overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-3 transition-all duration-500 hover:bg-white/10 hover:border-amber-500/30 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] flex flex-col">
               <div className="w-full aspect-[2/1] sm:aspect-video rounded-xl overflow-hidden relative border border-white/5 bg-black">
                  {c.image ? (
                     <img src={c.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-90 group-hover:scale-110 transition-all duration-1000" alt={c.name} />
                  ) : (
                     <div className="w-full h-full flex items-center justify-center text-4xl opacity-50">🍽️</div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/90 to-transparent"></div>
               </div>
               <div className="pt-6 pb-4 px-2 text-center">
                 <h3 className="text-2xl font-black uppercase tracking-[0.3em] text-white group-hover:text-amber-400 transition-colors drop-shadow-lg">{c.name}</h3>
               </div>
            </div>
          ))}
        </div>
      );
      
    case 'luxury':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16 mb-24 animate-in fade-in duration-1000">
          {categoriesData.map((c) => (
            <div key={c.name} onClick={() => onCategoryClick(c.name)} className="group cursor-pointer flex flex-col items-center justify-center text-center">
               <div className="w-full max-w-sm aspect-[4/3] overflow-hidden mb-8 border border-[#e5e5e0] shadow-2xl bg-[#ffffff]">
                  {c.image ? (
                     <img src={c.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s] ease-out opacity-90 group-hover:opacity-100" alt={c.name} />
                  ) : (
                     <div className="w-full h-full flex items-center justify-center bg-[#f8f8f8] text-5xl text-gray-300">🍽️</div>
                  )}
               </div>
               <h3 className="text-xl md:text-2xl font-medium tracking-widest uppercase text-[#1a1a1a] mb-4 group-hover:text-[#8b7355] transition-colors">{c.name}</h3>
               <div className="w-8 h-px border-t border-[#1a1a1a] group-hover:border-[#8b7355] transition-colors"></div>
            </div>
          ))}
        </div>
      );
      
    case 'rustic':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-20 animate-in fade-in duration-1000">
          {categoriesData.map((c) => (
            <div key={c.name} onClick={() => onCategoryClick(c.name)} className="group cursor-pointer border border-[#f0e6d5] p-5 bg-white rounded-t-[5rem] rounded-b-[2rem] shadow-sm hover:shadow-md hover:border-[#e9dac1] transition-all text-center">
               <div className="w-full aspect-[4/5] rounded-t-[4rem] rounded-b-xl overflow-hidden mb-6 border-[6px] border-[#fdfbf7] shadow-sm bg-[#f4ebd8]">
                  {c.image ? (
                     <img src={c.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={c.name} />
                  ) : (
                     <div className="w-full h-full flex items-center justify-center text-5xl opacity-40">🍽️</div>
                  )}
               </div>
               <h3 className="text-2xl font-bold text-[#2d241c] pb-2 group-hover:text-[#d97757] transition-colors capitalize">~ {c.name} ~</h3>
            </div>
          ))}
        </div>
      );

    case 'sushi':
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-16 animate-in fade-in duration-1000">
          {categoriesData.map((c) => (
            <div key={c.name} onClick={() => onCategoryClick(c.name)} className="group cursor-pointer border border-transparent hover:border-slate-800 p-2 sm:p-3 rounded-2xl transition-all relative overflow-hidden bg-slate-900/40">
               <div className="w-full aspect-square bg-slate-800 rounded-xl overflow-hidden border border-slate-700/50 relative shadow-lg">
                  {c.image ? (
                     <>
                        <img src={c.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" alt={c.name} />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end justify-center p-4">
                           <h3 className="text-sm sm:text-base font-bold uppercase tracking-[0.2em] text-white group-hover:text-emerald-400 transition-colors text-center shadow-black drop-shadow-md">{c.name}</h3>
                        </div>
                     </>
                  ) : (
                     <div className="w-full h-full flex items-center justify-center bg-slate-800 flex-col gap-3">
                        <span className="text-4xl opacity-50">🍽️</span>
                        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-emerald-400 text-center px-2">{c.name}</h3>
                     </div>
                  )}
               </div>
            </div>
          ))}
        </div>
      );

    case 'taverna':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16 animate-in fade-in duration-1000">
          {categoriesData.map((c) => (
            <div key={c.name} onClick={() => onCategoryClick(c.name)} className="group cursor-pointer border border-[#222] p-2 bg-[#111] transition-all hover:bg-[#1a1a1a]">
               <div className="border border-[#c9a66b]/30 p-1 h-full">
                  <div className="w-full aspect-[4/3] sm:aspect-video bg-[#0a0a0b] overflow-hidden relative border border-[#c9a66b]/20 text-center flex flex-col justify-end">
                     {c.image ? (
                        <>
                           <img src={c.image} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 grayscale-[40%] transition-opacity duration-700" alt={c.name} />
                           <div className="relative z-10 bg-gradient-to-t from-black/90 to-transparent p-6 w-full mt-auto">
                              <h3 className="text-xl sm:text-2xl font-light uppercase tracking-widest text-[#e0dfdc] group-hover:text-[#c9a66b] transition-colors">{c.name}</h3>
                           </div>
                        </>
                     ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-[#c9a66b] opacity-50 relative z-10">
                           <h3 className="text-xl sm:text-2xl font-light uppercase tracking-widest text-[#e0dfdc]">{c.name}</h3>
                        </div>
                     )}
                  </div>
               </div>
            </div>
          ))}
        </div>
      );

    case 'vibrant':
      const colors = ['bg-yellow-400', 'bg-emerald-400', 'bg-pink-400', 'bg-blue-400'];
      const hoverShadows = ['hover:shadow-[12px_12px_0px_#fde047]', 'hover:shadow-[12px_12px_0px_#4ade80]', 'hover:shadow-[12px_12px_0px_#f472b6]', 'hover:shadow-[12px_12px_0px_#60a5fa]'];
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16 animate-in slide-in-from-bottom-12 duration-500">
          {categoriesData.map((c, index) => {
            const accentObj = colors[index % colors.length];
            const hoverShadow = hoverShadows[index % hoverShadows.length];
            return (
              <div key={c.name} onClick={() => onCategoryClick(c.name)} className={`group cursor-pointer bg-white border-4 border-slate-900 rounded-3xl p-5 sm:p-6 shadow-[8px_8px_0px_#e2e8f0] hover:-translate-y-2 hover:-translate-x-2 transition-all flex flex-col relative ${hoverShadow}`}>
                 <div className="w-full aspect-video rounded-2xl border-4 border-slate-900 overflow-hidden relative mb-6 bg-slate-100">
                    {c.image ? (
                       <img src={c.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={c.name} />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center text-5xl">🍽️</div>
                    )}
                 </div>
                 <h3 className={`text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter px-4 py-3 rounded-xl border-4 border-slate-900 text-center ${accentObj}`}>
                   {c.name}
                 </h3>
              </div>
            );
          })}
        </div>
      );

    case 'elegant':
    default:
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
          {categoriesData.map((c) => (
            <div key={c.name} onClick={() => onCategoryClick(c.name)} className="relative aspect-video sm:aspect-square rounded-3xl overflow-hidden cursor-pointer group shadow-2xl border border-[#222] bg-[#111]">
               {c.image ? (
                  <img src={c.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60 group-hover:opacity-100" alt={c.name} />
               ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#333] opacity-30">
                     <span className="text-6xl">&#127869;</span>
                  </div>
               )}
               <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/40 to-transparent flex flex-col justify-end p-8">
                  <h3 className={`text-3xl font-serif text-white tracking-wide mb-2`}>
                     {c.name}
                  </h3>
                  <p className="text-[#a19f9b] text-sm">
                     Tocca per scoprire i nostri piatti
                  </p>
               </div>
            </div>
          ))}
        </div>
      );
  }
}
