import { Fragment } from 'react';

// Questa funzione legge i dati dinamicamente per il ristorante richiesto
async function getRestaurantData(restaurantId) {
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  // Assicura che l'URL includa l'ID del ristorante corretto
  const url = `${protocol}://localhost:3000/api/menu?restaurantId=${restaurantId}`;
  
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
  }
}

export default async function RestaurantMenu(props) {
  const params = await props.params;
  const restaurantId = params.restaurantId;
  const data = await getRestaurantData(restaurantId);

  // Fallback se il ristorante non esiste o non ha pubblicato nulla
  if (!data || !data.menu) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center p-6 text-center">
        <span className="text-4xl mb-4 grayscale opacity-50">🧭</span>
        <h1 className="text-2xl font-serif text-[#e0dfdc]">Menù Non Trovato</h1>
        <p className="text-[#a19f9b] mt-2">Sembra che questo ristorante non esista o non abbia ancora pubblicato il menù.</p>
      </div>
    );
  }

  const { menu, settings } = data;
  const restaurantName = settings?.restaurantName || "Il Nostro Menù";

  // Raggruppa per categoria
  const menuByCategory = menu.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e0dfdc] pb-24 selection:bg-[#c9a66b] selection:text-[#0a0a0b] font-sans relative overflow-hidden">
      
      {/* BACKGROUND EFFECTS */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-[#1a1815] to-[#0a0a0b] opacity-80 z-0 border-b border-[#2a2a2a]"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#c9a66b] blur-[150px] opacity-10 pointer-events-none"></div>
      
      {/* HEADER ELEGANCE */}
      <header className="relative z-10 pt-24 pb-16 px-6 text-center">
        <h1 className="text-5xl md:text-6xl font-serif text-white mb-2 tracking-wide font-light">{restaurantName}</h1>
        <div className="h-[1px] w-12 bg-[#c9a66b] mx-auto mt-6 mb-4"></div>
        <p className="text-[#a19f9b] uppercase tracking-[0.3em] text-xs font-medium">Fine Dining & Experience</p>
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
              <h2 className="text-2xl font-serif text-[#c9a66b] tracking-wider text-center px-4">
                {category}
              </h2>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#333]"></div>
            </div>

            <div className="space-y-12">
              {items.map(item => (
                <div key={item.id} className="group cursor-default">
                  <div className="flex justify-between items-baseline mb-3 gap-6">
                    <h3 className="text-xl md:text-2xl font-serif text-white tracking-wide group-hover:text-[#c9a66b] transition-colors leading-tight">
                      {item.name}
                    </h3>
                    <div className="border-b border-dotted border-[#444] flex-1 mx-2 mb-1 group-hover:border-[#c9a66b] transition-colors"></div>
                    <span className="text-[#c9a66b] font-medium text-lg whitespace-nowrap">
                      $ {item.price.toFixed(2)}
                    </span>
                  </div>
                  
                  {item.description && (
                    <p className="text-[#8e8d89] leading-relaxed text-sm max-w-[85%] font-light">
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 mt-24 text-center pb-8">
        <div className="w-8 h-8 rounded-full border border-[#333] flex items-center justify-center mx-auto mb-4 text-[#c9a66b] text-xs">
          IE
        </div>
        <p className="text-[#555] text-xs tracking-widest uppercase text-center w-full block">Menù interattivo offerto d SmartMenu AI</p>
      </footer>
    </div>
  );
}
